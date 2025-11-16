'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { ContractVoorkeuren } from '@/types/calculator'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const voorkeurenSchema = z.object({
  type: z.enum(['vast', 'dynamisch', 'beide']),
  looptijd: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5)]),
  groeneEnergie: z.boolean(),
  opmerkingen: z.string().optional(),
})

export function VoorkeurenForm() {
  const { setVoorkeuren, vorigeStap, voorkeuren } = useCalculatorStore()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ContractVoorkeuren>({
    resolver: zodResolver(voorkeurenSchema),
    defaultValues: voorkeuren || {
      type: 'beide',
      looptijd: 3,
      groeneEnergie: false,
      opmerkingen: '',
    },
  })

  const typeWaarde = watch('type')
  const looptijdWaarde = watch('looptijd')

  const onSubmit = async (data: ContractVoorkeuren) => {
    setVoorkeuren(data)
    // Hier zou je normaal een API call maken om resultaten op te halen
    // Voor nu redirecten we naar de resultaten pagina
    router.push('/calculator/resultaten')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-8">
          <CardTitle className="mb-6">Contract voorkeuren</CardTitle>

          {/* Contract type */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-brand-navy-500">Contracttype voorkeur</p>

            <label
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer hover:border-brand-teal-500 hover:bg-brand-teal-50/30 transition-all duration-150',
                typeWaarde === 'vast'
                  ? 'border-brand-teal-500 bg-brand-teal-50'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                {...register('type')}
                value="vast"
                className="w-5 h-5 mt-0.5 text-brand-teal-500 focus:ring-brand-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-brand-navy-500">Vast contract</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Zekerheid van een vast tarief voor de gehele looptijd
                </div>
              </div>
            </label>

            <label
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer hover:border-brand-teal-500 hover:bg-brand-teal-50/30 transition-all duration-150',
                typeWaarde === 'dynamisch'
                  ? 'border-brand-teal-500 bg-brand-teal-50'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                {...register('type')}
                value="dynamisch"
                className="w-5 h-5 mt-0.5 text-brand-teal-500 focus:ring-brand-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-brand-navy-500">Dynamisch contract</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Profiteer van dalende energieprijzen met flexibele tarieven
                </div>
              </div>
            </label>

            <label
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer hover:border-brand-teal-500 hover:bg-brand-teal-50/30 transition-all duration-150',
                typeWaarde === 'beide'
                  ? 'border-brand-teal-500 bg-brand-teal-50'
                  : 'border-gray-200'
              )}
            >
              <input
                type="radio"
                {...register('type')}
                value="beide"
                className="w-5 h-5 mt-0.5 text-brand-teal-500 focus:ring-brand-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-brand-navy-500">Beide opties tonen</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Bekijk alle opties en vergelijk ze
                </div>
              </div>
            </label>
          </div>

          {/* Looptijd */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-brand-navy-500">Gewenste looptijd</p>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 5].map((jaar) => (
                <button
                  key={jaar}
                  type="button"
                  onClick={() => setValue('looptijd', jaar as 1 | 2 | 3 | 5)}
                  className={cn(
                    'p-3 rounded-xl border-2 font-medium transition-all',
                    looptijdWaarde === jaar
                      ? 'border-brand-teal-500 bg-brand-teal-50 text-brand-teal-500'
                      : 'border-gray-200 text-gray-500 hover:border-brand-teal-500'
                  )}
                >
                  {jaar} jaar
                </button>
              ))}
            </div>
            <input type="hidden" {...register('looptijd', { valueAsNumber: true })} />
          </div>

          {/* Groene energie */}
          <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              {...register('groeneEnergie')}
              className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 focus:ring-offset-0 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-brand-navy-500 group-hover:text-brand-teal-500 transition-colors">
                100% groene energie
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                Alleen duurzame energiecontracten tonen
              </p>
            </div>
          </label>

          {/* Opmerkingen */}
          <div className="space-y-1.5 mt-6">
            <label className="block text-sm font-medium text-brand-navy-500">
              Aanvullende opmerkingen (optioneel)
            </label>
            <textarea
              {...register('opmerkingen')}
              rows={4}
              placeholder="Heeft u specifieke wensen of vragen?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-500/50 focus:outline-none focus:ring-3 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 transition-all duration-150 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={vorigeStap}>
          ← Vorige stap
        </Button>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Bekijk resultaten →
        </Button>
      </div>
    </form>
  )
}

