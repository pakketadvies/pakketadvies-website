import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
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

    // Get tags to revalidate from request body
    const body = await request.json()
    const { tags } = body

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags array is required' },
        { status: 400 }
      )
    }

    // Revalidate each tag
    for (const tag of tags) {
      revalidateTag(tag)
      console.log(`✅ Revalidated cache tag: ${tag}`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully revalidated ${tags.length} cache tag(s)`,
      tags,
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

