'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Lightning, MapPin } from '@phosphor-icons/react'
import { useState } from 'react'

const verbruikSchema = z.object({
  elektriciteitJaar: z.number().min(0, 'Vul een geldig verbruik in'),
  gasJaar: z.number().min(0, 'Vul een geldig verbruik in').nullable(),
  postcode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/, 'Vul een geldige postcode in'),
  geschat: z.boolean(),
})

type VerbruikFormData = z.infer<typeof verbruikSchema>

export function VerbruikForm() {
  const { setVerbruik, volgendeStap } = useCalculatorStore()
  const [isGeschat, setIsGeschat] = useState(false)
  const [heeftGas, setHeeftGas] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerbruikFormData>({
    resolver: zodResolver(verbruikSchema),
    defaultValues: {
      geschat: false,
      gasJaar: null,
    },
  })

  const onSubmit = (data: VerbruikFormData) => {
    setVerbruik({
      elektriciteitJaar: data.elektriciteitJaar,
      gasJaar: heeftGas ? data.gasJaar : null,
      postcode: data.postcode,
      geschat: isGeschat,
    })
    volgendeStap()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-navy-500 to-brand-navy-600 rounded-2xl flex items-center justify-center">
            <Lightning weight="duotone" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-dark-900">
              Energieverbruik
            </h2>
            <p className="text-gray-600">Vul je jaarverbruik in</p>
          </div>
        </div>
      </div>

      {/* Postcode */}
      <div>
        <Input
          label="Postcode"
          placeholder="1234 AB"
          error={errors.postcode?.message}
          helpText="Je postcode gebruiken we om de beste tarieven voor jouw regio te vinden"
          {...register('postcode')}
          required
        />
      </div>

      {/* Elektriciteit */}
      <div>
        <Input
          label="Elektriciteitsverbruik per jaar (kWh)"
          type="number"
          placeholder="bijv. 3500"
          error={errors.elektriciteitJaar?.message}
          helpText="Gemiddeld MKB: 5.000-15.000 kWh per jaar"
          {...register('elektriciteitJaar', { valueAsNumber: true })}
          required
        />
      </div>

      {/* Gas toggle */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={heeftGas}
            onChange={(e) => {
              setHeeftGas(e.target.checked)
              if (!e.target.checked) {
                setValue('gasJaar', null)
              }
            }}
            className="w-5 h-5 rounded border-2 border-gray-300 text-brand-navy-600 focus:ring-brand-navy-500 focus:ring-offset-2"
          />
          <span className="text-base font-medium text-gray-700 group-hover:text-brand-navy-600 transition-colors">
            Ik gebruik ook gas
          </span>
        </label>

        {heeftGas && (
          <div className="animate-slide-down">
            <Input
              label="Gasverbruik per jaar (m³)"
              type="number"
              placeholder="bijv. 1200"
              error={errors.gasJaar?.message}
              helpText="Gemiddeld MKB: 1.000-5.000 m³ per jaar"
              {...register('gasJaar', { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      {/* Geschat toggle */}
      <div className="bg-brand-navy-50 border border-brand-navy-100 rounded-2xl p-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isGeschat}
            onChange={(e) => {
              setIsGeschat(e.target.checked)
              setValue('geschat', e.target.checked)
            }}
            className="mt-1 w-5 h-5 rounded border-2 border-brand-navy-300 text-brand-navy-600 focus:ring-brand-navy-500 focus:ring-offset-2"
          />
          <div>
            <span className="text-base font-semibold text-brand-navy-900 block mb-1">
              Dit is een schatting
            </span>
            <span className="text-sm text-brand-navy-700">
              Geen probleem! We helpen je later met het vinden van je exacte verbruik.
            </span>
          </div>
        </label>
      </div>

      {/* Submit button */}
      <Button type="submit" size="lg" className="w-full">
        Volgende stap
        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Button>
    </form>
  )
}
