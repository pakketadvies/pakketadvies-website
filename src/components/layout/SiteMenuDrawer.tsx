'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { lockBodyScroll } from '@/lib/scroll-lock'

type Audience = 'business' | 'consumer'

type NavLink = { href: string; label: string }

interface SiteMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
  audience: Audience
  onSwitchAudience: (next: Audience) => void
  navLinks: NavLink[]
  primaryCta: { href: string; label: string }
}

export function SiteMenuDrawer({
  isOpen,
  onClose,
  audience,
  onSwitchAudience,
  navLinks,
  primaryCta,
}: SiteMenuDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  // Keep mounted for exit animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // Next tick → animate in
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    }

    // Animate out
    setVisible(false)
    const t = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(t)
  }, [isOpen])

  // Lock body scroll when open (important for mobile)
  useEffect(() => {
    if (!mounted) return
    return lockBodyScroll()
  }, [mounted])

  // ESC to close + focus on open
  useEffect(() => {
    if (!mounted) return
    closeBtnRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Minimal focus trap: keep focus inside the panel
      if (e.key === 'Tab') {
        const panel = panelRef.current
        if (!panel) return
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"]),input,select,textarea'
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        } else if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mounted, onClose])

  const groupedLinks = useMemo(() => {
    if (audience !== 'consumer') {
      return [{ title: 'Menu', links: navLinks }]
    }

    const contractTypes = navLinks.filter((l) => ['/particulier/vast', '/particulier/variabel', '/particulier/dynamisch'].includes(l.href))
    const primary = navLinks.filter((l) => l.href === '/particulier/energie-vergelijken')
    const rest = navLinks.filter(
      (l) => !contractTypes.includes(l) && !primary.includes(l)
    )
    return [
      { title: 'Particulier', links: primary },
      { title: 'Contracttypes', links: contractTypes },
      { title: 'Meer', links: rest },
    ]
  }, [audience, navLinks])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Sluit menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-300 ease-out ${
          visible
            ? 'translate-x-0'
            : 'translate-x-full sm:translate-x-full'
        }`}
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)',
          willChange: 'transform'
        }}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Menu</p>
            <p className="text-sm font-semibold text-brand-navy-600">
              {audience === 'consumer' ? 'Particulier' : 'Zakelijk'}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Sluit menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Audience switch */}
        <div className="px-5 pt-5">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSwitchAudience('business')}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  audience === 'business'
                    ? 'bg-brand-navy-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Zakelijk
              </button>
              <button
                type="button"
                onClick={() => onSwitchAudience('consumer')}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  audience === 'consumer'
                    ? 'bg-brand-navy-500 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Particulier
              </button>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {groupedLinks.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{group.title}</p>
              <div className="space-y-1">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="block px-4 py-3 rounded-xl text-gray-800 hover:bg-brand-teal-50 hover:text-brand-teal-700 transition-all font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky CTA */}
        <div className="p-5 border-t border-gray-200 bg-white">
          <Link
            href={primaryCta.href}
            onClick={onClose}
            className="block w-full text-center px-6 py-4 bg-brand-teal-500 text-white rounded-2xl font-semibold shadow-lg shadow-brand-teal-500/25 hover:bg-brand-teal-600 transition-all"
          >
            {primaryCta.label}
          </Link>
        </div>
      </div>
    </div>
  )
}


