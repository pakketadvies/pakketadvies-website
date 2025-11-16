'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { useCalculatorStore } from '@/store/calculatorStore'
import type { BedrijfsGegevens } from '@/types/calculator'

const bedrijfsSchema = z.object({
  bedrijfsnaam: z.string().min(2, 'Vul een bedrijfsnaam in'),
  contactpersoon: z.string().min(2, 'Vul een contactpersoon in'),
  email: z.string().email('Vul een geldig emailadres in'),
  telefoon: z.string().min(10, 'Vul een geldig telefoonnummer in'),
  typeBedrijf: z.enum(['retail', 'horeca', 'kantoor', 'productie', 'gezondheidszorg', 'onderwijs', 'overig']),
})

export function BedrijfsgegevensForm() {
  const { setBedrijfsgegevens, volgendeStap, vorigeStap, bedrijfsgegevens } = useCalculatorStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BedrijfsGegevens>({
    resolver: zodResolver(bedrijfsSchema),
    defaultValues: bedrijfsgegevens || {
      bedrijfsnaam: '',
      contactpersoon: '',
      email: '',
      telefoon: '',
      typeBedrijf: 'kantoor',
    },
  })

  const onSubmit = (data: BedrijfsGegevens) => {
    setBedrijfsgegevens(data)
    volgendeStap()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-8">
          <CardTitle className="mb-6">Bedrijfsgegevens</CardTitle>

          <div className="space-y-4">
            <Input
              {...register('bedrijfsnaam')}
              label="Bedrijfsnaam"
              placeholder="Bijvoorbeeld: Bakkerij Jansen"
              error={errors.bedrijfsnaam?.message}
              helpText="Vul de officiële bedrijfsnaam in zoals geregistreerd bij de KvK"
            />

            <Input
              {...register('contactpersoon')}
              label="Contactpersoon"
              placeholder="Voor- en achternaam"
              error={errors.contactpersoon?.message}
            />

            <Input
              {...register('email')}
              type="email"
              label="Emailadres"
              placeholder="info@uwbedrijf.nl"
              error={errors.email?.message}
            />

            <Input
              {...register('telefoon')}
              type="tel"
              label="Telefoonnummer"
              placeholder="06 12345678"
              error={errors.telefoon?.message}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-brand-navy-500">
                Type bedrijf
              </label>
              <select
                {...register('typeBedrijf')}
                className="w-full h-12 md:h-14 px-4 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-3 focus:ring-brand-teal-500/20 focus:border-brand-teal-500 appearance-none bg-white cursor-pointer transition-all duration-150"
              >
                <option value="retail">Retail</option>
                <option value="horeca">Horeca</option>
                <option value="kantoor">Kantoor</option>
                <option value="productie">Productie</option>
                <option value="gezondheidszorg">Gezondheidszorg</option>
                <option value="onderwijs">Onderwijs</option>
                <option value="overig">Overig</option>
              </select>
              {errors.typeBedrijf && (
                <p className="text-xs text-error-500">{errors.typeBedrijf.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={vorigeStap}>
          ← Vorige stap
        </Button>
        <Button type="submit" size="lg">
          Volgende stap →
        </Button>
      </div>
    </form>
  )
}

