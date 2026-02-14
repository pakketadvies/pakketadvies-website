'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MapPin, CheckCircle, Warning } from '@phosphor-icons/react'
import { schatAansluitwaarden } from '@/lib/aansluitwaarde-schatting'
import { CTA_COPY } from '@/lib/copy'

const quickStartSchema = z.object({
  postcode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Vul een geldige postcode in (bijv. 1234AB)'),
  huisnummer: z.string().min(1, 'Vul een huisnummer in'),
  toevoeging: z.string().optional(),
})

type QuickStartFormData = z.infer<typeof quickStartSchema>

export function QuickStartStep() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setVerbruik, setAddressType } = useCalculatorStore()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addressData, setAddressData] = useState<{ street?: string; city?: string; addressType?: 'particulier' | 'zakelijk' | null } | null>(null)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuickStartFormData>({
    resolver: zodResolver(quickStartSchema),
  })

  const postcode = watch('postcode')
  const huisnummer = watch('huisnummer')
  const toevoeging = watch('toevoeging')

  // Auto-fetch address when postcode + huisnummer are valid
  useEffect(() => {
    const postcodeClean = postcode?.toUpperCase().replace(/\s/g, '')
    const isValidPostcode = /^\d{4}[A-Z]{2}$/.test(postcodeClean || '')
    const isValidHuisnummer = huisnummer && huisnummer.trim().length > 0

    if (!isValidPostcode || !isValidHuisnummer) {
      setAddressData(null)
      return
    }

    const fetchAddressData = async () => {
      setLoading(true)
      setError(null)
      setAddressData(null)

      try {
        // 1. Fetch postcode API (straat + plaats)
        let url = `/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`
        if (toevoeging?.trim()) {
          url += `&addition=${encodeURIComponent(toevoeging.trim())}`
        }

        const postcodeResponse = await fetch(url)
        if (!postcodeResponse.ok) {
          const errorData = await postcodeResponse.json().catch(() => ({}))
          throw new Error(errorData.error || 'Adres niet gevonden')
        }

        const postcodeData = await postcodeResponse.json()
        if (postcodeData.error) {
          throw new Error(postcodeData.error)
        }

        // 2. Fetch BAG API (particulier/zakelijk check)
        const bagResponse = await fetch('/api/adres-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postcode: postcodeClean, huisnummer, toevoeging: toevoeging?.trim() }),
        })

        const bagData = await bagResponse.json()
        const addressType = bagData.type !== 'error' ? bagData.type : null

        setAddressData({
          street: postcodeData.street,
          city: postcodeData.city,
          addressType,
        })

        // Update address type in store
        if (addressType) {
          setAddressType(addressType)
        }
      } catch (err: unknown) {
        console.error('Error fetching address data:', err)
        setError(err instanceof Error ? err.message : 'Kon adresgegevens niet ophalen')
      } finally {
        setLoading(false)
      }
    }

    // Debounce API calls
    const timer = setTimeout(fetchAddressData, 500)
    return () => clearTimeout(timer)
  }, [postcode, huisnummer, toevoeging, setAddressType])

  const onSubmit = async (data: QuickStartFormData) => {
    if (!addressData?.street || !addressData.city) {
      setError('Controleer eerst of het adres correct is opgehaald')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const postcodeClean = data.postcode.toUpperCase().replace(/\s/g, '')

      // Standaard verbruikswaarden (zoals in best-deals API)
      const standaardVerbruik = {
        elektriciteitNormaal: 4000, // kWh/jaar
        elektriciteitDal: 2000, // kWh/jaar
        gasJaar: 1200, // m³/jaar
        heeftEnkeleMeter: false, // Dubbele meter
        heeftZonnepanelen: false,
        terugleveringJaar: 0,
        geenGasaansluiting: false,
        meterType: 'slim' as const,
        geschat: true, // Markeer als geschat
      }

      // Schat aansluitwaarden op basis van standaard verbruik
      const totaalElektriciteit = standaardVerbruik.elektriciteitNormaal + standaardVerbruik.elektriciteitDal
      const schatting = schatAansluitwaarden(totaalElektriciteit, standaardVerbruik.gasJaar)

      // Zet alle verbruik data in store
      setVerbruik({
        ...standaardVerbruik,
        aansluitwaardeElektriciteit: schatting.elektriciteit,
        aansluitwaardeGas: schatting.gas,
        addressType: addressData.addressType || null,
        leveringsadressen: [
          {
            postcode: postcodeClean,
            huisnummer: data.huisnummer,
            toevoeging: data.toevoeging || '',
            straat: addressData.street,
            plaats: addressData.city,
          },
        ],
      })

      // Navigeer naar stap 2 (contract wordt al via URL parameter doorgegeven)
      const contractId = searchParams?.get('contract')
      router.push(`/calculator?stap=2${contractId ? `&contract=${contractId}` : ''}`)
    } catch (err: unknown) {
      console.error('Error setting up quick start:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Postcode */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-brand-navy-500">
            Postcode <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('postcode')}
            type="text"
            placeholder="1234AB"
            className="uppercase"
            disabled={loading}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/\s/g, '')
              // Auto-format: 1234AB (4 cijfers + 2 letters)
              if (value.length <= 6) {
                const formatted = value.length > 4 ? `${value.slice(0, 4)} ${value.slice(4)}` : value
                setValue('postcode', formatted, { shouldValidate: true })
              }
            }}
          />
          {errors.postcode && (
            <p className="text-sm text-red-600">{errors.postcode.message}</p>
          )}
        </div>

        {/* Huisnummer */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-brand-navy-500">
            Huisnummer <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('huisnummer')}
            type="text"
            placeholder="12"
            disabled={loading}
          />
          {errors.huisnummer && (
            <p className="text-sm text-red-600">{errors.huisnummer.message}</p>
          )}
        </div>

        {/* Toevoeging (optioneel) */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-brand-navy-500">
            Toevoeging (optioneel)
          </label>
          <Input
            {...register('toevoeging')}
            type="text"
            placeholder="A, B, 1, etc."
            disabled={loading}
          />
          {errors.toevoeging && (
            <p className="text-sm text-red-600">{errors.toevoeging.message}</p>
          )}
        </div>

        {/* Address preview */}
        {addressData && addressData.street && addressData.city && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="bold" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 mb-1">Adres gevonden:</p>
                <p className="text-sm text-green-800">
                  {addressData.street} {huisnummer}{toevoeging ? ` ${toevoeging}` : ''}, {addressData.city}
                </p>
                {addressData.addressType && (
                  <p className="text-xs text-green-700 mt-1">
                    {addressData.addressType === 'particulier' ? 'Particulier adres' : 'Zakelijk adres'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && !addressData && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-brand-teal-600 border-t-transparent rounded-full animate-spin" />
              Adresgegevens ophalen...
            </div>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full bg-brand-teal-500 hover:bg-brand-teal-600"
          disabled={loading || !addressData?.street || !addressData?.city}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Bezig...
            </>
          ) : (
            <>
              {CTA_COPY.continueToDetails}
              <CheckCircle className="w-5 h-5 ml-2" weight="bold" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

