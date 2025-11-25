/**
 * Helper functions for generating friendly document URLs
 */

/**
 * Converts a Supabase storage URL to a friendly document URL
 * 
 * Example:
 * Input:  https://dxztyhwiwgrxjnlohapm.supabase.co/storage/v1/object/public/documents/contracten/voorwaarden_1764063793522.pdf
 * Output: /api/documenten/voorwaarden_1764063793522.pdf
 * 
 * @param supabaseUrl The Supabase storage URL
 * @returns A friendly URL path
 */
export function getFriendlyDocumentUrl(supabaseUrl: string): string {
  try {
    const url = new URL(supabaseUrl)
    
    // Extract the file path from Supabase URL
    // Format: /storage/v1/object/public/{bucket}/{path}
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/)
    
    if (match && match[1]) {
      const filePath = match[1]
      // Extract filename from path (e.g., "contracten/voorwaarden_xxx.pdf" -> "voorwaarden_xxx.pdf")
      const filename = filePath.split('/').pop() || filePath
      
      // Return friendly URL
      return `/api/documenten/${filename}`
    }
    
    // Fallback: return original URL if we can't parse it
    return supabaseUrl
  } catch (error) {
    // If URL parsing fails, return original URL
    return supabaseUrl
  }
}

/**
 * Extracts the Supabase storage URL from a friendly document URL
 * This is used by the API route to fetch the actual file
 * 
 * @param friendlyUrl The friendly URL path
 * @returns The original Supabase storage URL (if stored in database) or null
 */
export function getSupabaseUrlFromFilename(filename: string): string | null {
  // This will be handled by the API route which will look up the file in the database
  // For now, we'll reconstruct it based on the filename pattern
  // In a real implementation, you might want to store a mapping in the database
  
  // The API route will handle the lookup from the database
  return null
}

