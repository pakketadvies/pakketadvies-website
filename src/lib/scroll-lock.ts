let activeLocks = 0
let previousBodyOverflow: string | null = null
let previousHtmlOverflow: string | null = null
const sourceCounts = new Map<string, number>()

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function lockBodyScroll(source = 'unknown'): () => void {
  if (!isClient()) {
    return () => {}
  }

  if (activeLocks === 0) {
    previousBodyOverflow = document.body.style.overflow
    previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }

  activeLocks += 1
  sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
  let released = false

  return () => {
    if (released) return
    released = true
    activeLocks = Math.max(0, activeLocks - 1)
    const nextCount = Math.max(0, (sourceCounts.get(source) ?? 0) - 1)
    if (nextCount === 0) {
      sourceCounts.delete(source)
    } else {
      sourceCounts.set(source, nextCount)
    }

    if (activeLocks === 0) {
      document.body.style.overflow = previousBodyOverflow ?? ''
      document.documentElement.style.overflow = previousHtmlOverflow ?? ''
      previousBodyOverflow = null
      previousHtmlOverflow = null
    }
  }
}

export function clearBodyScrollLocks(): void {
  if (!isClient()) return
  activeLocks = 0
  sourceCounts.clear()
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  previousBodyOverflow = null
  previousHtmlOverflow = null
}
