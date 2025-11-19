import AdminLayout from '@/components/admin/AdminLayout'
import LeverancierForm from '@/components/admin/LeverancierForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Leverancier } from '@/types/admin'

async function getLeverancier(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leveranciers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Leverancier
}

export default async function EditLeverancierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const leverancier = await getLeverancier(id)

  if (!leverancier) {
    notFound()
  }

  return (
    <AdminLayout>
      <LeverancierForm leverancier={leverancier} />
    </AdminLayout>
  )
}

