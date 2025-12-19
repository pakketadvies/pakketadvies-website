'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { List, X } from '@phosphor-icons/react'
import { ModeSwitch } from './ModeSwitch'

// Simple mode detection based on pathname
function useModeSafe() {
  const pathname = usePathname()
  const mode = pathname?.startsWith('/particulier') ? 'particulier' : 'zakelijk'
  
  return { mode, isParticulier: mode === 'particulier', isZakelijk: mode === 'zakelijk' }
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { mode } = useModeSafe()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Menu items based on mode
  const zakelijkeNavLinks = [
    { href: '/diensten', label: 'Diensten' },
    { href: '/kennisbank/energieprijzen', label: 'Energieprijzen' },
    { href: '/kennisbank', label: 'Kennisbank' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/contact', label: 'Contact' },
  ]

  const particuliereNavLinks = [
    { href: '/particulier/vergelijken', label: 'Vergelijken' },
    { href: '/particulier/overstappen', label: 'Overstappen' },
    { href: '/particulier/energieprijzen', label: 'Prijzen' },
    { href: '/particulier/bespaartips', label: 'Tips' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/contact', label: 'Contact' },
  ]

  const navLinks = mode === 'particulier' ? particuliereNavLinks : zakelijkeNavLinks

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-2' : 'py-3'
    }`}>
      <div className="container-custom">
        <nav className={`rounded-xl transition-all duration-300 bg-white border border-gray-200 ${
          isScrolled 
            ? 'shadow-lg' 
            : 'shadow-sm'
        }`}>
          <div className="flex items-center justify-between px-3 md:px-4 py-2 gap-2">
            {/* Logo */}
            <Link 
              href={mode === 'particulier' ? '/particulier' : '/'}
              className="group transition-transform duration-300 hover:scale-105 flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/images/logo-dark.png"
                alt="PakketAdvies"
                width={180}
                height={40}
                className="block w-auto h-7 md:h-9"
                priority
              />
            </Link>

            {/* Mode Switch - Desktop (compact, next to logo) */}
            <div className="hidden lg:flex items-center flex-shrink-0">
              <ModeSwitch />
            </div>

            {/* Desktop Navigation - Compact */}
            <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-2xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-2.5 py-1.5 rounded-lg text-gray-700 hover:text-brand-teal-600 hover:bg-brand-teal-50 transition-all duration-200 text-sm font-medium whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Button - Compact */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Link href="/calculator">
                <button className="px-4 py-2 bg-brand-teal-500 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:bg-brand-teal-600 transition-all duration-200 whitespace-nowrap">
                  Bereken besparing
                </button>
              </Link>
            </div>

            {/* Mobile: Mode Switch + Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <ModeSwitch compact />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <List className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 px-4 py-3 space-y-1 animate-slide-down">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:text-brand-teal-600 hover:bg-brand-teal-50 transition-all duration-200 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/calculator" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full mt-2 px-4 py-2.5 bg-brand-teal-500 text-white rounded-lg font-semibold text-sm shadow-md">
                  Bereken besparing
                </button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}