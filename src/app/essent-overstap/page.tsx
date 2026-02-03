'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'
import {
  Phone,
  Envelope,
  User,
  CheckCircle,
  Lightning,
  TrendDown,
  Calendar,
  ShieldCheck,
  ChatCircleText,
  XCircle,
  ArrowRight,
} from '@phosphor-icons/react'

interface FormData {
  naam: string
  email: string
  telefoon: string
  opmerking: string
  privacy_akkoord: boolean
  website?: string // Honeypot field
}

interface FormErrors {
  naam?: string
  email?: string
  telefoon?: string
  privacy_akkoord?: string
}

export default function EssentOverstapPage() {
  const [formData, setFormData] = useState<FormData>({
    naam: '',
    email: '',
    telefoon: '',
    opmerking: '',
    privacy_akkoord: false,
    website: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.naam.trim()) {
      newErrors.naam = 'Naam is verplicht'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres'
    }

    if (!formData.telefoon.trim()) {
      newErrors.telefoon = 'Telefoonnummer is verplicht'
    } else if (formData.telefoon.trim().length < 10) {
      newErrors.telefoon = 'Vul een geldig telefoonnummer in'
    }

    if (!formData.privacy_akkoord) {
      newErrors.privacy_akkoord = 'Je moet akkoord gaan met de privacyvoorwaarden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Honeypot check
    if (formData.website) {
      console.log('Bot detected via honeypot')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact/essent-overstap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        setFormData({
          naam: '',
          email: '',
          telefoon: '',
          opmerking: '',
          privacy_akkoord: false,
          website: '',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitError(result.error || 'Er is een fout opgetreden. Probeer het later opnieuw.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container-custom max-w-4xl">
          <Card className="border-2 border-brand-teal-500 bg-brand-teal-50">
            <CardContent className="pt-10 pb-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-brand-teal-500 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" weight="fill" />
                </div>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
                Bedankt voor je interesse!
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                We hebben je gegevens ontvangen en nemen zo snel mogelijk contact met je op om de 
                mogelijkheden te bespreken.
              </p>
              <p className="text-gray-600 mb-8">
                Meestal reageren we binnen 24 uur. Heb je dringende vragen?<br />
                Bel ons op <a href="tel:0850477065" className="text-brand-teal-600 font-semibold hover:underline">085 047 7065</a>
              </p>
              <Button
                onClick={() => setIsSuccess(false)}
                variant="secondary"
              >
                Nog een aanvraag doen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Sectie */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-20 pt-32 md:pt-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Essent overstap"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-400/30 mb-6">
              <Calendar weight="duotone" className="w-5 h-5 text-red-300" />
              <span className="text-sm font-semibold text-red-200">BELANGRIJK: T/M 11 MAART 2026</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Essent klant?<br />
              <span className="text-brand-teal-500">Nu boetevrij overstappen!</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-semibold">
              Ga je niet zomaar akkoord met de nieuwe voorwaarden van Essent
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 md:h-20"
            preserveAspectRatio="none"
          >
            <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Formulier en Uitleg Sectie */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Links: Formulier */}
            <div className="lg:sticky lg:top-24">
              <Card className="shadow-xl border-2 border-brand-teal-500">
                <CardContent className="pt-8 pb-8">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-3 text-center">
                    Ik ben benieuwd naar de mogelijkheden
                  </h2>
                  <p className="text-gray-600 text-center mb-6">
                    Vul je gegevens in en we nemen snel contact op
                  </p>

                  {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" weight="fill" />
                        <p className="text-red-600 font-medium">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      label="Naam *"
                      name="naam"
                      placeholder="Je volledige naam"
                      icon={<User className="w-5 h-5" />}
                      value={formData.naam}
                      onChange={handleChange}
                      error={errors.naam}
                      required
                    />

                    <Input
                      label="E-mail *"
                      name="email"
                      type="email"
                      placeholder="jouw@email.nl"
                      icon={<Envelope className="w-5 h-5" />}
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                    />

                    <Input
                      label="Telefoonnummer *"
                      name="telefoon"
                      type="tel"
                      placeholder="0612345678"
                      icon={<Phone className="w-5 h-5" />}
                      value={formData.telefoon}
                      onChange={handleChange}
                      error={errors.telefoon}
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Opmerking (optioneel)
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-400 pointer-events-none z-10">
                          <ChatCircleText className="w-5 h-5" />
                        </div>
                        <textarea
                          name="opmerking"
                          rows={4}
                          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 pl-11 font-medium text-gray-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-brand-teal-500 focus:ring-brand-teal-500 bg-white"
                          placeholder="Heb je specifieke vragen of wensen?"
                          value={formData.opmerking}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Honeypot field - hidden from users */}
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                      tabIndex={-1}
                      autoComplete="off"
                    />

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="privacy_akkoord"
                          checked={formData.privacy_akkoord}
                          onChange={handleChange}
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
                          {errors.privacy_akkoord}
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
                          Ik ben benieuwd naar de mogelijkheden
                          <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      * Verplichte velden
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Rechts: Uitleg */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-3xl font-bold text-brand-navy-500 mb-4">
                  Wat is er aan de hand?
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  <strong>Essent past alle contractvoorwaarden aan</strong> vanwege de nieuwe energiewet 
                  die per 01-01-2026 is ingegaan. Dit doen ze ook voor bestaande klanten met lopende contracten.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Het goede nieuws? <strong>T/m 11 maart 2026</strong> krijgen alle Essent-klanten de 
                  mogelijkheid om <strong className="text-brand-teal-600">boetevrij hun contract te ontbinden</strong> als 
                  ze niet akkoord gaan met deze stilzwijgende aanpassing.
                </p>
              </div>

              <Card className="bg-red-50 border-2 border-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <Calendar weight="duotone" className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-900 mb-2">Let op: Deadline 11 maart!</h3>
                      <p className="text-red-800 text-sm leading-relaxed">
                        Je hebt <strong>tot 11 maart 2026</strong> de tijd om boetevrij over te stappen. 
                        Laat deze kans niet liggen!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="font-display text-3xl font-bold text-brand-navy-500 mb-4">
                  Waarom nu niet zomaar akkoord gaan?
                </h2>
                
                <div className="space-y-4">
                  <Card className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 flex items-center justify-center flex-shrink-0">
                          <TrendDown weight="duotone" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-navy-500 mb-2">Hoge tarieven? Nu is je kans!</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Als je nu <strong>hoge leveringstarieven</strong> vast hebt staan, is dit een 
                            <strong className="text-brand-teal-600"> buitenkans</strong> om daar vanaf te komen en 
                            een <strong>goedkoper tarief vast te leggen</strong> bij een andere energieleverancier.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck weight="duotone" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-navy-500 mb-2">Nieuwe keuzes maken</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Er is <strong>van alles mogelijk</strong> qua nieuwe energiecontracten. Of je nu 
                            op zoek bent naar <strong>vaste tarieven, dynamische prijzen</strong>, of een 
                            contract met <strong>ETS-2 bescherming</strong> — wij helpen je de beste keuze te maken.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 flex items-center justify-center flex-shrink-0">
                          <Lightning weight="duotone" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-brand-navy-500 mb-2">Volledig gratis advies</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Wij vergelijken <strong>alle beschikbare opties</strong> en helpen je kiezen wat 
                            het beste bij jouw situatie past. <strong>Geen kosten, geen verplichtingen</strong> — 
                            alleen eerlijk advies.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-brand-teal-50 border-2 border-brand-teal-500 rounded-2xl p-6">
                <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-3">
                  Zo helpen wij je:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">We beoordelen je huidige contract en tarieven</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">We vergelijken alle beschikbare energieleveranciers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">We adviseren je over de beste keuze voor jouw situatie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">We regelen de volledige overstap voor je (boetevrij!)</span>
                  </li>
                </ul>
              </div>

              <Card className="bg-brand-navy-500 text-white">
                <CardContent className="pt-8 pb-8 text-center">
                  <h3 className="font-display text-2xl font-bold mb-3">
                    Niet wachten, maar direct actie ondernemen!
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Vul het formulier in en we nemen binnen 24 uur contact met je op om de 
                    mogelijkheden te bespreken.
                  </p>
                  <p className="text-brand-teal-300 font-semibold">
                    Of bel direct: <a href="tel:0850477065" className="hover:underline">085 047 7065</a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
