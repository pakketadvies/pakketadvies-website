'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { User, Phone, Buildings, CheckCircle, XCircle } from '@phosphor-icons/react'

const claimSchema = z.object({
  naam: z.string().min(2, 'Vul je naam in'),
  telefoon: z
    .string()
    .min(10, 'Vul een geldig telefoonnummer in'),
  bedrijfsnaam: z.string().min(2, 'Vul je bedrijfsnaam in'),
  privacy_akkoord: z.boolean().refine((val) => val === true, {
    message: 'Je moet akkoord gaan met de privacyvoorwaarden',
  }),
})

type ClaimFormData = z.infer<typeof claimSchema>

interface GasContractClaimFormProps {
  /** Optionele submit-button tekst (default: "Claim dit aanbod") */
  submitLabel?: string
}

/**
 * Korte claim-formulier voor de gas-vastzetten aanbieding.
 * Vraagt alleen naam, telefoon en bedrijfsnaam. Stuurt door naar
 * /api/aanbieding/gas-vastzetten en daarvandaan naar Google Sheets
 * + notification e-mail.
 */
export function GasContractClaimForm({
  submitLabel = 'Claim dit aanbod',
}: GasContractClaimFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      naam: '',
      telefoon: '',
      bedrijfsnaam: '',
      privacy_akkoord: false,
    },
  })

  const onSubmit = async (data: ClaimFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/aanbieding/gas-vastzetten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        setIsSuccess(true)
        reset()
      } else {
        setError(result.error || 'Er is een fout opgetreden. Probeer het later opnieuw.')
      }
    } catch (err) {
      console.error('Error submitting claim form:', err)
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-2 border-brand-teal-500 bg-brand-teal-50">
        <CardContent className="pt-8 md:pt-10">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-brand-teal-500 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" weight="fill" />
              </div>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500">
              Bedankt — we bellen je terug!
            </h3>
            <p className="text-gray-600 text-base">
              We hebben je gegevens ontvangen en nemen zo snel mogelijk telefonisch
              contact met je op om de mogelijkheden door te nemen.
            </p>
            <p className="text-sm text-gray-500">
              Liever direct schakelen?{' '}
              <a
                href="tel:0850477065"
                className="text-brand-teal-600 font-semibold hover:underline"
              >
                085 047 7065
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" weight="fill" />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Naam *"
          placeholder="Je volledige naam"
          icon={<User className="w-5 h-5" />}
          autoComplete="name"
          {...register('naam')}
          error={errors.naam?.message}
          required
        />

        <Input
          label="Telefoonnummer *"
          type="tel"
          placeholder="0612345678"
          icon={<Phone className="w-5 h-5" />}
          autoComplete="tel"
          {...register('telefoon')}
          error={errors.telefoon?.message}
          required
        />

        <Input
          label="Bedrijfsnaam *"
          placeholder="Je bedrijfsnaam"
          icon={<Buildings className="w-5 h-5" />}
          autoComplete="organization"
          {...register('bedrijfsnaam')}
          error={errors.bedrijfsnaam?.message}
          required
        />

        <div>
          <label className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              {...register('privacy_akkoord')}
              className="mt-0.5 w-4 h-4 rounded border-2 border-gray-300 text-brand-teal-500 focus:ring-brand-teal-500 focus:ring-2 cursor-pointer"
            />
            <span className="text-xs text-gray-600 group-hover:text-gray-800">
              Ik ga akkoord met het{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal-600 font-semibold hover:underline"
              >
                privacybeleid
              </a>{' '}
              en geef toestemming om telefonisch contact met mij op te nemen.*
            </span>
          </label>
          {errors.privacy_akkoord && (
            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.privacy_akkoord.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Verzenden...
            </>
          ) : (
            <>{submitLabel}</>
          )}
        </Button>
      </form>
    </>
  )
}
