'use client'

import { useEffect, useState } from 'react'
import { X, Check, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import type { VerbruikData } from '@/types/calculator'
import EditVerbruikForm from './EditVerbruikForm'

interface EditVerbruikModalProps {
  isOpen: boolean
  onClose: () => void
  currentData: VerbruikData
  onSave: (newData: VerbruikData) => void
  isUpdating: boolean
}

export default function EditVerbruikModal({ 
  isOpen, 
  onClose, 
  currentData, 
  onSave,
  isUpdating 
}: EditVerbruikModalProps) {
  const [formData, setFormData] = useState<VerbruikData>(currentData)
  const [hasChanges, setHasChanges] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(currentData)
      setHasChanges(false)
    }
  }, [isOpen, currentData])

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
    setFormData(currentData)
    setHasChanges(false)
    onClose()
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
            <div className="p-5">
              <EditVerbruikForm 
                currentData={formData}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="border-t-2 border-gray-100 p-5 bg-white sticky bottom-0">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex-1 sm:flex-initial"
              >
                <X weight="bold" className="w-5 h-5" />
                Annuleren
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isUpdating}
                className="flex-1 sm:flex-auto"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Herberekenen...
                  </>
                ) : (
                  <>
                    <Check weight="bold" className="w-5 h-5" />
                    Opslaan & Herberekenen
                  </>
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

