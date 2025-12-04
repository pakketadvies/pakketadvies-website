'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PrijzenInfoCards } from '@/components/energieprijzen/PrijzenInfoCards'
import { PrijzenGrafiek } from '@/components/energieprijzen/PrijzenGrafiek'
import { PrijzenTabel } from '@/components/energieprijzen/PrijzenTabel'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Info, ArrowRight, Lightning, Flame, Question, ChartLine, ShieldCheck, Users } from '@phosphor-icons/react'

export default function EnergieprijzenPage() {
  const [belastingen] = useState<'exclusief' | 'inclusief'>('exclusief')
  const [huidigeData, setHuidigeData] = useState<any>(null)
  const [historieData, setHistorieData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate date range for historical data (5 years back)
  // Use today's date to ensure we always get the latest data
  const dateRange = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today)
        startDate.setFullYear(startDate.getFullYear() - 5)
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    }
  }, [])
  
  // Force refetch when component mounts or dateRange changes
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch current prices
  useEffect(() => {
    const fetchHuidige = async () => {
      try {
        const response = await fetch('/api/energieprijzen/huidig')
        const data = await response.json()
        
        if (data.success) {
          setHuidigeData(data)
        } else {
          setError(data.error || 'Fout bij ophalen huidige prijzen')
        }
      } catch (err: any) {
        console.error('Error fetching current prices:', err)
        setError('Fout bij ophalen huidige prijzen')
      }
    }
    
    fetchHuidige()
  }, [])

  // Fetch historical data
  useEffect(() => {
    const fetchHistorie = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(
          `/api/energieprijzen/historie?startDate=${dateRange.start}&endDate=${dateRange.end}&type=beide`,
          { cache: 'no-store' } // Don't cache to ensure fresh data
        )
        const data = await response.json()
        
        if (data.success) {
          const newData = data.data || []
          // Always update if we have new data, or if previous data was empty
          setHistorieData((prev) => {
            // If previous was empty and new has data, always update
            if (prev.length === 0 && newData.length > 0) return newData
            // If new is empty, keep previous (might be loading)
            if (newData.length === 0) return prev
            // If lengths differ, update
            if (prev.length !== newData.length) return newData
            // If first or last date changed, update
            if (prev.length > 0 && newData.length > 0) {
              if (prev[0]?.datum !== newData[0]?.datum || 
                  prev[prev.length - 1]?.datum !== newData[newData.length - 1]?.datum) {
                return newData
              }
            }
            // Keep previous reference if data is the same
            return prev
          })
        } else {
          setError(data.error || 'Fout bij ophalen historische prijzen')
          setHistorieData([])
        }
      } catch (err: any) {
        console.error('Error fetching history:', err)
        setError('Fout bij ophalen historische prijzen')
        setHistorieData([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchHistorie()
  }, [dateRange, refreshKey])
  
  // Force refresh on mount to get latest data
  useEffect(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
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
            {/* Back link */}
            <Link
              href="/kennisbank"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors text-sm"
            >
              <span>← Terug naar kennisbank</span>
            </Link>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
              <ChartLine weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Energieprijzen</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Inzicht in de{' '}
              <span className="text-brand-teal-500">energiemarkt</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Bekijk de actuele en historische marktprijzen voor elektriciteit en gas. Deze prijzen geven inzicht in de energiemarkt en helpen je bij het kiezen van het juiste energiecontract.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <ChartLine weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Actuele marktprijzen</div>
                  <div className="font-semibold text-white">Real-time data</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">100% onafhankelijk</div>
                  <div className="font-semibold text-white">Objectieve informatie</div>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Historie tot 5 jaar</div>
                  <div className="font-semibold text-white">Langjarige trends</div>
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
            <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white"/>
            <path 
              d="M0,95 Q360,65 720,95 T1440,95" 
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

      {/* Main Content */}
      <section className="py-6 md:py-12 lg:py-16 bg-white">
        <div className="container-custom max-w-7xl px-2 md:px-4 lg:px-6">
          {/* Info Cards */}
          {huidigeData && (
            <PrijzenInfoCards
              vandaag={huidigeData.vandaag}
              gemiddelden={huidigeData.gemiddelden_30_dagen}
              trends={huidigeData.trends}
              loading={!huidigeData}
            />
          )}

          {/* Error Message */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-8">
                <div className="flex items-center gap-3 text-red-600">
                  <Info className="w-5 h-5" weight="duotone" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grafiek */}
          <PrijzenGrafiek
            data={historieData}
            belastingen={belastingen}
            loading={loading}
          />

          {/* Tabel */}
          <PrijzenTabel
            data={historieData}
            energietype="beide"
            tarief="gemiddeld"
            belastingen={belastingen}
            loading={loading}
          />

          {/* Uitleg Sectie */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            <Card>
              <CardContent className="pt-4 md:pt-8 px-3 md:px-6">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 rounded-xl flex items-center justify-center">
                    <Question className="w-5 h-5 md:w-6 md:h-6 text-white" weight="duotone" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Wat zijn marktprijzen?</h3>
                </div>
                <div className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                  <p>
                    Marktprijzen zijn de prijzen die op de energiemarkt worden bepaald door vraag en aanbod. 
                    Voor elektriciteit wordt de prijs bepaald op de EPEX Spot markt, en voor gas op de TTF (Title Transfer Facility) markt.
                  </p>
                  <p>
                    Deze prijzen variëren dagelijks en zelfs per uur (voor elektriciteit). Ze vormen de basis 
                    voor dynamische energiecontracten, waarbij u de marktprijs betaalt plus een opslag van de leverancier.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 md:pt-8 px-3 md:px-6">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-navy-400 to-brand-navy-500 rounded-xl flex items-center justify-center">
                    <Info className="w-5 h-5 md:w-6 md:h-6 text-white" weight="duotone" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-brand-navy-500">Marktprijzen vs Contractprijzen</h3>
                </div>
                <div className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                  <p>
                    De prijzen op deze pagina zijn <strong>marktprijzen</strong>, niet de prijzen die u daadwerkelijk 
                    betaalt bij een energiecontract.
                  </p>
                  <p>
                    Bij een <strong>dynamisch contract</strong> betaalt u de marktprijs plus een opslag van de leverancier. 
                    Bij een <strong>vast contract</strong> betaalt u een vaste prijs die niet verandert tijdens de contractperiode.
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
                    <strong>Tip:</strong> Gebruik onze calculator om te zien welke contractprijzen beschikbaar zijn voor uw situatie.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <Card className="mb-12 bg-brand-teal-50 border-brand-teal-200">
            <CardContent className="pt-8">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-teal-600 mt-0.5 flex-shrink-0" weight="duotone" />
                <div>
                  <h4 className="font-semibold text-brand-navy-500 mb-2">Belangrijke informatie</h4>
                  <p className="text-sm text-gray-700">
                    De prijzen op deze pagina zijn marktprijzen en dienen als indicatie. De daadwerkelijke prijzen 
                    die u betaalt bij een energiecontract kunnen afwijken door opslagen, vaste kosten en andere factoren. 
                    Deze prijzen zijn exclusief BTW en energiebelasting, tenzij anders aangegeven. 
                    Voor een exacte prijsopgave voor uw situatie, gebruik onze{' '}
                    <Link href="/calculator" className="text-brand-teal-600 hover:text-brand-teal-700 font-semibold underline">
                      energiecalculator
                    </Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 text-white">
            <CardContent className="pt-12 pb-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Klaar om te besparen op uw energie?
              </h3>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                Vergelijk energiecontracten van verschillende leveranciers en vind het beste contract voor uw bedrijf.
              </p>
              <Link href="/calculator">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-brand-teal-600 hover:bg-gray-100 shadow-xl"
                >
                  Bereken uw besparing
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

