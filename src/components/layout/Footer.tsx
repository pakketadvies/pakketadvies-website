'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Envelope, Phone, MapPin, LinkedinLogo, InstagramLogo } from '@phosphor-icons/react'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()
  const [audience, setAudience] = useState<'business' | 'consumer'>('business')

  useEffect(() => {
    // Footer should reflect the current route (active experience).
    setAudience(pathname?.startsWith('/particulier') ? 'consumer' : 'business')
  }, [pathname])

  const isConsumer = audience === 'consumer'

  return (
    <footer className="bg-brand-navy-500 text-white">
      <div className="container-custom">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="group inline-block">
              <div className="relative h-12 w-auto transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="PakketAdvies"
                  width={200}
                  height={48}
                  className="object-contain brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              {isConsumer
                ? 'Vergelijk energiecontracten voor thuis. Helder advies over vast, variabel en dynamisch — inclusief zonnepanelen.'
                : 'Specialist in zakelijke energiecontracten. Wij bemiddelen het beste contract voor jouw bedrijf.'}
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-brand-teal-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <LinkedinLogo weight="bold" className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-brand-purple-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <InstagramLogo weight="bold" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-bold mb-6">Navigatie</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={isConsumer ? '/particulier/energie-vergelijken' : '/diensten'}
                  className="text-gray-300 hover:text-brand-teal-500 transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-teal-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  {isConsumer ? 'Energie vergelijken' : 'Diensten'}
                </Link>
              </li>
              <li>
                <Link
                  href={isConsumer ? '/particulier' : '/calculator'}
                  className="text-gray-300 hover:text-brand-teal-500 transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-teal-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  {isConsumer ? 'Particulier home' : 'Bereken besparing'}
                </Link>
              </li>
              <li>
                <Link
                  href={isConsumer ? '/particulier/kennisbank' : '/kennisbank'}
                  className="text-gray-300 hover:text-brand-teal-500 transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-brand-teal-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Kennisbank
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="text-gray-300 hover:text-brand-teal-500 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-teal-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-brand-teal-500 transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-brand-teal-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-lg font-bold mb-6">Diensten</h3>
            <ul className="space-y-3">
              {isConsumer ? (
                <>
                  <li className="text-gray-300">Energie vergelijken</li>
                  <li className="text-gray-300">Vast / variabel / dynamisch</li>
                  <li className="text-gray-300">Zonnepanelen & teruglevering</li>
                  <li className="text-gray-300">Verhuizen</li>
                  <li className="text-gray-300">Uitleg & FAQ</li>
                </>
              ) : (
                <>
              <li className="text-gray-300">Energiecontract advies</li>
              <li className="text-gray-300">Contractvergelijking</li>
              <li className="text-gray-300">Overstapservice</li>
              <li className="text-gray-300">Contractbeheer</li>
              <li className="text-gray-300">Groene energie</li>
              <li className="text-gray-300">Batterijoplossingen</li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@pakketadvies.nl" className="text-gray-300 hover:text-white transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-brand-teal-500 flex items-center justify-center transition-all duration-300">
                    <Envelope weight="duotone" className="w-5 h-5" />
                  </div>
                  <span>info@pakketadvies.nl</span>
                </a>
              </li>
              <li>
                <a href="tel:+31850477065" className="text-gray-300 hover:text-white transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-brand-teal-500 flex items-center justify-center transition-all duration-300">
                    <Phone weight="duotone" className="w-5 h-5" />
                  </div>
                  <span>085 047 7065</span>
                </a>
              </li>
              <li className="text-gray-300 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin weight="duotone" className="w-5 h-5" />
                </div>
                <div>
                  <span>Stavangerweg 13</span><br />
                  <span>9723 JC Groningen</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {currentYear} PakketAdvies. Alle rechten voorbehouden.</p>
            <div className="flex gap-6">
              <span className="text-gray-500 cursor-not-allowed" title="Komt binnenkort">
                Privacy
              </span>
              <span className="text-gray-500 cursor-not-allowed" title="Komt binnenkort">
                Algemene voorwaarden
              </span>
              <span className="text-gray-500 cursor-not-allowed" title="Komt binnenkort">
                Cookies
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
