'use client'

import { useState, useEffect, useRef } from 'react'
import { Lightning, Flame, MapPin, Plugs, Sun, Check, X, CheckCircle, XCircle, ArrowsClockwise, Warning } from '@phosphor-icons/react'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { VerbruikData } from '@/types/calculator'

interface EditVerbruikFormProps {
  currentData: VerbruikData
  onChange: (newData: VerbruikData) => void
}

export default function EditVerbruikForm({ currentData, onChange }: EditVerbruikFormProps) {
  const { setAddressType } = useCalculatorStore()
  const [formData, setFormData] = useState<VerbruikData>(currentData)
  // Ref om oorspronkelijke elektriciteitDal waarde te bewaren
  const savedElektriciteitDal = useRef<number | null>(null)
  
  // ✅ VOORSTEL 1: NO MORE SYNC! 
  // Form krijgt currentData bij mount, daarna volledig onafhankelijk
  // Geen useEffect die currentData synct = geen loops = geen modal reopen
  
  // Log formData changes (alleen voor debugging)
  useEffect(() => {
    console.log('🟠 [FORM] formData changed:', {
      postcode: formData?.leveringsadressen?.[0]?.postcode,
      huisnummer: formData?.leveringsadressen?.[0]?.huisnummer,
      toevoeging: formData?.leveringsadressen?.[0]?.toevoeging,
      addressType: formData?.addressType,
    })
  }, [formData])
  
  // Address lookup states
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string>('')
  const [checkingAddressType, setCheckingAddressType] = useState(false)
  const [addressTypeResult, setAddressTypeResult] = useState<{
    type: 'particulier' | 'zakelijk' | 'error';
    message: string;
    street?: string;
    city?: string;
  } | null>(null)
  const [manualAddressTypeOverride, setManualAddressTypeOverride] = useState<'particulier' | 'zakelijk' | null>(null)
  const [originalBagResult, setOriginalBagResult] = useState<'particulier' | 'zakelijk' | null>(null)
  const lastLookup = useRef<string>('')
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Request counters voor race condition preventie
  const requestCounter = useRef<number>(0)
  const bagRequestCounter = useRef<number>(0)

  // Cleanup
  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current)
      }
    }
  }, [])

  const handleFieldChange = (field: keyof VerbruikData, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
  }

  const handleAddressChange = (field: 'postcode' | 'huisnummer' | 'toevoeging', value: string) => {
    console.log('🔵 [FORM] handleAddressChange called', { field, value })
    
    const newAdres = { ...formData.leveringsadressen[0] }
    newAdres[field] = value
    
    // Clear address when input changes
    if (newAdres.straat || newAdres.plaats) {
      newAdres.straat = ''
      newAdres.plaats = ''
    }
    
    setAddressError('')
    setAddressTypeResult(null) // Clear BAG API result
    // Reset manual override en origineel resultaat als adres wijzigt
    setManualAddressTypeOverride(null)
    setOriginalBagResult(null)
    // Clear addressType omdat adres is gewijzigd
    const newData = { ...formData, leveringsadressen: [newAdres], addressType: null }
    
    console.log('🟢 [FORM] Calling setFormData with newData', {
      newPostcode: newData?.leveringsadressen?.[0]?.postcode,
      newHuisnummer: newData?.leveringsadressen?.[0]?.huisnummer,
      newToevoeging: newData?.leveringsadressen?.[0]?.toevoeging,
    })
    setFormData(newData)
    
    console.log('🟡 [FORM] Calling onChange(newData) to update parent modal')
    onChange(newData) // ✅ RE-ENABLED: Update parent modal
    
    // Clear existing timeout
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current)
    }
    
    // Validate postcode
    const postcodeComplete = isValidPostcode(newAdres.postcode)
    const hasHuisnummer = newAdres.huisnummer.trim().length > 0
    
    // Only API call if postcode complete AND huisnummer filled
    if (postcodeComplete && hasHuisnummer) {
      addressTimeoutRef.current = setTimeout(() => {
        fetchAddress(newAdres.postcode, newAdres.huisnummer, newAdres.toevoeging)
      }, 800)
    }
  }

  // Handler voor handmatige address type switch
  const handleManualAddressTypeSwitch = () => {
    if (!addressTypeResult || addressTypeResult.type === 'error') {
      return
    }

    const newType: 'particulier' | 'zakelijk' = addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier'
    setManualAddressTypeOverride(newType)

    // Bepaal of dit een handmatige wijziging is (verschilt van origineel)
    const isManualChange = originalBagResult !== null && newType !== originalBagResult

    // Update addressTypeResult state met aangepaste message
    const newResult: {
      type: 'particulier' | 'zakelijk' | 'error';
      message: string;
      street?: string;
      city?: string;
    } = {
      type: newType,
      message: isManualChange
        ? newType === 'particulier'
          ? 'Particulier adres (handmatig gewijzigd)\n⚠️ U bent zelf verantwoordelijk voor de juistheid van dit adrestype'
          : 'Zakelijk adres (handmatig gewijzigd)\n⚠️ U bent zelf verantwoordelijk voor de juistheid van dit adrestype'
        : newType === 'particulier'
          ? 'Particulier adres - geschikt voor consumentencontracten'
          : 'Zakelijk adres - geschikt voor zakelijke contracten',
      street: addressTypeResult.street,
      city: addressTypeResult.city
    }
    setAddressTypeResult(newResult)

    // Update formData
    const updatedData = { ...formData, addressType: newType }
    setFormData(updatedData)
    onChange(updatedData)

    // Update Zustand store
    setAddressType(newType)
  }

  const isValidPostcode = (postcode: string): boolean => {
    const clean = postcode.toUpperCase().replace(/\s/g, '')
    return /^\d{4}[A-Z]{2}$/.test(clean)
  }

  const fetchAddress = async (postcode: string, huisnummer: string, toevoeging?: string) => {
    console.log('🔍 [FORM] fetchAddress called', { postcode, huisnummer, toevoeging })
    
    const lookupKey = `${postcode}-${huisnummer}-${toevoeging || ''}`
    if (lastLookup.current === lookupKey) {
      console.log('⏭️ [FORM] Skipping - same address already looked up')
      return
    }

    // Genereer unieke request ID voor race condition preventie
    const currentRequestId = requestCounter.current + 1
    requestCounter.current = currentRequestId
    console.log('🔢 [FORM] Request ID:', currentRequestId)

    const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')
    setLoadingAddress(true)
    setAddressError('')
    
    try {
      let url = `/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`
      if (toevoeging && toevoeging.trim()) {
        url += `&addition=${encodeURIComponent(toevoeging.trim())}`
      }
      
      console.log('📡 [FORM] Fetching postcode API:', url)
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [FORM] Postcode API response:', data)
        
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current !== currentRequestId) {
          console.log('⚠️ [FORM] Ignoring stale postcode API response - newer request exists')
          return
        }
        
        if (data.error) {
          console.log('❌ [FORM] Postcode API returned error:', data.error)
          setAddressError(data.error)
          setAddressTypeResult(null) // Clear BAG API result
          // Clear addressType bij error
          const newData = { ...formData, addressType: null }
          setFormData(newData)
          console.log('🟡 [FORM] After error - calling onChange(newData)')
          onChange(newData)
        } else if (data.street && data.city) {
          console.log('✅ [FORM] Address found:', { street: data.street, city: data.city })
          const newAdres = { 
            ...formData.leveringsadressen[0],
            straat: data.street,
            plaats: data.city,
            postcode: postcodeClean,
            huisnummer: huisnummer,
            toevoeging: toevoeging || ''
          }
          const newData = { ...formData, leveringsadressen: [newAdres] }
          setFormData(newData)
          console.log('🟡 [FORM] After address found - calling onChange(newData)')
          onChange(newData)
          lastLookup.current = lookupKey

          // NIEUW: BAG API woonfunctie check (alleen als dit nog steeds de laatste request is)
          if (requestCounter.current === currentRequestId) {
            console.log('🔍 [FORM] Starting BAG API check for address type...')
            // Als er een manual override is, gebruik die in plaats van BAG API
            if (manualAddressTypeOverride) {
              const overrideResult: {
                type: 'particulier' | 'zakelijk' | 'error';
                message: string;
                street?: string;
                city?: string;
              } = {
                type: manualAddressTypeOverride,
                message: manualAddressTypeOverride === 'particulier' 
                  ? 'Particulier adres - geschikt voor consumentencontracten'
                  : 'Zakelijk adres - geschikt voor zakelijke contracten',
                street: addressTypeResult?.street,
                city: addressTypeResult?.city
              }
              setAddressTypeResult(overrideResult)
              const updatedData = { ...newData, addressType: manualAddressTypeOverride }
              setFormData(updatedData)
              onChange(updatedData)
              setAddressType(manualAddressTypeOverride)
              return
            }

            // Genereer unieke request ID voor BAG API race condition preventie
            const currentBagRequestId = bagRequestCounter.current + 1
            bagRequestCounter.current = currentBagRequestId

            setCheckingAddressType(true);
            setAddressTypeResult(null);
            
            try {
              console.log('📡 [FORM] Fetching BAG API:', { postcode, huisnummer, toevoeging })
              const bagResponse = await fetch('/api/adres-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postcode, huisnummer, toevoeging })
              });

              const bagResult = await bagResponse.json();
              console.log('✅ [FORM] BAG API response:', bagResult)
              
              // Check of dit nog steeds de laatste BAG request is (race condition preventie)
              if (bagRequestCounter.current !== currentBagRequestId) {
                console.log('⚠️ [FORM] Ignoring stale BAG API response - newer request exists')
                return
              }
              
              // Sla street en city op in result
              const bagResultWithDetails = {
                ...bagResult,
                street: bagResult.street,
                city: bagResult.city
              }
              
              setAddressTypeResult(bagResultWithDetails);
              
              // Update addressType in formData en sync met parent
              if (bagResult.type !== 'error') {
                console.log('✅ [FORM] BAG API success - addressType:', bagResult.type)
                // Sla het originele BAG API resultaat op (alleen bij eerste check, niet bij manual override)
                if (!originalBagResult && !manualAddressTypeOverride) {
                  setOriginalBagResult(bagResult.type)
                }
                const updatedData = { ...newData, addressType: bagResult.type };
                setFormData(updatedData);
                console.log('🟡 [FORM] After BAG success - calling onChange(updatedData)')
                onChange(updatedData); // ✅ RE-ENABLED: Update parent met addressType
                setAddressType(bagResult.type);
              } else {
                console.log('❌ [FORM] BAG API returned error type')
                const updatedData = { ...newData, addressType: null };
                setFormData(updatedData);
                console.log('🟡 [FORM] After BAG error - calling onChange(updatedData)')
                onChange(updatedData); // ✅ RE-ENABLED: Update parent
              }
            } catch (error) {
              console.error('❌ [FORM] BAG API check error:', error);
              
              // Check of dit nog steeds de laatste BAG request is (race condition preventie)
              if (bagRequestCounter.current !== currentBagRequestId) {
                console.log('⚠️ [FORM] Ignoring stale BAG API error - newer request exists')
                return
              }
              
              setAddressTypeResult({
                type: 'error',
                message: 'Kon adres type niet controleren'
              });
              // Bij error, clear addressType en sync met parent
              const updatedData = { ...newData, addressType: null };
              setFormData(updatedData);
              console.log('🟡 [FORM] After BAG catch error - calling onChange(updatedData)')
              onChange(updatedData); // ✅ RE-ENABLED: Update parent
            } finally {
              // Alleen loading state updaten als dit nog steeds de laatste request is
              if (bagRequestCounter.current === currentBagRequestId) {
                setCheckingAddressType(false);
              }
            }
          }
        }
      } else {
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current !== currentRequestId) {
          console.log('Ignoring stale postcode API error response')
          return
        }
        
        setAddressError('Adres niet gevonden')
        setAddressTypeResult(null) // Clear BAG API result
        // Clear addressType bij error en sync met parent
        const newData = { ...formData, addressType: null }
        setFormData(newData)
        onChange(newData) // ✅ RE-ENABLED: Update parent
      }
    } catch (error) {
      console.error('Address lookup error:', error)
      
      // Check of dit nog steeds de laatste request is (race condition preventie)
      if (requestCounter.current !== currentRequestId) {
        return
      }
      
      setAddressError('Er ging iets mis bij het opzoeken van het adres')
    } finally {
      // Alleen loading state updaten als dit nog steeds de laatste request is
      if (requestCounter.current === currentRequestId) {
      setLoadingAddress(false)
      }
    }
  }

  return (
    <div className="space-y-5">
      
      {/* 1. LEVERADRES */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin weight="duotone" className="w-5 h-5 text-brand-teal-600" />
          <h4 className="text-base font-bold text-brand-navy-500">Leveradres</h4>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-3">
            <div className="col-span-4">
              <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                Postcode
              </label>
              <input
                type="text"
                value={formData.leveringsadressen[0]?.postcode || ''}
                onChange={(e) => handleAddressChange('postcode', e.target.value.toUpperCase())}
                placeholder="1234AB"
                maxLength={6}
                className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                Huisnr.
              </label>
              <input
                type="text"
                value={formData.leveringsadressen[0]?.huisnummer || ''}
                onChange={(e) => handleAddressChange('huisnummer', e.target.value)}
                placeholder="12"
                className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                Toev.
              </label>
              <input
                type="text"
                value={formData.leveringsadressen[0]?.toevoeging || ''}
                onChange={(e) => handleAddressChange('toevoeging', e.target.value.toUpperCase())}
                placeholder="A"
                maxLength={4}
                className="w-full px-3 py-2.5 text-sm text-center rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all"
              />
            </div>
          </div>

          {/* Gecombineerde loading state: zichtbaar zolang één van beide API calls bezig is */}
          {(loadingAddress || checkingAddressType) && (
            <div className="flex items-center gap-2 text-sm text-brand-teal-600 animate-slide-down">
              <div className="w-4 h-4 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
              <span>
                {loadingAddress && !checkingAddressType 
                  ? 'Adres opzoeken...' 
                  : 'Adres controleren...'}
              </span>
            </div>
          )}

          {/* Gecombineerde status: BAG API resultaat (prioriteit) of postcode API success */}
          {!checkingAddressType && !loadingAddress && (
            <>
              {/* BAG API resultaat heeft prioriteit */}
              {addressTypeResult ? (
                <div className={`flex items-start gap-2 p-3 rounded-lg animate-slide-down ${
                  addressTypeResult.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : addressTypeResult.type === 'particulier'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  {addressTypeResult.type === 'error' ? (
                    <XCircle weight="duotone" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : addressTypeResult.type === 'particulier' ? (
                    <CheckCircle weight="duotone" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle weight="duotone" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className={`flex-1 text-sm ${
                    addressTypeResult.type === 'error'
                      ? 'text-red-900'
                      : addressTypeResult.type === 'particulier'
                      ? 'text-green-900'
                      : 'text-blue-900'
                  }`}>
                    {/* Toon adres als beschikbaar */}
                    {(formData.leveringsadressen[0]?.straat && formData.leveringsadressen[0]?.plaats) && (
                      <div className="font-semibold mb-1">
                        {formData.leveringsadressen[0].straat} {formData.leveringsadressen[0].huisnummer}
                        {formData.leveringsadressen[0].toevoeging ? ` ${formData.leveringsadressen[0].toevoeging}` : ''}, {formData.leveringsadressen[0].postcode} {formData.leveringsadressen[0].plaats}
                      </div>
                    )}
                    <div className="whitespace-pre-line">{addressTypeResult.message}</div>
                    
                    {/* NIEUW: Handmatige switch knop (alleen bij succes, niet bij error) */}
                    {addressTypeResult.type !== 'error' && (
                      <button
                        type="button"
                        onClick={handleManualAddressTypeSwitch}
                        className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline flex items-center gap-1 transition-colors"
                      >
                        Wijzig naar {addressTypeResult.type === 'particulier' ? 'zakelijk' : 'particulier'}
                        <ArrowsClockwise weight="bold" className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback: alleen postcode API success (als BAG check nog niet gedaan) */
                formData.leveringsadressen[0]?.straat && formData.leveringsadressen[0]?.plaats && (
            <div className="flex items-center gap-2 p-3 bg-brand-teal-50 border border-brand-teal-200 rounded-lg text-sm animate-slide-down">
              <Check weight="duotone" className="w-5 h-5 text-brand-teal-600 flex-shrink-0" />
              <span className="text-brand-teal-900 font-medium">
                {formData.leveringsadressen[0].straat} {formData.leveringsadressen[0].huisnummer}
                {formData.leveringsadressen[0].toevoeging ? ` ${formData.leveringsadressen[0].toevoeging}` : ''}, {formData.leveringsadressen[0].postcode} {formData.leveringsadressen[0].plaats}
              </span>
            </div>
                )
              )}
            </>
          )}

          {addressError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm animate-slide-down">
              <X weight="duotone" className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-900">{addressError}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2 & 3. ELEKTRICITEIT & ZONNEPANELEN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 2. Elektriciteit */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-600" />
            <h4 className="text-base font-bold text-brand-navy-500">Elektriciteit</h4>
          </div>
          
          <div className="space-y-3">
            {/* Enkele meter toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-brand-teal-300 hover:bg-brand-teal-50 transition-all">
              <input
                type="checkbox"
                checked={formData.heeftEnkeleMeter}
                onChange={(e) => {
                  const checked = e.target.checked
                  if (checked) {
                    // Bewaar de huidige waarde voordat we het op null zetten
                    if (formData.elektriciteitDal !== null && formData.elektriciteitDal !== undefined) {
                      savedElektriciteitDal.current = formData.elektriciteitDal
                    }
                    const newData = { 
                      ...formData, 
                      heeftEnkeleMeter: checked,
                      elektriciteitDal: null
                    }
                    setFormData(newData)
                    onChange(newData)
                  } else {
                    // Herstel de oorspronkelijke waarde als het vinkje wordt uitgezet
                    const restoredDal = savedElektriciteitDal.current !== null ? savedElektriciteitDal.current : formData.elektriciteitDal
                    const newData = { 
                      ...formData, 
                      heeftEnkeleMeter: checked,
                      elektriciteitDal: restoredDal
                    }
                    setFormData(newData)
                    onChange(newData)
                    savedElektriciteitDal.current = null
                  }
                }}
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-brand-navy-500">Enkele meter (geen dag/nacht)</span>
            </label>

            {/* Verbruik velden */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                  {formData.heeftEnkeleMeter ? 'Totaal verbruik' : 'Normaal tarief'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.elektriciteitNormaal || ''}
                    onChange={(e) => handleFieldChange('elektriciteitNormaal', Number(e.target.value) || 0)}
                    placeholder="3500"
                    className="w-full px-3 py-2.5 pr-12 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
                </div>
              </div>

              {!formData.heeftEnkeleMeter && (
                <div className="animate-slide-down">
                  <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                    Daltarief
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.elektriciteitDal || ''}
                      onChange={(e) => handleFieldChange('elektriciteitDal', Number(e.target.value) || 0)}
                      placeholder="2500"
                      className="w-full px-3 py-2.5 pr-12 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Zonnepanelen */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sun weight="duotone" className="w-5 h-5 text-amber-600" />
            <h4 className="text-base font-bold text-brand-navy-500">Zonnepanelen</h4>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50 transition-all">
              <input
                type="checkbox"
                checked={formData.heeftZonnepanelen}
                onChange={(e) => {
                  const checked = e.target.checked
                  const newData = { 
                    ...formData, 
                    heeftZonnepanelen: checked,
                    terugleveringJaar: checked ? formData.terugleveringJaar : null
                  }
                  setFormData(newData)
                  onChange(newData)
                }}
                className="w-5 h-5 rounded border-2 border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-brand-navy-500">Wij hebben zonnepanelen</span>
            </label>

            {formData.heeftZonnepanelen && (
              <div className="animate-slide-down">
                <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                  Teruglevering per jaar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.terugleveringJaar || ''}
                    onChange={(e) => handleFieldChange('terugleveringJaar', Number(e.target.value) || 0)}
                    placeholder="3000"
                    className="w-full px-3 py-2.5 pr-12 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kWh</span>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">
                  Hoeveel stroom lever je terug aan het net?
                </p>
              </div>
            )}
            
            {/* Spacer om hoogte gelijk te maken met elektriciteit sectie */}
            {!formData.heeftZonnepanelen && (
              <div className="h-20"></div>
            )}
          </div>
        </div>
      </div>

      {/* 4 & 5. GAS & AANSLUITWAARDEN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 4. Gas */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame weight="duotone" className="w-5 h-5 text-brand-teal-600" />
            <h4 className="text-base font-bold text-brand-navy-500">Gas</h4>
          </div>
          
          <div className="space-y-3">
            {!formData.geenGasaansluiting && (
              <div>
                <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                  Verbruik per jaar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.gasJaar || ''}
                    onChange={(e) => handleFieldChange('gasJaar', Number(e.target.value) || 0)}
                    placeholder="1200"
                    className="w-full px-3 py-2.5 pr-12 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">m³</span>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-brand-teal-300 hover:bg-brand-teal-50 transition-all">
              <input
                type="checkbox"
                checked={formData.geenGasaansluiting}
                onChange={(e) => {
                  const checked = e.target.checked
                  const newData = { 
                    ...formData, 
                    geenGasaansluiting: checked,
                    gasJaar: checked ? null : formData.gasJaar
                  }
                  setFormData(newData)
                  onChange(newData)
                }}
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-brand-navy-500">Geen gasaansluiting</span>
            </label>
          </div>
        </div>

        {/* 5. Aansluitwaarden */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plugs weight="duotone" className="w-5 h-5 text-brand-navy-500" />
            <h4 className="text-base font-bold text-brand-navy-500">Aansluitwaarden</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                Elektriciteit
              </label>
              <select
                value={formData.aansluitwaardeElektriciteit || '3x25A'}
                onChange={(e) => handleFieldChange('aansluitwaardeElektriciteit', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium bg-white"
              >
                <option value="3x25A">3x25A</option>
                <option value="3x35A">3x35A</option>
                <option value="3x50A">3x50A</option>
                <option value="3x63A">3x63A</option>
                <option value="3x80A">3x80A</option>
                <option value=">3x80A">Grootverbruik</option>
              </select>
            </div>

            {!formData.geenGasaansluiting && (
              <div>
                <label className="block text-xs font-semibold text-brand-navy-500 mb-1.5">
                  Gas
                </label>
                <select
                  value={formData.aansluitwaardeGas || 'G6'}
                  onChange={(e) => handleFieldChange('aansluitwaardeGas', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 transition-all text-brand-navy-500 font-medium bg-white"
                >
                  <option value="G4">G4</option>
                  <option value="G6">G6</option>
                  <option value="G10">G10</option>
                  <option value="G16">G16</option>
                  <option value="G25">G25</option>
                  <option value=">G25">Grootverbruik</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

