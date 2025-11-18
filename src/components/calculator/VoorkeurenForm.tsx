'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Button } from '@/components/ui/Button'
import { Leaf, Lock, Lightning, Diamond, Info, Check } from '@phosphor-icons/react'

// Dynamic schema based on contract type and verbruik
const createVoorkeurenSchema = (type?: string) => {
  const baseSchema = {
    type: z.enum(['vast', 'dynamisch', 'maatwerk']),
    groeneEnergie: z.boolean(),
    opmerkingen: z.string().optional(),
  }

  // Only require looptijd for 'vast' contracts
  if (type === 'vast') {
    return z.object({
      ...baseSchema,
      looptijd: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5)]),
    })
  }

  // For dynamisch and maatwerk, looptijd is not required
  return z.object(baseSchema)
}

type VoorkeurenFormData = {
  type: 'vast' | 'dynamisch' | 'maatwerk'
  looptijd?: 1 | 2 | 3 | 5
  groeneEnergie: boolean
  opmerkingen?: string
}

export function VoorkeurenForm() {
  const router = useRouter()
  const { setVoorkeuren, vorigeStap, verbruik } = useCalculatorStore()

  // Check if user qualifies for maatwerk (60k kWh OR 10k m³)
  const qualifiesForMaatwerk = 
    (verbruik?.elektriciteitJaar && verbruik.elektriciteitJaar >= 60000) ||
    (verbruik?.gasJaar && verbruik.gasJaar >= 10000)

  // Check if user has optimal setup for dynamic contracts
  const hasSmartMeter = verbruik?.meterType === 'slim'
  const hasSolarPanels = verbruik?.heeftZonnepanelen
  const idealForDynamic = hasSmartMeter || hasSolarPanels

  const form = useForm<VoorkeurenFormData>({
    resolver: zodResolver(createVoorkeurenSchema('vast')), // Start with vast schema
    defaultValues: {
      type: 'vast',
      looptijd: 3,
      groeneEnergie: false,
    },
    mode: 'onChange', // Validate on change to update schema dynamically
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const type = watch('type')
  const looptijd = watch('looptijd')
  const groeneEnergie = watch('groeneEnergie')

  const onSubmit = (data: VoorkeurenFormData) => {
    // If maatwerk selected, redirect to contact page
    if (data.type === 'maatwerk') {
      router.push('/contact?type=maatwerk&verbruik=' + (verbruik?.elektriciteitJaar || 0))
      return
    }
    
    setVoorkeuren(data)
    router.push('/calculator/resultaten')
  }

  const contractTypes = [
    {
      value: 'vast' as const,
      icon: Lock,
      title: 'Vast contract',
      description: 'Zekerheid met een vaste prijs',
      features: ['1-5 jaar looptijd', 'Geen prijsschommelingen', 'Budgetzekerheid'],
      color: 'blue',
      recommended: false,
    },
    {
      value: 'dynamisch' as const,
      icon: Lightning,
      title: 'Dynamisch',
      description: idealForDynamic ? 'Aanbevolen voor jou!' : 'Profiteer van lage prijzen',
      features: ['Maandelijks opzegbaar', 'Marktprijs per uur', 'Flexibel'],
      color: 'teal',
      recommended: idealForDynamic,
    },
    ...(qualifiesForMaatwerk ? [{
      value: 'maatwerk' as const,
      icon: Diamond,
      title: 'Maatwerk',
      description: 'Volume = extra voordeel',
      features: ['Bundeling volumes', 'Beste tarieven', 'Accountmanager'],
      color: 'purple',
      recommended: false,
    }] : [])
  ]

  const looptijden = [1, 2, 3, 5]

  // Determine if we should show looptijd section
  const showLooptijd = type === 'vast'
  const isDynamisch = type === 'dynamisch'
  const isMaatwerk = type === 'maatwerk'

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-brand-navy-500',
        border: 'border-brand-navy-500',
        text: 'text-brand-navy-600',
        bgLight: 'bg-brand-navy-50',
      },
      teal: {
        bg: 'bg-brand-teal-500',
        border: 'border-brand-teal-500',
        text: 'text-brand-teal-600',
        bgLight: 'bg-brand-teal-50',
      },
      purple: {
        bg: 'bg-brand-purple-500',
        border: 'border-brand-purple-500',
        text: 'text-brand-purple-600',
        bgLight: 'bg-brand-purple-50',
      },
    }
    return colors[color as keyof typeof colors]
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Leaf weight="duotone" className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-brand-navy-500 truncate">
              Voorkeuren
            </h2>
            <p className="text-sm md:text-base text-gray-600">Wat past het beste bij jou?</p>
          </div>
        </div>
      </div>

      {/* Maatwerk qualification badge */}
      {qualifiesForMaatwerk && (
        <div className="bg-brand-purple-50 border-2 border-brand-purple-200 rounded-xl p-4 flex items-start gap-3">
          <Diamond weight="duotone" className="w-6 h-6 text-brand-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-brand-purple-900 mb-1">Je komt in aanmerking voor maatwerk!</div>
            <p className="text-sm text-brand-purple-700">
              Met jouw verbruik ({verbruik?.elektriciteitJaar?.toLocaleString() || 0} kWh
              {verbruik?.gasJaar ? ` + ${verbruik.gasJaar.toLocaleString()} m³` : ''}) 
              kun je profiteren van volume pooling en extra scherpe tarieven.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic contract recommendation for solar/smart meter */}
      {idealForDynamic && !qualifiesForMaatwerk && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
          <Lightning weight="duotone" className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-green-900 mb-1">
              {hasSolarPanels && hasSmartMeter && '💡 Perfect voor dynamisch!'}
              {hasSolarPanels && !hasSmartMeter && '☀️ Ideaal met zonnepanelen!'}
              {!hasSolarPanels && hasSmartMeter && '📱 Slimme meter gedetecteerd!'}
            </div>
            <p className="text-sm text-green-700">
              {hasSolarPanels && 'Met zonnepanelen kun je optimaal profiteren van dynamische contracten door slim terug te leveren tijdens piekuren.'}
              {!hasSolarPanels && hasSmartMeter && 'Met je slimme meter kun je real-time profiteren van lage energieprijzen met een dynamisch contract.'}
            </p>
          </div>
        </div>
      )}

      {/* Contract type */}
      <div className="space-y-4">
        <label className="block text-sm md:text-base font-semibold text-brand-navy-500">
          Type contract <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {contractTypes.map((option) => {
            const Icon = option.icon
            const isSelected = type === option.value
            const colors = getColorClasses(option.color)
            
            return (
              <label
                key={option.value}
                className={`
                  relative flex flex-col p-4 md:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                  ${isSelected 
                    ? `${colors.border} ${colors.bgLight} shadow-lg ring-2 ring-${option.color}-500/20` 
                    : 'border-gray-200 bg-white hover:border-brand-teal-300 hover:shadow-md'
                  }
                  ${option.recommended && !isSelected ? 'ring-2 ring-green-400/50' : ''}
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('type')}
                  className="sr-only"
                />
                
                {option.recommended && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                    ⭐ Aanbevolen
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3 mt-1">
                  <Icon 
                    weight="duotone" 
                    className={`w-7 h-7 md:w-8 md:h-8 ${isSelected ? colors.text : 'text-gray-400'}`}
                  />
                  {isSelected && (
                    <div className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center shadow-lg`}>
                      <Check weight="bold" className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className={`text-base md:text-lg font-bold mb-1 ${isSelected ? 'text-brand-navy-500' : 'text-gray-900'}`}>
                  {option.title}
                </div>
                <div className="text-xs md:text-sm text-gray-600 mb-3">{option.description}</div>

                <ul className="space-y-1.5">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className={`w-1 h-1 rounded-full ${isSelected ? colors.bg : 'bg-gray-400'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </label>
            )
          })}
        </div>
      </div>

      {/* Looptijd - Only show for vast contract */}
      {showLooptijd && (
        <div className="space-y-4">
          <label className="block text-sm md:text-base font-semibold text-brand-navy-500">
            Gewenste looptijd <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {looptijden.map((jaar) => {
              const isSelected = looptijd === jaar
              
              return (
                <label
                  key={jaar}
                  onClick={() => setValue('looptijd', jaar as any)}
                  className={`
                    relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'border-brand-teal-500 bg-brand-teal-50 shadow-lg ring-2 ring-brand-teal-500/20' 
                      : 'border-gray-200 bg-white hover:border-brand-teal-300 hover:shadow-md'
                    }
                  `}
                >
                  <input
                    type="radio"
                    value={jaar}
                    checked={isSelected}
                    onChange={() => setValue('looptijd', jaar as any)}
                    className="sr-only"
                  />
                  <div className={`text-xl md:text-2xl font-bold mb-0.5 md:mb-1 ${isSelected ? 'text-brand-teal-600' : 'text-gray-900'}`}>
                    {jaar}
                  </div>
                  <div className="text-xs text-gray-600">jaar</div>
                  
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-brand-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Info for dynamisch */}
      {isDynamisch && (
        <div className="bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3">
            <Lightning weight="duotone" className="w-6 h-6 text-brand-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-brand-navy-500 mb-1">
                Dynamisch contract
              </div>
              <p className="text-sm text-gray-700">
                Bij een dynamisch contract is er geen vaste looptijd. Je kunt maandelijks opzeggen.
                De prijs varieert per uur op basis van de energiemarkt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info for maatwerk */}
      {isMaatwerk && (
        <div className="bg-brand-purple-50 border-2 border-brand-purple-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3">
            <Diamond weight="duotone" className="w-6 h-6 text-brand-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-brand-navy-500 mb-2">
                Maatwerk contract - persoonlijk advies
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Voor maatwerk contracten nemen we persoonlijk contact met je op. We analyseren je verbruik, 
                bundelen volumes met andere bedrijven en onderhandelen de scherpste tarieven.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check weight="bold" className="w-4 h-4 text-brand-purple-600" />
                  <span>15-25% extra besparing door volume pooling</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check weight="bold" className="w-4 h-4 text-brand-purple-600" />
                  <span>Persoonlijke accountmanager</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check weight="bold" className="w-4 h-4 text-brand-purple-600" />
                  <span>Op maat gemaakte voorwaarden</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groene energie */}
      <div className="bg-brand-teal-50 border-2 border-brand-teal-200 rounded-xl p-4 md:p-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register('groeneEnergie')}
            className="mt-1 w-5 h-5 rounded border-2 border-brand-teal-300 text-brand-teal-600 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Leaf weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <span className="text-base font-semibold text-brand-teal-900">
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
        <label className="block text-sm md:text-base font-semibold text-brand-navy-500 mb-2">
          Opmerkingen of speciale wensen
        </label>
        <textarea
          {...register('opmerkingen')}
          rows={4}
          className="w-full rounded-lg border-2 border-gray-300 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500 focus:ring-offset-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base transition-all duration-200"
          placeholder="Zijn er nog specifieke zaken waar we rekening mee moeten houden?"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
        <Button type="button" variant="outline" size="lg" onClick={vorigeStap} className="w-full sm:flex-1 text-sm md:text-base">
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Vorige
        </Button>
        <Button type="submit" size="lg" className="w-full sm:flex-1 bg-brand-teal-500 hover:bg-brand-teal-600 text-sm md:text-base">
          {isMaatwerk ? 'Vraag maatwerk aan' : 'Bekijk resultaten'}
          <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
