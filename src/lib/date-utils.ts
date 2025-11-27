/**
 * Utility functions for date formatting and conversion
 */

/**
 * Converts a date from Dutch format (DD-MM-YYYY) to ISO format (YYYY-MM-DD)
 * Also handles other formats like DD/MM/YYYY, DD.MM.YYYY
 */
export function convertToISODate(dateString: string | undefined | null): string | undefined {
  if (!dateString || !dateString.trim()) {
    return undefined
  }

  const cleaned = dateString.trim().replace(/\s+/g, '')

  // Try different formats: dd-mm-yyyy, d-m-yyyy, dd/mm/yyyy, dd.mm.yyyy
  const patterns = [
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
  ]

  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      const day = parseInt(match[1], 10)
      const month = parseInt(match[2], 10)
      const year = parseInt(match[3], 10)

      // Validate date
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
        // Format as YYYY-MM-DD
        const paddedDay = String(day).padStart(2, '0')
        const paddedMonth = String(month).padStart(2, '0')
        return `${year}-${paddedMonth}-${paddedDay}`
      }
    }
  }

  // If already in ISO format (YYYY-MM-DD), return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned
  }

  // If we can't parse it, return undefined (will cause validation error)
  return undefined
}

/**
 * Converts a date from ISO format (YYYY-MM-DD) to Dutch format (DD-MM-YYYY)
 */
export function convertToDutchDate(isoDate: string | undefined | null): string | undefined {
  if (!isoDate || !isoDate.trim()) {
    return undefined
  }

  const match = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    const year = match[1]
    const month = match[2]
    const day = match[3]
    return `${day}-${month}-${year}`
  }

  return undefined
}

