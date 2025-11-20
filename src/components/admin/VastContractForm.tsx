'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, Plus, X } from '@phosphor-icons/react'
import Link from 'next/link'
import type { Leverancier, Contract, ContractDetailsVast } from '@/types/admin'

const vastContractSchema = z.object({
  // Basis contract info
  leverancier_id: z.string().min(1, 'Selecteer een leverancier'),
  naam: z.string().min(1, 'Naam is verplicht'),
  beschrijving: z.string().optional(),
  actief: z.boolean(),
  aanbevolen: z.boolean(),
  populair: z.boolean(),
  volgorde: z.number().int().min(0),

  // Vast contract specifiek
  looptijd: z.enum(['1', '2', '3', '5']),
  heeft_dubbele_meter: z.boolean(), // NIEUW: enkele vs dubbele meter
  tarief_elektriciteit_enkel: z.number().min(0, 'Tarief moet positief zijn').nullable(), // NIEUW: enkeltarief
  tarief_elektriciteit_normaal: z.number().min(0, 'Tarief moet positief zijn').nullable(), // Nu nullable
  tarief_elektriciteit_dal: z.number().min(0).nullable(),
  tarief_gas: z.number().min(0).nullable(),
  vaste_kosten_maand: z.number().min(0).nullable(),
  groene_energie: z.boolean(),
  prijsgarantie: z.boolean(),
  opzegtermijn: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  aantal_reviews: z.number().int().min(0),
}).refine(
  (data) => {
    // Als dubbele meter: normaal EN dal vereist
    // Als enkele meter: enkel vereist
    if (data.heeft_dubbele_meter) {
      return data.tarief_elektriciteit_normaal !== null && data.tarief_elektriciteit_dal !== null
    } else {
      return data.tarief_elektriciteit_enkel !== null
    }
  },
  {
    message: 'Vul de juiste elektriciteits tarieven in (enkel OF normaal+dal)',
    path: ['tarief_elektriciteit_enkel'],
  }
)

type VastContractFormData = z.infer<typeof vastContractSchema>

interface VastContractFormProps {
  contract?: Contract & { details_vast?: ContractDetailsVast }
}

export default function VastContractForm({ contract }: VastContractFormProps) {
  const router = useRouter()
  const isEdit = !!contract
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leveranciers, setLeveranciers] = useState<Leverancier[]>([])
  const [voorwaarden, setVoorwaarden] = useState<string[]>(contract?.details_vast?.voorwaarden || [])
  const [bijzonderheden, setBijzonderheden] = useState<string[]>(contract?.details_vast?.bijzonderheden || [])
  const [newVoorwaarde, setNewVoorwaarde] = useState('')
  const [newBijzonderheid, setNewBijzonderheid] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<VastContractFormData>({
    resolver: zodResolver(vastContractSchema),
    defaultValues: {
      leverancier_id: contract?.leverancier_id || '',
      naam: contract?.naam || '',
      beschrijving: contract?.beschrijving || '',
      actief: contract?.actief ?? true,
      aanbevolen: contract?.aanbevolen ?? false,
      populair: contract?.populair ?? false,
      volgorde: contract?.volgorde || 0,
      looptijd: (contract?.details_vast?.looptijd?.toString() || '1') as '1' | '2' | '3' | '5',
      heeft_dubbele_meter: contract?.details_vast?.tarief_elektriciteit_dal !== null,
      tarief_elektriciteit_enkel: contract?.details_vast?.tarief_elektriciteit_normaal || null,
      tarief_elektriciteit_normaal: contract?.details_vast?.tarief_elektriciteit_normaal || null,
      tarief_elektriciteit_dal: contract?.details_vast?.tarief_elektriciteit_dal || null,
      tarief_gas: contract?.details_vast?.tarief_gas || null,
      vaste_kosten_maand: contract?.details_vast?.vaste_kosten_maand || null,
      groene_energie: contract?.details_vast?.groene_energie ?? false,
      prijsgarantie: contract?.details_vast?.prijsgarantie ?? false,
      opzegtermijn: contract?.details_vast?.opzegtermijn || 1,
      rating: contract?.details_vast?.rating || 0,
      aantal_reviews: contract?.details_vast?.aantal_reviews || 0,
    },
  })

  const heeftDubbeleMeter = watch('heeft_dubbele_meter')

  // Fetch leveranciers
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

  const addBijzonderheid = () => {
    if (newBijzonderheid.trim()) {
      setBijzonderheden([...bijzonderheden, newBijzonderheid.trim()])
      setNewBijzonderheid('')
    }
  }

  const removeBijzonderheid = (index: number) => {
    setBijzonderheden(bijzonderheden.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: VastContractFormData) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const contractData = {
        leverancier_id: data.leverancier_id,
        naam: data.naam,
        type: 'vast',
        beschrijving: data.beschrijving || null,
        actief: data.actief,
        aanbevolen: data.aanbevolen,
        populair: data.populair,
        volgorde: data.volgorde,
      }

      let contractId = contract?.id

      if (isEdit && contractId) {
        // Update contract
        const { error: contractError } = await supabase
          .from('contracten')
          .update(contractData)
          .eq('id', contractId)

        if (contractError) throw contractError
      } else {
        // Create new contract
        const { data: newContract, error: contractError } = await supabase
          .from('contracten')
          .insert(contractData)
          .select()
          .single()

        if (contractError) throw contractError
        contractId = newContract.id
      }

      // Insert/update details
      const detailsData = {
        contract_id: contractId,
        looptijd: parseInt(data.looptijd),
        tarief_elektriciteit_normaal: data.tarief_elektriciteit_normaal,
        tarief_elektriciteit_dal: data.tarief_elektriciteit_dal,
        tarief_gas: data.tarief_gas,
        vaste_kosten_maand: data.vaste_kosten_maand,
        groene_energie: data.groene_energie,
        prijsgarantie: data.prijsgarantie,
        opzegtermijn: data.opzegtermijn,
        voorwaarden,
        bijzonderheden,
        rating: data.rating,
        aantal_reviews: data.aantal_reviews,
      }

      const { error: detailsError } = await supabase
        .from('contract_details_vast')
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/contracten"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-brand-navy-500">
            {isEdit ? 'Vast contract bewerken' : 'Nieuw vast contract'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Pas de gegevens aan' : 'Voeg een nieuw vast contract toe met vaste tarieven'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Basis Informatie */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Basis informatie</h2>
          <div className="space-y-4">
            {/* Leverancier */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Leverancier <span className="text-red-500">*</span>
              </label>
              <select
                {...register('leverancier_id')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              >
                <option value="">Selecteer een leverancier</option>
                {leveranciers.map((lev) => (
                  <option key={lev.id} value={lev.id}>
                    {lev.naam}
                  </option>
                ))}
              </select>
              {errors.leverancier_id && (
                <p className="text-sm text-red-600">{errors.leverancier_id.message}</p>
              )}
            </div>

            {/* Naam */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Contract naam <span className="text-red-500">*</span>
              </label>
              <input
                {...register('naam')}
                type="text"
                placeholder="Bijv. Stroom Vast 3 jaar"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              />
              {errors.naam && (
                <p className="text-sm text-red-600">{errors.naam.message}</p>
              )}
            </div>

            {/* Beschrijving */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Beschrijving</label>
              <textarea
                {...register('beschrijving')}
                rows={3}
                placeholder="Korte beschrijving van het contract"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all resize-none"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Tarieven */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Tarieven (exclusief belastingen)</h2>
          <p className="text-sm text-gray-600 mb-6">
            ⚠️ Vul alle tarieven <strong>exclusief</strong> energiebelasting, ODE, netbeheerkosten en BTW in. Het systeem berekent deze automatisch.
          </p>
          
          <div className="space-y-4">
            {/* Looptijd */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Looptijd <span className="text-red-500">*</span>
              </label>
              <select
                {...register('looptijd')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              >
                <option value="1">1 jaar</option>
                <option value="2">2 jaar</option>
                <option value="3">3 jaar</option>
                <option value="5">5 jaar</option>
              </select>
            </div>

            {/* Enkele vs Dubbele Meter Toggle */}
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('heeft_dubbele_meter')}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                  disabled={loading}
                />
                <div>
                  <span className="font-semibold text-brand-navy-500">Dubbele meter (dag/nacht tarief)</span>
                  <p className="text-xs text-gray-600">Vink aan als contract verschillende dag- en nachttarieven heeft</p>
                </div>
              </label>
            </div>

            {/* Elektriciteits Tarieven */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!heeftDubbeleMeter ? (
                // ENKELTARIEF
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-brand-navy-500">
                    Elektriciteit enkeltarief (€/kWh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('tarief_elektriciteit_enkel', { 
                      valueAsNumber: true,
                      setValueAs: (v) => v === '' ? null : parseFloat(v)
                    })}
                    type="number"
                    step="0.000001"
                    placeholder="0.12294"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">Bijvoorbeeld: 0,12294 (tot 6 decimalen mogelijk)</p>
                  {errors.tarief_elektriciteit_enkel && (
                    <p className="text-sm text-red-600">{errors.tarief_elektriciteit_enkel.message}</p>
                  )}
                </div>
              ) : (
                // NORMAAL + DAL TARIEF
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-brand-navy-500">
                      Elektriciteit normaal/dag (€/kWh) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('tarief_elektriciteit_normaal', { 
                        valueAsNumber: true,
                        setValueAs: (v) => v === '' ? null : parseFloat(v)
                      })}
                      type="number"
                      step="0.000001"
                      placeholder="0.12294"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">Dagtarief (bijv. 06:00-23:00)</p>
                    {errors.tarief_elektriciteit_normaal && (
                      <p className="text-sm text-red-600">{errors.tarief_elektriciteit_normaal.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-brand-navy-500">
                      Elektriciteit dal/nacht (€/kWh) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('tarief_elektriciteit_dal', { 
                        valueAsNumber: true,
                        setValueAs: (v) => v === '' ? null : parseFloat(v)
                      })}
                      type="number"
                      step="0.000001"
                      placeholder="0.11000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">Nachttarief (bijv. 23:00-06:00)</p>
                    {errors.tarief_elektriciteit_dal && (
                      <p className="text-sm text-red-600">{errors.tarief_elektriciteit_dal.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* Gas */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Gas (€/m³)
                </label>
                <input
                  {...register('tarief_gas', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : parseFloat(v)
                  })}
                  type="number"
                  step="0.000001"
                  placeholder="0.44746"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Laat leeg als geen gas</p>
              </div>

              {/* Vaste Kosten */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Vastrecht per maand (€)
                </label>
                <input
                  {...register('vaste_kosten_maand', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : parseFloat(v)
                  })}
                  type="number"
                  step="0.01"
                  placeholder="8.25"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Bijv. €99/jaar = €8,25/maand</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Eigenschappen */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Contract eigenschappen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opzegtermijn */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Opzegtermijn (maanden)
              </label>
              <input
                {...register('opzegtermijn', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                {...register('groene_energie')}
                type="checkbox"
                id="groene_energie"
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="groene_energie" className="text-sm font-medium text-brand-navy-500 cursor-pointer">
                100% groene energie
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register('prijsgarantie')}
                type="checkbox"
                id="prijsgarantie"
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="prijsgarantie" className="text-sm font-medium text-brand-navy-500 cursor-pointer">
                Prijsgarantie tijdens looptijd
              </label>
            </div>
          </div>
        </div>

        {/* Voorwaarden & Bijzonderheden */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Voorwaarden & bijzonderheden</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voorwaarden */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-brand-navy-500">Voorwaarden</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVoorwaarde}
                  onChange={(e) => setNewVoorwaarde(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVoorwaarde())}
                  placeholder="Voeg voorwaarde toe"
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addVoorwaarde}
                  className="px-4 py-2 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg transition-colors"
                  disabled={loading}
                >
                  <Plus size={20} weight="bold" />
                </button>
              </div>
              <ul className="space-y-2">
                {voorwaarden.map((voorwaarde, index) => (
                  <li key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{voorwaarde}</span>
                    <button
                      type="button"
                      onClick={() => removeVoorwaarde(index)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      disabled={loading}
                    >
                      <X size={16} className="text-red-600" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bijzonderheden */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-brand-navy-500">Bijzonderheden</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBijzonderheid}
                  onChange={(e) => setNewBijzonderheid(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBijzonderheid())}
                  placeholder="Voeg bijzonderheid toe"
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addBijzonderheid}
                  className="px-4 py-2 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg transition-colors"
                  disabled={loading}
                >
                  <Plus size={20} weight="bold" />
                </button>
              </div>
              <ul className="space-y-2">
                {bijzonderheden.map((bijzonderheid, index) => (
                  <li key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{bijzonderheid}</span>
                    <button
                      type="button"
                      onClick={() => removeBijzonderheid(index)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      disabled={loading}
                    >
                      <X size={16} className="text-red-600" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews & Display */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Reviews & weergave</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rating */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Rating (0-5)
              </label>
              <input
                {...register('rating', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="4.5"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              />
            </div>

            {/* Aantal reviews */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Aantal reviews
              </label>
              <input
                {...register('aantal_reviews', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="123"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              />
            </div>

            {/* Volgorde */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Volgorde
              </label>
              <input
                {...register('volgorde', { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Lagere nummers verschijnen eerst</p>
            </div>
          </div>

          {/* Status checkboxes */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                {...register('actief')}
                type="checkbox"
                id="actief"
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="actief" className="text-sm font-medium text-brand-navy-500 cursor-pointer">
                Contract is actief (zichtbaar op website)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register('aanbevolen')}
                type="checkbox"
                id="aanbevolen"
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="aanbevolen" className="text-sm font-medium text-brand-navy-500 cursor-pointer">
                Markeer als aanbevolen contract
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                {...register('populair')}
                type="checkbox"
                id="populair"
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="populair" className="text-sm font-medium text-brand-navy-500 cursor-pointer">
                Markeer als populair contract
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 bg-white rounded-xl border-2 border-gray-200 p-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
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
          <Link
            href="/admin/contracten"
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-all"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  )
}

