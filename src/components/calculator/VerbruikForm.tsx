'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { VerbruikData } from '@/types/calculator'

const verbruikSchema = z.object({
  elektriciteitJaar: z.number().min(0, 'Vul een geldig verbruik in'),
  gasJaar: z.number().min(0, 'Vul een geldig verbruik in').nullable(),
  postcode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/, 'Vul een geldige postcode in'),
  geschat: z.boolean(),
})

export function VerbruikForm() {
  const { setVerbruik, volgendeStap } = useCalculatorStore()
  const [geschat, setGeschat] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VerbruikData>({
    resolver: zodResolver(verbruikSchema),
    defaultValues: {
      elektriciteitJaar: 25000,
      gasJaar: 3500,
      postcode: '',
      geschat: false,
    },
  })

  const elektriciteitWaarde = watch('elektriciteitJaar')
  const gasWaarde = watch('gasJaar')

  const onSubmit = (data: VerbruikData) => {
    setVerbruik({ ...data, geschat })
    volgendeStap()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-8">
          <CardTitle className="mb-6">Wat is uw jaarlijks energieverbruik?</CardTitle>

          {/* Verbruik type selectie */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setGeschat(false)}
              className={`p-4 rounded-xl border-2 transition-all ${
                !geschat
                  ? 'border-brand-teal-500 bg-brand-teal-50'
                  : 'border-gray-200 hover:border-brand-teal-500'
              }`}
            >
              <div className="font-medium text-brand-navy-500">Ik weet mijn verbruik</div>
              <div className="text-sm text-gray-500 mt-1">Exacte invoer</div>
            </button>
            <button
              type="button"
              onClick={() => setGeschat(true)}
              className={`p-4 rounded-xl border-2 transition-all ${
                geschat
                  ? 'border-brand-teal-500 bg-brand-teal-50'
                  : 'border-gray-200 hover:border-brand-teal-500'
              }`}
            >
              <div className="font-medium text-brand-navy-500">Ik weet het niet</div>
              <div className="text-sm text-gray-500 mt-1">Schatting</div>
            </button>
          </div>

          {/* Elektriciteit */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-brand-navy-500">
              Elektriciteit (kWh per jaar)
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={elektriciteitWaarde}
              onChange={(e) => setValue('elektriciteitJaar', Number(e.target.value))}
              className="w-full h-2 rounded-full bg-brand-teal-50 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-teal-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 kWh</span>
              <span className="text-lg font-semibold text-brand-teal-500">
                {elektriciteitWaarde.toLocaleString()} kWh
              </span>
              <span>100.000 kWh</span>
            </div>
            <input
              type="hidden"
              {...register('elektriciteitJaar', { valueAsNumber: true })}
              value={elektriciteitWaarde}
            />
          </div>

          {/* Gas */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-brand-navy-500">
              Gas (m³ per jaar)
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={gasWaarde || 0}
              onChange={(e) => setValue('gasJaar', Number(e.target.value))}
              className="w-full h-2 rounded-full bg-brand-teal-50 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-teal-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 m³</span>
              <span className="text-lg font-semibold text-brand-teal-500">
                {(gasWaarde || 0).toLocaleString()} m³
              </span>
              <span>10.000 m³</span>
            </div>
            <input
              type="hidden"
              {...register('gasJaar', { valueAsNumber: true })}
              value={gasWaarde ?? 0}
            />
          </div>

          {/* Postcode */}
          <Input
            {...register('postcode')}
            label="Postcode"
            placeholder="1234 AB"
            error={errors.postcode?.message}
            helpText="Voor regio-specifieke tarieven"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Volgende stap →
        </Button>
      </div>
    </form>
  )
}

