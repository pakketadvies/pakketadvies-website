import { notFound, redirect } from 'next/navigation'

/**
 * Dynamic route for /aanbieding/[slug]
 * Handles base64 encoded slugs like /aanbieding/cGFydGljdW
 */
export default async function AanbiedingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Try to decode base64 slug
  let decodedSlug: string | null = null
  try {
    decodedSlug = Buffer.from(slug, 'base64').toString('utf-8')
  } catch (e) {
    // Not base64, use as-is
    decodedSlug = slug
  }

  // Map decoded slugs to actual routes
  const slugMap: Record<string, string> = {
    'particulier': '/aanbieding/particulier-3-jaar',
    'mkb': '/aanbieding/mkb-3-jaar',
    'grootzakelijk': '/aanbieding/grootzakelijk',
    'dynamisch': '/aanbieding/dynamisch',
  }

  // Check if decoded slug matches a known route
  if (decodedSlug && slugMap[decodedSlug]) {
    redirect(slugMap[decodedSlug])
  }

  // Check if slug itself matches a known route
  if (slugMap[slug]) {
    redirect(slugMap[slug])
  }

  // If no match, show 404
  notFound()
}

