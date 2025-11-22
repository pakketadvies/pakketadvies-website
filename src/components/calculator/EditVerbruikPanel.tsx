'use client'

import { useState, useEffect, useRef } from 'react'
import { Lightning, Flame, MapPin, Plugs, PencilSimple, Check, X, CaretDown, CaretUp, Sun } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import type { VerbruikData } from '@/types/calculator'

interface EditVerbruikPanelProps {
  currentData: VerbruikData
  onUpdate: (newData: VerbruikData) => void
  isUpdating: boolean
  forceOpen?: boolean // For modal mode
}

export default function EditVerbruikPanel({ currentData, onUpdate, isUpdating, forceOpen = false }: EditVerbruikPanelProps) {
  const [isOpen, setIsOpen] = useState(forceOpen)
  const [formData, setFormData] = useState<VerbruikData>(currentData)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Address lookup states
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string>('')
  const lastLookup = useRef<string>('')
  const addressTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update form when currentData changes
  useEffect(() => {
    setFormData(currentData)
    setHasChanges(false)
  }, [currentData])

  // Force open state when in modal mode
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
    }
  }, [forceOpen])

  // Cleanup
  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current)
      }
    }
  }, [])

  const handleFieldChange = (field: keyof VerbruikData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
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
    setFormData(prev => ({ ...prev, leveringsadressen: [newAdres] }))
    setHasChanges(true)
    
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
        
        if (data.error) {
          setAddressError(data.error)
          setFormData(prev => ({
            ...prev,
            leveringsadressen: [{
              ...prev.leveringsadressen[0],
              straat: '',
              plaats: '',
            }]
          }))
          setLoadingAddress(false)
          return
        }
        
        setFormData(prev => ({
          ...prev,
          leveringsadressen: [{
            ...prev.leveringsadressen[0],
            straat: data.street || '',
            plaats: data.city || '',
          }]
        }))
        
        lastLookup.current = lookupKey
      } else if (response.status === 404) {
        const errorData = await response.json()
        setAddressError(errorData.error || 'Adres niet gevonden')
        setFormData(prev => ({
          ...prev,
          leveringsadressen: [{
            ...prev.leveringsadressen[0],
            straat: '',
            plaats: '',
          }]
        }))
      }
    } catch (error) {
      console.error('Address fetch exception:', error)
      setAddressError('Fout bij ophalen adres')
    } finally {
      setLoadingAddress(false)
    }
  }

  const handleSubmit = () => {
    onUpdate(formData)
    setHasChanges(false)
  }

  const handleReset = () => {
    setFormData(currentData)
    setHasChanges(false)
    setAddressError('')
  }

  const totaalElektriciteit = formData.elektriciteitNormaal + (formData.elektriciteitDal || 0)

  return (
    <div className={`bg-white overflow-hidden transition-all duration-300 ${forceOpen ? '' : 'rounded-2xl shadow-lg border-2 border-gray-200'}`}>
      {/* Header - Only show when NOT in modal mode */}
      {!forceOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-teal-100 rounded-lg flex items-center justify-center group-hover:bg-brand-teal-200 transition-colors">
              <PencilSimple weight="duotone" className="w-5 h-5 text-brand-teal-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-brand-navy-500">Verbruik aanpassen</h3>
              <p className="text-sm text-gray-600">
                {totaalElektriciteit.toLocaleString()} kWh stroom
                {formData.heeftZonnepanelen && formData.terugleveringJaar ? ` • ${formData.terugleveringJaar.toLocaleString()} kWh teruglevering` : ''}
                {formData.gasJaar ? ` • ${formData.gasJaar.toLocaleString()} m³ gas` : ''}
                {formData.leveringsadressen?.[0]?.postcode && ` • ${formData.leveringsadressen[0].postcode}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && !isOpen && (
              <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                <PencilSimple weight="bold" className="w-4 h-4" />
                Niet opgeslagen
              </span>
            )}
            {isOpen ? (
              <CaretUp weight="bold" className="w-6 h-6 text-gray-400" />
            ) : (
              <CaretDown weight="bold" className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </button>
      )}

      {/* Edit Form - Collapsible or always open in modal */}
      {isOpen && (
        <div className={`px-4 md:px-6 pb-6 space-y-5 animate-slide-down pt-6 ${forceOpen ? '' : 'border-t-2 border-gray-100'}`}>
          
          {/* 1. LEVERADRES - Altijd bovenaan, full width */}
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

              {loadingAddress && (
                <div className="flex items-center gap-2 text-sm text-brand-teal-600 animate-slide-down">
                  <div className="w-4 h-4 border-2 border-brand-teal-300 border-t-brand-teal-600 rounded-full animate-spin" />
                  <span>Adres opzoeken...</span>
                </div>
              )}

              {formData.leveringsadressen[0]?.straat && formData.leveringsadressen[0]?.plaats && !loadingAddress && (
                <div className="flex items-center gap-2 p-3 bg-brand-teal-50 border border-brand-teal-200 rounded-lg text-sm animate-slide-down">
                  <Check weight="duotone" className="w-5 h-5 text-brand-teal-600 flex-shrink-0" />
                  <span className="text-brand-teal-900 font-medium">
                    {formData.leveringsadressen[0].straat} {formData.leveringsadressen[0].huisnummer}
                    {formData.leveringsadressen[0].toevoeging ? ` ${formData.leveringsadressen[0].toevoeging}` : ''}, {formData.leveringsadressen[0].postcode} {formData.leveringsadressen[0].plaats}
                  </span>
                </div>
              )}

              {addressError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm animate-slide-down">
                  <X weight="duotone" className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-900">{addressError}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2 & 3. ELEKTRICITEIT & ZONNEPANELEN - Desktop: 2 kolommen, Mobiel: stack */}
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
                      handleFieldChange('heeftEnkeleMeter', e.target.checked)
                      if (e.target.checked) {
                        handleFieldChange('elektriciteitDal', null)
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
                      handleFieldChange('heeftZonnepanelen', e.target.checked)
                      if (!e.target.checked) {
                        handleFieldChange('terugleveringJaar', null)
                      }
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

          {/* 4 & 5. GAS & AANSLUITWAARDEN - Desktop: 2 kolommen, Mobiel: stack */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* 4. Gas */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame weight="duotone" className="w-5 h-5 text-orange-600" />
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

                <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.geenGasaansluiting}
                    onChange={(e) => {
                      handleFieldChange('geenGasaansluiting', e.target.checked)
                      if (e.target.checked) {
                        handleFieldChange('gasJaar', null)
                      }
                    }}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
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
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-100">
            <Button
              onClick={handleSubmit}
              disabled={!hasChanges || isUpdating}
              className="flex-1 sm:flex-initial"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Herberekenen...
                </>
              ) : (
                <>
                  <Check weight="bold" className="w-5 h-5" />
                  Herbereken resultaten
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isUpdating}
              className="flex-1 sm:flex-initial"
            >
              <X weight="bold" className="w-5 h-5" />
              Annuleren
            </Button>
            
            {hasChanges && (
              <div className="sm:ml-auto flex items-center gap-2 text-sm text-orange-600 font-medium">
                <PencilSimple weight="bold" className="w-4 h-4" />
                Niet opgeslagen wijzigingen
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

