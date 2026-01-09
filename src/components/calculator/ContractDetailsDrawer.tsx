'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Calculator, FileText, Info } from '@phosphor-icons/react'
import type { KostenBreakdown } from './ContractCard'
import type { ContractOptie } from '@/types/calculator'
import { getFriendlyDocumentUrl } from '@/lib/document-url'
import { Check, FilePdf, Sun } from '@phosphor-icons/react'
import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'

type Tab = 'prijsdetails' | 'voorwaarden' | 'over'

interface ContractDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  contract: ContractOptie
  breakdown: KostenBreakdown | null
  loading: boolean
  error: string | null
  verbruikElektriciteitNormaal: number
  verbruikElektriciteitDal: number
  verbruikGas: number
  aansluitwaardeElektriciteit: string
  aansluitwaardeGas: string
  addressType?: 'particulier' | 'zakelijk' | null // NIEUW: voor BTW bepaling
}

/**
 * Slide-over details panel.
 * - Desktop: right-side drawer
 * - Mobile: full-screen drawer
 */
export function ContractDetailsDrawer({
  isOpen,
  onClose,
  contract,
  breakdown,
  loading,
  error,
  verbruikElektriciteitNormaal,
  verbruikElektriciteitDal,
  verbruikGas,
  aansluitwaardeElektriciteit,
  aansluitwaardeGas,
  addressType,
}: ContractDetailsDrawerProps) {
  const isZakelijk = addressType === 'zakelijk'
  const [activeTab, setActiveTab] = useState<Tab>('prijsdetails')

  // Format currency helper
  // Breakdown items zijn excl. BTW, dus voor particulier moeten we BTW toevoegen
  const formatCurrency = (amount: number, addBtw: boolean = true) => {
    if (addBtw && !isZakelijk) {
      amount = amount * 1.21
    }
    return amount.toFixed(2)
  }
  
  // Format tariff helper (voor tarieven zoals €/kWh, €/m³)
  // Tarieven in breakdown zijn excl. BTW, dus voor particulier moeten we BTW toevoegen
  const formatTariff = (tariff: number, decimals: number = 6) => {
    const adjustedTariff = isZakelijk ? tariff : tariff * 1.21
    return adjustedTariff.toFixed(decimals)
  }

  const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  // Keep mounted for exit animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // next tick → animate in
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    }

    // animate out
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 250)
    return () => clearTimeout(t)
  }, [isOpen])

  // Lock body scroll while mounted
  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  // ESC closes
  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mounted, onClose])

  const contractTypeLine = useMemo(() => {
    return contract.type === 'dynamisch'
      ? 'Dynamisch contract'
      : contract.looptijd
        ? `Vast contract • ${contract.looptijd} jaar`
        : 'Contract'
  }, [contract.type, contract.looptijd])

  if (!mounted) return null

  const content = (
    <div className="fixed inset-0 z-[120]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`absolute inset-y-0 right-0 w-screen max-w-full sm:max-w-2xl bg-white shadow-2xl transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Details ${contract.leverancier.naam}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="min-w-0">
              <div className="font-bold text-brand-navy-500 text-base sm:text-lg truncate">{contract.leverancier.naam}</div>
              <div className="text-xs text-gray-500">{contractTypeLine}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-xl p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Sluiten</span>
              <X className="w-6 h-6" weight="bold" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-gray-200 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('prijsdetails')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'prijsdetails' ? 'text-brand-teal-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calculator weight={activeTab === 'prijsdetails' ? 'bold' : 'regular'} className="w-4 h-4" />
              <span className="whitespace-nowrap">Prijsdetails</span>
              {activeTab === 'prijsdetails' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-600" />}
            </button>
            <button
              onClick={() => setActiveTab('voorwaarden')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'voorwaarden' ? 'text-brand-teal-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText weight={activeTab === 'voorwaarden' ? 'bold' : 'regular'} className="w-4 h-4" />
              <span className="whitespace-nowrap">Voorwaarden</span>
              {activeTab === 'voorwaarden' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-600" />}
            </button>
            <button
              onClick={() => setActiveTab('over')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'over' ? 'text-brand-teal-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Info weight={activeTab === 'over' ? 'bold' : 'regular'} className="w-4 h-4" />
              <span className="whitespace-nowrap">Over leverancier</span>
              {activeTab === 'over' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-600" />}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden break-words px-4 sm:px-6 py-5">
                      {/* Prijsdetails */}
                      {activeTab === 'prijsdetails' && (
                        <div className="space-y-4">
                          {loading && (
                            <div className="flex items-center justify-center py-16">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-600" />
                            </div>
                          )}

                          {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                              {error}
                            </div>
                          )}

                          {breakdown && !loading && (
                            <div className="space-y-4">
                              {/* SALDERING BLOK - Bovenaan als er zonnepanelen zijn */}
                              {breakdown.saldering && breakdown.saldering.heeftZonnepanelen && breakdown.saldering.opwekking > 0 && (
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 shadow-sm print:border print:border-gray-300">
                                  <h4 className="font-bold text-brand-navy-600 mb-4 flex items-center gap-2 text-lg">
                                    <Sun weight="duotone" className="w-6 h-6 text-yellow-500" />
                                    Saldering (Zonnepanelen)
                                  </h4>

                                  <div className="space-y-2.5 mb-4">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700 font-medium">Verbruik:</span>
                                      <span className="font-semibold text-gray-900">
                                        {breakdown.saldering.verbruikBruto.toLocaleString()} kWh
                                      </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700 font-medium">Opwekking zonnepanelen:</span>
                                      <span className="font-semibold text-green-700">
                                        {breakdown.saldering.opwekking.toLocaleString()} kWh
                                      </span>
                                    </div>

                                    <div className="border-t-2 border-yellow-400 my-2"></div>
                                    
                                    {/* 30/70 Verdeling */}
                                    <div className="bg-white/50 rounded-lg p-3 space-y-2">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700 font-medium flex items-center gap-1 flex-wrap">
                                          Eigen verbruik (30%):
                                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-normal print:border print:border-purple-300">
                                            direct gebruikt
                                          </span>
                                        </span>
                                        <span className="font-semibold text-purple-700">
                                          {breakdown.saldering.eigenVerbruik.toLocaleString()} kWh
                                        </span>
                                      </div>
                                      
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700 font-medium flex items-center gap-1 flex-wrap">
                                          Teruglevering (70%):
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-normal print:border print:border-blue-300">
                                            naar het net
                                          </span>
                                        </span>
                                        <span className="font-semibold text-blue-700">
                                          {breakdown.saldering.teruglevering.toLocaleString()} kWh
                                        </span>
                                      </div>
                                    </div>

                                    <div className="border-t-2 border-yellow-400 my-2"></div>

                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-900 font-bold flex items-center gap-1 flex-wrap">
                                        Netto verbruik:
                                        {breakdown.saldering.verbruikNetto === 0 && (
                                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal print:border print:border-green-300">
                                            volledig gesaldeerd
                                          </span>
                                        )}
                                      </span>
                                      <span className="font-bold text-brand-navy-600 text-lg">
                                        {breakdown.saldering.verbruikNetto.toLocaleString()} kWh
                                      </span>
                                    </div>
                                  </div>

                                  {/* NIEUW: Overschot vergoeding (alleen bij dynamisch) */}
                                  {contract.type === 'dynamisch' && breakdown.saldering.overschotKwh > 0 && breakdown.leverancier.opbrengstOverschot && breakdown.leverancier.opbrengstOverschot > 0 && (
                                    <div className="mt-3">
                                      <div className="flex justify-between items-center text-sm border-t-2 border-green-400 bg-green-50 px-3 py-3 rounded-lg">
                                        <span className="font-semibold text-green-800 flex items-center gap-1 flex-wrap">
                                          💰 Overschot vergoeding:
                                          <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-normal">
                                            {breakdown.saldering.overschotKwh.toLocaleString()} kWh × €0,02/kWh
                                          </span>
                                        </span>
                                        <span className="font-bold text-green-700 text-lg flex-shrink-0">
                                          + €{breakdown.leverancier.opbrengstOverschot.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Info box */}
                                  <div className="bg-white/70 backdrop-blur-sm border border-yellow-300 rounded-lg p-3 text-xs text-gray-700 leading-relaxed print:bg-gray-50">
                                    <strong className="text-brand-navy-600">ℹ️ Realistische berekening:</strong> Van je opgewekte stroom gebruik je ongeveer 30% direct zelf (eigen verbruik). De overige 70% gaat terug naar het net (teruglevering). Je betaalt alleen energiebelasting over het <strong>netto verbruik</strong> ({breakdown.saldering.verbruikNetto.toLocaleString()} kWh).
                                  </div>
                                </div>
                              )}

                              {/* STROOM */}
                              <div>
                                <h4 className="font-bold text-brand-navy-500 mb-3 text-lg">Stroom</h4>

                                <div className="space-y-1.5 mb-3">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">
                                    Variabele kosten{' '}
                                    <span className="text-[10px] font-medium text-gray-400">
                                      [{isZakelijk ? 'excl. BTW' : 'incl. BTW'}]
                                    </span>
                                  </p>

                                  {breakdown.leverancier.elektriciteitDetails?.type === 'dubbel' && (
                                    <>
                                      <div className="flex justify-between items-center text-sm gap-2">
                                        <span className="text-gray-700 flex-1 min-w-0 break-words">
                                          Leveringskosten normaal
                                          <span className="text-xs text-gray-500 ml-1 block sm:inline">
                                            ({((breakdown.leverancier.elektriciteitDetails.normaal as any)?.nettoKwh ??
                                              breakdown.leverancier.elektriciteitDetails.normaal?.kwh ??
                                              0
                                            ).toLocaleString()}{' '}
                                            kWh × €{formatTariff(breakdown.leverancier.elektriciteitDetails.normaal?.tarief || 0)})
                                          </span>
                                        </span>
                                        <span className="font-medium flex-shrink-0">
                                          €{formatCurrency(breakdown.leverancier.elektriciteitDetails.normaal?.bedrag || 0)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-sm gap-2">
                                        <span className="text-gray-700 flex-1 min-w-0 break-words">
                                          Leveringskosten dal
                                          <span className="text-xs text-gray-500 ml-1 block sm:inline">
                                            ({((breakdown.leverancier.elektriciteitDetails.dal as any)?.nettoKwh ??
                                              breakdown.leverancier.elektriciteitDetails.dal?.kwh ??
                                              0
                                            ).toLocaleString()}{' '}
                                            kWh × €{formatTariff(breakdown.leverancier.elektriciteitDetails.dal?.tarief || 0)})
                                          </span>
                                        </span>
                                        <span className="font-medium flex-shrink-0">
                                          €{formatCurrency(breakdown.leverancier.elektriciteitDetails.dal?.bedrag || 0)}
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {breakdown.leverancier.elektriciteitDetails?.type === 'enkel' && (
                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0 break-words">
                                        Leveringskosten enkeltarief
                                        <span className="text-xs text-gray-500 ml-1 block sm:inline">
                                          ({((breakdown.leverancier.elektriciteitDetails.enkel as any)?.nettoKwh ??
                                            breakdown.leverancier.elektriciteitDetails.enkel?.kwh ??
                                            0
                                          ).toLocaleString()}{' '}
                                          kWh × €{formatTariff(breakdown.leverancier.elektriciteitDetails.enkel?.tarief || 0)})
                                        </span>
                                      </span>
                                      <span className="font-medium flex-shrink-0">
                                        €{formatCurrency(breakdown.leverancier.elektriciteitDetails.enkel?.bedrag || 0)}
                                      </span>
                                    </div>
                                  )}

                                  {!breakdown.leverancier.elektriciteitDetails && (
                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0 break-words">
                                        Leveringskosten stroom
                                        <span className="text-xs text-gray-500 ml-1">({totaalElektriciteit.toLocaleString()} kWh)</span>
                                      </span>
                                      <span className="font-medium flex-shrink-0">
                                        €{formatCurrency(breakdown.leverancier.elektriciteit)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Dynamische prijsinformatie (spotprijs + opslag) */}
                                  {breakdown.dynamischePrijzen && (
                                    <details className="ml-4 text-xs text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200 print:bg-white print:border-gray-300">
                                      <summary className="cursor-pointer hover:text-brand-teal-600 font-semibold text-brand-navy-600 mb-1">
                                        📊 Dynamische prijsopbouw (spotprijs + opslag)
                                      </summary>
                                      <div className="mt-3 space-y-3">
                                        {/* Elektriciteit Dag */}
                                        {breakdown.leverancier.elektriciteitDetails?.normaal && (
                                          <div className="space-y-1">
                                            <div className="font-medium text-gray-700">Elektriciteit (normaal/dag):</div>
                                            <div className="pl-3 space-y-0.5 text-gray-600">
                                              <div className="flex justify-between">
                                                <span>• Spotprijs (30d gem.):</span>
                                                <span className="font-mono">€{breakdown.dynamischePrijzen.spotprijzen.elektriciteitDag.toFixed(5)}/kWh</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>• Opslag leverancier:</span>
                                                <span className="font-mono">€{breakdown.dynamischePrijzen.opslagen.elektriciteit.toFixed(5)}/kWh</span>
                                              </div>
                                              <div className="flex justify-between pt-1 border-t border-blue-300 font-semibold text-gray-800">
                                                <span>= Totaal tarief:</span>
                                                <span className="font-mono">€{breakdown.dynamischePrijzen.totaalTarieven.elektriciteitDag.toFixed(5)}/kWh</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Elektriciteit Nacht */}
                                        {breakdown.leverancier.elektriciteitDetails?.dal && (
                                          <div className="space-y-1 pt-2 border-t border-blue-200">
                                            <div className="font-medium text-gray-700">Elektriciteit (dal/nacht):</div>
                                            <div className="pl-3 space-y-0.5 text-gray-600">
                                              <div className="flex justify-between">
                                                <span>• Spotprijs (30d gem.):</span>
                                                <span className="font-mono">€{breakdown.dynamischePrijzen.spotprijzen.elektriciteitNacht.toFixed(5)}/kWh</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>• Opslag leverancier:</span>
                                                <span className="font-mono">€{breakdown.dynamischePrijzen.opslagen.elektriciteit.toFixed(5)}/kWh</span>
                                              </div>
                                              <div className="flex justify-between pt-1 border-t border-blue-300 font-semibold text-gray-800">
                                                <span>= Totaal tarief:</span>
                                                <span className="font-mono">€{breakdown.dynamischePrijzen.totaalTarieven.elektriciteitNacht.toFixed(5)}/kWh</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-gray-600 italic">
                                          💡 Spotprijzen zijn 30-dagen gemiddelden en variëren dagelijks
                                        </div>
                                      </div>
                                    </details>
                                  )}

                                  <div className="flex justify-between items-center text-sm gap-2">
                                    <span className="text-gray-700 flex-1 min-w-0">Energiebelasting</span>
                                    <span className="font-medium flex-shrink-0">
                                      €{formatCurrency(breakdown.energiebelasting.elektriciteit)}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">
                                    Vaste kosten{' '}
                                    <span className="text-[10px] font-medium text-gray-400">
                                      [{isZakelijk ? 'excl. BTW' : 'incl. BTW'}]
                                    </span>
                                  </p>

                                  <div className="flex justify-between items-center text-sm gap-2">
                                    <span className="text-gray-700 flex-1 min-w-0">Vastrecht</span>
                                    <span className="font-medium flex-shrink-0">€{formatCurrency(breakdown.leverancier.vastrechtStroom)}</span>
                                  </div>

                                  <div className="flex justify-between items-center text-sm gap-2">
                                    <span className="text-gray-700 flex-1 min-w-0 break-words">
                                      Netbeheerkosten {aansluitwaardeElektriciteit}
                                      <span className="text-xs text-gray-500 ml-1">({breakdown.netbeheer.netbeheerder})</span>
                                    </span>
                                    <span className="font-medium flex-shrink-0">€{formatCurrency(breakdown.netbeheer.elektriciteit)}</span>
                                  </div>

                                  {isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit) && (
                                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                      <p className="text-xs text-blue-700 leading-relaxed">
                                        <strong>Let op:</strong> Bij grootverbruik aansluitingen (&gt;3x80A) worden de netbeheerkosten apart door de netbeheerder in rekening gebracht en zijn daarom niet opgenomen in dit maandbedrag.
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center text-sm text-green-700 gap-2">
                                    <span className="flex-1 min-w-0">Vermindering EB</span>
                                    <span className="font-medium flex-shrink-0">-€{formatCurrency(breakdown.energiebelasting.vermindering)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* GAS */}
                              {verbruikGas > 0 && (
                                <div className="pt-4 border-t border-gray-200">
                                  <h4 className="font-bold text-brand-navy-500 mb-3 text-lg">Gas</h4>

                                  <div className="space-y-1.5 mb-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                      Variabele kosten{' '}
                                      <span className="text-[10px] font-medium text-gray-400">
                                        [{isZakelijk ? 'excl. BTW' : 'incl. BTW'}]
                                      </span>
                                    </p>

                                    {breakdown.leverancier.gasDetails && (
                                      <div className="flex justify-between items-center text-sm gap-2">
                                        <span className="text-gray-700 flex-1 min-w-0 break-words">
                                          Leveringskosten gas
                                          <span className="text-xs text-gray-500 ml-1 block sm:inline">
                                            ({breakdown.leverancier.gasDetails.m3.toLocaleString()} m³ × €
                                            {formatTariff(breakdown.leverancier.gasDetails.tarief)})
                                          </span>
                                        </span>
                                        <span className="font-medium flex-shrink-0">€{formatCurrency(breakdown.leverancier.gasDetails.bedrag)}</span>
                                      </div>
                                    )}

                                    {/* Dynamische gas prijsinformatie (spotprijs + opslag) */}
                                    {breakdown.dynamischePrijzen && breakdown.leverancier.gasDetails && (
                                      <details className="ml-4 text-xs text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200 print:bg-white print:border-gray-300">
                                        <summary className="cursor-pointer hover:text-brand-teal-600 font-semibold text-brand-navy-600 mb-1">
                                          📊 Dynamische prijsopbouw (spotprijs + opslag)
                                        </summary>
                                        <div className="mt-3 space-y-1">
                                          <div className="flex justify-between">
                                            <span>• Spotprijs (30d gem.):</span>
                                            <span className="font-mono">€{breakdown.dynamischePrijzen.spotprijzen.gas.toFixed(5)}/m³</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>• Opslag leverancier:</span>
                                            <span className="font-mono">€{breakdown.dynamischePrijzen.opslagen.gas.toFixed(5)}/m³</span>
                                          </div>
                                          <div className="flex justify-between pt-1 border-t border-blue-300 font-semibold text-gray-800">
                                            <span>= Totaal tarief:</span>
                                            <span className="font-mono">€{breakdown.dynamischePrijzen.totaalTarieven.gas.toFixed(5)}/m³</span>
                                          </div>
                                          <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-gray-600 italic">
                                            💡 Spotprijzen zijn 30-dagen gemiddelden en variëren dagelijks
                                          </div>
                                        </div>
                                      </details>
                                    )}

                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0">Energiebelasting</span>
                                      <span className="font-medium flex-shrink-0">€{formatCurrency(breakdown.energiebelasting.gas)}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                      Vaste kosten{' '}
                                      <span className="text-[10px] font-medium text-gray-400">
                                        [{isZakelijk ? 'excl. BTW' : 'incl. BTW'}]
                                      </span>
                                    </p>

                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0">Vastrecht</span>
                                      <span className="font-medium flex-shrink-0">€{formatCurrency(breakdown.leverancier.vastrechtGas)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0 break-words">
                                        Netbeheerkosten {aansluitwaardeGas}
                                        <span className="text-xs text-gray-500 ml-1">({breakdown.netbeheer.netbeheerder})</span>
                                      </span>
                                      <span className="font-medium flex-shrink-0">€{formatCurrency(breakdown.netbeheer.gas)}</span>
                                    </div>

                                    {isGrootverbruikGasAansluitwaarde(aansluitwaardeGas) && (
                                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                          <strong>Let op:</strong> Bij grootverbruik aansluitingen (&gt;G25) worden de netbeheerkosten apart door de netbeheerder in rekening gebracht en zijn daarom niet opgenomen in dit maandbedrag.
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* TOTAL */}
                              <div className="pt-4 border-t-2 border-gray-300 bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-brand-navy-500">
                                    Totaal {isZakelijk ? '(excl. btw)' : '(incl. btw)'}
                                  </span>
                                  <span className="font-bold text-brand-navy-500">
                                    {/* Use contract.maandbedrag (from results page calculation) instead of breakdown total */}
                                    {/* This ensures consistency between results page and details drawer */}
                                    €{(contract.maandbedrag ?? (isZakelijk ? breakdown.totaal.maandExclBtw : breakdown.totaal.maandInclBtw ?? breakdown.totaal.maandExclBtw)).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mnd
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Voorwaarden */}
                      {activeTab === 'voorwaarden' && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-brand-navy-500 text-lg">Voorwaarden</h4>
                          <div className="space-y-3">
                            {(contract.voorwaarden || []).length === 0 ? (
                              <div className="text-sm text-gray-600">Geen voorwaarden beschikbaar.</div>
                            ) : (
                              (contract.voorwaarden || []).map((v, idx) => {
                                // Parse voorwaarde: kan een JSON string zijn (document) of plain string (oude format)
                                // Of het kan al een object zijn (als het al geparsed is)
                                let voorwaardeObj: { naam?: string; url?: string; type?: string } | null = null
                                
                                // Check 1: Is het al een object?
                                if (v && typeof v === 'object' && !Array.isArray(v) && v !== null) {
                                  // Het is al een object
                                  const vObj = v as { naam?: string; url?: string; type?: string }
                                  if (vObj.url && (vObj.type === 'pdf' || vObj.type === 'doc')) {
                                    voorwaardeObj = vObj as { naam: string; url: string; type: string }
                                  }
                                } 
                                // Check 2: Is het een string die JSON kan zijn?
                                else if (typeof v === 'string') {
                                  // Check of het eruit ziet als JSON (begint met { en eindigt met })
                                  const trimmed = v.trim()
                                  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                                    // Probeer te parsen als JSON
                                    try {
                                      const parsed = JSON.parse(trimmed)
                                      if (parsed && typeof parsed === 'object' && parsed !== null && parsed.url && (parsed.type === 'pdf' || parsed.type === 'doc')) {
                                        // Het is een JSON string met document info
                                        voorwaardeObj = parsed as { naam: string; url: string; type: string }
                                      }
                                    } catch (e) {
                                      // Parsing gefaald, behandel als plain string
                                      console.warn('Failed to parse voorwaarde as JSON:', e, v)
                                    }
                                  }
                                }

                                // Render als document (met link) of als plain tekst
                                if (voorwaardeObj && voorwaardeObj.url) {
                                  // Document met URL
                                  const isPdf = voorwaardeObj.type === 'pdf'
                                  const isDoc = voorwaardeObj.type === 'doc'
                                  const documentUrl = getFriendlyDocumentUrl(voorwaardeObj.url)
                                  return (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                      {isPdf ? (
                                        <FilePdf className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" weight="bold" />
                                      ) : isDoc ? (
                                        <FileText className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" weight="bold" />
                                      ) : (
                                        <Check className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" weight="bold" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <a
                                          href={documentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 text-brand-teal-600 hover:text-brand-teal-700 font-medium hover:underline break-words"
                                        >
                                          <span className="break-words">{voorwaardeObj.naam || 'Download voorwaarden'}</span>
                                        </a>
                                      </div>
                                    </div>
                                  )
                                } else {
                                  // Plain tekst (oude format of tekstvoorwaarde)
                                  const tekst = typeof v === 'string' ? v : (v as any)?.naam || String(v) || 'Voorwaarde'
                                  return (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                      <Check className="w-5 h-5 text-brand-teal-600 flex-shrink-0 mt-0.5" weight="bold" />
                                      <span className="min-w-0 break-words">{tekst}</span>
                                    </div>
                                  )
                                }
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* Over leverancier */}
                      {activeTab === 'over' && (
                        <div className="space-y-4">
                          <h4 className="font-bold text-brand-navy-500 text-lg">Over {contract.leverancier.naam}</h4>
                          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {contract.leverancier.overLeverancier ||
                              'We hebben nog geen uitgebreide informatie over deze leverancier. Bekijk de details of ga naar de website van de leverancier.'}
                          </div>

                          {contract.groeneEnergie && (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                              <div className="flex items-center gap-2 font-semibold text-green-800">
                                <Sun className="w-5 h-5" weight="duotone" />
                                Groene stroom
                              </div>
                              <p className="mt-1 text-sm text-green-800/80">
                                Dit contract biedt groene stroom.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
          <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render via portal to escape any stacking contexts (e.g. parent transforms),
  // ensuring the drawer always sits above the fixed header.
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body)
  }

  return content
}


