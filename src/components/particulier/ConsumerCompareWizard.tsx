'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { VerbruikData } from '@/types/calculator'
import { estimateConsumerUsage } from '@/lib/particulier-verbruik-schatting'
import { ConsumerAddressStartCard } from '@/components/particulier/ConsumerAddressStartCard'

type MethodChoice = 'manual' | 'estimate' | 'netbeheerder'

const RESULTS_PATH = '/particulier/energie-vergelijken/resultaten'

export function ConsumerCompareWizard() {
  const router = useRouter()
  const { setVerbruik, verbruik } = useCalculatorStore()

  const [method, setMethod] = useState<MethodChoice>('manual')

  // Step 2 values (manual / estimate)
  const [hasSingleMeter, setHasSingleMeter] = useState(false)
  const [electricityNormal, setElectricityNormal] = useState<number | ''>('')
  const [electricityOffPeak, setElectricityOffPeak] = useState<number | ''>('')
  const [hasGas, setHasGas] = useState(true)
  const [gasM3, setGasM3] = useState<number | ''>('')
  const [hasSolar, setHasSolar] = useState(false)
  const [feedInKwh, setFeedInKwh] = useState<number | ''>('')
  const [numberOfSolarPanels, setNumberOfSolarPanels] = useState<number | ''>(1) // Aantal zonnepanelen voor estimate mode
  const [hasSmartMeter, setHasSmartMeter] = useState(true)

  // Estimate inputs
  const [householdSize, setHouseholdSize] = useState(2)

  // iDIN enable gating (until provider configured)
  const idinEnabled = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_IDIN_ENABLED === 'true')
  const [idinError, setIdinError] = useState<string | null>(null)
  const [idinLoading, setIdinLoading] = useState(false)

  const hasCheckedAddress = useMemo(() => {
    const a = verbruik?.leveringsadressen?.[0]
    if (!a?.postcode || !a?.huisnummer) return false
    if (!a?.straat || !a?.plaats) return false
    if (!verbruik?.addressType || verbruik.addressType === null) return false
    return true
  }, [verbruik])

  // Fetch iDIN session data (user data + consumption data)
  const fetchIdinSessionData = useCallback(async () => {
    setIdinLoading(true)
    try {
      const response = await fetch('/api/idin/session')
      if (!response.ok) {
        throw new Error('Failed to fetch session data')
      }

      const result = await response.json()
      if (result.success && result.data) {
        const { userData, consumptionData } = result.data

        // If we have consumption data, auto-fill the form
        if (consumptionData && verbruik) {
          const updated: VerbruikData = {
            ...verbruik,
            // Verbruik data
            elektriciteitNormaal: consumptionData.elektriciteitNormaal || verbruik.elektriciteitNormaal || 0,
            elektriciteitDal: consumptionData.elektriciteitDal || verbruik.elektriciteitDal || null,
            heeftEnkeleMeter: consumptionData.heeftEnkeleMeter ?? verbruik.heeftEnkeleMeter ?? false,
            gasJaar: consumptionData.gasJaar || verbruik.gasJaar || null,
            geenGasaansluiting: consumptionData.geenGasaansluiting ?? verbruik.geenGasaansluiting ?? false,
            terugleveringJaar: consumptionData.terugleveringJaar || verbruik.terugleveringJaar || null,
            heeftZonnepanelen: !!consumptionData.terugleveringJaar || verbruik.heeftZonnepanelen || false,
            // Mark as not estimated (real data from netbeheerder)
            geschat: false,
          }

          setVerbruik(updated)

          // Auto-fill form fields
          if (consumptionData.elektriciteitNormaal) {
            setElectricityNormal(consumptionData.elektriciteitNormaal)
          }
          if (consumptionData.elektriciteitDal) {
            setElectricityOffPeak(consumptionData.elektriciteitDal)
          }
          if (consumptionData.heeftEnkeleMeter !== undefined) {
            setHasSingleMeter(consumptionData.heeftEnkeleMeter)
          }
          if (consumptionData.gasJaar) {
            setGasM3(consumptionData.gasJaar)
            setHasGas(!consumptionData.geenGasaansluiting)
          }
          if (consumptionData.terugleveringJaar) {
            setFeedInKwh(consumptionData.terugleveringJaar)
            setHasSolar(true)
          }

          // Show success message - check URL params again
          const currentParams = new URLSearchParams(window.location.search)
          const currentIdin = currentParams.get('idin')
          if (currentIdin === 'success-with-data') {
            setIdinError(null) // Clear error, show success
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching iDIN session data:', error)
      // Don't show error to user - they can still fill manually
    } finally {
      setIdinLoading(false)
    }
  }, [verbruik, setVerbruik])

  // Allow deep-linking back into the wizard after /api/idin/* redirects.
  useEffect(() => {
    // NOTE: We intentionally do NOT use next/navigation's useSearchParams here,
    // because Next.js requires it to be wrapped in a Suspense boundary at the page level
    // and it can break prerendering on Vercel. Using window.location keeps this fully client-only.
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const spMethod = params.get('method')
    const spIdin = params.get('idin')

    if (spMethod === 'netbeheerder' || spMethod === 'manual' || spMethod === 'estimate') setMethod(spMethod)

    if (spIdin) {
      // Show a friendly message on the netbeheerder card.
      const map: Record<string, string> = {
        'not-configured': 'iDIN is nog niet geconfigureerd. Voeg provider-credentials toe om dit te activeren.',
        'unsupported-provider': 'iDIN provider is niet ondersteund in deze omgeving. Controleer IDIN_PROVIDER.',
        'start-failed': 'iDIN starten is niet gelukt. Controleer of de Signicat OIDC discovery/issuer goed staat ingesteld.',
        'provider-error': 'De iDIN-provider gaf een fout terug. Probeer het opnieuw.',
        'missing-code': 'We hebben geen iDIN code ontvangen. Probeer het opnieuw.',
        'missing-state': 'Je sessie is verlopen (iDIN state ontbreekt). Probeer het opnieuw.',
        'state-mismatch': 'Je sessie is verlopen of ongeldig (iDIN state mismatch). Probeer het opnieuw.',
        'token-exchange-failed': 'Inloggen gelukt, maar tokens ophalen faalde. Controleer client secret en redirect URI.',
        'nonce-mismatch': 'iDIN sessie validatie faalde (nonce mismatch). Probeer het opnieuw.',
        'callback-failed': 'iDIN afronden is niet gelukt. Probeer het later opnieuw.',
        'success':
          'iDIN verificatie gelukt. Verbruiksdata wordt opgehaald...',
        'success-with-data':
          'iDIN gelukt! Je verbruiksdata is opgehaald en ingevuld.',
      }
      setIdinError(map[spIdin] || 'Er is iets misgegaan met iDIN. Probeer het later opnieuw.')
      setMethod('netbeheerder')

      // If success, try to fetch session data
      if (spIdin === 'success' || spIdin === 'success-with-data') {
        // Fetch session data after a short delay to ensure cookie is set
        setTimeout(() => {
          fetchIdinSessionData()
        }, 500)
      }
    }
    // Run on mount
  }, [fetchIdinSessionData])

  const handleSubmitManual = () => {
    if (!verbruik?.leveringsadressen?.length) return

    const en = typeof electricityNormal === 'number' ? electricityNormal : 0
    const ed = hasSingleMeter ? null : (typeof electricityOffPeak === 'number' ? electricityOffPeak : 0)
    const gas = hasGas ? (typeof gasM3 === 'number' ? gasM3 : 0) : null
    const terug = hasSolar ? (typeof feedInKwh === 'number' ? feedInKwh : 0) : null

    const updated: VerbruikData = {
      ...verbruik,
      elektriciteitNormaal: en,
      elektriciteitDal: ed,
      heeftEnkeleMeter: hasSingleMeter,
      gasJaar: gas,
      geenGasaansluiting: !hasGas,
      heeftZonnepanelen: hasSolar,
      terugleveringJaar: terug,
      meterType: hasSmartMeter ? 'slim' : 'oud',
      aansluitwaardeElektriciteit: verbruik.aansluitwaardeElektriciteit || '3x25A',
      aansluitwaardeGas: hasGas ? (verbruik.aansluitwaardeGas || 'G6') : undefined,
      geschat: false,
    }

    setVerbruik(updated)
    router.push(RESULTS_PATH)
  }

  const handleUseEstimate = () => {
    if (!verbruik?.leveringsadressen?.length) return

    const est = estimateConsumerUsage({
      householdSize,
      hasGas,
      hasSolar,
      hasSmartMeter,
    })

    // Bereken teruglevering: aantal zonnepanelen * 385 kWh per paneel
    const calculatedFeedIn = hasSolar && typeof numberOfSolarPanels === 'number' && numberOfSolarPanels > 0
      ? numberOfSolarPanels * 385
      : null

    const updated: VerbruikData = {
      ...verbruik,
      elektriciteitNormaal: est.electricityNormalKwh,
      elektriciteitDal: hasSingleMeter ? null : est.electricityOffPeakKwh,
      heeftEnkeleMeter: hasSingleMeter,
      gasJaar: hasGas ? est.gasM3 : null,
      geenGasaansluiting: !hasGas,
      heeftZonnepanelen: hasSolar,
      terugleveringJaar: calculatedFeedIn,
      meterType: est.meterType,
      aansluitwaardeElektriciteit: verbruik.aansluitwaardeElektriciteit || '3x25A',
      aansluitwaardeGas: hasGas ? (verbruik.aansluitwaardeGas || 'G6') : undefined,
      geschat: true,
    }

    setVerbruik(updated)
    router.push(RESULTS_PATH)
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
        {!hasCheckedAddress ? (
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-navy-600">Start met je adres</h2>
            <p className="mt-2 text-gray-600">
              We doen direct dezelfde adrescheck als in de calculator. Daarna kun je kiezen hoe je je verbruik invult.
            </p>
            <div className="mt-6">
              <ConsumerAddressStartCard
                variant="inline"
                nextHref="/particulier/energie-vergelijken"
                title="Controleer je adres"
                description="Vul postcode, huisnummer (en eventueel toevoeging) in. We checken meteen het aansluitpunt."
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-brand-navy-600">Kies hoe je je verbruik invult</h2>
                <p className="mt-2 text-gray-600">Kies de optie die het makkelijkst is. Daarna tonen we direct je resultaten.</p>
              </div>
              <Link href="/particulier" className="text-sm font-semibold text-brand-teal-600 hover:underline">
                Adres wijzigen
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  key: 'manual' as const,
                  title: 'Ja, ik weet mijn verbruik',
                  desc: 'Je kunt je verbruik handmatig invoeren.',
                },
                {
                  key: 'estimate' as const,
                  title: 'Nee, help mijn verbruik schatten',
                  desc: 'We helpen je een schatting te maken.',
                },
                {
                  key: 'netbeheerder' as const,
                  title: 'Verbruik ophalen bij netbeheerder',
                  desc: 'Automatisch en veilig via iDIN.',
                },
              ].map((opt) => {
                const active = method === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setMethod(opt.key)}
                    className={`text-left rounded-2xl border p-5 transition-all ${
                      active
                        ? 'border-brand-teal-500 bg-brand-teal-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-brand-navy-600">{opt.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{opt.desc}</div>
                  </button>
                )
              })}
            </div>

            {/* Shared toggles */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-gray-200">
                <input
                  type="checkbox"
                  checked={hasSingleMeter}
                  onChange={(e) => setHasSingleMeter(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600"
                />
                <div>
                  <div className="font-semibold text-brand-navy-600">Ik heb een enkele meter</div>
                  <div className="text-sm text-gray-600">Geen dag/nacht verdeling</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-gray-200">
                <input
                  type="checkbox"
                  checked={hasSmartMeter}
                  onChange={(e) => setHasSmartMeter(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600"
                />
                <div>
                  <div className="font-semibold text-brand-navy-600">Ik heb een slimme meter</div>
                  <div className="text-sm text-gray-600">Helpt bij dynamische contracten</div>
                </div>
              </label>
            </div>

            {method === 'manual' && (
              <div className="mt-6 border border-gray-200 rounded-2xl p-5">
                <h3 className="font-display text-xl font-bold text-brand-navy-600">Je verbruik</h3>
                <p className="mt-2 text-gray-600 text-sm">Je vindt dit op je jaarafrekening (schatting is oké).</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Stroom normaal (kWh/jaar) {!hasSingleMeter && <span className="text-gray-500">(dag)</span>}
                    </label>
                    <input
                      type="number"
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                      value={electricityNormal}
                      onChange={(e) => setElectricityNormal(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Bijv. 1300"
                    />
                  </div>

                  {!hasSingleMeter && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Stroom dal (kWh/jaar) <span className="text-gray-500">(nacht/weekend)</span>
                      </label>
                      <input
                        type="number"
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                        value={electricityOffPeak}
                        onChange={(e) => setElectricityOffPeak(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Bijv. 700"
                      />
                    </div>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-gray-200 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={hasGas}
                      onChange={(e) => {
                        setHasGas(e.target.checked)
                        if (!e.target.checked) setGasM3('')
                      }}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600"
                    />
                    <div>
                      <div className="font-semibold text-brand-navy-600">Ik heb gas</div>
                      <div className="text-sm text-gray-600">Zet uit als je volledig elektrisch bent</div>
                    </div>
                  </label>

                  {hasGas && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Gas (m³/jaar)</label>
                      <input
                        type="number"
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                        value={gasM3}
                        onChange={(e) => setGasM3(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Bijv. 950"
                      />
                    </div>
                  )}

                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-gray-200 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={hasSolar}
                      onChange={(e) => {
                        setHasSolar(e.target.checked)
                        if (!e.target.checked) setFeedInKwh('')
                      }}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600"
                    />
                    <div>
                      <div className="font-semibold text-brand-navy-600">Ik heb zonnepanelen</div>
                      <div className="text-sm text-gray-600">Dan nemen we teruglevering mee</div>
                    </div>
                  </label>

                  {hasSolar && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Teruglevering (kWh/jaar)</label>
                      <input
                        type="number"
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                        value={feedInKwh}
                        onChange={(e) => setFeedInKwh(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Bijv. 2000"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitManual}
                    className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600 transition-all"
                  >
                    Toon resultaten
                  </button>
                </div>
              </div>
            )}

            {method === 'estimate' && (
              <div className="mt-6 border border-gray-200 rounded-2xl p-5">
                <h3 className="font-display text-xl font-bold text-brand-navy-600">Je verbruik inschatten</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  We maken een snelle schatting. Daarna kun je het altijd nog aanpassen.
                </p>

                <div className="mt-4 flex items-center justify-between gap-4 border border-gray-200 rounded-2xl p-4">
                  <div>
                    <div className="font-semibold text-brand-navy-600">Aantal personen in huishouden</div>
                    <div className="text-sm text-gray-600">Kies wat het beste past</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-gray-200 font-bold"
                      onClick={() => setHouseholdSize((s) => Math.max(1, s - 1))}
                    >
                      −
                    </button>
                    <div className="w-12 text-center font-semibold text-brand-navy-600">{householdSize}</div>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl border border-gray-200 font-bold"
                      onClick={() => setHouseholdSize((s) => Math.min(6, s + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-gray-200">
                    <input
                      type="checkbox"
                      checked={hasGas}
                      onChange={(e) => setHasGas(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600"
                    />
                    <div>
                      <div className="font-semibold text-brand-navy-600">Ik heb gas</div>
                      <div className="text-sm text-gray-600">Zet uit als je volledig elektrisch bent</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-gray-200">
                    <input
                      type="checkbox"
                      checked={hasSolar}
                      onChange={(e) => {
                        setHasSolar(e.target.checked)
                        if (!e.target.checked) {
                          setNumberOfSolarPanels(1) // Reset naar 1 wanneer uitgeschakeld
                        }
                      }}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600"
                    />
                    <div>
                      <div className="font-semibold text-brand-navy-600">Ik heb zonnepanelen</div>
                      <div className="text-sm text-gray-600">We houden rekening met teruglevering</div>
                    </div>
                  </label>

                  {hasSolar && (
                    <div className="md:col-span-2 border border-gray-200 rounded-2xl p-4 bg-gray-50">
                      <label className="block text-sm font-semibold text-brand-navy-600 mb-2">
                        Aantal zonnepanelen
                      </label>
                      <p className="text-xs text-gray-600 mb-3">
                        Per zonnepaneel wordt 385 kWh per jaar van je verbruik afgetrokken (teruglevering).
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setNumberOfSolarPanels((n) => Math.max(1, (typeof n === 'number' ? n : 1) - 1))}
                          className="w-10 h-10 rounded-xl border border-gray-300 bg-white font-bold text-brand-navy-600 hover:bg-gray-50 transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={numberOfSolarPanels}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(1, Math.min(50, Number(e.target.value)))
                            setNumberOfSolarPanels(val)
                          }}
                          className="w-20 px-3 py-2 text-center rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 font-semibold text-brand-navy-600"
                        />
                        <button
                          type="button"
                          onClick={() => setNumberOfSolarPanels((n) => Math.min(50, (typeof n === 'number' ? n : 1) + 1))}
                          className="w-10 h-10 rounded-xl border border-gray-300 bg-white font-bold text-brand-navy-600 hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                        <div className="flex-1 text-sm text-gray-600">
                          = <span className="font-semibold text-brand-navy-600">{(typeof numberOfSolarPanels === 'number' ? numberOfSolarPanels : 1) * 385} kWh</span> teruglevering per jaar
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                  {(() => {
                    const est = estimateConsumerUsage({
                      householdSize,
                      hasGas,
                      hasSolar,
                      hasSmartMeter,
                    })
                    const calculatedFeedIn = hasSolar && typeof numberOfSolarPanels === 'number' && numberOfSolarPanels > 0
                      ? numberOfSolarPanels * 385
                      : 0
                    return (
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>
                          <span className="font-semibold">Stroom</span>: {est.electricityNormalKwh} kWh/jaar normaal{' '}
                          {!hasSingleMeter && <>+ {est.electricityOffPeakKwh} kWh/jaar dal</>}
                          {hasSolar && calculatedFeedIn > 0 && (
                            <span className="text-brand-teal-600"> (teruglevering: -{calculatedFeedIn} kWh/jaar)</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">Gas</span>: {hasGas ? `${est.gasM3} m³/jaar` : 'geen gas'}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleUseEstimate}
                    className="inline-flex justify-center items-center px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600 transition-all"
                  >
                    Gebruik schatting & toon resultaten
                  </button>
                </div>
              </div>
            )}

            {method === 'netbeheerder' && (
              <div className="mt-6 border border-gray-200 rounded-2xl p-5">
                <h3 className="font-display text-xl font-bold text-brand-navy-600">Verbruik ophalen bij netbeheerder</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Automatisch en veilig via iDIN. Je bank wordt alleen gebruikt om je identiteit te bevestigen.
                </p>

                {idinError && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {idinError}
                  </div>
                )}

                <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 space-y-2">
                  <div>✓ Je bank wordt enkel gebruikt om je woonadres te matchen</div>
                  <div>✓ We krijgen geen inzage in inloggegevens, bankgegevens of transacties</div>
                  <div>✓ We halen je energieverbruik en (waar mogelijk) contractinformatie op</div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                  {!idinEnabled && (
                    <div className="text-xs text-gray-500 self-center">
                      iDIN is nog niet geconfigureerd. Dit zetten we live zodra provider-keys zijn toegevoegd.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/api/idin/start'
                    }}
                    disabled={!idinEnabled}
                    className={`inline-flex justify-center items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                      idinEnabled
                        ? 'bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Haal mijn verbruik op
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


