'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { User, Envelope, Phone, ChatCircleText, CheckCircle, XCircle } from '@phosphor-icons/react'

const interesseSchema = z.object({
  naam: z.string().min(2, 'Vul je naam in'),
  email: z.string().email('Vul een geldig e-mailadres in'),
  telefoon: z.string().min(10, 'Vul een geldig telefoonnummer in'),
  opmerking: z.string().optional(),
  privacy_akkoord: z.boolean().refine((val) => val === true, {
    message: 'Je moet akkoord gaan met de privacyvoorwaarden',
  }),
})

type InteresseFormData = z.infer<typeof interesseSchema>

interface AanbiedingInteresseFormProps {
  aanbiedingType: 'particulier-3-jaar' | 'mkb-3-jaar' | 'grootzakelijk' | 'dynamisch' | 'clean-energy-ets2'
  compact?: boolean  // Voor inline gebruik in hero
}

export function AanbiedingInteresseForm({ aanbiedingType, compact = false }: AanbiedingInteresseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InteresseFormData>({
    resolver: zodResolver(interesseSchema),
    defaultValues: {
      naam: '',
      email: '',
      telefoon: '',
      opmerking: '',
      privacy_akkoord: false,
    },
  })

  const onSubmit = async (data: InteresseFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/aanbieding/interesse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          aanbiedingType,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        reset()
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError(result.error || 'Er is een fout opgetreden. Probeer het later opnieuw.')
      }
    } catch (err) {
      console.error('Error submitting form:', err)
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
              Bedankt voor je interesse!
            </h3>
            <p className="text-gray-600 text-lg">
              We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op.
            </p>
            <p className="text-sm text-gray-500">
              Meestal reageren we binnen 24 uur. Heb je dringende vragen? Bel ons op{' '}
              <a href="tel:0850477065" className="text-brand-teal-600 font-semibold hover:underline">
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
      {!compact && (
        <Card className="hover-lift">
          <CardContent className="pt-8 md:pt-10">
            <div className="mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-3">
                Interesse? Laat het ons weten!
              </h2>
              <p className="text-gray-600">
                Vul het formulier in en we nemen zo snel mogelijk contact met je op voor een vrijblijvend gesprek.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" weight="fill" />
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Naam *"
                placeholder="Je volledige naam"
                icon={<User className="w-5 h-5" />}
                {...register('naam')}
                error={errors.naam?.message}
                required
              />

              <Input
                label="E-mail *"
                type="email"
                placeholder="jouw@email.nl"
                icon={<Envelope className="w-5 h-5" />}
                {...register('email')}
                error={errors.email?.message}
                required
              />

              <Input
                label="Telefoonnummer *"
                type="tel"
                placeholder="0612345678"
                icon={<Phone className="w-5 h-5" />}
                {...register('telefoon')}
                error={errors.telefoon?.message}
                required
              />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Opmerking
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400 pointer-events-none z-10">
                <ChatCircleText className="w-5 h-5" />
              </div>
              <textarea
                {...register('opmerking')}
                rows={4}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 pl-11 font-medium text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-brand-teal-500 focus:ring-brand-teal-500 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Heb je vragen of specifieke wensen? Laat het ons weten..."
              />
            </div>
          </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    {...register('privacy_akkoord')}
                    className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-500 focus:ring-brand-teal-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-800">
                    Ik ga akkoord met het{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-teal-600 font-semibold hover:underline"
                    >
                      privacybeleid
                    </a>
                    {' '}en geef toestemming om contact met mij op te nemen.*
                  </span>
                </label>
                {errors.privacy_akkoord && (
                  <p className="text-sm font-medium text-red-600 flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                  <>
                    Verstuur interesse
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {compact && (
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
              {...register('naam')}
              error={errors.naam?.message}
              required
            />

            <Input
              label="E-mail *"
              type="email"
              placeholder="jouw@email.nl"
              icon={<Envelope className="w-5 h-5" />}
              {...register('email')}
              error={errors.email?.message}
              required
            />

            <Input
              label="Telefoonnummer *"
              type="tel"
              placeholder="0612345678"
              icon={<Phone className="w-5 h-5" />}
              {...register('telefoon')}
              error={errors.telefoon?.message}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opmerking
              </label>
              <textarea
                {...register('opmerking')}
                rows={3}
                className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-brand-teal-500 focus:ring-brand-teal-500 bg-white"
                placeholder="Optioneel: vragen of wensen?"
              />
            </div>

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
                  </a>
                  *
                </span>
              </label>
              {errors.privacy_akkoord && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                <>
                  Verstuur interesse
                </>
              )}
            </Button>
          </form>
        </>
      )}
    </>
  )
}

