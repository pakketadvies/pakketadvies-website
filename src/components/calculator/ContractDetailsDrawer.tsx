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
}: ContractDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('prijsdetails')

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
                              {/* STROOM */}
                              <div>
                                <h4 className="font-bold text-brand-navy-500 mb-3 text-lg">Stroom</h4>

                                <div className="space-y-1.5 mb-3">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Variabele kosten</p>

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
                                            kWh × €{breakdown.leverancier.elektriciteitDetails.normaal?.tarief.toFixed(6)})
                                          </span>
                                        </span>
                                        <span className="font-medium flex-shrink-0">
                                          €{breakdown.leverancier.elektriciteitDetails.normaal?.bedrag.toFixed(2)}
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
                                            kWh × €{breakdown.leverancier.elektriciteitDetails.dal?.tarief.toFixed(6)})
                                          </span>
                                        </span>
                                        <span className="font-medium flex-shrink-0">
                                          €{breakdown.leverancier.elektriciteitDetails.dal?.bedrag.toFixed(2)}
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
                                          kWh × €{breakdown.leverancier.elektriciteitDetails.enkel?.tarief.toFixed(6)})
                                        </span>
                                      </span>
                                      <span className="font-medium flex-shrink-0">
                                        €{breakdown.leverancier.elektriciteitDetails.enkel?.bedrag.toFixed(2)}
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
                                        €{breakdown.leverancier.elektriciteit.toFixed(2)}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center text-sm gap-2">
                                    <span className="text-gray-700 flex-1 min-w-0">Energiebelasting</span>
                                    <span className="font-medium flex-shrink-0">
                                      €{breakdown.energiebelasting.elektriciteit.toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-gray-200">
                                  <p className="text-xs font-semibold text-gray-500 mb-1">Vaste kosten</p>

                                  <div className="flex justify-between items-center text-sm gap-2">
                                    <span className="text-gray-700 flex-1 min-w-0">Vastrecht</span>
                                    <span className="font-medium flex-shrink-0">€{breakdown.leverancier.vastrechtStroom.toFixed(2)}</span>
                                  </div>

                                  <div className="flex justify-between items-center text-sm gap-2">
                                    <span className="text-gray-700 flex-1 min-w-0 break-words">
                                      Netbeheerkosten {aansluitwaardeElektriciteit}
                                      <span className="text-xs text-gray-500 ml-1">({breakdown.netbeheer.netbeheerder})</span>
                                    </span>
                                    <span className="font-medium flex-shrink-0">€{breakdown.netbeheer.elektriciteit.toFixed(2)}</span>
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
                                    <span className="font-medium flex-shrink-0">-€{breakdown.energiebelasting.vermindering.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* GAS */}
                              {verbruikGas > 0 && (
                                <div className="pt-4 border-t border-gray-200">
                                  <h4 className="font-bold text-brand-navy-500 mb-3 text-lg">Gas</h4>

                                  <div className="space-y-1.5 mb-3">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Variabele kosten</p>

                                    {breakdown.leverancier.gasDetails && (
                                      <div className="flex justify-between items-center text-sm gap-2">
                                        <span className="text-gray-700 flex-1 min-w-0 break-words">
                                          Leveringskosten gas
                                          <span className="text-xs text-gray-500 ml-1 block sm:inline">
                                            ({breakdown.leverancier.gasDetails.m3.toLocaleString()} m³ × €
                                            {breakdown.leverancier.gasDetails.tarief.toFixed(6)})
                                          </span>
                                        </span>
                                        <span className="font-medium flex-shrink-0">€{breakdown.leverancier.gasDetails.bedrag.toFixed(2)}</span>
                                      </div>
                                    )}

                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0">Energiebelasting</span>
                                      <span className="font-medium flex-shrink-0">€{breakdown.energiebelasting.gas.toFixed(2)}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500 mb-1">Vaste kosten</p>

                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0">Vastrecht</span>
                                      <span className="font-medium flex-shrink-0">€{breakdown.leverancier.vastrechtGas.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm gap-2">
                                      <span className="text-gray-700 flex-1 min-w-0 break-words">
                                        Netbeheerkosten {aansluitwaardeGas}
                                        <span className="text-xs text-gray-500 ml-1">({breakdown.netbeheer.netbeheerder})</span>
                                      </span>
                                      <span className="font-medium flex-shrink-0">€{breakdown.netbeheer.gas.toFixed(2)}</span>
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
                                  <span className="font-bold text-brand-navy-500">Totaal (incl. btw)</span>
                                  <span className="font-bold text-brand-navy-500">
                                    €{(breakdown.totaal.maandInclBtw ?? breakdown.totaal.maandExclBtw).toFixed(0)}/mnd
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
                          <div className="space-y-2">
                            {(contract.voorwaarden || []).length === 0 ? (
                              <div className="text-sm text-gray-600">Geen voorwaarden beschikbaar.</div>
                            ) : (
                              (contract.voorwaarden || []).map((v, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <Check className="w-5 h-5 text-brand-teal-600 flex-shrink-0" weight="bold" />
                                  <span className="min-w-0 break-words">{v}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Documents */}
                          <div className="pt-3 border-t border-gray-200">
                            <h5 className="font-semibold text-brand-navy-500 mb-2">Documenten</h5>
                            <div className="space-y-2">
                              {(contract.leverancier?.website || contract.contractNaam) && (
                                <a
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-teal-700 hover:text-brand-teal-800"
                                  href={contract.leverancier.website || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <FilePdf className="w-4 h-4" weight="bold" />
                                  Naar leverancier
                                </a>
                              )}
                              <div className="text-xs text-gray-500">
                                {getFriendlyDocumentUrl('voorwaarden')} {/* keeps same helper semantics */}
                              </div>
                            </div>
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


