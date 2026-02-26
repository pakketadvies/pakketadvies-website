let activeLocks = 0
let previousBodyOverflow: string | null = null
let previousHtmlOverflow: string | null = null
const sourceCounts = new Map<string, number>()

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function updateDebugState() {
  if (!isClient()) return
  const state = {
    activeLocks,
    bodyOverflow: document.body.style.overflow || '(empty)',
    htmlOverflow: document.documentElement.style.overflow || '(empty)',
    sources: Array.from(sourceCounts.entries()).map(([source, count]) => ({ source, count })),
  }
  window.__PA_SCROLL_DEBUG = state
  return state
}

function logDebug(event: string, source: string) {
  if (!isClient()) return
  const state = updateDebugState()
  console.log(`[ScrollLock][${event}]`, {
    source,
    activeLocks: state?.activeLocks ?? 0,
    bodyOverflow: state?.bodyOverflow,
    htmlOverflow: state?.htmlOverflow,
    sources: state?.sources ?? [],
    path: window.location.pathname,
  })
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
  logDebug('lock', source)
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
    logDebug('unlock', source)
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
  logDebug('clear', 'LayoutWrapper')
}

export function getScrollLockDebugState() {
  return {
    activeLocks,
    sources: Array.from(sourceCounts.entries()).map(([source, count]) => ({ source, count })),
  }
}

declare global {
  interface Window {
    __PA_SCROLL_DEBUG?: {
      activeLocks: number
      bodyOverflow: string
      htmlOverflow: string
      sources: Array<{ source: string; count: number }>
    }
  }
}
