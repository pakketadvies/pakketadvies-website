/**
 * Revalidate Next.js cache tags
 * Call this after updating contracts in admin to refresh homepage carousel
 */
export async function revalidateCache(tags: string[]): Promise<boolean> {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to revalidate cache:', error)
      return false
    }

    const data = await response.json()
    console.log('✅ Cache revalidated:', data)
    return true
  } catch (error) {
    console.error('Error revalidating cache:', error)
    return false
  }
}

