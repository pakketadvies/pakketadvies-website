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

const DEFAULT_POPUP_DELAY_MS = 20000
const HOMEPAGE_POPUP_DELAY_MS = 12000
const POPUP_CLOSE_DELAY_MS = 3000

export function TimedLeadCapturePopup({ pathname }: TimedLeadCapturePopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [canClose, setCanClose] = useState(false)

  const flow = useMemo(() => inferLeadFlow(pathname), [pathname])
  const shouldSkipRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/contract-viewer') ||
    pathname.startsWith('/bekijk-contract')
  const popupDelayMs = pathname === '/' ? HOMEPAGE_POPUP_DELAY_MS : DEFAULT_POPUP_DELAY_MS

  useEffect(() => {
    if (shouldSkipRoute || hasRecentLeadCapture(30) || wasPopupRecentlyDismissed(24)) {
      return
    }

    let closeLockTimer: number | undefined
    const timer = window.setTimeout(() => {
      setIsOpen(true)
      setCanClose(false)
      closeLockTimer = window.setTimeout(() => {
        setCanClose(true)
      }, POPUP_CLOSE_DELAY_MS)
    }, popupDelayMs)

    return () => {
      window.clearTimeout(timer)
      if (closeLockTimer) {
        window.clearTimeout(closeLockTimer)
      }
    }
  }, [pathname, shouldSkipRoute, popupDelayMs])

  const closePopup = () => {
    if (!canClose) return
    setIsOpen(false)
    dismissLeadPopup()
  }

  return (
    <Modal isOpen={isOpen} onClose={closePopup} size="md" showCloseButton closeDisabled={!canClose}>
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
