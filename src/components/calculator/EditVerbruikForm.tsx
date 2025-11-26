'use client'

import { useState, useEffect, useRef } from 'react'
import { Lightning, Flame, MapPin, Plugs, Sun, Check, X, CheckCircle, XCircle } from '@phosphor-icons/react'
import type { VerbruikData } from '@/types/calculator'

interface EditVerbruikFormProps {
  currentData: VerbruikData
  onChange: (newData: VerbruikData) => void
}

export default function EditVerbruikForm({ currentData, onChange }: EditVerbruikFormProps) {
  const [formData, setFormData] = useState<VerbruikData>(currentData)
  
  // Address lookup states
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string>('')
  const [checkingAddressType, setCheckingAddressType] = useState(false)
  const [addressTypeResult, setAddressTypeResult] = useState<{
    type: 'particulier' | 'zakelijk' | 'error';
    message: string;
  } | null>(null)
  const lastLookup = useRef<string>('')
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Request counters voor race condition preventie
  const requestCounter = useRef<number>(0)
  const bagRequestCounter = useRef<number>(0)

  // Update form when currentData changes
  useEffect(() => {
    setFormData(currentData)
  }, [currentData])

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
    const newAdres = { ...formData.leveringsadressen[0] }
    newAdres[field] = value
    
    // Clear address when input changes
    if (newAdres.straat || newAdres.plaats) {
      newAdres.straat = ''
      newAdres.plaats = ''
    }
    
    setAddressError('')
    setAddressTypeResult(null) // Clear BAG API result
    // Clear addressType omdat adres is gewijzigd
    const newData = { ...formData, leveringsadressen: [newAdres], addressType: null }
    setFormData(newData)
    onChange(newData)
    
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

  const isValidPostcode = (postcode: string): boolean => {
    const clean = postcode.toUpperCase().replace(/\s/g, '')
    return /^\d{4}[A-Z]{2}$/.test(clean)
  }

  const fetchAddress = async (postcode: string, huisnummer: string, toevoeging?: string) => {
    const lookupKey = `${postcode}-${huisnummer}-${toevoeging || ''}`
    if (lastLookup.current === lookupKey) return

    // Genereer unieke request ID voor race condition preventie
    const currentRequestId = requestCounter.current + 1
    requestCounter.current = currentRequestId

    const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')
    setLoadingAddress(true)
    setAddressError('')
    
    try {
      let url = `/api/postcode?postcode=${postcodeClean}&number=${huisnummer}`
      if (toevoeging && toevoeging.trim()) {
        url += `&addition=${encodeURIComponent(toevoeging.trim())}`
      }
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        // Check of dit nog steeds de laatste request is (race condition preventie)
        if (requestCounter.current !== currentRequestId) {
          console.log('Ignoring stale postcode API response')
          return
        }
        
        if (data.error) {
          setAddressError(data.error)
          setAddressTypeResult(null) // Clear BAG API result
          // Clear addressType bij error
          const newData = { ...formData, addressType: null }
          setFormData(newData)
          onChange(newData)
        } else if (data.street && data.city) {
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
          onChange(newData)
          lastLookup.current = lookupKey

          // NIEUW: BAG API woonfunctie check (alleen als dit nog steeds de laatste request is)
          if (requestCounter.current === currentRequestId) {
            // Genereer unieke request ID voor BAG API race condition preventie
            const currentBagRequestId = bagRequestCounter.current + 1
            bagRequestCounter.current = currentBagRequestId

            setCheckingAddressType(true);
            setAddressTypeResult(null);
            
            try {
              const bagResponse = await fetch('/api/adres-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postcode, huisnummer, toevoeging })
              });

              const bagResult = await bagResponse.json();
              
              // Check of dit nog steeds de laatste BAG request is (race condition preventie)
              if (bagRequestCounter.current !== currentBagRequestId) {
                console.log('Ignoring stale BAG API response')
                return
              }
              
              setAddressTypeResult(bagResult);
              
              // Update addressType in formData
              if (bagResult.type !== 'error') {
                const updatedData = { ...newData, addressType: bagResult.type };
                setFormData(updatedData);
                onChange(updatedData);
              } else {
                const updatedData = { ...newData, addressType: null };
                setFormData(updatedData);
                onChange(updatedData);
              }
            } catch (error) {
              console.error('BAG API check error:', error);
              
              // Check of dit nog steeds de laatste BAG request is (race condition preventie)
              if (bagRequestCounter.current !== currentBagRequestId) {
                return
              }
              
              setAddressTypeResult({
                type: 'error',
                message: 'Kon adres type niet controleren'
              });
              // Bij error, clear addressType
              const updatedData = { ...newData, addressType: null };
              setFormData(updatedData);
              onChange(updatedData);
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
        // Clear addressType bij error
        const newData = { ...formData, addressType: null }
        setFormData(newData)
        onChange(newData)
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
                  <div className={`text-sm ${
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
                    <div>{addressTypeResult.message}</div>
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
                  const newData = { 
                    ...formData, 
                    heeftEnkeleMeter: checked,
                    elektriciteitDal: checked ? null : formData.elektriciteitDal
                  }
                  setFormData(newData)
                  onChange(newData)
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

