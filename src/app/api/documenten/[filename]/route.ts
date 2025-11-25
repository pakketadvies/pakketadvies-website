import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route to proxy document files from Supabase Storage
 * 
 * This provides friendly URLs like:
 *   /api/documenten/voorwaarden_1764063793522.pdf
 * 
 * Instead of the Supabase URL:
 *   https://dxztyhwiwgrxjnlohapm.supabase.co/storage/v1/object/public/documents/contracten/voorwaarden_1764063793522.pdf
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxztyhwiwgrxjnlohapm.supabase.co'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Sanitize filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    // Extract file extension
    const extension = filename.split('.').pop()?.toLowerCase()
    
    // Determine content type
    let contentType = 'application/octet-stream'
    if (extension === 'pdf') {
      contentType = 'application/pdf'
    } else if (extension === 'doc') {
      contentType = 'application/msword'
    } else if (extension === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }

    // Construct the Supabase public URL
    // Files are stored in: documents/contracten/{filename} or logos/contracten/{filename}
    let supabaseUrl = `${SUPABASE_URL}/storage/v1/object/public/documents/contracten/${filename}`
    
    // Fetch the file from Supabase (public bucket, so no auth needed)
    const response = await fetch(supabaseUrl, {
      method: 'GET',
      headers: {
        'Accept': contentType,
      },
    })

    // If not found in documents bucket, try logos bucket
    if (!response.ok && response.status === 404) {
      supabaseUrl = `${SUPABASE_URL}/storage/v1/object/public/logos/contracten/${filename}`
      const retryResponse = await fetch(supabaseUrl, {
        method: 'GET',
        headers: {
          'Accept': contentType,
        },
      })
      
      if (!retryResponse.ok) {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
      
      const buffer = Buffer.from(await retryResponse.arrayBuffer())
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: response.status }
      )
    }

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer())

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    })
  } catch (error: any) {
    console.error('Error serving document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

