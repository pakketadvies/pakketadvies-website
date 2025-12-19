'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { List, X } from '@phosphor-icons/react'

type Audience = 'business' | 'consumer'
const AUDIENCE_COOKIE = 'pa_audience'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365) {
  if (typeof document === 'undefined') return
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [audience, setAudience] = useState<Audience>('business')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fromCookie = getCookie(AUDIENCE_COOKIE) as Audience | undefined
    if (fromCookie === 'business' || fromCookie === 'consumer') {
      setAudience(fromCookie)
      return
    }
    // Fallback: infer from route
    if (pathname?.startsWith('/particulier')) setAudience('consumer')
  }, [pathname])

  const businessNavLinks = [
    { href: '/diensten', label: 'Diensten' },
    { href: '/kennisbank/energieprijzen', label: 'Energieprijzen' },
    { href: '/kennisbank', label: 'Kennisbank' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/contact', label: 'Contact' },
  ]

  const consumerNavLinks = [
    { href: '/particulier/energie-vergelijken', label: 'Energie vergelijken' },
    { href: '/particulier/vast', label: 'Vast' },
    { href: '/particulier/variabel', label: 'Variabel' },
    { href: '/particulier/dynamisch', label: 'Dynamisch' },
    { href: '/particulier/zonnepanelen', label: 'Zonnepanelen' },
    { href: '/particulier/verhuizen', label: 'Verhuizen' },
    { href: '/particulier/klantenservice', label: 'Klantenservice' },
  ]

  const navLinks = audience === 'consumer' ? consumerNavLinks : businessNavLinks
  const homeHref = audience === 'consumer' ? '/particulier' : '/'

  const handleSwitch = (next: Audience) => {
    if (next === audience) return
    setAudience(next)
    setCookie(AUDIENCE_COOKIE, next)
    setIsMobileMenuOpen(false)
    router.push(next === 'consumer' ? '/particulier' : '/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-3' : 'py-5'
    }`}>
      <div className="container-custom">
        <nav className={`rounded-2xl transition-all duration-300 bg-white border border-gray-200 ${
          isScrolled 
            ? 'shadow-xl' 
            : 'shadow-sm'
        }`}>
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link 
              href={homeHref}
              className="group transition-transform duration-300 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/images/logo-dark.png"
                alt="PakketAdvies"
                width={220}
                height={48}
                className="block"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-gray-700 hover:text-brand-teal-600 hover:bg-brand-teal-50 transition-all duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Audience Switch */}
              <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleSwitch('business')}
                  className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    audience === 'business'
                      ? 'bg-brand-navy-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Zakelijk
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitch('consumer')}
                  className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    audience === 'consumer'
                      ? 'bg-brand-navy-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Particulier
                </button>
              </div>

              <Link href={audience === 'consumer' ? '/particulier/energie-vergelijken' : '/calculator'}>
                <button className="px-6 py-3 bg-brand-teal-500 text-white rounded-full font-semibold shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-[1.02] hover:bg-brand-teal-600 transition-all duration-300">
                  {audience === 'consumer' ? 'Vergelijk nu' : 'Bereken besparing'}
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <List className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 px-6 py-4 space-y-2 animate-slide-down">
              {/* Audience Switch (mobile) */}
              <div className="flex items-center bg-white border border-gray-200 rounded-full p-1 mb-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleSwitch('business')}
                  className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    audience === 'business'
                      ? 'bg-brand-navy-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Zakelijk
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitch('consumer')}
                  className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    audience === 'consumer'
                      ? 'bg-brand-navy-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Particulier
                </button>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-3 rounded-xl text-gray-700 hover:text-brand-teal-600 hover:bg-brand-teal-50 transition-all duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={audience === 'consumer' ? '/particulier/energie-vergelijken' : '/calculator'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <button className="w-full px-6 py-3 bg-brand-teal-500 text-white rounded-full font-semibold shadow-lg">
                  {audience === 'consumer' ? 'Vergelijk nu' : 'Bereken besparing'}
                </button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}