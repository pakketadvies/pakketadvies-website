import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Forbidden - Admin access required' }
  }

  return { ok: true as const }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Lead id ontbreekt' }, { status: 400 })
    }

    const serviceSupabase = createServiceRoleClient()
    const { error } = await serviceSupabase.from('comparison_leads').delete().eq('id', id)

    if (error) {
      console.error('Error deleting comparison lead:', error)
      return NextResponse.json(
        { error: 'Verwijderen van lead is mislukt: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id })
  } catch (error: unknown) {
    console.error('Unexpected error deleting comparison lead:', error)
    return NextResponse.json({ error: 'Onverwachte fout bij verwijderen lead.' }, { status: 500 })
  }
}
