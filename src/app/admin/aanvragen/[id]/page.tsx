import AdminLayout from '@/components/admin/AdminLayout'
import AanvraagDetail from '@/components/admin/AanvraagDetail'
import { createClient } from '@/lib/supabase/server'
import type { ContractAanvraag } from '@/types/aanvragen'
import { notFound } from 'next/navigation'

async function getAanvraag(id: string) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('contractaanvragen')
    .select(`
      *,
      contract:contracten(id, naam, type),
      leverancier:leveranciers(id, naam, logo_url)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as ContractAanvraag
}

export default async function AanvraagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const aanvraag = await getAanvraag(id)

  if (!aanvraag) {
    notFound()
  }

  return (
    <AdminLayout>
      <AanvraagDetail aanvraag={aanvraag} />
    </AdminLayout>
  )
}

