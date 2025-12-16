'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Calculator, FileText, Info } from '@phosphor-icons/react'
import type { KostenBreakdown } from './ContractCard'
import { getFriendlyDocumentUrl } from '@/lib/document-url'
import { Check, FilePdf, Sun } from '@phosphor-icons/react'
import type { ContractOptie } from '@/types/calculator'
import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'

interface ContractDetailsModalProps {
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

type Tab = 'prijsdetails' | 'voorwaarden' | 'over'

export function ContractDetailsModal({
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
}: ContractDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('prijsdetails')

  const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contract.leverancier.naam}
      size="xl"
    >
      {/* Tabs - Perfectly divided into 3 equal parts */}
      <div className="flex border-b-2 border-gray-200 -mx-6 px-6 mb-6">
        <button
          onClick={() => setActiveTab('prijsdetails')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'prijsdetails'
              ? 'text-brand-teal-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calculator weight={activeTab === 'prijsdetails' ? 'bold' : 'regular'} className="w-5 h-5" />
          <span className="whitespace-nowrap">Prijsdetails</span>
          {activeTab === 'prijsdetails' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('voorwaarden')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'voorwaarden'
              ? 'text-brand-teal-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText weight={activeTab === 'voorwaarden' ? 'bold' : 'regular'} className="w-5 h-5" />
          <span className="whitespace-nowrap">Voorwaarden</span>
          {activeTab === 'voorwaarden' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('over')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'over'
              ? 'text-brand-teal-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Info weight={activeTab === 'over' ? 'bold' : 'regular'} className="w-5 h-5" />
          <span className="whitespace-nowrap">Over leverancier</span>
          {activeTab === 'over' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal-600" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Prijsdetails Tab */}
        {activeTab === 'prijsdetails' && (
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {breakdown && !loading && (
              <div className="space-y-4">
                {/* STROOM SECTIE */}
                <div>
                  <h4 className="font-bold text-brand-navy-500 mb-3 text-lg">Stroom</h4>

                  {/* Variabele kosten */}
                  <div className="space-y-1.5 mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Variabele kosten</p>

                    {/* Leveringskosten stroom - met tarief details */}
                    {breakdown.leverancier.elektriciteitDetails?.type === 'dubbel' && (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Leveringskosten normaal
                            <span className="text-xs text-gray-500 ml-1">
                              ({((breakdown.leverancier.elektriciteitDetails.normaal as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.normaal?.kwh ?? 0).toLocaleString()} kWh × €{breakdown.leverancier.elektriciteitDetails.normaal?.tarief.toFixed(6)})
                            </span>
                          </span>
                          <span className="font-medium">
                            €{breakdown.leverancier.elektriciteitDetails.normaal?.bedrag.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Leveringskosten dal
                            <span className="text-xs text-gray-500 ml-1">
                              ({((breakdown.leverancier.elektriciteitDetails.dal as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.dal?.kwh ?? 0).toLocaleString()} kWh × €{breakdown.leverancier.elektriciteitDetails.dal?.tarief.toFixed(6)})
                            </span>
                          </span>
                          <span className="font-medium">
                            €{breakdown.leverancier.elektriciteitDetails.dal?.bedrag.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    {breakdown.leverancier.elektriciteitDetails?.type === 'enkel' && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Leveringskosten enkeltarief
                          <span className="text-xs text-gray-500 ml-1">
                            ({((breakdown.leverancier.elektriciteitDetails.enkel as any)?.nettoKwh ?? breakdown.leverancier.elektriciteitDetails.enkel?.kwh ?? 0).toLocaleString()} kWh × €{breakdown.leverancier.elektriciteitDetails.enkel?.tarief.toFixed(6)})
                          </span>
                        </span>
                        <span className="font-medium">
                          €{breakdown.leverancier.elektriciteitDetails.enkel?.bedrag.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Fallback als er geen details zijn */}
                    {!breakdown.leverancier.elektriciteitDetails && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Leveringskosten stroom
                          <span className="text-xs text-gray-500 ml-1">
                            ({totaalElektriciteit.toLocaleString()} kWh)
                          </span>
                        </span>
                        <span className="font-medium">
                          €{breakdown.leverancier.elektriciteit.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Energiebelasting stroom */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Energiebelasting</span>
                      <span className="font-medium">
                        €{breakdown.energiebelasting.elektriciteit.toFixed(2)}
                      </span>
                    </div>

                    {/* Energiebelasting staffels uitklapper */}
                    {breakdown.energiebelasting.staffels && (
                      <details className="ml-4 text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-brand-teal-600 font-medium">
                          Bekijk staffels
                        </summary>
                        <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
                          {breakdown.energiebelasting.staffels.schijf1 && (
                            <div className="flex justify-between">
                              <span>0-{breakdown.energiebelasting.staffels.schijf1.kwh.toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf1.tarief.toFixed(5)}</span>
                              <span>€{breakdown.energiebelasting.staffels.schijf1.bedrag.toFixed(2)}</span>
                            </div>
                          )}
                          {breakdown.energiebelasting.staffels.schijf2 && (
                            <div className="flex justify-between">
                              <span>{(breakdown.energiebelasting.staffels.schijf1?.kwh || 0).toLocaleString()}-{breakdown.energiebelasting.staffels.schijf2.kwh.toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf2.tarief.toFixed(5)}</span>
                              <span>€{breakdown.energiebelasting.staffels.schijf2.bedrag.toFixed(2)}</span>
                            </div>
                          )}
                          {breakdown.energiebelasting.staffels.schijf3 && (
                            <div className="flex justify-between">
                              <span>{(breakdown.energiebelasting.staffels.schijf2?.kwh || 0).toLocaleString()}-{breakdown.energiebelasting.staffels.schijf3.kwh.toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf3.tarief.toFixed(5)}</span>
                              <span>€{breakdown.energiebelasting.staffels.schijf3.bedrag.toFixed(2)}</span>
                            </div>
                          )}
                          {breakdown.energiebelasting.staffels.schijf4 && (
                            <div className="flex justify-between">
                              <span>&gt;{(breakdown.energiebelasting.staffels.schijf3?.kwh || 0).toLocaleString()} kWh × €{breakdown.energiebelasting.staffels.schijf4.tarief.toFixed(5)}</span>
                              <span>€{breakdown.energiebelasting.staffels.schijf4.bedrag.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>

                  {/* Vaste kosten stroom */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Vaste kosten</p>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Vastrecht</span>
                      <span className="font-medium">€{breakdown.leverancier.vastrechtStroom.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">
                        Netbeheerkosten {aansluitwaardeElektriciteit}
                        <span className="text-xs text-gray-500 ml-1">
                          ({breakdown.netbeheer.netbeheerder})
                        </span>
                      </span>
                      <span className="font-medium">€{breakdown.netbeheer.elektriciteit.toFixed(2)}</span>
                    </div>

                    {/* Melding voor grootverbruik elektriciteit */}
                    {isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit) && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700 leading-relaxed">
                          <strong>Let op:</strong> Bij grootverbruik aansluitingen (&gt;3x80A) worden de netbeheerkosten apart door de netbeheerder in rekening gebracht en zijn daarom niet opgenomen in dit maandbedrag.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-green-700">
                      <span>Vermindering EB</span>
                      <span className="font-medium">-€{breakdown.energiebelasting.vermindering.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Subtotaal stroom */}
                  <div className="mt-3 pt-2 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-navy-500">Totaal stroom</span>
                      <span className="font-bold text-brand-navy-500">
                        €{(breakdown.leverancier.elektriciteit +
                           breakdown.energiebelasting.elektriciteit +
                           breakdown.netbeheer.elektriciteit +
                           breakdown.leverancier.vastrechtStroom -
                           breakdown.energiebelasting.vermindering).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GAS SECTIE */}
                {verbruikGas > 0 && (
                  <div className="pt-4 border-t-2 border-gray-200">
                    <h4 className="font-bold text-brand-navy-500 mb-3 text-lg">Gas</h4>

                    {/* Variabele kosten */}
                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Variabele kosten</p>

                      {/* Leveringskosten gas - met tarief details */}
                      {breakdown.leverancier.gasDetails ? (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Leveringskosten gas
                            <span className="text-xs text-gray-500 ml-1">
                              ({breakdown.leverancier.gasDetails.m3.toLocaleString()} m³ × €{breakdown.leverancier.gasDetails.tarief.toFixed(6)})
                            </span>
                          </span>
                          <span className="font-medium">
                            €{breakdown.leverancier.gasDetails.bedrag.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            Leveringskosten gas
                            <span className="text-xs text-gray-500 ml-1">
                              ({verbruikGas.toLocaleString()} m³)
                            </span>
                          </span>
                          <span className="font-medium">
                            €{breakdown.leverancier.gas.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Energiebelasting gas */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Energiebelasting
                          <span className="text-xs text-gray-500 ml-1">
                            (staffel: €0,57816/m³)
                          </span>
                        </span>
                        <span className="font-medium">
                          €{breakdown.energiebelasting.gas.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Vaste kosten gas */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Vaste kosten</p>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Vastrecht</span>
                        <span className="font-medium">€{breakdown.leverancier.vastrechtGas.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Netbeheerkosten {aansluitwaardeGas}
                          <span className="text-xs text-gray-500 ml-1">
                            ({breakdown.netbeheer.netbeheerder})
                          </span>
                        </span>
                        <span className="font-medium">€{breakdown.netbeheer.gas.toFixed(2)}</span>
                      </div>

                      {/* Melding voor grootverbruik gas */}
                      {isGrootverbruikGasAansluitwaarde(aansluitwaardeGas) && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-xs text-blue-700 leading-relaxed">
                            <strong>Let op:</strong> Bij grootverbruik aansluitingen (&gt;G25) worden de netbeheerkosten apart door de netbeheerder in rekening gebracht en zijn daarom niet opgenomen in dit maandbedrag.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Subtotaal gas */}
                    <div className="mt-3 pt-2 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-brand-navy-500">Totaal gas</span>
                        <span className="font-bold text-brand-navy-500">
                          €{(breakdown.leverancier.gas +
                             breakdown.energiebelasting.gas +
                             breakdown.netbeheer.gas +
                             breakdown.leverancier.vastrechtGas).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Teruglevering (zonnepanelen) - VASTE CONTRACTEN */}
                {contract.type === 'vast' && breakdown.leverancier.terugleveringDetails && breakdown.leverancier.terugleveringDetails.kwh > 0 && breakdown.leverancier.terugleveringDetails.bedrag > 0 && (
                  <div className="bg-brand-teal-50 border-2 border-brand-teal-200 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
                      <Sun weight="duotone" className="w-5 h-5 text-brand-teal-600" />
                      Teruglevering (Zonnepanelen)
                    </h4>

                    {/* Terugleverkosten */}
                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Terugleverkosten</p>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Kosten teruglevering
                          <span className="text-xs text-gray-500 ml-1">
                            ({breakdown.leverancier.terugleveringDetails.kwh.toLocaleString()} kWh × €{breakdown.leverancier.terugleveringDetails.tarief.toFixed(6)})
                          </span>
                        </span>
                        <span className="font-medium text-brand-teal-700">
                          €{breakdown.leverancier.terugleveringDetails.bedrag.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Info box */}
                    <div className="mt-3 p-2 bg-brand-teal-100 rounded text-xs text-brand-teal-900">
                      <strong>ℹ️ Salderingsregeling:</strong> Je verbruik is al verrekend met je teruglevering. Bovenstaande kosten zijn de administratiekosten die de leverancier rekent voor het innemen van stroom.
                    </div>
                  </div>
                )}

                {/* Opbrengst extra teruglevering - DYNAMISCHE CONTRACTEN */}
                {contract.type === 'dynamisch' && breakdown.leverancier.overschotKwh && breakdown.leverancier.overschotKwh > 0 && breakdown.leverancier.opbrengstOverschot && breakdown.leverancier.opbrengstOverschot > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <h4 className="font-bold text-brand-navy-500 mb-3 flex items-center gap-2">
                      <Sun weight="duotone" className="w-5 h-5 text-green-600" />
                      Opbrengst Extra Teruglevering
                    </h4>

                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Opbrengst</p>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">
                          Opbrengst extra teruglevering
                          <span className="text-xs text-gray-500 ml-1">
                            ({breakdown.leverancier.overschotKwh.toLocaleString()} kWh)
                          </span>
                        </span>
                        <span className="font-medium text-green-700">
                          − €{breakdown.leverancier.opbrengstOverschot.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Info box */}
                    <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-900">
                      <strong>ℹ️ Salderingsregeling:</strong> Je hebt meer stroom teruggeleverd dan verbruikt. Je krijgt voor de overschot teruglevering een vergoeding van je leverancier.
                    </div>
                  </div>
                )}

                {/* TOTAAL SECTIE */}
                <div className="pt-4 border-t-2 border-gray-300 bg-yellow-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-navy-500">Totaal per jaar (excl. btw)</span>
                      <span className="font-bold text-brand-navy-500">€{breakdown.totaal.jaarExclBtw.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-yellow-300">
                      <span className="text-brand-navy-500">Per maand (excl. btw)</span>
                      <span className="text-brand-navy-500">€{breakdown.totaal.maandExclBtw.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Per maand (incl. 21% btw)</span>
                      <span>€{(breakdown.totaal.maandExclBtw * 1.21).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voorwaarden Tab */}
        {activeTab === 'voorwaarden' && (
          <div className="space-y-2">
            {contract.voorwaarden && contract.voorwaarden.length > 0 ? (() => {
              // Filter alleen documenten (PDF/DOC met URL), negeer tekstvoorwaarden
              const documenten = contract.voorwaarden
                .map(vw => {
                  let voorwaardeObj: { naam?: string; url?: string; type?: string } | null = null

                  if (typeof vw === 'string') {
                    // Try to parse as JSON
                    try {
                      const parsed = JSON.parse(vw) as { naam?: string; url?: string; type?: string }
                      if (parsed && typeof parsed === 'object' && parsed.url && (parsed.type === 'pdf' || parsed.type === 'doc')) {
                        voorwaardeObj = parsed
                      }
                    } catch {
                      // Legacy string format - ignore (tekstvoorwaarde)
                    }
                  } else if (vw && typeof vw === 'object' && 'naam' in vw) {
                    const vwObj = vw as { naam?: string; url?: string; type?: string }
                    if (vwObj.url && (vwObj.type === 'pdf' || vwObj.type === 'doc')) {
                      voorwaardeObj = vwObj
                    }
                  }

                  return voorwaardeObj
                })
                .filter((v): v is { naam: string; url: string; type: 'pdf' | 'doc' } => v !== null)

              if (documenten.length === 0) {
                return <p className="text-sm text-gray-500">Geen voorwaarden beschikbaar</p>
              }

              return documenten.map((vw, i) => {
                const isPdf = vw.type === 'pdf'
                const isDoc = vw.type === 'doc'

                return (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    {isPdf ? (
                      <FilePdf weight="bold" className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : isDoc ? (
                      <FileText weight="bold" className="w-4 h-4 text-brand-teal-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    )}
                    <a
                      href={getFriendlyDocumentUrl(vw.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-teal-600 hover:text-brand-teal-700 hover:underline font-medium"
                    >
                      {vw.naam || 'Download voorwaarden'}
                    </a>
                  </div>
                )
              })
            })() : (
              <p className="text-sm text-gray-500">Geen voorwaarden beschikbaar</p>
            )}
            {contract.bijzonderheden && contract.bijzonderheden.length > 0 && (
              <>
                <div className="border-t border-gray-100 my-3" />
                <p className="text-xs font-semibold text-gray-600 mb-2">Bijzonderheden:</p>
                {contract.bijzonderheden.map((bz, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <span>{bz}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Over leverancier Tab */}
        {activeTab === 'over' && (
          <div>
            {contract.leverancier.overLeverancier ? (
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {contract.leverancier.overLeverancier}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Geen informatie beschikbaar over deze leverancier</p>
            )}
            {contract.leverancier.website && (
              <a
                href={contract.leverancier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-sm text-brand-teal-600 hover:text-brand-teal-700 font-semibold"
              >
                Bezoek website →
              </a>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

