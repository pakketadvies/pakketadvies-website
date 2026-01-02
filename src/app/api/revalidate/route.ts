import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * API route to manually revalidate Next.js cache
 * Used after updating contracts in admin to refresh homepage carousel
 */
export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get paths to revalidate from request body
    const body = await request.json()
    const { paths = ['/'] } = body

    if (!Array.isArray(paths)) {
      return NextResponse.json(
        { error: 'Paths array is required' },
        { status: 400 }
      )
    }

    // Revalidate each path
    for (const path of paths) {
      revalidatePath(path, 'page')
      console.log(`✅ Revalidated cache path: ${path}`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully revalidated ${paths.length} path(s)`,
      paths,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('❌ Error revalidating cache:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to revalidate cache' },
      { status: 500 }
    )
  }
}

