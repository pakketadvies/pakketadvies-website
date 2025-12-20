'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { VerbruikData } from '@/types/calculator'
import { estimateConsumerUsage } from '@/lib/particulier-verbruik-schatting'

type AddressTypeResult =
  | {
      type: 'particulier' | 'zakelijk'
      message: string
      street?: string
      city?: string
    }
  | {
      type: 'error'
      message: string
      street?: string
      city?: string
    }

type MethodChoice = 'manual' | 'estimate' | 'netbeheerder'

const RESULTS_PATH = '/particulier/energie-vergelijken/resultaten'

export function ConsumerCompareWizard() {
  const router = useRouter()
  const { setVerbruik, verbruik } = useCalculatorStore()

  const [step, setStep] = useState<1 | 2>(1)
  const [method, setMethod] = useState<MethodChoice>('manual')

  // Step 1: address fields
  const [postcode, setPostcode] = useState('')
  const [huisnummer, setHuisnummer] = useState('')
  const [toevoeging, setToevoeging] = useState('')
  const [straat, setStraat] = useState('')
  const [plaats, setPlaats] = useState('')
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [checkingAddressType, setCheckingAddressType] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [addressTypeResult, setAddressTypeResult] = useState<AddressTypeResult | null>(null)
  const [manualAddressTypeOverride, setManualAddressTypeOverride] = useState<'particulier' | 'zakelijk' | null>(null)
  const [originalBagResult, setOriginalBagResult] = useState<'particulier' | 'zakelijk' | null>(null)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const requestCounter = useRef(0)
  const bagRequestCounter = useRef(0)
  const lastLookup = useRef<string>('')

  // Step 2 values (manual / estimate)
  const [hasSingleMeter, setHasSingleMeter] = useState(false)
  const [electricityNormal, setElectricityNormal] = useState<number | ''>('')
  const [electricityOffPeak, setElectricityOffPeak] = useState<number | ''>('')
  const [hasGas, setHasGas] = useState(true)
  const [gasM3, setGasM3] = useState<number | ''>('')
  const [hasSolar, setHasSolar] = useState(false)
  const [feedInKwh, setFeedInKwh] = useState<number | ''>('')
  const [hasSmartMeter, setHasSmartMeter] = useState(true)

  // Estimate inputs
  const [householdSize, setHouseholdSize] = useState(2)

  // iDIN enable gating (until provider configured)
  const idinEnabled = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_IDIN_ENABLED === 'true')
  const [idinError, setIdinError] = useState<string | null>(null)

  // Allow deep-linking back into the wizard after /api/idin/* redirects.
  useEffect(() => {
    // NOTE: We intentionally do NOT use next/navigation's useSearchParams here,
    // because Next.js requires it to be wrapped in a Suspense boundary at the page level
    // and it can break prerendering on Vercel. Using window.location keeps this fully client-only.
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const spStep = params.get('step')
    const spMethod = params.get('method')
    const spIdin = params.get('idin')

    if (spStep === '2') setStep(2)
    if (spMethod === 'netbeheerder' || spMethod === 'manual' || spMethod === 'estimate') setMethod(spMethod)

    if (spIdin) {
      // Show a friendly message on the netbeheerder card.
      const map: Record<string, string> = {
        'not-configured': 'iDIN is nog niet geconfigureerd. Voeg provider-credentials toe om dit te activeren.',
        'not-implemented': 'iDIN provider-flow is nog niet geactiveerd. Dit zetten we live zodra de provider is ingericht.',
        'callback-not-implemented': 'We hebben je iDIN callback ontvangen, maar de verwerking is nog niet ingericht.',
      }
      setIdinError(map[spIdin] || 'Er is iets misgegaan met iDIN. Probeer het later opnieuw.')
      setStep(2)
      setMethod('netbeheerder')
    }
    // Run on mount
  }, [])

  const isValidPostcode = (pc: string) => /^\d{4}[A-Z]{2}$/.test(pc.toUpperCase().replace(/\s/g, ''))
  const cleanPostcode = (pc: string) => pc.toUpperCase().replace(/\s/g, '')

  const applyManualAddressType = useCallback(
    (type: 'particulier' | 'zakelijk') => {
      const isManualChange = originalBagResult !== null && type !== originalBagResult
      const msg = isManualChange
        ? `${type === 'particulier' ? 'Particulier' : 'Zakelijk'} adres (handmatig gewijzigd)\n⚠️ Je bent zelf verantwoordelijk voor de juistheid van dit adrestype`
        : type === 'particulier'
          ? 'Particulier adres - geschikt voor consumentencontracten'
          : 'Zakelijk adres - geschikt voor zakelijke contracten'

      setManualAddressTypeOverride(type)
      setAddressTypeResult({
        type,
        message: msg,
        street: straat,
        city: plaats,
      })
    },
    [originalBagResult, straat, plaats]
  )

  const checkAddressType = useCallback(
    async (pc: string, hn: string, tv?: string) => {
      if (manualAddressTypeOverride) {
        applyManualAddressType(manualAddressTypeOverride)
        return
      }

      const currentBagRequestId = ++bagRequestCounter.current
      setCheckingAddressType(true)
      setAddressTypeResult(null)

      try {
        const res = await fetch('/api/adres-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcode: pc, huisnummer: hn, toevoeging: tv }),
        })
        const result = await res.json()
        if (bagRequestCounter.current !== currentBagRequestId) return

        const withDetails = { ...result, street: result.street ?? straat, city: result.city ?? plaats }
        setAddressTypeResult(withDetails)
        if (withDetails.type !== 'error') {
          setOriginalBagResult(withDetails.type)
        }
      } catch {
        if (bagRequestCounter.current === currentBagRequestId) {
          setAddressTypeResult({ type: 'error', message: 'Kon adres type niet controleren' })
        }
      } finally {
        if (bagRequestCounter.current === currentBagRequestId) setCheckingAddressType(false)
      }
    },
    [manualAddressTypeOverride, applyManualAddressType, straat, plaats]
  )

  const fetchAddress = useCallback(
    async (pc: string, hn: string, tv?: string) => {
      const lookupKey = `${pc}-${hn}-${tv || ''}`
      if (lastLookup.current === lookupKey) return

      const currentRequestId = ++requestCounter.current
      setLoadingAddress(true)
      setAddressError('')
      setAddressTypeResult(null)

      try {
        let url = `/api/postcode?postcode=${cleanPostcode(pc)}&number=${hn}`
        if (tv && tv.trim()) url += `&addition=${encodeURIComponent(tv.trim())}`

        const res = await fetch(url)
        const data = await res.json()
        if (requestCounter.current !== currentRequestId) return

        if (!res.ok || data?.error) {
          setStraat('')
          setPlaats('')
          setAddressError(data?.error || 'Adres niet gevonden')
          setLoadingAddress(false)
          return
        }

        lastLookup.current = lookupKey
        setStraat(data.street || '')
        setPlaats(data.city || '')

        await checkAddressType(pc, hn, tv)
      } catch {
        if (requestCounter.current === currentRequestId) setAddressError('Fout bij ophalen adres')
      } finally {
        if (requestCounter.current === currentRequestId) setLoadingAddress(false)
      }
    },
    [checkAddressType]
  )

  const scheduleLookup = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setAddressError('')
    setAddressTypeResult(null)
    setManualAddressTypeOverride(null)
    setOriginalBagResult(null)
    setStraat('')
    setPlaats('')
    lastLookup.current = ''

    const pc = postcode
    const hn = huisnummer
    if (!isValidPostcode(pc) || !hn.trim()) return

    debounceRef.current = setTimeout(() => {
      fetchAddress(pc, hn.trim(), toevoeging.trim() || undefined)
    }, 600)
  }, [postcode, huisnummer, toevoeging, fetchAddress])

  useEffect(() => {
    scheduleLookup()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [scheduleLookup])

  const canContinueAddress = useMemo(() => {
    if (loadingAddress || checkingAddressType) return false
    if (!straat || !plaats) return false
    if (!addressTypeResult || addressTypeResult.type === 'error') return false
    return true
  }, [loadingAddress, checkingAddressType, straat, plaats, addressTypeResult])

  const handleContinueFromAddress = () => {
    if (!canContinueAddress || !addressTypeResult || addressTypeResult.type === 'error') return

    const addressType = addressTypeResult.type

    // Create an initial verbruik object so addressType is persisted in store immediately.
    const seed: VerbruikData = {
      leveringsadressen: [
        {
          postcode: cleanPostcode(postcode),
          huisnummer: huisnummer.trim(),
          toevoeging: toevoeging.trim() || undefined,
          straat,
          plaats,
        },
      ],
      elektriciteitNormaal: 0,
      elektriciteitDal: hasSingleMeter ? null : 0,
      heeftEnkeleMeter: hasSingleMeter,
      gasJaar: hasGas ? 0 : null,
      geenGasaansluiting: !hasGas,
      heeftZonnepanelen: hasSolar,
      terugleveringJaar: hasSolar ? 0 : null,
      meterType: hasSmartMeter ? 'slim' : 'oud',
      aansluitwaardeElektriciteit: '3x25A',
      aansluitwaardeGas: hasGas ? 'G6' : undefined,
      addressType,
      geschat: false,
    }

    setVerbruik(seed)
    setStep(2)
  }

  const baseHeader = (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-white/80 text-sm font-semibold">Stap {step} van 2</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold text-white leading-tight">
          Energie vergelijken voor thuis
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl">
          Vul je adres in en kies daarna hoe je je verbruik wilt invullen. Daarna tonen we direct de resultaten.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <div className={`h-2 w-16 rounded-full ${step === 1 ? 'bg-white' : 'bg-white/30'}`} />
        <div className={`h-2 w-16 rounded-full ${step === 2 ? 'bg-white' : 'bg-white/30'}`} />
      </div>
    </div>
  )

  const addressBadge = () => {
    if (loadingAddress || checkingAddressType) {
      return (
        <div className="mt-3 text-xs text-brand-teal-100 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white/40 border-t-white/90 rounded-full animate-spin" />
          <span>Adres controleren…</span>
        </div>
      )
    }

    if (addressError) {
      return <div className="mt-3 text-xs text-red-200">{addressError}</div>
    }

    if (!addressTypeResult) return null

    if (addressTypeResult.type === 'error') {
      return <div className="mt-3 text-xs text-red-200">{addressTypeResult.message}</div>
    }

    const isParticulier = addressTypeResult.type === 'particulier'
    return (
      <div
        className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
          isParticulier ? 'border-green-200/40 bg-green-500/10 text-green-100' : 'border-blue-200/40 bg-blue-500/10 text-blue-100'
        }`}
      >
        <div className="font-semibold">
          {straat} {huisnummer}
          {toevoeging ? ` ${toevoeging}` : ''}, {cleanPostcode(postcode)} {plaats}
        </div>
        <div className="mt-1 whitespace-pre-line">{addressTypeResult.message}</div>
        <button
          type="button"
          className="mt-2 underline text-white/80 hover:text-white"
          onClick={() => applyManualAddressType(isParticulier ? 'zakelijk' : 'particulier')}
        >
          Wijzig naar {isParticulier ? 'zakelijk' : 'particulier'}
        </button>
      </div>
    )
  }

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

    const updated: VerbruikData = {
      ...verbruik,
      elektriciteitNormaal: est.electricityNormalKwh,
      elektriciteitDal: hasSingleMeter ? null : est.electricityOffPeakKwh,
      heeftEnkeleMeter: hasSingleMeter,
      gasJaar: hasGas ? est.gasM3 : null,
      geenGasaansluiting: !hasGas,
      heeftZonnepanelen: hasSolar,
      terugleveringJaar: hasSolar ? 0 : null,
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
      <div className="bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-600 rounded-3xl p-6 md:p-10 text-white">
        {baseHeader}
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
        {step === 1 ? (
          <>
            <h2 className="font-display text-2xl font-bold text-brand-navy-600">1. Controleer je adres</h2>
            <p className="mt-2 text-gray-600">We checken direct of dit een particulier of zakelijk aansluitpunt is.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700">Postcode</label>
                <input
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                  placeholder="1234AB"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700">Huisnummer</label>
                <input
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                  placeholder="12"
                  value={huisnummer}
                  onChange={(e) => setHuisnummer(e.target.value)}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700">Toev. (optioneel)</label>
                <input
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
                  placeholder="A"
                  value={toevoeging}
                  onChange={(e) => setToevoeging(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            {addressBadge()}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <Link
                href="/particulier"
                className="inline-flex justify-center items-center px-6 py-3 bg-white border border-gray-200 text-brand-navy-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Terug
              </Link>
              <button
                type="button"
                onClick={handleContinueFromAddress}
                disabled={!canContinueAddress}
                className={`inline-flex justify-center items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                  canContinueAddress
                    ? 'bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verder
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-brand-navy-600">2. Kies hoe je je verbruik invult</h2>
                <p className="mt-2 text-gray-600">
                  Kies de optie die het makkelijkst is. Daarna tonen we direct je resultaten.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-brand-teal-600 hover:underline"
              >
                Adres wijzigen
              </button>
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
                      onChange={(e) => setHasSolar(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600"
                    />
                    <div>
                      <div className="font-semibold text-brand-navy-600">Ik heb zonnepanelen</div>
                      <div className="text-sm text-gray-600">We houden rekening met teruglevering</div>
                    </div>
                  </label>
                </div>

                <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                  {(() => {
                    const est = estimateConsumerUsage({
                      householdSize,
                      hasGas,
                      hasSolar,
                      hasSmartMeter,
                    })
                    return (
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>
                          <span className="font-semibold">Stroom</span>: {est.electricityNormalKwh} kWh/jaar normaal{' '}
                          {!hasSingleMeter && <>+ {est.electricityOffPeakKwh} kWh/jaar dal</>}
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


