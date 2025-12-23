'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
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

type ConsumerAddressStartCardProps = {
  /**
   * Where to send the user after a successful address check + store seed.
   * Defaults to consumer compare wizard.
   */
  nextHref?: string
  /**
   * Optional title override.
   */
  title?: string
  /**
   * Optional description override.
   */
  description?: string
  /**
   * If true, renders a lighter style (for embedding inside pages).
   */
  variant?: 'heroCard' | 'inline'
}

const DEFAULT_NEXT = '/particulier/energie-vergelijken'
const RESULTS_PATH = '/particulier/energie-vergelijken/resultaten'

// Volledige lijst van Nederlandse energieleveranciers (2024-2025)
const ALLE_LEVERANCIERS = [
  'ANWB Energie',
  'Budget Energie',
  'CleanEnergy',
  'Coolblue Energie',
  'Delta',
  'Eneco',
  'Energiedirect.nl',
  'Engie',
  'Essent',
  'Frank Energie',
  'Gewoon Energie',
  'Greenchoice',
  'HVC Energie',
  'Innova',
  'Mega',
  'NextEnergy',
  'NLE',
  'NieuweStroom',
  'OM | nieuwe energie',
  'Oxxio',
  'Powerpeers',
  'Pure Energie',
  'Sepa Green Energy',
  'Shell Energy',
  'United Consumers',
  'Vandebron',
  'Vattenfall',
  'Vrijopnaam',
  'Zelfstroom',
  'Zonneplan',
].sort()

export function ConsumerAddressStartCard({
  nextHref = DEFAULT_NEXT,
  title = 'Check je voordeel',
  description = 'Vul je gegevens in en start direct met vergelijken. Je ziet snel welk contracttype logisch is voor jouw situatie.',
  variant = 'heroCard',
}: ConsumerAddressStartCardProps) {
  const router = useRouter()
  const { setVerbruik } = useCalculatorStore()

  // EXACT same address model as QuickCalculator / VerbruikForm
  const [adres, setAdres] = useState({
    postcode: '',
    huisnummer: '',
    toevoeging: '',
    straat: '',
    plaats: '',
  })

  const [loadingAddress, setLoadingAddress] = useState(false)
  const [checkingAddressType, setCheckingAddressType] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [addressTypeResult, setAddressTypeResult] = useState<AddressTypeResult | null>(null)
  const [manualAddressTypeOverride, setManualAddressTypeOverride] = useState<'particulier' | 'zakelijk' | null>(null)
  const [originalBagResult, setOriginalBagResult] = useState<'particulier' | 'zakelijk' | null>(null)

  // Optional (UI only)
  const [currentSupplier, setCurrentSupplier] = useState('') // not stored yet (consumer)

  // Debounce + race-condition protection (same pattern as QuickCalculator)
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const requestCounter = useRef(0)
  const bagRequestCounter = useRef(0)
  const lastLookup = useRef<string>('')

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
        street: adres.straat,
        city: adres.plaats,
      })
    },
    [originalBagResult, adres.straat, adres.plaats]
  )

  const checkAddressType = useCallback(
    async (postcode: string, huisnummer: string, toevoeging?: string) => {
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
          body: JSON.stringify({ postcode: postcode, huisnummer: huisnummer, toevoeging: toevoeging }),
        })
        const result = await res.json()
        if (bagRequestCounter.current !== currentBagRequestId) return

        const withDetails = {
          ...result,
          street: result.street ?? adres.straat,
          city: result.city ?? adres.plaats,
        }
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
    [manualAddressTypeOverride, applyManualAddressType, adres.straat, adres.plaats]
  )

  const fetchAddress = useCallback(async (postcode: string, huisnummer: string, toevoeging?: string) => {
    // Check of dit dezelfde lookup is als de laatste (voorkom dubbele calls) - exact zoals QuickCalculator
    const lookupKey = `${postcode}-${huisnummer}-${toevoeging || ''}`
    if (lastLookup.current === lookupKey) return

    const currentRequestId = ++requestCounter.current
    const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')

    setLoadingAddress(true)
    setAddressError('')

    try {
      let url = `/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`
      if (toevoeging && toevoeging.trim()) url += `&addition=${encodeURIComponent(toevoeging.trim())}`

      const res = await fetch(url)

      if (res.ok) {
        const data = await res.json()
        if (requestCounter.current !== currentRequestId) return

        if (data?.error) {
          setAddressError(data.error)
          setAddressTypeResult(null)
          setAdres((prev) => ({ ...prev, straat: '', plaats: '' }))
          setLoadingAddress(false)
          return
        }

        lastLookup.current = lookupKey
        setAdres((prev) => ({
          ...prev,
          straat: data.street || '',
          plaats: data.city || '',
        }))

        await checkAddressType(postcode, huisnummer, toevoeging)
        return
      }

      if (res.status === 404) {
        const err = await res.json().catch(() => ({}))
        if (requestCounter.current !== currentRequestId) return
        setAddressError(err?.error || 'Adres niet gevonden')
        setAddressTypeResult(null)
        setAdres((prev) => ({ ...prev, straat: '', plaats: '' }))
        return
      }

      if (requestCounter.current === currentRequestId) {
        setAddressError('Kon adres niet ophalen')
      }
    } catch {
      if (requestCounter.current === currentRequestId) setAddressError('Fout bij ophalen adres')
    } finally {
      if (requestCounter.current === currentRequestId) setLoadingAddress(false)
    }
  }, [checkAddressType])

  const handleAddressInputChange = (field: 'postcode' | 'huisnummer' | 'toevoeging', value: string) => {
    setAddressError('')
    setAddressTypeResult(null)
    setManualAddressTypeOverride(null)
    setOriginalBagResult(null)

    setAdres((prev) => {
      const next = { ...prev, [field]: value }
      // Clear address details when user changes any of the lookup fields
      next.straat = ''
      next.plaats = ''
      return next
    })

    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current)

    const postcode = field === 'postcode' ? value : adres.postcode
    const huisnummer = field === 'huisnummer' ? value : adres.huisnummer
    const toevoeging = field === 'toevoeging' ? value : adres.toevoeging

    const postcodeComplete = isValidPostcode(postcode)
    const hasHuisnummer = huisnummer.trim().length > 0

    if (postcodeComplete && hasHuisnummer) {
      addressTimeoutRef.current = setTimeout(() => {
        fetchAddress(postcode, huisnummer.trim(), toevoeging?.trim() || undefined)
      }, 800) // same debounce as QuickCalculator
    }
  }


  const canStart = useMemo(() => {
    if (loadingAddress || checkingAddressType) return false
    if (!adres.straat || !adres.plaats) return false
    if (!addressTypeResult || addressTypeResult.type === 'error') return false
    return true
  }, [loadingAddress, checkingAddressType, adres.straat, adres.plaats, addressTypeResult])

  const handleStart = () => {
    if (!canStart || !addressTypeResult || addressTypeResult.type === 'error') return

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
    const directToResults = variant === 'heroCard' && isDesktop

    const seed: VerbruikData = {
      leveringsadressen: [
        {
          postcode: cleanPostcode(adres.postcode),
          huisnummer: adres.huisnummer.trim(),
          toevoeging: adres.toevoeging.trim() || undefined,
          straat: adres.straat,
          plaats: adres.plaats,
        },
      ],
      elektriciteitNormaal: 0,
      elektriciteitDal: 0,
      heeftEnkeleMeter: false,
      gasJaar: 0,
      geenGasaansluiting: false,
      heeftZonnepanelen: false,
      terugleveringJaar: null,
      meterType: 'slim',
      aansluitwaardeElektriciteit: '3x25A',
      aansluitwaardeGas: 'G6',
      addressType: addressTypeResult.type,
      geschat: false,
    }

    if (directToResults) {
      // Desktop: skip the "verbruik invullen" step and go straight to results with a sensible estimate.
      const est = estimateConsumerUsage({
        householdSize: 2,
        hasGas: true,
        hasSolar: false,
        hasSmartMeter: true,
      })

      const withEstimate: VerbruikData = {
        ...seed,
        elektriciteitNormaal: est.electricityNormalKwh,
        elektriciteitDal: est.electricityOffPeakKwh,
        gasJaar: est.gasM3,
        geenGasaansluiting: false,
        meterType: est.meterType,
        geschat: true,
      }

      setVerbruik(withEstimate)
      router.push(RESULTS_PATH)
      return
    }

    // Mobile (and inline usage): keep the next step where the user can enter their exact usage.
    setVerbruik(seed)
    router.push(nextHref)
  }

  const shell =
    variant === 'inline'
      ? 'bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm'
      : 'bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30'

  return (
    <div className={shell}>
      <h2 className="font-display text-2xl font-bold text-brand-navy-600">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-gray-700">Postcode</label>
          <input
            className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            placeholder="1234AB"
            value={adres.postcode}
            onChange={(e) => handleAddressInputChange('postcode', e.target.value.toUpperCase())}
            maxLength={6}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-sm font-semibold text-gray-700">Huisnummer</label>
            <input
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              placeholder="12"
              value={adres.huisnummer}
              onChange={(e) => handleAddressInputChange('huisnummer', e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-semibold text-gray-700">Toev.</label>
            <input
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 text-center"
              placeholder="A"
              value={adres.toevoeging}
              onChange={(e) => handleAddressInputChange('toevoeging', e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-gray-700">Ik zit nu bij</label>
          <select
            className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 text-gray-900"
            value={currentSupplier || ''}
            onChange={(e) => setCurrentSupplier(e.target.value)}
          >
            <option value="" disabled>
              Selecteer je huidige leverancier (optioneel)
            </option>
            {ALLE_LEVERANCIERS.map((leverancier) => (
              <option key={leverancier} value={leverancier}>
                {leverancier}
              </option>
            ))}
            <option value="onbekend">Onbekend / Anders</option>
            <option value="verhuizen">Geen i.v.m. verhuizing</option>
            <option value="verschillend">Verschillend voor gas en stroom</option>
          </select>
        </div>
      </div>

      {(loadingAddress || checkingAddressType) && (
        <div className="mt-3 text-xs text-brand-teal-600 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
          <span>Adres controleren…</span>
        </div>
      )}

      {addressError && <div className="mt-3 text-xs text-red-600">{addressError}</div>}

      {addressTypeResult && addressTypeResult.type !== 'error' && (
        <div
          className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
            addressTypeResult.type === 'particulier'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-blue-200 bg-blue-50 text-blue-900'
          }`}
        >
          <div className="font-semibold">
            {adres.straat} {adres.huisnummer}
            {adres.toevoeging ? ` ${adres.toevoeging}` : ''}, {cleanPostcode(adres.postcode)} {adres.plaats}
          </div>
          <div className="mt-1 whitespace-pre-line">{addressTypeResult.message}</div>
          <button
            type="button"
            className="mt-2 underline text-gray-700 hover:text-gray-900"
            onClick={() => applyManualAddressType(addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier')}
          >
            Wijzig naar {addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier'}
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
            canStart
              ? 'bg-brand-teal-500 text-white shadow-brand-teal-500/25 hover:bg-brand-teal-600 hover:shadow-xl'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
          }`}
        >
          Start vergelijken
        </button>
        <p className="text-xs text-gray-500">
          Tip: heb je zonnepanelen? Bekijk dan ook{' '}
          <Link className="text-brand-teal-600 underline" href="/particulier/zonnepanelen">
            zonnepaneel-opties
          </Link>
          .
        </p>
      </div>
    </div>
  )
}


