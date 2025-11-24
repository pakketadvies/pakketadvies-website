'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, Plus, X, File, FilePdf, Upload } from '@phosphor-icons/react'
import Link from 'next/link'
import type { Leverancier, Contract, ContractDetailsDynamisch } from '@/types/admin'

const dynamischContractSchema = z.object({
  leverancier_id: z.string().min(1, 'Selecteer een leverancier'),
  naam: z.string().min(1, 'Naam is verplicht'),
  beschrijving: z.string().optional(),
  actief: z.boolean(),
  aanbevolen: z.boolean(),
  populair: z.boolean(),
  volgorde: z.number().int().min(0),
  zichtbaar_bij_teruglevering: z.boolean().nullable(), // NULL = altijd, TRUE = alleen bij teruglevering, FALSE = alleen zonder
  
  opslag_elektriciteit: z.number().min(0, 'Opslag moet positief zijn'),
  opslag_gas: z.number().min(0).nullable(),
  opslag_teruglevering: z.number().nullable(), // Kan negatief zijn, meestal 0
  vastrecht_stroom_maand: z.number().min(0, 'Vastrecht moet positief zijn'),
  vastrecht_gas_maand: z.number().min(0, 'Vastrecht moet positief zijn'),
  index_naam: z.string().min(1, 'Index naam is verplicht'),
  max_prijs_cap: z.number().min(0).nullable(),
  groene_energie: z.boolean(),
  opzegtermijn: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  aantal_reviews: z.number().int().min(0),
})

type DynamischContractFormData = z.infer<typeof dynamischContractSchema>

interface DynamischContractFormProps {
  contract?: Contract & { details_dynamisch?: ContractDetailsDynamisch }
}

export default function DynamischContractForm({ contract }: DynamischContractFormProps) {
  const router = useRouter()
  const isEdit = !!contract
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leveranciers, setLeveranciers] = useState<Leverancier[]>([])
  // Voorwaarden kunnen strings zijn (oude formaat) of objecten {naam: string, url?: string, type: 'text' | 'pdf'}
  type VoorwaardeType = string | { naam: string; url?: string; type: 'text' | 'pdf' }
  const [voorwaarden, setVoorwaarden] = useState<VoorwaardeType[]>(() => {
    if (!contract?.details_dynamisch?.voorwaarden) return []
    // Convert old string format to new format for display
    return contract.details_dynamisch.voorwaarden.map(v => {
      try {
        const parsed = JSON.parse(v)
        if (parsed.naam) return parsed
        return v // Legacy string format
      } catch {
        return v // Legacy string format
      }
    })
  })
  const [bijzonderheden, setBijzonderheden] = useState<string[]>(contract?.details_dynamisch?.bijzonderheden || [])
  const [newVoorwaarde, setNewVoorwaarde] = useState('')
  const [newBijzonderheid, setNewBijzonderheid] = useState('')
  const [uploadingPdf, setUploadingPdf] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DynamischContractFormData>({
    resolver: zodResolver(dynamischContractSchema),
    defaultValues: {
      leverancier_id: contract?.leverancier_id || '',
      naam: contract?.naam || '',
      beschrijving: contract?.beschrijving || '',
      actief: contract?.actief ?? true,
      aanbevolen: contract?.aanbevolen ?? false,
      populair: contract?.populair ?? false,
      volgorde: contract?.volgorde || 0,
      zichtbaar_bij_teruglevering: contract?.zichtbaar_bij_teruglevering ?? null,
      opslag_elektriciteit: contract?.details_dynamisch?.opslag_elektriciteit || 0,
      opslag_gas: contract?.details_dynamisch?.opslag_gas || null,
      opslag_teruglevering: contract?.details_dynamisch?.opslag_teruglevering || 0,
      vastrecht_stroom_maand: contract?.details_dynamisch?.vastrecht_stroom_maand || 4.00,
      vastrecht_gas_maand: contract?.details_dynamisch?.vastrecht_gas_maand || 4.00,
      index_naam: contract?.details_dynamisch?.index_naam || 'EPEX Day-Ahead',
      max_prijs_cap: contract?.details_dynamisch?.max_prijs_cap || null,
      groene_energie: contract?.details_dynamisch?.groene_energie ?? false,
      opzegtermijn: contract?.details_dynamisch?.opzegtermijn || 1,
      rating: contract?.details_dynamisch?.rating || 0,
      aantal_reviews: contract?.details_dynamisch?.aantal_reviews || 0,
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
      setVoorwaarden([...voorwaarden, { naam: newVoorwaarde.trim(), type: 'text' }])
      setNewVoorwaarde('')
    }
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Alleen PDF bestanden zijn toegestaan')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Bestand is te groot. Maximum 10MB')
      return
    }

    setUploadingPdf(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `voorwaarden_${Date.now()}.${fileExt}`
      const filePath = `contracten/${fileName}`

      // Upload to storage - try 'documents' bucket first, fallback to 'logos'
      let bucket = 'documents'
      let { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: 'application/pdf',
        })

      // Fallback to logos bucket if documents doesn't exist
      if (uploadError && uploadError.message?.includes('Bucket not found')) {
        bucket = 'logos'
        const retryResult = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            contentType: 'application/pdf',
          })
        uploadError = retryResult.error
      }

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      // Add to voorwaarden
      setVoorwaarden([...voorwaarden, {
        naam: file.name.replace('.pdf', ''),
        url: urlData.publicUrl,
        type: 'pdf'
      }])
    } catch (err: any) {
      setError(err.message || 'Upload mislukt')
    } finally {
      setUploadingPdf(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const removeVoorwaarde = async (index: number) => {
    const voorwaarde = voorwaarden[index]
    
    // If it's a PDF, delete from storage
    if (typeof voorwaarde === 'object' && voorwaarde.type === 'pdf' && voorwaarde.url) {
      try {
        const supabase = createClient()
        // Extract path from URL
        const url = new URL(voorwaarde.url)
        // Extract bucket name and path from URL
        const match = url.pathname.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/)
        if (match) {
          const bucketName = match[1]
          const filePath = match[2]
          await supabase.storage.from(bucketName).remove([filePath])
        }
      } catch (err) {
        console.error('Error deleting PDF from storage:', err)
        // Continue with removal even if delete fails
      }
    }
    
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

  const onSubmit = async (data: DynamischContractFormData) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const contractData = {
        leverancier_id: data.leverancier_id,
        naam: data.naam,
        type: 'dynamisch',
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

      // Convert voorwaarden to database format (JSON strings for objects, plain strings for legacy)
      const voorwaardenForDb = voorwaarden.map(v => {
        if (typeof v === 'object' && v !== null) {
          return JSON.stringify(v)
        }
        return String(v)
      })

      const detailsData = {
        contract_id: contractId,
        opslag_elektriciteit: data.opslag_elektriciteit,
        opslag_gas: data.opslag_gas,
        opslag_teruglevering: data.opslag_teruglevering || 0,
        vastrecht_stroom_maand: data.vastrecht_stroom_maand,
        vastrecht_gas_maand: data.vastrecht_gas_maand,
        index_naam: data.index_naam,
        max_prijs_cap: data.max_prijs_cap,
        groene_energie: data.groene_energie,
        opzegtermijn: data.opzegtermijn,
        voorwaarden: voorwaardenForDb,
        bijzonderheden,
        rating: data.rating,
        aantal_reviews: data.aantal_reviews,
      }

      const { error: detailsError } = await supabase
        .from('contract_details_dynamisch')
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
            {isEdit ? 'Dynamisch contract bewerken' : 'Nieuw dynamisch contract'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Pas de gegevens aan' : 'Voeg een nieuw dynamisch contract toe met variabele tarieven'}
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
              <input {...register('naam')} type="text" placeholder="Bijv. Dynamisch Variabel" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              {errors.naam && <p className="text-sm text-red-600">{errors.naam.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Beschrijving</label>
              <textarea {...register('beschrijving')} rows={3} placeholder="Korte beschrijving" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all resize-none" disabled={loading} />
            </div>
          </div>
        </div>

        {/* Opslagen */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Opslagen op marktprijs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Opslag elektriciteit (€/kWh) <span className="text-red-500">*</span>
              </label>
              <input {...register('opslag_elektriciteit', { valueAsNumber: true })} type="number" step="0.0001" placeholder="0.0200" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              <p className="text-xs text-gray-500">Opslag bovenop spotprijs voor stroom (geldt voor zowel dag als nacht)</p>
              {errors.opslag_elektriciteit && <p className="text-sm text-red-600">{errors.opslag_elektriciteit.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Opslag gas (€/m³)</label>
              <input {...register('opslag_gas', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : parseFloat(v) })} type="number" step="0.0001" placeholder="0.0500" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Opslag teruglevering (€/kWh)</label>
              <input {...register('opslag_teruglevering', { valueAsNumber: true, setValueAs: (v) => v === '' ? 0 : parseFloat(v) })} type="number" step="0.0001" placeholder="0.0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              <p className="text-xs text-gray-500">Opslag voor teruglevering. Meestal 0 of negatief. Wordt gebruikt: P_teruglever = S_enkel + opslag_teruglevering</p>
            </div>

            {/* Vastrecht Stroom */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Vastrecht Stroom per maand (€) *</label>
              <input {...register('vastrecht_stroom_maand', { valueAsNumber: true })} type="number" step="0.01" placeholder="4.00" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              {errors.vastrecht_stroom_maand && <p className="text-sm text-red-600">{errors.vastrecht_stroom_maand.message}</p>}
            </div>

            {/* Vastrecht Gas */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Vastrecht Gas per maand (€) *</label>
              <input {...register('vastrecht_gas_maand', { valueAsNumber: true })} type="number" step="0.01" placeholder="4.00" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              {errors.vastrecht_gas_maand && <p className="text-sm text-red-600">{errors.vastrecht_gas_maand.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Index naam <span className="text-red-500">*</span>
              </label>
              <input {...register('index_naam')} type="text" placeholder="EPEX Day-Ahead" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              {errors.index_naam && <p className="text-sm text-red-600">{errors.index_naam.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Maximale prijscap (€/kWh)</label>
              <input {...register('max_prijs_cap', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : parseFloat(v) })} type="number" step="0.0001" placeholder="0.5000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
              <p className="text-xs text-gray-500">Optioneel: maximale prijs bescherming</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">Opzegtermijn (maanden)</label>
              <input {...register('opzegtermijn', { valueAsNumber: true })} type="number" min="0" placeholder="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              <input {...register('groene_energie')} type="checkbox" id="groene_energie_dyn" className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2" disabled={loading} />
              <label htmlFor="groene_energie_dyn" className="text-sm font-medium text-brand-navy-500 cursor-pointer">100% groene energie</label>
            </div>
          </div>
        </div>

        {/* Voorwaarden & Bijzonderheden */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Voorwaarden & bijzonderheden</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-brand-navy-500">Voorwaarden</label>
              
              {/* Text input voor tekstvoorwaarden */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVoorwaarde}
                  onChange={(e) => setNewVoorwaarde(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVoorwaarde())}
                  placeholder="Voeg tekstvoorwaarde toe"
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                  disabled={loading || uploadingPdf}
                />
                <button
                  type="button"
                  onClick={addVoorwaarde}
                  className="px-4 py-2 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={loading || uploadingPdf}
                >
                  <Plus size={20} weight="bold" />
                </button>
              </div>

              {/* PDF upload button */}
              <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-brand-teal-300 rounded-lg hover:bg-brand-teal-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  disabled={loading || uploadingPdf}
                />
                {uploadingPdf ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-teal-600"></div>
                    <span className="text-sm text-brand-navy-600">Uploaden...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="text-brand-teal-600" />
                    <span className="text-sm text-brand-navy-600 font-medium">PDF uploaden</span>
                  </>
                )}
              </label>

              {/* Lijst van voorwaarden */}
              <ul className="space-y-2">
                {voorwaarden.map((voorwaarde, index) => {
                  const isPdf = typeof voorwaarde === 'object' && voorwaarde.type === 'pdf'
                  const naam = typeof voorwaarde === 'object' ? voorwaarde.naam : voorwaarde
                  const url = typeof voorwaarde === 'object' ? voorwaarde.url : null

                  return (
                    <li key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isPdf ? (
                          <FilePdf size={16} className="text-red-600 flex-shrink-0" />
                        ) : (
                          <File size={16} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700 truncate">{naam}</span>
                        {isPdf && url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-teal-600 hover:text-brand-teal-700 font-medium ml-auto flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Bekijk
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVoorwaarde(index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                        disabled={loading || uploadingPdf}
                      >
                        <X size={16} className="text-red-600" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-brand-navy-500">Bijzonderheden</label>
              <div className="flex gap-2">
                <input type="text" value={newBijzonderheid} onChange={(e) => setNewBijzonderheid(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBijzonderheid())} placeholder="Voeg bijzonderheid toe" className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all" disabled={loading} />
                <button type="button" onClick={addBijzonderheid} className="px-4 py-2 bg-brand-teal-600 hover:bg-brand-teal-700 text-white rounded-lg transition-colors" disabled={loading}>
                  <Plus size={20} weight="bold" />
                </button>
              </div>
              <ul className="space-y-2">
                {bijzonderheden.map((b, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{b}</span>
                    <button type="button" onClick={() => removeBijzonderheid(i)} className="p-1 hover:bg-red-100 rounded transition-colors" disabled={loading}>
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
              <input {...register('actief')} type="checkbox" id="actief_dyn" className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2" disabled={loading} />
              <label htmlFor="actief_dyn" className="text-sm font-medium text-brand-navy-500 cursor-pointer">Contract is actief (zichtbaar op website)</label>
            </div>

            <div className="flex items-center gap-3">
              <input {...register('aanbevolen')} type="checkbox" id="aanbevolen_dyn" className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2" disabled={loading} />
              <label htmlFor="aanbevolen_dyn" className="text-sm font-medium text-brand-navy-500 cursor-pointer">Markeer als aanbevolen contract</label>
            </div>

            <div className="flex items-center gap-3">
              <input {...register('populair')} type="checkbox" id="populair_dyn" className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2" disabled={loading} />
              <label htmlFor="populair_dyn" className="text-sm font-medium text-brand-navy-500 cursor-pointer">Markeer als populair contract</label>
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

