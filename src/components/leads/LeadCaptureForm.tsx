'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { captureComparisonLead } from '@/lib/lead-capture'
import type { ComparisonLeadFlow, ComparisonLeadSource } from '@/types/comparison-leads'

interface LeadCaptureFormProps {
  source: ComparisonLeadSource
  flow: ComparisonLeadFlow
  title: string
  subtitle?: string
  buttonText?: string
  compact?: boolean
  onSuccess?: () => void
}

export function LeadCaptureForm({
  source,
  flow,
  title,
  subtitle,
  buttonText = 'Stuur mijn aanbod',
  compact = false,
  onSuccess,
}: LeadCaptureFormProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const consentText = useMemo(
    () => 'Ik geef toestemming om contact op te nemen over energie-aanbod van PakketAdvies.',
    []
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Vul een geldig e-mailadres in.')
      return
    }

    try {
      setIsSubmitting(true)
      await captureComparisonLead({
        email: email.trim(),
        phone: phone.trim() || undefined,
        source,
        flow,
        consentText,
      })
      setSuccess(true)
      onSuccess?.()
    } catch (submitError: any) {
      setError(submitError?.message || 'Opslaan mislukt. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-brand-teal-200 bg-brand-teal-50 px-4 py-4">
        <p className="text-sm font-semibold text-brand-teal-700">Top, je aanvraag staat klaar.</p>
        <p className="mt-1 text-sm text-gray-700">
          We sturen je snel een passend voorstel op basis van jouw situatie.
        </p>
      </div>
    )
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div>
        <h3 className={compact ? 'text-base font-bold text-brand-navy-500' : 'text-lg font-bold text-brand-navy-500'}>
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
        <Input
          type="email"
          label="E-mailadres"
          placeholder="naam@bedrijf.nl"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          inputSize={compact ? 'sm' : 'md'}
        />

        <Input
          type="tel"
          label="Telefoonnummer (optioneel)"
          placeholder="06 12345678"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          inputSize={compact ? 'sm' : 'md'}
        />

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <Button type="submit" variant="primary" size={compact ? 'sm' : 'md'} loading={isSubmitting} className="w-full">
          {buttonText}
        </Button>

        <p className="text-xs text-gray-500">
          Met versturen ga je akkoord dat we je mogen benaderen over energiecontracten.
        </p>
      </form>
    </div>
  )
}
