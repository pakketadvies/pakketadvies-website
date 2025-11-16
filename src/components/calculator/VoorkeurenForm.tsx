'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Button } from '@/components/ui/Button'
import { Leaf } from '@phosphor-icons/react'

const voorkeurenSchema = z.object({
  type: z.enum(['vast', 'dynamisch', 'beide']),
  looptijd: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5)]),
  groeneEnergie: z.boolean(),
  opmerkingen: z.string().optional(),
})

type VoorkeurenFormData = z.infer<typeof voorkeurenSchema>

export function VoorkeurenForm() {
  const router = useRouter()
  const { setVoorkeuren, vorigeStap } = useCalculatorStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VoorkeurenFormData>({
    resolver: zodResolver(voorkeurenSchema),
    defaultValues: {
      type: 'beide',
      looptijd: 3,
      groeneEnergie: false,
    },
  })

  const type = watch('type')
  const looptijd = watch('looptijd')

  const onSubmit = (data: VoorkeurenFormData) => {
    setVoorkeuren(data)
    router.push('/calculator/resultaten')
  }

  const contractTypes = [
    { value: 'vast', title: 'Vast contract', description: 'Zekerheid met een vaste prijs' },
    { value: 'dynamisch', title: 'Dynamisch', description: 'Profiteer van lage prijzen' },
    { value: 'beide', title: 'Beide opties', description: 'Laat mij adviseren' },
  ]

  const looptijden = [1, 2, 3, 5]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-navy-500 mb-2">
          Voorkeuren
        </h2>
        <p className="text-gray-600">Wat past het beste bij jouw bedrijf?</p>
      </div>

      {/* Contract type */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Type contract <span className="text-red-500">*</span>
        </label>
        <div className="grid md:grid-cols-3 gap-3">
          {contractTypes.map((option) => {
            const isSelected = type === option.value
            
            return (
              <label
                key={option.value}
                className={`
                  relative flex flex-col p-4 rounded-md border-2 cursor-pointer transition-colors
                  ${isSelected 
                    ? 'border-brand-teal-500 bg-brand-teal-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('type')}
                  className="sr-only"
                />
                <div className={`font-bold mb-1 ${isSelected ? 'text-brand-teal-700' : 'text-gray-900'}`}>
                  {option.title}
                </div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Looptijd */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Gewenste looptijd <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {looptijden.map((jaar) => {
            const isSelected = looptijd === jaar
            
            return (
              <label
                key={jaar}
                className={`
                  relative flex flex-col items-center justify-center p-4 rounded-md border-2 cursor-pointer transition-colors
                  ${isSelected 
                    ? 'border-brand-teal-500 bg-brand-teal-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  value={jaar}
                  {...register('looptijd', { valueAsNumber: true })}
                  className="sr-only"
                />
                <div className={`text-2xl font-bold mb-1 ${isSelected ? 'text-brand-teal-700' : 'text-gray-900'}`}>
                  {jaar}
                </div>
                <div className="text-xs text-gray-600">jaar</div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Groene energie */}
      <div className="bg-brand-teal-50 border border-brand-teal-200 rounded-md p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('groeneEnergie')}
            className="mt-1 w-5 h-5 rounded border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-offset-2"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Leaf weight="regular" className="w-5 h-5 text-brand-teal-600" />
              <span className="text-sm font-semibold text-brand-teal-900">
                Ik wil graag groene energie
              </span>
            </div>
            <span className="text-sm text-brand-teal-700">
              Kies voor 100% duurzame energie uit wind, zon of water. 
              Goed voor het milieu én vaak voordeliger dan je denkt.
            </span>
          </div>
        </label>
      </div>

      {/* Opmerkingen */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Opmerkingen of speciale wensen
        </label>
        <textarea
          {...register('opmerkingen')}
          rows={4}
          className="w-full rounded-md border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500 focus:ring-offset-1 px-4 py-2.5 transition-all duration-200"
          placeholder="Zijn er nog specifieke zaken waar we rekening mee moeten houden?"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button type="button" variant="ghost" size="lg" onClick={vorigeStap} className="flex-1">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Vorige
        </Button>
        <Button type="submit" variant="secondary" size="lg" className="flex-1">
          Bekijk resultaten
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
