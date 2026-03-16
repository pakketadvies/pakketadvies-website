'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const vveFormSchema = z.object({
  naam: z.string().trim().min(2, 'Vul je naam in'),
  locatieVve: z.string().trim().min(2, 'Vul de locatie van de VvE in'),
  telefoon: z.string().trim().min(8, 'Vul een geldig telefoonnummer in'),
})

type VveFormValues = z.infer<typeof vveFormSchema>

type FormErrors = Partial<Record<keyof VveFormValues, string>>

const initialValues: VveFormValues = {
  naam: '',
  locatieVve: '',
  telefoon: '',
}

export function VveContactForm() {
  const [values, setValues] = useState<VveFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (field: keyof VveFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setValues((current) => ({ ...current, [field]: nextValue }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const parsed = vveFormSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string' && !fieldErrors[field as keyof VveFormValues]) {
          fieldErrors[field as keyof VveFormValues] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/vve-advies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      })

      const result = (await response.json()) as { success?: boolean; error?: string }

      if (!response.ok || !result.success) {
        setSubmitError(result.error || 'Er is iets misgegaan. Probeer het opnieuw.')
        return
      }

      setIsSuccess(true)
      setValues(initialValues)
    } catch {
      setSubmitError('Er is iets misgegaan. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <p className="font-semibold text-green-800">Dank je, je aanvraag is ontvangen.</p>
        <p className="mt-2 text-sm text-green-700">We nemen vrijblijvend contact op om mee te kijken naar het beste VvE-energieadvies.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Naam"
        placeholder="Bijv. Jan de Vries"
        value={values.naam}
        onChange={handleChange('naam')}
        error={errors.naam}
        required
      />

      <Input
        label="Locatie VvE"
        placeholder="Bijv. Groningen, Stavangerweg"
        value={values.locatieVve}
        onChange={handleChange('locatieVve')}
        error={errors.locatieVve}
        required
      />

      <Input
        label="Telefoonnummer"
        type="tel"
        placeholder="Bijv. 06 12345678"
        value={values.telefoon}
        onChange={handleChange('telefoon')}
        error={errors.telefoon}
        required
      />

      {submitError ? <p className="text-sm font-medium text-red-600">{submitError}</p> : null}

      <Button type="submit" className="w-full" size="lg" variant="premium" loading={isSubmitting} loadingText="Versturen...">
        Verstuur
      </Button>

      <p className="text-xs text-gray-500">
        Advies is gratis en vrijblijvend. Door te versturen geef je toestemming dat we telefonisch contact opnemen over VvE-energieadvies.
      </p>
    </form>
  )
}
