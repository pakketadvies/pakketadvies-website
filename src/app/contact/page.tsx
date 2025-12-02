'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Phone, 
  Envelope, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ChatCircleDots,
  ArrowRight,
  Lightning,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react'

interface FormData {
  naam: string
  bedrijfsnaam: string
  email: string
  telefoon: string
  onderwerp: string
  bericht: string
  privacy_akkoord: boolean
}

interface FormErrors {
  naam?: string
  bedrijfsnaam?: string
  email?: string
  onderwerp?: string
  bericht?: string
  privacy_akkoord?: string
}

const faqItems = [
  {
    vraag: 'Hoe snel krijg ik reactie op mijn bericht?',
    antwoord: 'We streven ernaar om binnen 24 uur te reageren op alle berichten. Tijdens kantooruren (ma-vr 09:00-17:00) reageren we meestal nog sneller.'
  },
  {
    vraag: 'Is het contactformulier gratis?',
    antwoord: 'Ja, het contactformulier is volledig gratis. Je betaalt alleen als je daadwerkelijk een energiecontract afsluit via ons.'
  },
  {
    vraag: 'Kan ik ook telefonisch contact opnemen?',
    antwoord: 'Ja, je kunt ons bellen op 085 047 7065 (ma-vr 09:00-17:00). Voor dringende vragen kun je ook een afspraak maken voor een persoonlijk gesprek.'
  },
  {
    vraag: 'Wat gebeurt er na het indienen van het formulier?',
    antwoord: 'Je ontvangt direct een bevestiging per email. Binnen 24 uur neemt een van onze energiespecialisten contact met je op om je vraag te beantwoorden of een offerte op te stellen.'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    naam: '',
    bedrijfsnaam: '',
    email: '',
    telefoon: '',
    onderwerp: '',
    bericht: '',
    privacy_akkoord: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.naam.trim()) {
      newErrors.naam = 'Naam is verplicht'
    }

    if (!formData.bedrijfsnaam.trim()) {
      newErrors.bedrijfsnaam = 'Bedrijfsnaam is verplicht'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig emailadres'
    }

    if (!formData.onderwerp) {
      newErrors.onderwerp = 'Onderwerp is verplicht'
    }

    if (!formData.bericht.trim()) {
      newErrors.bericht = 'Bericht is verplicht'
    } else if (formData.bericht.trim().length < 10) {
      newErrors.bericht = 'Bericht moet minimaal 10 tekens bevatten'
    }

    if (!formData.privacy_akkoord) {
      newErrors.privacy_akkoord = 'Je moet akkoord gaan met de privacyvoorwaarden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setFormData({
          naam: '',
          bedrijfsnaam: '',
          email: '',
          telefoon: '',
          onderwerp: '',
          bericht: '',
          privacy_akkoord: false,
        })
        // Scroll naar success message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setErrors({ bericht: data.error || 'Er is een fout opgetreden' })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ bericht: 'Er is een fout opgetreden. Probeer het later opnieuw.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pt-32 md:pt-40 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/office-team.jpg"
            alt="Professional office team"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
              <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Contact</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Heb je een vraag?{' '}
              <span className="text-brand-teal-500">We helpen je graag</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Geen gedoe, alleen snel en persoonlijk contact. Stuur een bericht en we nemen binnen 24 uur contact met je op.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Clock weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Reactietijd</div>
                  <div className="font-semibold text-white">Binnen 24 uur</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Tevreden klanten</div>
                  <div className="font-semibold text-white">7.500+</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom transition */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-20 md:h-24 lg:h-auto"
            preserveAspectRatio="none"
          >
            <path d="M0,40 Q360,10 720,40 T1440,40 L1440,120 L0,120 Z" fill="white"/>
            <path 
              d="M0,40 Q360,10 720,40 T1440,40" 
              stroke="url(#energyGradient)" 
              strokeWidth="2" 
              fill="none"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00AF9B" stopOpacity="0" />
                <stop offset="20%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="50%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="80%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="100%" stopColor="#00AF9B" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Success Message */}
      {isSuccess && (
        <section className="py-8 bg-brand-teal-50 border-b border-brand-teal-200">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border-2 border-brand-teal-500 shadow-lg">
                <div className="w-12 h-12 bg-brand-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle weight="fill" className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-brand-navy-500 mb-2 text-lg">Bericht verzonden!</h3>
                  <p className="text-gray-600">
                    Je bericht is succesvol verzonden. We hebben een bevestiging gestuurd naar {formData.email || 'je emailadres'}. 
                    Binnen 24 uur neemt een van onze energiespecialisten contact met je op.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Sluiten"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form - Takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <Card className="hover-lift">
                <CardContent className="pt-8 md:pt-10">
                  <div className="mb-8">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-3">
                      Stuur een bericht
                    </h2>
                    <p className="text-gray-600">
                      Vul het formulier in en we nemen zo snel mogelijk contact met je op.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Naam *"
                        placeholder="Je volledige naam"
                        value={formData.naam}
                        onChange={(e) => handleChange('naam', e.target.value)}
                        error={errors.naam}
                        required
                      />
                      <Input
                        label="Bedrijfsnaam *"
                        placeholder="Naam van je bedrijf"
                        value={formData.bedrijfsnaam}
                        onChange={(e) => handleChange('bedrijfsnaam', e.target.value)}
                        error={errors.bedrijfsnaam}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Email *"
                        type="email"
                        placeholder="je.email@bedrijf.nl"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email}
                        required
                      />
                      <Input
                        label="Telefoon"
                        type="tel"
                        placeholder="06 12345678"
                        value={formData.telefoon}
                        onChange={(e) => handleChange('telefoon', e.target.value)}
                        helpText="Bellen we je liever terug? Laat je nummer achter"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Onderwerp * <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.onderwerp}
                        onChange={(e) => handleChange('onderwerp', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          errors.onderwerp
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-brand-teal-500 focus:ring-brand-teal-500 bg-white'
                        }`}
                        required
                      >
                        <option value="">Selecteer een onderwerp</option>
                        <option value="offerte">Offerte aanvragen</option>
                        <option value="vraag">Vraag</option>
                        <option value="overstappen">Overstappen</option>
                        <option value="ander">Andere</option>
                      </select>
                      {errors.onderwerp && (
                        <p className="text-sm font-medium text-red-600 flex items-center gap-1 mt-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.onderwerp}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bericht * <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Vertel ons waar je mee geholpen wilt worden..."
                        value={formData.bericht}
                        onChange={(e) => handleChange('bericht', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none ${
                          errors.bericht
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-brand-teal-500 focus:ring-brand-teal-500 bg-white'
                        }`}
                        required
                      />
                      {errors.bericht && (
                        <p className="text-sm font-medium text-red-600 flex items-center gap-1 mt-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.bericht}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={formData.privacy_akkoord}
                        onChange={(e) => handleChange('privacy_akkoord', e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-500 focus:ring-brand-teal-500"
                        required
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-600">
                        Ik ga akkoord met de{' '}
                        <Link href="/privacy" className="text-brand-teal-600 hover:text-brand-teal-700 underline">
                          privacyvoorwaarden
                        </Link>
                        {' '}en geef toestemming voor het verwerken van mijn gegevens. *
                      </label>
                    </div>
                    {errors.privacy_akkoord && (
                      <p className="text-sm font-medium text-red-600 flex items-center gap-1 -mt-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.privacy_akkoord}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verzenden...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Verstuur bericht
                          <ArrowRight weight="bold" className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info - Takes 1 column on desktop */}
            <div className="space-y-6">
              {/* Phone Card */}
              <Card className="hover-lift">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                      <Phone weight="duotone" className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-navy-500 mb-2 text-lg">Telefoon</h3>
                      <a 
                        href="tel:0850477065" 
                        className="text-xl font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors block mb-2"
                      >
                        085 047 7065
                      </a>
                      <p className="text-sm text-gray-500 mb-4">
                        Ma-vr: 09:00 - 17:00
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.location.href = 'tel:0850477065'}
                      >
                        <Phone weight="bold" className="w-4 h-4 mr-2" />
                        Bel nu
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Card */}
              <Card className="hover-lift">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                      <Envelope weight="duotone" className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-navy-500 mb-2 text-lg">Email</h3>
                      <a 
                        href="mailto:info@pakketadvies.nl" 
                        className="text-lg font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors block mb-2 break-all"
                      >
                        info@pakketadvies.nl
                      </a>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal-50 border border-brand-teal-200 mb-4">
                        <Clock weight="duotone" className="w-4 h-4 text-brand-teal-600" />
                        <span className="text-xs font-semibold text-brand-teal-700">Reactie binnen 24 uur</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.location.href = 'mailto:info@pakketadvies.nl'}
                      >
                        <Envelope weight="bold" className="w-4 h-4 mr-2" />
                        Email nu
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Card */}
              <Card className="hover-lift">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                      <MapPin weight="duotone" className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-navy-500 mb-2 text-lg">Bezoekadres</h3>
                      <p className="text-gray-600 mb-1">
                        Stavangerweg 13<br />
                        9723 JC Groningen
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 mt-3">
                        <span className="text-xs font-semibold text-gray-600">Op afspraak</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What happens next section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
              <ChatCircleDots weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <span className="text-sm font-semibold text-brand-navy-600">
                Wat gebeurt er na je bericht?
              </span>
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy-500 mb-4">
              Simpel en snel
            </h2>
            
            <p className="text-lg text-gray-600">
              In 3 stappen helpen we je verder. Geen gedoe, alleen resultaat.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                icon: Envelope,
                title: 'Je bericht is verzonden',
                description: 'Je ontvangt direct een bevestiging per email. Je bericht wordt door ons team bekeken.',
                color: 'teal'
              },
              {
                number: '02',
                icon: ChatCircleDots,
                title: 'We nemen contact op',
                description: 'Binnen 24 uur neemt een energiespecialist contact met je op om je vraag te beantwoorden.',
                color: 'teal'
              },
              {
                number: '03',
                icon: CheckCircle,
                title: 'We helpen je verder',
                description: 'Samen bekijken we je situatie en stellen we een passende oplossing voor. Vrijblijvend en transparant.',
                color: 'teal'
              }
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Connector line (desktop only) */}
                  {index < 2 && (
                    <div className="hidden md:block absolute left-full top-1/2 w-8 h-0.5 bg-gradient-to-r from-brand-teal-500/30 to-transparent" />
                  )}
                  
                  <div className="relative bg-white rounded-3xl p-8 border border-gray-200 hover-lift hover:border-brand-teal-500/50 transition-all duration-300 h-full">
                    {/* Number badge */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-navy-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="font-display text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                    
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-teal-500 shadow-lg mb-6">
                      <Icon weight="duotone" className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-display text-xl md:text-2xl font-bold text-brand-navy-500 mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-lg text-gray-600">
              Alles wat je wilt weten over contact opnemen
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="pt-6">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left"
                  >
                    <h3 className="font-bold text-brand-navy-500 text-lg pr-8">
                      {item.vraag}
                    </h3>
                    {openFaqIndex === index ? (
                      <CaretUp weight="bold" className="w-6 h-6 text-brand-teal-500 flex-shrink-0" />
                    ) : (
                      <CaretDown weight="bold" className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFaqIndex === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed">
                        {item.antwoord}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-brand-navy-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Of bereken eerst je besparing
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Ontdek hoeveel je kunt besparen met een beter energiecontract. Gratis en vrijblijvend.
            </p>
            <Link href="/calculator">
              <Button variant="secondary" size="lg" className="bg-white text-brand-navy-500 hover:bg-gray-50">
                <span className="flex items-center gap-2">
                  <Lightning weight="duotone" className="w-6 h-6" />
                  Start je besparingscheck
                  <ArrowRight weight="bold" className="w-5 h-5" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
