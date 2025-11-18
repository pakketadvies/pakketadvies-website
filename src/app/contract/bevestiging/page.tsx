'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { CheckCircle, Envelope, Phone, Lightning, CalendarCheck, Confetti } from '@phosphor-icons/react'
import confetti from 'canvas-confetti'

function BevestigingContent() {
  const searchParams = useSearchParams()
  const bedrijfsnaam = searchParams?.get('bedrijf') || 'Uw bedrijf'
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    if (showConfetti && typeof window !== 'undefined') {
      // Laat confetti af! 🎉
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          clearInterval(interval)
          setShowConfetti(false)
          return
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [showConfetti])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal-50 via-white to-brand-navy-50 py-12 pt-32 md:pt-36">
      <div className="container-custom max-w-3xl">
        {/* Success Card */}
        <Card className="border-2 border-green-200 shadow-2xl">
          <CardContent className="pt-12 pb-8 text-center">
            {/* Success icon met animatie */}
            <div className="relative mb-6 inline-block">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
                <CheckCircle weight="fill" className="w-14 h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce-slow">
                <Confetti weight="fill" className="w-6 h-6 text-yellow-700" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4 animate-slide-up">
              Gelukt! 🎉
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto animate-slide-up-delay">
              Je aanvraag voor een nieuw energiecontract is succesvol ingediend. We nemen zo snel mogelijk contact met je op!
            </p>

            {/* Contract details */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto shadow-inner">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-300">
                <CheckCircle weight="duotone" className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-brand-navy-500">Aanvraag details</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bedrijf:</span>
                  <span className="font-semibold text-brand-navy-500">{bedrijfsnaam}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Aanvraagnummer:</span>
                  <span className="font-mono font-semibold text-brand-navy-500">
                    #PA-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 999999)).padStart(6, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    In behandeling
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  Terug naar home
                </Button>
              </Link>
              <Link href="/calculator">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Nieuwe berekening
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <Card className="mt-8 border-2 border-brand-teal-100">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-brand-navy-500 mb-2 flex items-center gap-3">
              <CalendarCheck weight="duotone" className="w-8 h-8 text-brand-teal-500" />
              Wat gebeurt er nu?
            </h2>
            <p className="text-gray-600 mb-6">We gaan direct voor je aan de slag:</p>

            <div className="space-y-6">
              {/* Stap 1 */}
              <div className="flex gap-4 group hover:bg-gray-50 p-4 rounded-xl transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Envelope weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-brand-navy-500">Binnen 1 uur</h3>
                    <span className="text-xs px-2 py-0.5 bg-brand-teal-100 text-brand-teal-700 rounded-full font-medium">
                      Bevestiging
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Je ontvangt een bevestigingsmail met alle details van je aanvraag en je persoonlijke contactpersoon.
                  </p>
                </div>
              </div>

              {/* Stap 2 */}
              <div className="flex gap-4 group hover:bg-gray-50 p-4 rounded-xl transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Phone weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-brand-navy-500">Binnen 1 werkdag</h3>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                      Persoonlijk contact
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Een energiespecialist neemt contact met je op om je aanvraag door te nemen en eventuele vragen te beantwoorden.
                  </p>
                </div>
              </div>

              {/* Stap 3 */}
              <div className="flex gap-4 group hover:bg-gray-50 p-4 rounded-xl transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Lightning weight="duotone" className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-brand-navy-500">Binnen 2-3 weken</h3>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                      Contract actief
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Na akkoord regelen wij de overstap. Je nieuwe contract gaat in en je begint te besparen!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="mt-8 bg-gradient-to-br from-brand-navy-500 to-brand-navy-600 border-0 text-white">
          <CardContent className="pt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Heb je nog vragen?</h3>
              <p className="text-brand-navy-100 mb-6">
                Ons team staat voor je klaar om je te helpen
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="mailto:info@pakketadvies.nl">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-brand-navy-500 hover:bg-gray-100"
                  >
                    <Envelope weight="duotone" className="w-5 h-5 mr-2" />
                    Email ons
                  </Button>
                </Link>
                <Link href="tel:0850606969">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                  >
                    <Phone weight="duotone" className="w-5 h-5 mr-2" />
                    Bel ons
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-10%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.6s ease-out 0.4s both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  )
}

export default function BevestigingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    }>
      <BevestigingContent />
    </Suspense>
  )
}
