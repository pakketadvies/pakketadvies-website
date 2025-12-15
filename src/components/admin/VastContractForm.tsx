'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, Plus, X, File, FilePdf, FileText, Upload } from '@phosphor-icons/react'
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
  zichtbaar_bij_teruglevering: z.boolean().nullable(), // NULL = altijd, TRUE = alleen bij teruglevering, FALSE = alleen zonder
  target_audience: z.enum(['particulier', 'zakelijk', 'both']), // NIEUW: address type targeting
  verbruik_type: z.enum(['kleinverbruik', 'grootverbruik', 'beide']), // NIEUW: verbruik type filtering
  tonen_op_homepage: z.boolean(), // NIEUW: tonen op homepage carousel

  // Vast contract specifiek
  looptijd: z.enum(['1', '2', '3', '4', '5']),
  tarief_elektriciteit_enkel: z.number().min(0, 'Tarief moet positief zijn').nullable(),
  tarief_elektriciteit_normaal: z.number().min(0, 'Tarief moet positief zijn').nullable(),
  tarief_elektriciteit_dal: z.number().min(0).nullable(),
  tarief_gas: z.number().min(0).nullable(),
  tarief_teruglevering_kwh: z.number().min(0, 'Teruglevertarief moet positief zijn'),
  
  // Vastrechten (apart voor stroom en gas)
  vastrecht_stroom_maand: z.number().min(0, 'Vastrecht moet positief zijn'),
  vastrecht_gas_maand: z.number().min(0, 'Vastrecht moet positief zijn'),
  
  groene_energie: z.boolean(),
  prijsgarantie: z.boolean(),
  opzegtermijn: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  aantal_reviews: z.number().int().min(0),
})

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
  // Voorwaarden zijn alleen documenten (PDF of DOC) met {naam: string, url: string, type: 'pdf' | 'doc'}
  type VoorwaardeType = { naam: string; url: string; type: 'pdf' | 'doc' }
  const [voorwaarden, setVoorwaarden] = useState<VoorwaardeType[]>(() => {
    if (!contract?.details_vast?.voorwaarden) return []
    // Filter alleen documenten (met url en type pdf/doc), negeer oude tekstvoorwaarden
    return contract.details_vast.voorwaarden
      .map(v => {
        try {
          const parsed = JSON.parse(v)
          // Alleen documenten met url en type pdf of doc
          if (parsed && typeof parsed === 'object' && parsed.url && (parsed.type === 'pdf' || parsed.type === 'doc')) {
            return parsed as VoorwaardeType
          }
          return null
        } catch {
          // Legacy string format - negeren
          return null
        }
      })
      .filter((v): v is VoorwaardeType => v !== null)
  })
  const [bijzonderheden, setBijzonderheden] = useState<string[]>(contract?.details_vast?.bijzonderheden || [])
  const [newBijzonderheid, setNewBijzonderheid] = useState('')
  const [uploadingDocument, setUploadingDocument] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
      zichtbaar_bij_teruglevering: contract?.zichtbaar_bij_teruglevering ?? null,
      target_audience: (contract?.target_audience as 'particulier' | 'zakelijk' | 'both') || 'both',
      verbruik_type: (contract?.details_vast?.verbruik_type as 'kleinverbruik' | 'grootverbruik' | 'beide') || 'beide',
      tonen_op_homepage: contract?.tonen_op_homepage ?? false,
      looptijd: (contract?.details_vast?.looptijd?.toString() || '1') as '1' | '2' | '3' | '4' | '5',
      tarief_elektriciteit_enkel: contract?.details_vast?.tarief_elektriciteit_enkel || null,
      tarief_elektriciteit_normaal: contract?.details_vast?.tarief_elektriciteit_normaal || null,
      tarief_elektriciteit_dal: contract?.details_vast?.tarief_elektriciteit_dal || null,
      tarief_gas: contract?.details_vast?.tarief_gas || null,
      tarief_teruglevering_kwh: contract?.details_vast?.tarief_teruglevering_kwh || 0.00,
      vastrecht_stroom_maand: contract?.details_vast?.vastrecht_stroom_maand || 4.00,
      vastrecht_gas_maand: contract?.details_vast?.vastrecht_gas_maand || 4.00,
      groene_energie: contract?.details_vast?.groene_energie ?? false,
      prijsgarantie: contract?.details_vast?.prijsgarantie ?? false,
      opzegtermijn: contract?.details_vast?.opzegtermijn || 1,
      rating: contract?.details_vast?.rating || 0,
      aantal_reviews: contract?.details_vast?.aantal_reviews || 0,
    },
  })

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

  // Set leverancier_id after leveranciers are loaded (for edit mode)
  useEffect(() => {
    if (isEdit && contract?.leverancier_id && leveranciers.length > 0) {
      setValue('leverancier_id', contract.leverancier_id)
    }
  }, [isEdit, contract?.leverancier_id, leveranciers, setValue])

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validate all files first
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    const allowedExtensions = ['.pdf', '.doc', '.docx']
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()?.toLowerCase()

      if (!fileExt || !allowedExtensions.includes(`.${fileExt}`)) {
        invalidFiles.push(file.name)
        continue
      }

      if (!allowedTypes.includes(file.type) && fileExt) {
        if (!allowedExtensions.includes(`.${fileExt}`)) {
          invalidFiles.push(file.name)
          continue
        }
      }

      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (te groot)`)
        continue
      }

      validFiles.push(file)
    }

    if (invalidFiles.length > 0) {
      setError(`De volgende bestanden kunnen niet worden geüpload: ${invalidFiles.join(', ')}. Alleen PDF en Word bestanden (.pdf, .doc, .docx) tot 10MB zijn toegestaan.`)
      event.target.value = ''
      return
    }

    if (validFiles.length === 0) {
      event.target.value = ''
      return
    }

    setUploadingDocument(true)
    setError(null)

    const supabase = createClient()
    
    // Check authentication once
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setError('Je bent niet ingelogd. Log opnieuw in en probeer het opnieuw.')
      setUploadingDocument(false)
      event.target.value = ''
      return
    }

    console.log(`📤 Starting upload of ${validFiles.length} file(s)...`)

    // Upload all files
    const uploadedVoorwaarden: VoorwaardeType[] = []
    const failedUploads: string[] = []

    for (const file of validFiles) {
      try {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
        const timestamp = Date.now() + Math.random()
        const fileName = `voorwaarden_${timestamp}.${fileExt}`
        const filePath = `contracten/${fileName}`
        const docType: 'pdf' | 'doc' = fileExt === 'pdf' ? 'pdf' : 'doc'
        const contentType = file.type || (
          docType === 'pdf' ? 'application/pdf' :
          fileExt === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
          'application/msword'
        )

        let bucket = 'documents'
        let uploadData: any = null
        let uploadError: any = null

        try {
          const uploadResult = await supabase.storage
            .from(bucket)
            .upload(filePath, file, { contentType, upsert: false })
          uploadData = uploadResult.data
          uploadError = uploadResult.error
        } catch (err: any) {
          uploadError = err
        }

        if (uploadError) {
          if (uploadError.message?.includes('Bucket not found') ||
              uploadError.message?.includes('not found') ||
              uploadError.statusCode === '404' ||
              uploadError.status === 404) {
            bucket = 'logos'
            try {
              const retryResult = await supabase.storage
                .from(bucket)
                .upload(filePath, file, { contentType, upsert: false })
              uploadError = retryResult.error
              uploadData = retryResult.data
            } catch (retryErr: any) {
              uploadError = retryErr
            }
          }
        }

        if (uploadError || !uploadData || !uploadData.path) {
          failedUploads.push(file.name)
          continue
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
        uploadedVoorwaarden.push({
          naam: file.name.replace(/\.(pdf|doc|docx)$/i, ''),
          url: urlData.publicUrl,
          type: docType
        })
      } catch (err: any) {
        failedUploads.push(file.name)
      }
    }

    if (uploadedVoorwaarden.length > 0) {
      setVoorwaarden([...voorwaarden, ...uploadedVoorwaarden])
    }

    if (failedUploads.length > 0) {
      setError(`${failedUploads.length} bestand(en) konden niet worden geüpload: ${failedUploads.join(', ')}${uploadedVoorwaarden.length > 0 ? '. De rest is wel toegevoegd.' : ''}`)
    } else if (uploadedVoorwaarden.length === 0) {
      setError('Geen bestanden konden worden geüpload.')
    }

    setUploadingDocument(false)
    event.target.value = ''
  }

  const removeVoorwaarde = async (index: number) => {
    const voorwaarde = voorwaarden[index]
    
    // Delete document from storage
    if (voorwaarde?.url) {
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
        console.error('Error deleting document from storage:', err)
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
        zichtbaar_bij_teruglevering: data.zichtbaar_bij_teruglevering,
        target_audience: data.target_audience,
        tonen_op_homepage: data.tonen_op_homepage,
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

      // Convert voorwaarden to database format (JSON strings)
      const voorwaardenForDb = voorwaarden.map(v => JSON.stringify(v))

      // Insert/update details
      const detailsData = {
        contract_id: contractId,
        looptijd: parseInt(data.looptijd),
        tarief_elektriciteit_enkel: data.tarief_elektriciteit_enkel,
        tarief_elektriciteit_normaal: data.tarief_elektriciteit_normaal,
        tarief_elektriciteit_dal: data.tarief_elektriciteit_dal,
        tarief_gas: data.tarief_gas,
        tarief_teruglevering_kwh: data.tarief_teruglevering_kwh,
        vastrecht_stroom_maand: data.vastrecht_stroom_maand,
        vastrecht_gas_maand: data.vastrecht_gas_maand,
        groene_energie: data.groene_energie,
        prijsgarantie: data.prijsgarantie,
        opzegtermijn: data.opzegtermijn,
        verbruik_type: data.verbruik_type,
        voorwaarden: voorwaardenForDb,
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
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-sm text-red-700 font-medium">
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-bold">⚠️</span>
              <div className="flex-1">
                <strong>Fout:</strong> {error}
                <br />
                <span className="text-xs text-red-600 mt-1 block">Check de browser console (F12 → Console tab) voor meer details</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
                aria-label="Sluiten"
              >
                <X size={16} />
              </button>
            </div>
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

            {/* NIEUW: Target Audience */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Doelgroep <span className="text-red-500">*</span>
              </label>
              <select
                {...register('target_audience')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              >
                <option value="both">Alle adressen (particulier & zakelijk)</option>
                <option value="particulier">Alleen particulier (woonfunctie)</option>
                <option value="zakelijk">Alleen zakelijk (andere functie)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Bepaal voor welke doelgroep dit contract wordt getoond op basis van adrescheck (BAG API).
              </p>
            </div>

            {/* Verbruik Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-brand-navy-500">
                Verbruik Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('verbruik_type')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
                disabled={loading}
              >
                <option value="beide">Beide (kleinverbruik en grootverbruik)</option>
                <option value="kleinverbruik">Alleen kleinverbruik (≤3x80A / ≤G25)</option>
                <option value="grootverbruik">Alleen grootverbruik (&gt;3x80A / &gt;G25)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Bepaalt voor welk verbruikstype dit contract zichtbaar is op basis van aansluitwaarden
              </p>
              {errors.verbruik_type && (
                <p className="text-sm text-red-500 mt-1">{errors.verbruik_type.message}</p>
              )}
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
                <option value="4">4 jaar</option>
                <option value="5">5 jaar</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-brand-teal-50 border-2 border-brand-teal-200 rounded-lg">
              <p className="text-sm text-brand-teal-900">
                <strong>💡 Let op:</strong> Vul altijd alle 3 de tarieven in (enkeltarief, normaal én dal). De klant kiest later welk tarief bij zijn/haar meter past.
              </p>
            </div>

            {/* Elektriciteits Tarieven - ALLE 3 ALTIJD ZICHTBAAR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Enkeltarief */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Elektriciteit enkeltarief (€/kWh) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('tarief_elektriciteit_enkel', { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : parseFloat(v)
                  })}
                  type="number"
                  step="0.00000001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Voor enkele meters</p>
                {errors.tarief_elektriciteit_enkel && (
                  <p className="text-sm text-red-600">{errors.tarief_elektriciteit_enkel.message}</p>
                )}
              </div>

              {/* Normaal Tarief */}
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
                  step="0.00000001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Voor dubbele meters (dag)</p>
                {errors.tarief_elektriciteit_normaal && (
                  <p className="text-sm text-red-600">{errors.tarief_elektriciteit_normaal.message}</p>
                )}
              </div>

              {/* Dal Tarief */}
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
                  step="0.00000001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Voor dubbele meters (nacht)</p>
                {errors.tarief_elektriciteit_dal && (
                  <p className="text-sm text-red-600">{errors.tarief_elektriciteit_dal.message}</p>
                )}
              </div>
            </div>

            {/* Gas en Vastrechten */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  step="0.00000001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Laat leeg als geen gas</p>
              </div>

              {/* Teruglevering */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Teruglevering (€/kWh) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('tarief_teruglevering_kwh', { 
                    valueAsNumber: true
                  })}
                  type="number"
                  step="0.00000001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Kosten voor teruglevering aan net</p>
                {errors.tarief_teruglevering_kwh && (
                  <p className="text-sm text-red-600">{errors.tarief_teruglevering_kwh.message}</p>
                )}
              </div>
            </div>

            {/* Vastrechten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Vastrecht Stroom */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Vastrecht Stroom per maand (€) *
                </label>
                <input
                  {...register('vastrecht_stroom_maand', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="4.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                {errors.vastrecht_stroom_maand && (
                  <p className="text-sm text-red-600">{errors.vastrecht_stroom_maand.message}</p>
                )}
                <p className="text-xs text-gray-500">Bijv. €48/jaar = €4,00/maand</p>
              </div>

              {/* Vastrecht Gas */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-navy-500">
                  Vastrecht Gas per maand (€) *
                </label>
                <input
                  {...register('vastrecht_gas_maand', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="4.00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all font-mono"
                  disabled={loading}
                />
                {errors.vastrecht_gas_maand && (
                  <p className="text-sm text-red-600">{errors.vastrecht_gas_maand.message}</p>
                )}
                <p className="text-xs text-gray-500">Bijv. €48/jaar = €4,00/maand</p>
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
              
              {/* Document upload button (PDF of Word) - Multiple files supported */}
              <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-brand-teal-300 rounded-lg hover:bg-brand-teal-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  disabled={loading || uploadingDocument}
                />
                {uploadingDocument ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-teal-600"></div>
                    <span className="text-sm text-brand-navy-600">Uploaden...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} className="text-brand-teal-600" />
                    <span className="text-sm text-brand-navy-600 font-medium">PDF of Word bestand(en) uploaden</span>
                  </>
                )}
              </label>
              <p className="text-xs text-gray-500">Je kunt meerdere bestanden tegelijk selecteren</p>

              {/* Lijst van voorwaarden (alleen documenten) */}
              <ul className="space-y-2">
                {voorwaarden.length === 0 ? (
                  <li className="text-sm text-gray-500 italic py-2">Nog geen voorwaarden toegevoegd</li>
                ) : (
                  voorwaarden.map((voorwaarde, index) => {
                    const isPdf = voorwaarde.type === 'pdf'
                    const isDoc = voorwaarde.type === 'doc'

                    return (
                      <li key={index} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {isPdf ? (
                            <FilePdf size={16} className="text-red-600 flex-shrink-0" />
                          ) : isDoc ? (
                            <FileText size={16} className="text-brand-teal-600 flex-shrink-0" />
                          ) : (
                            <File size={16} className="text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm text-gray-700 truncate">{voorwaarde.naam}</span>
                          {voorwaarde.url && (
                            <a
                              href={voorwaarde.url}
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
                          disabled={loading || uploadingDocument}
                        >
                          <X size={16} className="text-red-600" />
                        </button>
                      </li>
                    )
                  })
                )}
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

            <div className="flex items-center gap-3">
              <input
                {...register('tonen_op_homepage')}
                type="checkbox"
                id="tonen_op_homepage"
                className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
                disabled={loading}
              />
              <label htmlFor="tonen_op_homepage" className="text-sm font-medium text-brand-navy-500 cursor-pointer">
                Tonen op homepage carousel
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

