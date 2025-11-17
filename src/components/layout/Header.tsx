'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { List, X } from '@phosphor-icons/react'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/diensten', label: 'Diensten' },
    { href: '/kennisbank', label: 'Kennisbank' },
    { href: '/over-ons', label: 'Over ons' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-3' : 'py-5'
    }`}>
      <div className="container-custom">
        <nav className={`rounded-2xl transition-all duration-300 ${
          isScrolled 
            ? 'glass border border-gray-200 shadow-xl backdrop-blur-lg' 
            : 'bg-white/80 backdrop-blur-sm border border-gray-200'
        }`}>
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link href="/" className="group">
              <div className="relative h-10 w-auto transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="PakketAdvies"
                  width={180}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
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
              <Link href="/calculator">
                <button className="px-6 py-3 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300">
                  Bereken besparing
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
