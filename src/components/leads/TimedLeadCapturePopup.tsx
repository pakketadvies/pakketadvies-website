'use client'

import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { LeadCaptureForm } from '@/components/leads/LeadCaptureForm'
import {
  dismissLeadPopup,
  hasRecentLeadCapture,
  inferLeadFlow,
  wasPopupRecentlyDismissed,
} from '@/lib/lead-capture'

interface TimedLeadCapturePopupProps {
  pathname: string
}

const POPUP_DELAY_MS = 20000

export function TimedLeadCapturePopup({ pathname }: TimedLeadCapturePopupProps) {
  const [isOpen, setIsOpen] = useState(false)

  const flow = useMemo(() => inferLeadFlow(pathname), [pathname])
  const shouldSkipRoute = pathname.startsWith('/admin') || pathname.startsWith('/contract-viewer')

  useEffect(() => {
    if (shouldSkipRoute || hasRecentLeadCapture(30) || wasPopupRecentlyDismissed(24)) {
      return
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true)
    }, POPUP_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [pathname, shouldSkipRoute])

  const closePopup = () => {
    setIsOpen(false)
    dismissLeadPopup()
  }

  return (
    <Modal isOpen={isOpen} onClose={closePopup} size="md" showCloseButton>
      <LeadCaptureForm
        source="timed_popup"
        flow={flow}
        title="Nog even slim vergelijken?"
        subtitle="Laat je e-mailadres achter en ontvang een passend energievoorstel zonder verplichtingen."
        buttonText="Ontvang mijn aanbod"
        onSuccess={() => setIsOpen(false)}
      />
    </Modal>
  )
}
