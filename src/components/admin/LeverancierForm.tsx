'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Buildings, Upload, X, CheckCircle, ArrowLeft } from '@phosphor-icons/react'
import Link from 'next/link'
import Image from 'next/image'
import type { Leverancier } from '@/types/admin'

const leverancierSchema = z.object({
  naam: z.string().min(1, 'Naam is verplicht'),
  website: z.string().url('Vul een geldige URL in').optional().or(z.literal('')),
  over_leverancier: z.string().optional(),
  actief: z.boolean(),
  volgorde: z.number().int().min(0),
})

type LeverancierFormData = z.infer<typeof leverancierSchema>

interface LeverancierFormProps {
  leverancier?: Leverancier
}

export default function LeverancierForm({ leverancier }: LeverancierFormProps) {
  const router = useRouter()
  const isEdit = !!leverancier
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(leverancier?.logo_url || null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeverancierFormData>({
    resolver: zodResolver(leverancierSchema),
    defaultValues: {
      naam: leverancier?.naam || '',
      website: leverancier?.website || '',
      over_leverancier: leverancier?.over_leverancier || '',
      actief: leverancier?.actief ?? true,
      volgorde: leverancier?.volgorde || 0,
    },
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const onSubmit = async (data: LeverancierFormData) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let logo_url = leverancier?.logo_url || null

      // Upload logo if new file
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `leveranciers/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath)

        logo_url = urlData.publicUrl
      }

      const leverancierData = {
        naam: data.naam,
        website: data.website || null,
        over_leverancier: data.over_leverancier || null,
        logo_url,
        actief: data.actief,
        volgorde: data.volgorde,
      }

      if (isEdit) {
        // Update existing
        const { error: updateError } = await supabase
          .from('leveranciers')
          .update(leverancierData)
          .eq('id', leverancier.id)

        if (updateError) throw updateError
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('leveranciers')
          .insert(leverancierData)

        if (insertError) throw insertError
      }

      router.push('/admin/leveranciers')
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
          href="/admin/leveranciers"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-brand-navy-500">
            {isEdit ? 'Leverancier bewerken' : 'Nieuwe leverancier'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Pas de gegevens van de leverancier aan' : 'Voeg een nieuwe energieleverancier toe'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border-2 border-gray-200 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-navy-500">Logo</label>
            {logoPreview ? (
              <div className="relative w-32 h-32 rounded-lg border-2 border-gray-200 overflow-hidden group">
                <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            ) : (
              <label className="block w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-teal-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Upload size={32} />
                  <span className="text-xs mt-2">Upload logo</span>
                </div>
              </label>
            )}
            <p className="text-xs text-gray-500">Aanbevolen: PNG of SVG, max 2MB</p>
          </div>

          {/* Naam */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-navy-500">
              Naam <span className="text-red-500">*</span>
            </label>
            <input
              {...register('naam')}
              type="text"
              placeholder="Bijv. Vattenfall"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
              disabled={loading}
            />
            {errors.naam && (
              <p className="text-sm text-red-600">{errors.naam.message}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-navy-500">Website</label>
            <input
              {...register('website')}
              type="url"
              placeholder="https://www.leverancier.nl"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
              disabled={loading}
            />
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>

          {/* Over leverancier */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-navy-500">Over leverancier</label>
            <textarea
              {...register('over_leverancier')}
              rows={5}
              placeholder="Korte beschrijving over de leverancier (wordt getoond in 'Over leverancier' tab)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Deze tekst wordt getoond bij de contractresultaten</p>
          </div>

          {/* Volgorde */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-navy-500">Volgorde</label>
            <input
              {...register('volgorde', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">Lagere nummers verschijnen eerst in de lijst</p>
            {errors.volgorde && (
              <p className="text-sm text-red-600">{errors.volgorde.message}</p>
            )}
          </div>

          {/* Actief */}
          <div className="flex items-center gap-3">
            <input
              {...register('actief')}
              type="checkbox"
              id="actief"
              className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
              disabled={loading}
            />
            <label htmlFor="actief" className="text-sm font-medium text-brand-navy-500 cursor-pointer">
              Leverancier is actief (zichtbaar op website)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
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
                {isEdit ? 'Wijzigingen opslaan' : 'Leverancier toevoegen'}
              </>
            )}
          </button>
          <Link
            href="/admin/leveranciers"
            className="px-6 py-3 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-all"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  )
}

