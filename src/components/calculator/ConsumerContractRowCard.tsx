'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaretRight, Check, Star, Info } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { ContractOptie } from '@/types/calculator'
import type { KostenBreakdown } from './ContractCard'
import { ContractDetailsDrawer } from './ContractDetailsDrawer'

type Props = {
  contract: ContractOptie
  position?: number
  // for details modal / calculations
  meterType: 'slim' | 'oud' | 'weet_niet' | 'enkel'
  heeftEnkeleMeter: boolean
  verbruikElektriciteitNormaal: number
  verbruikElektriciteitDal: number
  verbruikGas: number
  terugleveringJaar?: number
  aansluitwaardeElektriciteit: string
  aansluitwaardeGas: string
  postcode: string
}

export function ConsumerContractRowCard({
  contract,
  position,
  meterType,
  heeftEnkeleMeter,
  verbruikElektriciteitNormaal,
  verbruikElektriciteitDal,
  verbruikGas,
  aansluitwaardeElektriciteit,
  aansluitwaardeGas,
  postcode,
}: Props) {
  const router = useRouter()
  const { setSelectedContract } = useCalculatorStore()

  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [breakdown, setBreakdown] = useState<KostenBreakdown | null>(contract.breakdown || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lazy-load breakdown only when opening details.
  useEffect(() => {
    if (!isDetailsOpen) return
    if (breakdown) return

    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const heeftDubbeleMeter = heeftEnkeleMeter === true ? false : !heeftEnkeleMeter
        const res = await fetch('/api/energie/bereken-contract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elektriciteitNormaal: verbruikElektriciteitNormaal,
            elektriciteitDal: verbruikElektriciteitDal,
            gas: verbruikGas,
            terugleveringJaar: 0,
            aansluitwaardeElektriciteit,
            aansluitwaardeGas,
            postcode,
            contractType: contract.type,
            // We already have calculated costs in ResultatenFlow, but breakdown needs these:
            tariefElektriciteitNormaal: contract.tariefElektriciteit || 0,
            tariefElektriciteitDal: contract.tariefElektriciteitDal || 0,
            tariefElektriciteitEnkel: contract.tariefElektriciteitEnkel || 0,
            tariefGas: contract.tariefGas || 0,
            tariefTerugleveringKwh: 0,
            opslagElektriciteit: 0,
            opslagGas: 0,
            opslagTeruglevering: 0,
            vastrechtStroomMaand: 4.0,
            vastrechtGasMaand: 4.0,
            heeftDubbeleMeter,
          }),
        })

        if (!res.ok) throw new Error('Kon prijsdetails niet ophalen')
        const json = await res.json()
        if (!cancelled) setBreakdown(json.breakdown || null)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Kon prijsdetails niet ophalen')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [
    isDetailsOpen,
    breakdown,
    contract.type,
    contract.tariefElektriciteit,
    contract.tariefElektriciteitDal,
    contract.tariefElektriciteitEnkel,
    contract.tariefGas,
    heeftEnkeleMeter,
    verbruikElektriciteitNormaal,
    verbruikElektriciteitDal,
    verbruikGas,
    aansluitwaardeElektriciteit,
    aansluitwaardeGas,
    postcode,
  ])

  const contractTypeLabel =
    contract.type === 'dynamisch'
      ? 'Dynamisch'
      : contract.looptijd
        ? `Vast • ${contract.looptijd} jaar`
        : 'Vast'

  return (
    <>
      <Card className="relative border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200">
        {position !== undefined && (
          <div className="absolute -top-2.5 -left-2.5 z-10">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-teal-500 to-brand-teal-600 text-white rounded-full flex items-center justify-center shadow-lg font-bold text-sm border-2 border-white">
              {position}
            </div>
          </div>
        )}

        <CardContent className="p-4 md:p-4">
          {/* Mobile: Vertical layout (unchanged) */}
          <div className="md:hidden space-y-3">
            {/* Top row: Logo + Name + Badges */}
            <div className="flex items-start gap-3">
              {contract.leverancier.logo ? (
                <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 p-2.5 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img src={contract.leverancier.logo} alt={`${contract.leverancier.naam} logo`} className="w-full h-full object-contain" />
                </div>
              ) : null}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-brand-navy-500 truncate">{contract.leverancier.naam}</h3>
                  {contract.groeneEnergie && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Check className="w-3 h-3" weight="bold" />
                      Groen
                    </span>
                  )}
                </div>

                {/* Contract type + Rating - compact single line */}
                <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Check className="w-3.5 h-3.5 text-brand-teal-600" weight="bold" />
                    <span className="font-medium">{contractTypeLabel}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <Star className="w-3.5 h-3.5 text-yellow-500" weight="fill" />
                    <span className="font-medium">{contract.rating}</span>
                    <span className="text-gray-500">({contract.aantalReviews})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Price section - prominent with saving badge */}
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">kosten per maand</div>
                  <div className="flex items-baseline gap-1.5">
                    <div className="text-4xl font-bold text-brand-navy-500">€{contract.maandbedrag}</div>
                    <div className="text-base text-gray-500">/maand</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">€{contract.jaarbedrag.toLocaleString('nl-NL')} per jaar</div>
                </div>
                
                {/* Saving badge - prominent if available */}
                {contract.besparing && contract.besparing > 0 && (
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-br from-green-50 to-green-100 text-green-700 rounded-xl px-3 py-2 text-sm font-bold border-2 border-green-300 shadow-sm">
                      <Check className="w-4 h-4" weight="bold" />
                      <div className="flex flex-col">
                        <span className="leading-tight">€{contract.besparing}/mnd</span>
                        <span className="text-xs font-semibold text-green-600 leading-tight">besparing</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button - full width on mobile */}
            <Button
              className="w-full bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-teal-500/25 hover:shadow-xl hover:shadow-brand-teal-500/30 transition-all duration-200"
              onClick={() => {
                setSelectedContract(contract)
                router.push(`/calculator?stap=2&contract=${contract.id}`)
              }}
            >
              Aanmelden
            </Button>

            {/* Details link - compact */}
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="w-full text-center text-sm font-medium text-brand-teal-700 hover:text-brand-teal-800 inline-flex items-center justify-center gap-1.5 py-2 transition-colors"
            >
              <Info className="w-4 h-4" weight="fill" />
              <span>Alle details</span>
              <CaretRight className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>

          {/* Desktop: Horizontal compact layout (Pricewise-style) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Left: Logo + Name + Badges */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0" style={{ width: '240px' }}>
              {contract.leverancier.logo ? (
                <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 p-1.5 flex items-center justify-center flex-shrink-0">
                  <img src={contract.leverancier.logo} alt={`${contract.leverancier.naam} logo`} className="w-full h-full object-contain" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-base font-bold text-brand-navy-500 truncate">{contract.leverancier.naam}</h3>
                  {contract.groeneEnergie && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded flex-shrink-0">
                      <Check className="w-2.5 h-2.5" weight="bold" />
                      Groen
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-3 h-3 text-brand-teal-600" weight="bold" />
                    <span>{contractTypeLabel}</span>
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-500" weight="fill" />
                    <span className="font-medium">{contract.rating}</span>
                    <span className="text-gray-500">({contract.aantalReviews})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Middle: Price + Saving badge */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-brand-navy-500">€{contract.maandbedrag}</div>
                <div className="text-sm text-gray-500">/mnd</div>
              </div>
              <div className="text-xs text-gray-500">€{contract.jaarbedrag.toLocaleString('nl-NL')}/jaar</div>
              {contract.besparing && contract.besparing > 0 && (
                <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 rounded-lg px-2 py-1 text-xs font-semibold border border-green-200">
                  <Check className="w-3 h-3" weight="bold" />
                  <span>€{contract.besparing}/mnd besparing</span>
                </div>
              )}
            </div>

            {/* Right: CTA Button + Details link */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                onClick={() => {
                  setSelectedContract(contract)
                  router.push(`/calculator?stap=2&contract=${contract.id}`)
                }}
              >
                Aanmelden
              </Button>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(true)}
                className="text-sm font-medium text-brand-teal-700 hover:text-brand-teal-800 inline-flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Info className="w-4 h-4" weight="fill" />
                <span className="hidden lg:inline">Details</span>
                <CaretRight className="w-3.5 h-3.5" weight="bold" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ContractDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        contract={contract}
        breakdown={breakdown}
        loading={loading}
        error={error}
        verbruikElektriciteitNormaal={verbruikElektriciteitNormaal}
        verbruikElektriciteitDal={verbruikElektriciteitDal}
        verbruikGas={verbruikGas}
        aansluitwaardeElektriciteit={aansluitwaardeElektriciteit}
        aansluitwaardeGas={aansluitwaardeGas}
      />
    </>
  )
}


