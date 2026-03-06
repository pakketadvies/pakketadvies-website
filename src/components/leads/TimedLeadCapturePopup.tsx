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
        title="Voorkom te hoge energiekosten"
        subtitle="We sturen je een persoonlijk voorstel met actuele tarieven en duidelijke keuzes."
        buttonText="Ja, stuur mijn aanbod"
        onComplete={() => setIsOpen(false)}
      />
    </Modal>
  )
}
