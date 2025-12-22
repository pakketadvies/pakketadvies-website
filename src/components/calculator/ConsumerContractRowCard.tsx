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
      <Card className="relative border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        {position !== undefined && (
          <div className="absolute -top-2 -left-2 z-10">
            <div className="w-7 h-7 bg-brand-teal-500 text-white rounded-full flex items-center justify-center shadow font-bold text-sm border-2 border-white">
              {position}
            </div>
          </div>
        )}

        <CardContent className="p-4 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:items-center">
            {/* Left: supplier + bullets */}
            <div className="min-w-0">
              <div className="flex items-start gap-3">
                {contract.leverancier.logo ? (
                  <div className="w-14 h-14 bg-white rounded-lg border border-gray-100 p-2 flex items-center justify-center flex-shrink-0">
                    <img src={contract.leverancier.logo} alt={`${contract.leverancier.naam} logo`} className="w-full h-full object-contain" />
                  </div>
                ) : null}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base md:text-lg font-bold text-brand-navy-500 truncate">{contract.leverancier.naam}</h3>
                    {contract.groeneEnergie && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" weight="bold" />
                        Groen
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-4 h-4 text-brand-teal-600" weight="bold" />
                      {contractTypeLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" weight="fill" />
                      {contract.rating} ({contract.aantalReviews})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: price + CTA */}
            <div className="flex flex-row flex-wrap gap-3 items-center justify-between md:justify-end">
              {/* Price box LEFT of CTA */}
              <div className="rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 md:text-right">
                <div className="text-xs text-gray-500">kosten p.m.</div>
                <div className="flex items-baseline gap-1 md:justify-end">
                  <div className="text-3xl font-bold text-brand-navy-500">€{contract.maandbedrag}</div>
                  <div className="text-sm text-gray-500">/maand</div>
                </div>
                <div className="text-xs text-gray-500">€{contract.jaarbedrag.toLocaleString()} / jaar</div>
              </div>

              <Button
                className="w-full sm:w-auto md:w-auto bg-brand-teal-500 hover:bg-brand-teal-600 px-6 flex-shrink-0"
                onClick={() => {
                  setSelectedContract(contract)
                  router.push(`/calculator?stap=2&contract=${contract.id}`)
                }}
              >
                Aanmelden
              </Button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="text-sm font-semibold text-brand-teal-700 hover:text-brand-teal-800 inline-flex items-center gap-2"
            >
              <Info className="w-4 h-4" weight="fill" />
              Alle details van dit pakket
              <CaretRight className="w-4 h-4" weight="bold" />
            </button>
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


