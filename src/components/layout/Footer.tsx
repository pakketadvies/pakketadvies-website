'use client'

import Link from 'next/link'
import { Envelope, Phone, MapPin, LinkedinLogo } from '@phosphor-icons/react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-brand-navy-500 text-white">
      <div className="container-custom">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-teal-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="font-bold text-xl tracking-tight">
                PAKKETADVIES
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Specialist in zakelijke energiecontracten. Wij bemiddelen het beste contract voor jouw bedrijf.
            </p>
            <div>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 items-center justify-center transition-colors"
              >
                <LinkedinLogo weight="bold" className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Navigatie</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/diensten" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Diensten
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Bereken besparing
                </Link>
              </li>
              <li>
                <Link href="/kennisbank" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Kennisbank
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Diensten</h3>
            <ul className="space-y-2.5 text-gray-300 text-sm">
              <li>Energiecontract advies</li>
              <li>Contractvergelijking</li>
              <li>Overstapservice</li>
              <li>Contractbeheer</li>
              <li>Groene energie</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@pakketadvies.nl" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm">
                  <Envelope weight="regular" className="w-5 h-5" />
                  <span>info@pakketadvies.nl</span>
                </a>
              </li>
              <li>
                <a href="tel:+31201234567" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm">
                  <Phone weight="regular" className="w-5 h-5" />
                  <span>020 123 4567</span>
                </a>
              </li>
              <li className="text-gray-300 flex items-start gap-2 text-sm">
                <MapPin weight="regular" className="w-5 h-5 flex-shrink-0" />
                <span>Amsterdam, Nederland</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-300">
            <p>© {currentYear} PakketAdvies. Alle rechten voorbehouden.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/algemene-voorwaarden" className="hover:text-white transition-colors">
                Algemene voorwaarden
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
