'use client'

import { Suspense, useEffect, useState } from 'react'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { CheckCircle, Envelope, Phone, Lightning, CalendarCheck, Confetti, Buildings, MapPin } from '@phosphor-icons/react'
import confetti from 'canvas-confetti'

function BevestigingContent() {
  const { bedrijfsgegevens, verbruik } = useCalculatorStore()
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
    <div className="min-h-screen bg-gradient-to-br from-brand-teal-50 via-white to-brand-navy-50 py-8 md:py-12 pt-24 md:pt-32">
      <div className="container-custom max-w-3xl">
        {/* Success Card */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm md:shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <div className="text-center">
            {/* Success icon met animatie */}
            <div className="relative mb-4 md:mb-6 inline-block">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
                <CheckCircle weight="fill" className="w-12 h-12 md:w-14 md:h-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce-slow">
                <Confetti weight="fill" className="w-5 h-5 md:w-6 md:h-6 text-yellow-700" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy-500 mb-3 md:mb-4 animate-slide-up">
              Gelukt! 🎉
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto animate-slide-up-delay">
              Je aanvraag voor een nieuw energiecontract is succesvol ingediend. We nemen zo snel mogelijk contact met je op!
            </p>

            {/* Contract details */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-3 md:mb-4 pb-3 border-b border-gray-300">
                <CheckCircle weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-brand-teal-600" />
                <span className="text-sm md:text-base font-semibold text-brand-navy-500">Aanvraag details</span>
              </div>
              <div className="space-y-3 md:space-y-4">
                {bedrijfsgegevens?.bedrijfsnaam && (
                  <div className="flex items-start gap-2 md:gap-3">
                    <Buildings weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-600 text-xs md:text-sm">Bedrijf:</span>
                      <p className="text-sm md:text-base font-semibold text-brand-navy-500">{bedrijfsgegevens.bedrijfsnaam}</p>
                      {bedrijfsgegevens.kvkNummer && (
                        <p className="text-xs text-gray-500">KvK: {bedrijfsgegevens.kvkNummer}</p>
                      )}
                    </div>
                  </div>
                )}
                {verbruik?.leveringsadressen && verbruik.leveringsadressen.length > 0 && (
                  <div className="flex items-start gap-2 md:gap-3">
                    <MapPin weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-600 text-xs md:text-sm">Leveradres:</span>
                      <p className="text-sm md:text-base font-semibold text-brand-navy-500">
                        {verbruik.leveringsadressen[0].straat} {verbruik.leveringsadressen[0].huisnummer}
                        {verbruik.leveringsadressen[0].toevoeging ? ` ${verbruik.leveringsadressen[0].toevoeging}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {verbruik.leveringsadressen[0].postcode} {verbruik.leveringsadressen[0].plaats}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                  <span className="text-gray-600 text-xs md:text-sm">Aanvraagnummer:</span>
                  <span className="font-mono text-xs md:text-sm font-semibold text-brand-navy-500">
                    #PA-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 999999)).padStart(6, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs md:text-sm">Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 bg-brand-teal-100 text-brand-teal-700 rounded-full text-xs md:text-sm font-semibold">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand-teal-500 rounded-full animate-pulse" />
                    In behandeling
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-brand-teal-500 hover:bg-brand-teal-600">
                  Terug naar home
                </Button>
              </Link>
              <Link href="/calculator" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Nieuwe berekening
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm md:shadow-lg p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <CalendarCheck weight="duotone" className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-brand-navy-500">Wat gebeurt er nu?</h2>
          </div>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">We gaan direct voor je aan de slag:</p>

          <div className="space-y-4 md:space-y-6">
            {/* Stap 1 */}
            <div className="flex gap-3 md:gap-4 group hover:bg-gray-50 p-4 md:p-5 rounded-xl transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Envelope weight="duotone" className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-brand-navy-500">Binnen 1 uur</h3>
                  <span className="text-xs px-2 py-0.5 bg-brand-teal-100 text-brand-teal-700 rounded-full font-medium">
                    Bevestiging
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Je ontvangt een bevestigingsmail met alle details van je aanvraag en je persoonlijke contactpersoon.
                </p>
              </div>
            </div>

            {/* Stap 2 */}
            <div className="flex gap-3 md:gap-4 group hover:bg-gray-50 p-4 md:p-5 rounded-xl transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand-navy-500 to-brand-navy-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Phone weight="duotone" className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-brand-navy-500">Binnen 1 werkdag</h3>
                  <span className="text-xs px-2 py-0.5 bg-brand-teal-100 text-brand-teal-700 rounded-full font-medium">
                    Persoonlijk contact
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Een energiespecialist neemt contact met je op om je aanvraag door te nemen en eventuele vragen te beantwoorden.
                </p>
              </div>
            </div>

            {/* Stap 3 */}
            <div className="flex gap-3 md:gap-4 group hover:bg-gray-50 p-4 md:p-5 rounded-xl transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Lightning weight="duotone" className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-brand-navy-500">Binnen 2-3 weken</h3>
                  <span className="text-xs px-2 py-0.5 bg-brand-teal-100 text-brand-teal-700 rounded-full font-medium">
                    Contract actief
                  </span>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Na akkoord regelen wij de overstap. Je nieuwe contract gaat in en je begint te besparen!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-gradient-to-br from-brand-navy-500 to-brand-navy-600 rounded-xl md:rounded-2xl border-0 text-white p-6 md:p-8">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Heb je nog vragen?</h3>
            <p className="text-sm md:text-base text-brand-navy-100 mb-4 md:mb-6">
              Ons team staat voor je klaar om je te helpen
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="mailto:info@pakketadvies.nl" className="w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-brand-navy-500 hover:bg-gray-100"
                >
                  <Envelope weight="duotone" className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Email ons
                </Button>
              </Link>
              <Link href="tel:0850477065" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                >
                  <Phone weight="duotone" className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Bel ons
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
    <BevestigingContent />
  )
}
