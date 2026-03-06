import type {
  ComparisonLeadExtraContext,
  ComparisonLeadFlow,
  ComparisonLeadSource,
} from '@/types/comparison-leads'

export const LEAD_CAPTURE_DONE_KEY = 'pa_lead_capture_done_at'
export const LEAD_CAPTURE_SESSION_ID_KEY = 'pa_lead_capture_session_id'
export const LEAD_CAPTURE_POPUP_DISMISSED_KEY = 'pa_lead_capture_popup_dismissed_at'

export function inferLeadFlow(pathname: string): ComparisonLeadFlow {
  if (!pathname) return 'unknown'
  if (pathname.startsWith('/particulier')) return 'consumer'
  if (pathname.startsWith('/zakelijk')) return 'business'
  if (pathname.startsWith('/calculator')) return 'unknown'
  return 'unknown'
}

export function getOrCreateLeadSessionId(): string {
  if (typeof window === 'undefined') return ''
  const existing = window.localStorage.getItem(LEAD_CAPTURE_SESSION_ID_KEY)
  if (existing) return existing

  const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  window.localStorage.setItem(LEAD_CAPTURE_SESSION_ID_KEY, generated)
  return generated
}

export function hasRecentLeadCapture(days = 30): boolean {
  if (typeof window === 'undefined') return false
  const raw = window.localStorage.getItem(LEAD_CAPTURE_DONE_KEY)
  if (!raw) return false
  const timestamp = Number(raw)
  if (!Number.isFinite(timestamp)) return false
  return Date.now() - timestamp < days * 24 * 60 * 60 * 1000
}

export function markLeadCaptured() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LEAD_CAPTURE_DONE_KEY, String(Date.now()))
}

export function dismissLeadPopup() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LEAD_CAPTURE_POPUP_DISMISSED_KEY, String(Date.now()))
}

export function wasPopupRecentlyDismissed(hours = 24): boolean {
  if (typeof window === 'undefined') return false
  const raw = window.localStorage.getItem(LEAD_CAPTURE_POPUP_DISMISSED_KEY)
  if (!raw) return false
  const timestamp = Number(raw)
  if (!Number.isFinite(timestamp)) return false
  return Date.now() - timestamp < hours * 60 * 60 * 1000
}

export function getTrackingParams() {
  if (typeof window === 'undefined') {
    return {
      pagePath: null,
      referrer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmContent: null,
      utmTerm: null,
      fbclid: null,
      gclid: null,
    }
  }

  const url = new URL(window.location.href)
  const q = url.searchParams
  return {
    pagePath: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer || null,
    utmSource: q.get('utm_source'),
    utmMedium: q.get('utm_medium'),
    utmCampaign: q.get('utm_campaign'),
    utmContent: q.get('utm_content'),
    utmTerm: q.get('utm_term'),
    fbclid: q.get('fbclid'),
    gclid: q.get('gclid'),
  }
}

export async function captureComparisonLead(input: {
  email: string
  phone?: string
  source: ComparisonLeadSource
  flow: ComparisonLeadFlow
  consentText?: string
}) {
  const tracking = getTrackingParams()
  const sessionId = getOrCreateLeadSessionId()

  const response = await fetch('/api/comparison-leads/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      phone: input.phone || null,
      source: input.source,
      flow: input.flow,
      pagePath: tracking.pagePath,
      referrer: tracking.referrer,
      utmSource: tracking.utmSource,
      utmMedium: tracking.utmMedium,
      utmCampaign: tracking.utmCampaign,
      utmContent: tracking.utmContent,
      utmTerm: tracking.utmTerm,
      fbclid: tracking.fbclid,
      gclid: tracking.gclid,
      sessionId,
      consentText: input.consentText || null,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Lead opslaan mislukt')
  }

  markLeadCaptured()
  return data
}

export async function updateComparisonLeadContext(input: {
  leadId: string
  extraContext: ComparisonLeadExtraContext
}) {
  const response = await fetch(`/api/comparison-leads/${input.leadId}/context`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      extraContext: input.extraContext,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Aanvullende informatie opslaan mislukt')
  }

  return data
}
