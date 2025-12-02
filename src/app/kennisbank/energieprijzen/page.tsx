'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { PrijzenInfoCards } from '@/components/energieprijzen/PrijzenInfoCards'
import { PrijzenGrafiek } from '@/components/energieprijzen/PrijzenGrafiek'
import { PrijzenTabel } from '@/components/energieprijzen/PrijzenTabel'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Info, ArrowRight, Lightning, Flame, Question } from '@phosphor-icons/react'

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
            <section className="bg-gradient-to-br from-brand-navy-500 to-brand-navy-600 text-white py-8 md:py-12 lg:py-16 pt-24 md:pt-32 lg:pt-36">
              <div className="container-custom px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/kennisbank"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 md:mb-6 transition-colors text-xs md:text-sm"
            >
              <span>← Terug naar kennisbank</span>
            </Link>
            
                  <div className="flex flex-col items-center gap-4 md:gap-6 mb-4 md:mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-sm rounded-2xl">
                      <Lightning className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" weight="duotone" />
            </div>
            
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
              Energieprijzen
            </h1>
                  </div>
                  
                  <p className="text-sm md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto px-2">
              Bekijk de actuele en historische marktprijzen voor elektriciteit en gas. 
              Deze prijzen geven inzicht in de energiemarkt en helpen u bij het kiezen van het juiste energiecontract.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
            <section className="py-6 md:py-12 lg:py-16">
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

