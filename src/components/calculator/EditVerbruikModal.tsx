'use client'

import { useEffect, useState } from 'react'
import { X, ArrowLeft, Leaf, SlidersHorizontal, ArrowsDownUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import type { VerbruikData } from '@/types/calculator'
import EditVerbruikForm from './EditVerbruikForm'

interface Filters {
  type: 'alle' | 'vast' | 'dynamisch'
  groeneEnergie: boolean
  maxPrijs: number
  minRating: number
}

interface EditVerbruikModalProps {
  isOpen: boolean
  onClose: () => void
  currentData: VerbruikData
  onSave: (newData: VerbruikData) => void
  isUpdating: boolean
  // NIEUW: Filters voor mobiel
  filters?: Filters
  onFiltersChange?: (filters: Filters) => void
  sortBy?: 'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating'
  onSortByChange?: (sortBy: 'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating') => void
}

export default function EditVerbruikModal({ 
  isOpen, 
  onClose, 
  currentData, 
  onSave,
  isUpdating,
  filters,
  onFiltersChange,
  sortBy = 'besparing',
  onSortByChange
}: EditVerbruikModalProps) {
  const [formData, setFormData] = useState<VerbruikData>(currentData)
  const [hasChanges, setHasChanges] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState<Filters>(filters || {
    type: 'alle',
    groeneEnergie: false,
    maxPrijs: 99999,
    minRating: 0,
  })
  const [localSortBy, setLocalSortBy] = useState<'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating'>(sortBy)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(currentData)
      setHasChanges(false)
      setShowAdvancedFilters(false) // Reset advanced filters section when modal opens
      if (filters) {
        setLocalFilters(filters)
      }
      if (sortBy) {
        setLocalSortBy(sortBy)
      }
    }
  }, [isOpen, currentData, filters, sortBy])

  // Update filters when local filters change
  useEffect(() => {
    if (onFiltersChange && isOpen) {
      onFiltersChange(localFilters)
    }
  }, [localFilters, isOpen, onFiltersChange])

  // Update sortBy when local sortBy changes
  useEffect(() => {
    if (onSortByChange && isOpen) {
      onSortByChange(localSortBy)
    }
  }, [localSortBy, isOpen, onSortByChange])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSave = () => {
    onSave(formData)
  }

  const handleCancel = () => {
    // Reset all state first
    setFormData(currentData)
    setHasChanges(false)
    setShowAdvancedFilters(false) // Reset advanced filters section
    
    // Close the modal - ensure onClose is called
    if (onClose) {
      onClose()
    }
  }

  const handleFormChange = (newData: VerbruikData) => {
    setFormData(newData)
    setHasChanges(true)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleCancel}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        <div className="w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl pointer-events-auto flex flex-col animate-slide-up sm:animate-scale-in overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="sm:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
                aria-label="Terug"
              >
                <ArrowLeft weight="bold" className="w-5 h-5 text-brand-navy-500" />
              </button>
              <h2 className="text-xl font-bold text-brand-navy-500">
                Verbruik aanpassen
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="Sluiten"
            >
              <X weight="bold" className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 space-y-6">
              {/* Filters Section - Only on mobile */}
              <div className="md:hidden space-y-4 pb-4 border-b-2 border-gray-100">
                <h3 className="text-lg font-bold text-brand-navy-500">Filters & Sorteren</h3>
                
                {/* Quick filter buttons */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contracttype</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setLocalFilters({ ...localFilters, type: 'alle' })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          localFilters.type === 'alle'
                            ? 'bg-brand-teal-500 text-white shadow-md'
                            : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                        }`}
                      >
                        Alle
                      </button>
                      <button
                        onClick={() => setLocalFilters({ ...localFilters, type: 'vast' })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          localFilters.type === 'vast'
                            ? 'bg-brand-teal-500 text-white shadow-md'
                            : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                        }`}
                      >
                        Vast
                      </button>
                      <button
                        onClick={() => setLocalFilters({ ...localFilters, type: 'dynamisch' })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          localFilters.type === 'dynamisch'
                            ? 'bg-brand-teal-500 text-white shadow-md'
                            : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                        }`}
                      >
                        Dynamisch
                      </button>
                      <button
                        onClick={() => setLocalFilters({ ...localFilters, groeneEnergie: !localFilters.groeneEnergie })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                          localFilters.groeneEnergie
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Leaf weight="duotone" className="w-4 h-4" />
                        Groen
                      </button>
                    </div>
                  </div>

                  {/* Sort dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sorteren op</label>
                    <div className="flex items-center gap-2">
                      <ArrowsDownUp weight="bold" className="w-5 h-5 text-gray-500" />
                      <select
                        value={localSortBy}
                        onChange={(e) => setLocalSortBy(e.target.value as any)}
                        className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                      >
                        <option value="besparing">Hoogste besparing</option>
                        <option value="prijs-laag">Laagste prijs</option>
                        <option value="prijs-hoog">Hoogste prijs</option>
                        <option value="rating">Beste beoordeling</option>
                      </select>
                    </div>
                  </div>

                  {/* Advanced filters toggle */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal weight="bold" className="w-4 h-4" />
                    Meer filters
                    {showAdvancedFilters ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Advanced filters (collapsible) */}
                  {showAdvancedFilters && (
                    <div className="pt-3 border-t border-gray-200 space-y-3 animate-slide-down">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Min. beoordeling</label>
                        <select
                          value={localFilters.minRating}
                          onChange={(e) => setLocalFilters({ ...localFilters, minRating: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
                        >
                          <option value="0">Alle</option>
                          <option value="4">4+ sterren</option>
                          <option value="4.5">4.5+ sterren</option>
                          <option value="4.8">4.8+ sterren</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setLocalFilters({ type: 'alle', groeneEnergie: false, maxPrijs: 99999, minRating: 0 })
                          setShowAdvancedFilters(false)
                        }}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-navy-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <X weight="bold" className="w-4 h-4" />
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Verbruik Form */}
              <div>
                <h3 className="text-lg font-bold text-brand-navy-500 mb-4">Verbruik</h3>
                <EditVerbruikForm 
                  currentData={formData}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="border-t-2 border-gray-100 p-5 bg-white sticky bottom-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1"
              >
                Annuleren
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Herberekenen...
                  </>
                ) : (
                  'Opslaan & Herberekenen'
                )}
              </Button>
            </div>
            
            {hasChanges && !isUpdating && (
              <p className="text-xs text-gray-600 mt-3 text-center">
                Je hebt wijzigingen die nog niet zijn opgeslagen
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

