import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * DELETE /api/admin/delete-all-aanvragen
 * 
 * Verwijdert ALLE contractaanvragen en gerelateerde records
 * Alleen toegankelijk voor admins
 * 
 * ⚠️ WAARSCHUWING: Dit is een destructieve operatie!
 */
export async function DELETE() {
  try {
    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient()

    // Check if user is admin (via regular client for auth check)
    const { createClient } = await import('@/lib/supabase/server')
    const authSupabase = await createClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await authSupabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Delete all related records first
    console.log('🗑️ [delete-all-aanvragen] Deleting contract_viewer_access records...')
    const { error: viewerError } = await supabase
      .from('contract_viewer_access')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (using a condition that's always true)

    if (viewerError) {
      console.error('❌ [delete-all-aanvragen] Error deleting contract_viewer_access:', viewerError)
      return NextResponse.json(
        { error: 'Fout bij verwijderen contract_viewer_access: ' + viewerError.message },
        { status: 500 }
      )
    }

    console.log('🗑️ [delete-all-aanvragen] Deleting email_logs records...')
    const { error: emailLogsError } = await supabase
      .from('email_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (emailLogsError) {
      console.error('❌ [delete-all-aanvragen] Error deleting email_logs:', emailLogsError)
      return NextResponse.json(
        { error: 'Fout bij verwijderen email_logs: ' + emailLogsError.message },
        { status: 500 }
      )
    }

    // Delete all contractaanvragen
    console.log('🗑️ [delete-all-aanvragen] Deleting all contractaanvragen...')
    const { error: aanvragenError } = await supabase
      .from('contractaanvragen')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (aanvragenError) {
      console.error('❌ [delete-all-aanvragen] Error deleting contractaanvragen:', aanvragenError)
      return NextResponse.json(
        { error: 'Fout bij verwijderen contractaanvragen: ' + aanvragenError.message },
        { status: 500 }
      )
    }

    // Verify deletion
    const { count: aanvragenCount } = await supabase
      .from('contractaanvragen')
      .select('*', { count: 'exact', head: true })

    const { count: emailLogsCount } = await supabase
      .from('email_logs')
      .select('*', { count: 'exact', head: true })

    const { count: viewerAccessCount } = await supabase
      .from('contract_viewer_access')
      .select('*', { count: 'exact', head: true })

    console.log('✅ [delete-all-aanvragen] Deletion complete:', {
      aanvragen: aanvragenCount,
      emailLogs: emailLogsCount,
      viewerAccess: viewerAccessCount
    })

    return NextResponse.json({
      success: true,
      message: 'Alle contractaanvragen zijn verwijderd',
      counts: {
        aanvragen: aanvragenCount || 0,
        emailLogs: emailLogsCount || 0,
        viewerAccess: viewerAccessCount || 0
      }
    })
  } catch (error: any) {
    console.error('❌ [delete-all-aanvragen] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

