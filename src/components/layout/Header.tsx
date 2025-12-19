'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { List, X } from '@phosphor-icons/react'
import { ModeSwitch } from './ModeSwitch'

// Lazy load useMode to avoid SSR issues
function useModeSafe() {
  const [mode, setMode] = useState<'zakelijk' | 'particulier'>('zakelijk')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    // Check localStorage or pathname
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pakketadvies-mode') as 'zakelijk' | 'particulier' | null
      if (stored === 'particulier' || stored === 'zakelijk') {
        setMode(stored)
      } else if (window.location.pathname.startsWith('/particulier')) {
        setMode('particulier')
      }
    }
  }, [])
  
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
    { href: '/particulier/vergelijken', label: 'Energie vergelijken' },
    { href: '/particulier/overstappen', label: 'Overstappen' },
    { href: '/particulier/energieprijzen', label: 'Energieprijzen' },
    { href: '/particulier/bespaartips', label: 'Bespaartips' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/contact', label: 'Contact' },
  ]

  const navLinks = mode === 'particulier' ? particuliereNavLinks : zakelijkeNavLinks

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
          <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-2 md:gap-4">
            {/* Logo */}
            <Link 
              href={mode === 'particulier' ? '/particulier' : '/'}
              className="group transition-transform duration-300 hover:scale-105 flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/images/logo-dark.png"
                alt="PakketAdvies"
                width={220}
                height={48}
                className="block w-auto h-8 md:h-12"
                priority
              />
            </Link>

            {/* Mode Switch - Desktop */}
            <div className="hidden lg:flex items-center">
              <ModeSwitch />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
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
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <Link href="/calculator">
                <button className="px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300">
                  Bereken besparing
                </button>
              </Link>
            </div>

            {/* Mode Switch - Mobile/Tablet */}
            <div className="lg:hidden flex items-center">
              <ModeSwitch compact />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Menu"
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
              <Link href="/calculator" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg">
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