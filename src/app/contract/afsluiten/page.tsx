'use client'

import { useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// Mock contract data
const contractData = {
  id: '1',
  leverancier: 'Groene Stroom',
  type: 'vast',
  looptijd: 3,
  maandbedrag: 137,
  jaarbedrag: 1644,
  groeneEnergie: true,
}

export default function ContractAfsluitenPage() {
  const router = useRouter()
  const [stap, setStap] = useState(1)
  const [akkoorden, setAkkoorden] = useState({
    voorwaarden: false,
    contract: false,
    herroeping: false,
    privacy: false,
  })
  const [handtekeningMethode, setHandtekeningMethode] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const alleAkkoordenChecked = Object.values(akkoorden).every((v) => v)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simuleer API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push('/contract/bevestiging')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-32 md:pt-36">
      <div className="container-custom max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-2">
            Contract afsluiten
          </h1>
          <p className="text-lg text-gray-500">Laatste stap voordat uw nieuwe contract ingaat</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className={cn(
              'flex-1 h-1 rounded-full',
              stap >= 1 ? 'bg-brand-teal-500' : 'bg-gray-200'
            )}
          />
          <div
            className={cn(
              'flex-1 h-1 rounded-full',
              stap >= 2 ? 'bg-brand-teal-500' : 'bg-gray-200'
            )}
          />
          <div
            className={cn(
              'flex-1 h-1 rounded-full',
              stap >= 3 ? 'bg-brand-teal-500' : 'bg-gray-200'
            )}
          />
        </div>

        {/* Stap 1: Contract Overzicht */}
        {stap === 1 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-8">
                <CardTitle className="mb-6">Uw geselecteerde contract</CardTitle>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Leverancier</span>
                    <span className="font-semibold text-brand-navy-500">
                      {contractData.leverancier}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Contracttype</span>
                    <Badge variant="info">{contractData.type === 'vast' ? 'Vast' : 'Dynamisch'}</Badge>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Looptijd</span>
                    <span className="font-semibold text-brand-navy-500">
                      {contractData.looptijd} jaar
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-gray-500">Maandbedrag</span>
                    <span className="text-2xl font-bold text-brand-navy-500">
                      €{contractData.maandbedrag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Jaarbedrag</span>
                    <span className="font-semibold text-brand-navy-500">
                      €{contractData.jaarbedrag}
                    </span>
                  </div>
                </div>

                <Alert variant="info" title="Let op">
                  U heeft 14 dagen herroepingsrecht. Binnen deze periode kunt u het contract zonder
                  opgave van reden annuleren.
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button size="lg" onClick={() => setStap(2)}>
                Akkoord en verder →
              </Button>
            </div>
          </div>
        )}

        {/* Stap 2: Akkoordverklaringen */}
        {stap === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-8">
                <CardTitle className="mb-6">Algemene voorwaarden en akkoord</CardTitle>

                <p className="text-gray-500 mb-6">
                  Voordat u het contract kunt afsluiten, vragen we u om akkoord te gaan met de
                  volgende punten:
                </p>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={akkoorden.voorwaarden}
                      onChange={(e) =>
                        setAkkoorden({ ...akkoorden, voorwaarden: e.target.checked })
                      }
                      className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-brand-navy-500">
                        Ik heb de algemene voorwaarden gelezen en ga akkoord
                      </span>
                      <button
                        type="button"
                        className="block text-xs text-brand-teal-500 hover:underline mt-1"
                      >
                        Lees algemene voorwaarden
                      </button>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={akkoorden.contract}
                      onChange={(e) =>
                        setAkkoorden({ ...akkoorden, contract: e.target.checked })
                      }
                      className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-brand-navy-500">
                      Ik ga akkoord met het contract zoals hierboven weergegeven
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={akkoorden.herroeping}
                      onChange={(e) =>
                        setAkkoorden({ ...akkoorden, herroeping: e.target.checked })
                      }
                      className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-brand-navy-500">
                        Ik begrijp dat ik 14 dagen herroepingsrecht heb
                      </span>
                      <button
                        type="button"
                        className="block text-xs text-brand-teal-500 hover:underline mt-1"
                      >
                        Meer info over herroepingsrecht
                      </button>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={akkoorden.privacy}
                      onChange={(e) =>
                        setAkkoorden({ ...akkoorden, privacy: e.target.checked })
                      }
                      className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-brand-navy-500">
                        Ik geef toestemming voor verwerking van mijn gegevens conform het
                        privacybeleid
                      </span>
                      <button
                        type="button"
                        className="block text-xs text-brand-teal-500 hover:underline mt-1"
                      >
                        Lees privacybeleid
                      </button>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStap(1)}>
                ← Vorige stap
              </Button>
              <Button size="lg" onClick={() => setStap(3)} disabled={!alleAkkoordenChecked}>
                Volgende stap →
              </Button>
            </div>
          </div>
        )}

        {/* Stap 3: Ondertekening */}
        {stap === 3 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-8">
                <CardTitle className="mb-6">Contract ondertekenen</CardTitle>

                <p className="text-gray-500 mb-6">
                  Kies uw voorkeursmethode voor ondertekening:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setHandtekeningMethode('sms')}
                    className={cn(
                      'p-6 rounded-xl border-2 text-left transition-all',
                      handtekeningMethode === 'sms'
                        ? 'border-brand-teal-500 bg-brand-teal-50'
                        : 'border-gray-200 hover:border-brand-teal-500'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-brand-navy-500 mb-1">SMS verificatie</h3>
                    <p className="text-sm text-gray-500">Meest gekozen</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHandtekeningMethode('email')}
                    className={cn(
                      'p-6 rounded-xl border-2 text-left transition-all',
                      handtekeningMethode === 'email'
                        ? 'border-brand-teal-500 bg-brand-teal-50'
                        : 'border-gray-200 hover:border-brand-teal-500'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-50 flex items-center justify-center text-brand-teal-500 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-brand-navy-500 mb-1">Email verificatie</h3>
                    <p className="text-sm text-gray-500">Eenvoudig en snel</p>
                  </button>
                </div>

                {handtekeningMethode && (
                  <Alert variant="info">
                    We sturen een verificatiecode naar uw{' '}
                    {handtekeningMethode === 'sms' ? 'telefoonnummer' : 'emailadres'}. Vul deze
                    code in om het contract te ondertekenen.
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStap(2)}>
                ← Vorige stap
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!handtekeningMethode || isSubmitting}
              >
                {isSubmitting ? 'Bezig met ondertekenen...' : 'Contract ondertekenen →'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

