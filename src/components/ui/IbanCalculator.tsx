'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { Input } from './Input'
import { CreditCard, CheckCircle, XCircle, Copy, MagnifyingGlass, X } from '@phosphor-icons/react'
import { calculateIBAN, validateIBAN, formatIBAN, getBankNameFromIBAN, getCommonBankCodes } from '@/lib/iban-calculator'

interface IbanCalculatorProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (iban: string) => void
}

export function IbanCalculator({ isOpen, onClose, onSelect }: IbanCalculatorProps) {
  const [mode, setMode] = useState<'calculate' | 'validate'>('calculate')
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ibanInput, setIbanInput] = useState('')
  const [result, setResult] = useState<{ iban?: string; valid?: boolean; error?: string; bankName?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const commonBanks = getCommonBankCodes()

  const handleCalculate = () => {
    setResult(null)
    setCopied(false)

    if (!bankCode || !accountNumber) {
      setResult({ error: 'Vul zowel bankcode als rekeningnummer in' })
      return
    }

    const calculated = calculateIBAN(bankCode, accountNumber)
    if (calculated.error) {
      setResult({ error: calculated.error })
      return
    }

    const formatted = formatIBAN(calculated.iban)
    const bankNameResult = getBankNameFromIBAN(calculated.iban)

    setResult({
      iban: formatted,
      valid: true,
      ...(bankNameResult && { bankName: bankNameResult }),
    })
  }

  const handleValidate = () => {
    setResult(null)
    setCopied(false)

    if (!ibanInput) {
      setResult({ error: 'Vul een IBAN in om te valideren' })
      return
    }

    const validation = validateIBAN(ibanInput)
    if (!validation.valid) {
      setResult({ valid: false, error: validation.error })
      return
    }

    const formatted = formatIBAN(ibanInput)
    const bankNameResult = getBankNameFromIBAN(ibanInput)

    setResult({
      iban: formatted,
      valid: true,
      ...(bankNameResult && { bankName: bankNameResult }),
    })
  }

  const handleCopy = async () => {
    if (!result?.iban) return

    try {
      await navigator.clipboard.writeText(result.iban.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleUseIban = () => {
    if (result?.iban && onSelect) {
      onSelect(result.iban.replace(/\s/g, ''))
      onClose()
      // Reset
      setBankCode('')
      setAccountNumber('')
      setIbanInput('')
      setResult(null)
      setMode('calculate')
    }
  }

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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleClose = () => {
    onClose()
    // Reset on close
    setTimeout(() => {
      setBankCode('')
      setAccountNumber('')
      setIbanInput('')
      setResult(null)
      setMode('calculate')
      setCopied(false)
    }, 300)
  }

  if (!isOpen) return null

  // Render fullscreen overlay via portal
  const modalContent = typeof window !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Backdrop - click to close */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl md:rounded-t-3xl z-10">
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy-500">
            IBAN Bepalen
          </h2>
          <button
            onClick={handleClose}
            className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X weight="bold" className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
        {/* Mode selector */}
        <div className="flex gap-3 border-b border-gray-200 pb-4">
          <button
            onClick={() => {
              setMode('calculate')
              setResult(null)
              setIbanInput('')
            }}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              mode === 'calculate'
                ? 'bg-brand-teal-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MagnifyingGlass weight="duotone" className="w-5 h-5" />
              <span>Berekenen</span>
            </div>
          </button>
          <button
            onClick={() => {
              setMode('validate')
              setResult(null)
              setBankCode('')
              setAccountNumber('')
            }}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
              mode === 'validate'
                ? 'bg-brand-teal-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle weight="duotone" className="w-5 h-5" />
              <span>Valideren</span>
            </div>
          </button>
        </div>

        {/* Calculate mode */}
        {mode === 'calculate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bankcode <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <Input
                  value={bankCode}
                  onChange={(e) => {
                    setBankCode(e.target.value.toUpperCase().slice(0, 4))
                    setResult(null)
                  }}
                  placeholder="Bijv. INGB, RABO, ABNA"
                  maxLength={4}
                  className="uppercase"
                />
                <div className="text-xs text-gray-500">
                  Veelgebruikte bankcodes:
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonBanks.slice(0, 8).map((bank) => (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => {
                        setBankCode(bank.code)
                        setResult(null)
                      }}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-brand-teal-100 hover:text-brand-teal-700 rounded-lg transition-colors border border-gray-200 hover:border-brand-teal-300"
                    >
                      {bank.code} - {bank.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rekeningnummer <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setAccountNumber(value)
                  setResult(null)
                }}
                placeholder="10 cijfers (bijv. 1234567890)"
                maxLength={10}
              />
            </div>

            <Button
              onClick={handleCalculate}
              className="w-full bg-brand-teal-500 hover:bg-brand-teal-600"
              disabled={!bankCode || !accountNumber}
            >
              <CreditCard weight="duotone" className="w-5 h-5 mr-2" />
              IBAN Berekenen
            </Button>
          </div>
        )}

        {/* Validate mode */}
        {mode === 'validate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IBAN <span className="text-red-500">*</span>
              </label>
              <Input
                value={ibanInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Z0-9\s]/gi, '').toUpperCase()
                  setIbanInput(value)
                  setResult(null)
                }}
                placeholder="NL91 ABNA 0417 1643 00"
                maxLength={21}
              />
              <p className="text-xs text-gray-500 mt-1">
                Voer uw IBAN in om te controleren of deze geldig is
              </p>
            </div>

            <Button
              onClick={handleValidate}
              className="w-full bg-brand-teal-500 hover:bg-brand-teal-600"
              disabled={!ibanInput}
            >
              <CheckCircle weight="duotone" className="w-5 h-5 mr-2" />
              IBAN Valideren
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`p-4 rounded-xl border-2 animate-slide-down ${
              result.valid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {result.valid && result.iban ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle weight="duotone" className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-green-900 mb-1">
                      IBAN is geldig
                    </div>
                    {result.bankName && (
                      <div className="text-sm text-green-700 mb-2">
                        Bank: {result.bankName}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono font-bold text-green-900 bg-white px-3 py-2 rounded-lg border border-green-200">
                        {result.iban}
                      </code>
                      <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Kopieer IBAN"
                      >
                        {copied ? (
                          <CheckCircle weight="fill" className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy weight="duotone" className="w-5 h-5 text-green-600" />
                        )}
                      </button>
                    </div>
                    {onSelect && (
                      <Button
                        onClick={handleUseIban}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Gebruik dit IBAN
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <XCircle weight="duotone" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-900 mb-1">
                    IBAN is ongeldig
                  </div>
                  <div className="text-sm text-red-700">
                    {result.error || 'Controleer het IBAN en probeer het opnieuw'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <CreditCard weight="duotone" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Wat is een IBAN?</p>
              <p>
                IBAN staat voor International Bank Account Number. Een Nederlands IBAN bestaat uit:
                <br />
                • Landcode: NL
                <br />
                • 2 controlecijfers
                <br />
                • 4 letters (bankcode)
                <br />
                • 10 cijfers (rekeningnummer)
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return modalContent
}

