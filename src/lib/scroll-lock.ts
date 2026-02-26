let activeLocks = 0
let previousBodyOverflow: string | null = null
let previousHtmlOverflow: string | null = null

export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') {
    return () => {}
  }

  if (activeLocks === 0) {
    previousBodyOverflow = document.body.style.overflow
    previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }

  activeLocks += 1
  let released = false

  return () => {
    if (released) return
    released = true
    activeLocks = Math.max(0, activeLocks - 1)

    if (activeLocks === 0) {
      document.body.style.overflow = previousBodyOverflow ?? ''
      document.documentElement.style.overflow = previousHtmlOverflow ?? ''
      previousBodyOverflow = null
      previousHtmlOverflow = null
    }
  }
}

export function clearBodyScrollLocks(): void {
  if (typeof document === 'undefined') return
  activeLocks = 0
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  previousBodyOverflow = null
  previousHtmlOverflow = null
}
