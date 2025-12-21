'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { VerbruikData } from '@/types/calculator'

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

export function ConsumerAddressStartCard({
  nextHref = DEFAULT_NEXT,
  title = 'Check je voordeel',
  description = 'Vul je gegevens in en start direct met vergelijken. Je ziet snel welk contracttype logisch is voor jouw situatie.',
  variant = 'heroCard',
}: ConsumerAddressStartCardProps) {
  const router = useRouter()
  const { setVerbruik } = useCalculatorStore()

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

  // Optional (UI only)
  const [currentSupplier, setCurrentSupplier] = useState('') // not stored yet (consumer)

  // Refs to avoid hook dependency loops (street/city updates would otherwise change callbacks)
  const streetRef = useRef('')
  const cityRef = useRef('')

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
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
        street: streetRef.current,
        city: cityRef.current,
      })
    },
    [originalBagResult]
  )

  const checkAddressType = useCallback(
    async (pc: string, hn: string, tv?: string, street?: string, city?: string) => {
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

        const withDetails = { ...result, street: result.street ?? street, city: result.city ?? city }
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
    [manualAddressTypeOverride, applyManualAddressType]
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
          streetRef.current = ''
          cityRef.current = ''
          setAddressError(data?.error || 'Adres niet gevonden')
          setLoadingAddress(false)
          return
        }

        lastLookup.current = lookupKey
        streetRef.current = data.street || ''
        cityRef.current = data.city || ''
        setStraat(streetRef.current)
        setPlaats(cityRef.current)

        await checkAddressType(pc, hn, tv, streetRef.current, cityRef.current)
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
    streetRef.current = ''
    cityRef.current = ''
    lastLookup.current = ''

    const pc = postcode
    const hn = huisnummer
    if (!isValidPostcode(pc) || !hn.trim()) return

    debounceRef.current = setTimeout(() => {
      fetchAddress(pc, hn.trim(), toevoeging.trim() || undefined)
    }, 700)
  }, [postcode, huisnummer, toevoeging, fetchAddress])

  useEffect(() => {
    scheduleLookup()
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [scheduleLookup])

  const canStart = useMemo(() => {
    if (loadingAddress || checkingAddressType) return false
    if (!straat || !plaats) return false
    if (!addressTypeResult || addressTypeResult.type === 'error') return false
    return true
  }, [loadingAddress, checkingAddressType, straat, plaats, addressTypeResult])

  const handleStart = () => {
    if (!canStart || !addressTypeResult || addressTypeResult.type === 'error') return

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
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            maxLength={6}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-sm font-semibold text-gray-700">Huisnummer</label>
            <input
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              placeholder="12"
              value={huisnummer}
              onChange={(e) => setHuisnummer(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-semibold text-gray-700">Toev.</label>
            <input
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 text-center"
              placeholder="A"
              value={toevoeging}
              onChange={(e) => setToevoeging(e.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-gray-700">Ik zit nu bij</label>
          <select
            className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            value={currentSupplier}
            onChange={(e) => setCurrentSupplier(e.target.value)}
          >
            <option value="">Leverancier (optioneel)</option>
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
            {straat} {huisnummer}
            {toevoeging ? ` ${toevoeging}` : ''}, {cleanPostcode(postcode)} {plaats}
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


