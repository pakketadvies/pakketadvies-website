'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, Plus, X } from '@phosphor-icons/react'
import Link from 'next/link'
import type { Leverancier, Contract, ContractDetailsMaatwerk } from '@/types/admin'

const maatwerkContractSchema = z.object({
  leverancier_id: z.string().min(1, 'Selecteer een leverancier'),
  naam: z.string().min(1, 'Naam is verplicht'),
  beschrijving: z.string().optional(),
  actief: z.boolean(),
  aanbevolen: z.boolean(),
  populair: z.boolean(),
  volgorde: z.number().int().min(0),
  zichtbaar_bij_teruglevering: z.boolean().nullable(), // NULL = altijd, TRUE = alleen bij teruglevering, FALSE = alleen zonder
  
  min_verbruik_elektriciteit: z.number().int().min(0).nullable(),
  min_verbruik_gas: z.number().int().min(0).nullable(),
  custom_tekst: z.string().optional(),
  contact_email: z.string().email('Ongeldig e-mailadres').optional().or(z.literal('')),
  contact_telefoon: z.string().optional(),
  rating: z.number().min(0).max(5),
  aantal_reviews: z.number().int().min(0),
})

type MaatwerkContractFormData = z.infer<typeof maatwerkContractSchema>

interface MaatwerkContractFormProps {
  contract?: Contract & { details_maatwerk?: ContractDetailsMaatwerk }
}

export default function MaatwerkContractForm({ contract }: MaatwerkContractFormProps) {
  const router = useRouter()
  const isEdit = !!contract
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leveranciers, setLeveranciers] = useState<Leverancier[]>([])
  const [voorwaarden, setVoorwaarden] = useState<string[]>(contract?.details_maatwerk?.voorwaarden || [])
  const [newVoorwaarde, setNewVoorwaarde] = useState('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MaatwerkContractFormData>({
    resolver: zodResolver(maatwerkContractSchema),
    defaultValues: {
      leverancier_id: contract?.leverancier_id || '',
      naam: contract?.naam || '',
      beschrijving: contract?.beschrijving || '',
      actief: contract?.actief ?? true,
      aanbevolen: contract?.aanbevolen ?? false,
      populair: contract?.populair ?? false,
      volgorde: contract?.volgorde || 0,
      zichtbaar_bij_teruglevering: contract?.zichtbaar_bij_teruglevering ?? null,
      min_verbruik_elektriciteit: contract?.details_maatwerk?.min_verbruik_elektriciteit || null,
      min_verbruik_gas: contract?.details_maatwerk?.min_verbruik_gas || null,
      custom_tekst: contract?.details_maatwerk?.custom_tekst || '',
      contact_email: contract?.details_maatwerk?.contact_email || '',
      contact_telefoon: contract?.details_maatwerk?.contact_telefoon || '',
      rating: contract?.details_maatwerk?.rating || 0,
      aantal_reviews: contract?.details_maatwerk?.aantal_reviews || 0,
    },
  })

  useEffect(() => {
    const fetchLeveranciers = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('leveranciers')
        .select('*')
        .eq('actief', true)
        .order('naam')
      if (data) setLeveranciers(data)
    }
    fetchLeveranciers()
  }, [])

  const addVoorwaarde = () => {
    if (newVoorwaarde.trim()) {
      setVoorwaarden([...voorwaarden, newVoorwaarde.trim()])
      setNewVoorwaarde('')
    }
  }

  const removeVoorwaarde = (index: number) => {
    setVoorwaarden(voorwaarden.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: MaatwerkContractFormData) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const contractData = {
        leverancier_id: data.leverancier_id,
        naam: data.naam,
        type: 'maatwerk',
        beschrijving: data.beschrijving || null,
        actief: data.actief,
        aanbevolen: data.aanbevolen,
        populair: data.populair,
        volgorde: data.volgorde,
        zichtbaar_bij_teruglevering: data.zichtbaar_bij_teruglevering,
      }

      let contractId = contract?.id

      if (isEdit && contractId) {
        const { error: contractError } = await supabase
          .from('contracten')
          .update(contractData)
          .eq('id', contractId)
        if (contractError) throw contractError
      } else {
        const { data: newContract, error: contractError } = await supabase
          .from('contracten')
          .insert(contractData)
          .select()
          .single()
        if (contractError) throw contractError
        contractId = newContract.id
      }

      const detailsData = {
        contract_id: contractId,
        min_verbruik_elektriciteit: data.min_verbruik_elektriciteit,
        min_verbruik_gas: data.min_verbruik_gas,
        custom_tekst: data.custom_tekst || null,
        contact_email: data.contact_email || null,
        contact_telefoon: data.contact_telefoon || null,
        voorwaarden,
        rating: data.rating,
        aantal_reviews: data.aantal_reviews,
      }

      const { error: detailsError } = await supabase
        .from('contract_details_maatwerk')
        .upsert(detailsData)

      if (detailsError) throw detailsError

      router.push('/admin/contracten')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/contracten" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-brand-navy-500">
            {isEdit ? 'Maatwerk contract bewerken' : 'Nieuw maatwerk contract'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Pas de gegevens aan' : 'Voeg een nieuw maatwerk contract toe voor specifieke klanten'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {/* Basis */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Basis informatie</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Leverancier <span className="text-red-500">*</span>
              </label>
              <select {...register('leverancier_id')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading}>
                <option value="">Selecteer een leverancier</option>
                {leveranciers.map((lev) => (
                  <option key={lev.id} value={lev.id}>{lev.naam}</option>
                ))}
              </select>
              {errors.leverancier_id && <p className="text-sm text-red-600">{errors.leverancier_id.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Contract naam <span className="text-red-500">*</span>
              </label>
              <input {...register('naam')} type="text" placeholder="Bijv. Zakelijk Op Maat" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              {errors.naam && <p className="text-sm text-red-600">{errors.naam.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Beschrijving</label>
              <textarea {...register('beschrijving')} rows={3} placeholder="Korte beschrijving" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all resize-none" disabled={loading} />
            </div>
          </div>
        </div>

        {/* Vereisten & Contact */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Vereisten & contact</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Minimaal elektriciteit verbruik (kWh/jaar)
                </label>
                <input {...register('min_verbruik_elektriciteit', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : parseInt(v) })} type="number" placeholder="10000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
                <p className="text-xs text-gray-500">Minimaal verbruik om in aanmerking te komen</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Minimaal gas verbruik (m³/jaar)
                </label>
                <input {...register('min_verbruik_gas', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : parseInt(v) })} type="number" placeholder="5000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">Contact e-mail</label>
                <input {...register('contact_email')} type="email" placeholder="maatwerk@leverancier.nl" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
                {errors.contact_email && <p className="text-sm text-red-600">{errors.contact_email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">Contact telefoon</label>
                <input {...register('contact_telefoon')} type="tel" placeholder="088 123 4567" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Custom tekst</label>
              <textarea {...register('custom_tekst')} rows={4} placeholder="Specifieke informatie over dit maatwerk contract..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all resize-none" disabled={loading} />
              <p className="text-xs text-gray-500">Deze tekst wordt getoond op de website</p>
            </div>
          </div>
        </div>

        {/* Voorwaarden */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Voorwaarden</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" value={newVoorwaarde} onChange={(e) => setNewVoorwaarde(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVoorwaarde())} placeholder="Voeg voorwaarde toe" className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              <button type="button" onClick={addVoorwaarde} className="px-4 py-2 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg transition-colors" disabled={loading}>
                <Plus size={20} weight="bold" />
              </button>
            </div>
            <ul className="space-y-2">
              {voorwaarden.map((v, i) => (
                <li key={i} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{v}</span>
                  <button type="button" onClick={() => removeVoorwaarde(i)} className="p-1 hover:bg-red-100 rounded transition-colors" disabled={loading}>
                    <X size={16} className="text-red-600" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reviews & Display */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Reviews & weergave</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Rating (0-5)</label>
              <input {...register('rating', { valueAsNumber: true })} type="number" step="0.1" min="0" max="5" placeholder="4.5" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Aantal reviews</label>
              <input {...register('aantal_reviews', { valueAsNumber: true })} type="number" min="0" placeholder="123" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Volgorde</label>
              <input {...register('volgorde', { valueAsNumber: true })} type="number" min="0" placeholder="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
            </div>

            {/* Zichtbaar bij teruglevering */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Zichtbaarheid bij teruglevering
              </label>
              <Controller
                name="zichtbaar_bij_teruglevering"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value === null ? 'null' : field.value ? 'true' : 'false'}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === 'null' ? null : value === 'true')
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                    disabled={loading}
                  >
                    <option value="null">Altijd tonen</option>
                    <option value="true">Alleen tonen bij teruglevering (zonnepanelen)</option>
                    <option value="false">Alleen tonen zonder teruglevering</option>
                  </select>
                )}
              />
              <p className="text-xs text-gray-500">Bepaalt wanneer dit contract zichtbaar is op basis van teruglevering</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input {...register('actief')} type="checkbox" id="actief_maat" className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2" disabled={loading} />
              <label htmlFor="actief_maat" className="text-sm font-medium text-brand-navy-500 cursor-pointer">Contract is actief (zichtbaar op website)</label>
            </div>

            <div className="flex items-center gap-3">
              <input {...register('aanbevolen')} type="checkbox" id="aanbevolen_maat" className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2" disabled={loading} />
              <label htmlFor="aanbevolen_maat" className="text-sm font-medium text-brand-navy-500 cursor-pointer">Markeer als aanbevolen contract</label>
            </div>

            <div className="flex items-center gap-3">
              <input {...register('populair')} type="checkbox" id="populair_maat" className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2" disabled={loading} />
              <label htmlFor="populair_maat" className="text-sm font-medium text-brand-navy-500 cursor-pointer">Markeer als populair contract</label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 bg-white rounded-xl border-2 border-gray-200 p-6">
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEdit ? 'Opslaan...' : 'Toevoegen...'}
              </>
            ) : (
              <>
                <CheckCircle size={20} weight="fill" />
                {isEdit ? 'Wijzigingen opslaan' : 'Contract toevoegen'}
              </>
            )}
          </button>
          <Link href="/admin/contracten" className="px-6 py-3 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-all">
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  )
}

