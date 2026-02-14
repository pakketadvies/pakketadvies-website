'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Cookie, 
  CaretDown, 
  CaretUp, 
  CheckCircle, 
  X,
  ShieldCheck,
  ChartBar,
  Megaphone
} from '@phosphor-icons/react'
import {
  getCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  acceptOnlyNecessary,
  shouldShowCookieBanner,
  type CookiePreferences,
} from '@/lib/cookies'

export function CookieBanner() {
  const [show, setShow] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [analytical, setAnalytical] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    // Check if banner should be shown
    if (shouldShowCookieBanner()) {
      setShow(true)
    } else {
      // Load existing preferences
      const existing = getCookiePreferences()
      if (existing) {
        setPreferences(existing)
        setAnalytical(existing.analytical)
        setMarketing(existing.marketing)
      }
    }
  }, [])

  useEffect(() => {
    const handleOpenSettings = () => {
      const existing = getCookiePreferences()
      if (existing) {
        setPreferences(existing)
        setAnalytical(existing.analytical)
        setMarketing(existing.marketing)
      }
      setShow(true)
      setShowSettings(true)
    }

    window.addEventListener('openCookieSettings', handleOpenSettings)
    return () => {
      window.removeEventListener('openCookieSettings', handleOpenSettings)
    }
  }, [])

  const handleAcceptAll = () => {
    acceptAllCookies()
    setShow(false)
    // Reload page to apply cookie preferences
    window.location.reload()
  }

  const handleAcceptNecessary = () => {
    acceptOnlyNecessary()
    setShow(false)
    // Reload page to apply cookie preferences
    window.location.reload()
  }

  const handleSavePreferences = () => {
    saveCookiePreferences({
      necessary: true,
      analytical,
      marketing,
    })
    setShow(false)
    // Reload page to apply cookie preferences
    window.location.reload()
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-brand-navy-500 text-white shadow-2xl border-t-4 border-brand-teal-500">
        <div className="container-custom py-4 md:py-6">
          {/* Main Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie weight="duotone" className="w-6 h-6 md:w-7 md:h-7 text-brand-teal-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg md:text-xl font-bold mb-1">
                  We gebruiken cookies
                </h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                  We gebruiken cookies om onze website te verbeteren en te analyseren. 
                  Je kunt zelf kiezen welke cookies je accepteert.{' '}
                  <Link 
                    href="/cookies" 
                    className="text-brand-teal-400 hover:text-brand-teal-300 underline font-semibold"
                  >
                    Meer informatie
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-3 min-h-[44px] rounded-xl border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>Instellingen</span>
                {showSettings ? (
                  <CaretUp weight="bold" className="w-4 h-4" />
                ) : (
                  <CaretDown weight="bold" className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-4 py-3 min-h-[44px] rounded-xl border-2 border-white/30 hover:border-white/50 bg-transparent hover:bg-white/5 transition-all text-sm font-semibold"
              >
                Alleen noodzakelijk
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-3 min-h-[44px] md:px-6 rounded-xl bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
              >
                Alles accepteren
              </button>
            </div>
          </div>

          {/* Settings Panel (Expandable) */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-white/10 animate-slide-down">
              <h4 className="font-display text-base md:text-lg font-bold mb-4">
                Cookie-instellingen
              </h4>
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-brand-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-base">Noodzakelijke cookies</h5>
                          <span className="px-2 py-0.5 bg-brand-teal-500/20 text-brand-teal-300 text-xs font-semibold rounded">
                            Altijd actief
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          Deze cookies zijn noodzakelijk voor het functioneren van de website. 
                          Ze kunnen niet worden uitgeschakeld.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-6 bg-brand-teal-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytical Cookies */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-brand-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ChartBar weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-base mb-1">Analytische cookies</h5>
                        <p className="text-sm text-gray-300 leading-relaxed mb-2">
                          Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken, 
                          zodat we de website kunnen verbeteren.
                        </p>
                        <p className="text-xs text-gray-400">
                          Bijvoorbeeld: Google Analytics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => setAnalytical(!analytical)}
                        className={`relative w-12 h-6 min-w-[44px] min-h-[44px] rounded-full transition-all duration-300 ${
                          analytical ? 'bg-brand-teal-500' : 'bg-gray-600'
                        }`}
                        aria-label="Analytische cookies aan of uit"
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                            analytical ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-brand-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Megaphone weight="duotone" className="w-5 h-5 text-brand-purple-300" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-base mb-1">Marketing cookies</h5>
                        <p className="text-sm text-gray-300 leading-relaxed mb-2">
                          Deze cookies worden gebruikt om relevante advertenties te tonen en 
                          de effectiviteit van marketingcampagnes te meten.
                        </p>
                        <p className="text-xs text-gray-400">
                          Op dit moment gebruiken wij geen marketing cookies.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => setMarketing(!marketing)}
                        disabled
                        className="relative w-12 h-6 min-w-[44px] min-h-[44px] rounded-full bg-gray-700 opacity-50 cursor-not-allowed"
                        aria-label="Marketing cookies niet beschikbaar"
                      >
                        <div className="absolute top-1 left-1 w-4 h-4 bg-gray-500 rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-3 min-h-[44px] rounded-xl border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-3 min-h-[44px] rounded-xl bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm md:text-base flex items-center justify-center gap-2"
                >
                  <CheckCircle weight="bold" className="w-5 h-5" />
                  Voorkeuren opslaan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

