'use client'

import Link from 'next/link'
import { Lightning, Envelope, Phone, MapPin, LinkedinLogo, InstagramLogo } from '@phosphor-icons/react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-dark-900 via-primary-950 to-dark-950 text-white">
      <div className="container-custom">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300">
                <Lightning weight="duotone" className="w-7 h-7 text-white" />
              </div>
              <span className="font-display text-2xl font-bold">
                PakketAdvies
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Specialist in zakelijke energiecontracten. Wij bemiddelen het beste contract voor jouw bedrijf.
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <LinkedinLogo weight="bold" className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
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
                <Link href="/diensten" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Diensten
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Bereken besparing
                </Link>
              </li>
              <li>
                <Link href="/kennisbank" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Kennisbank
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full group-hover:w-2 group-hover:h-2 transition-all" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-lg font-bold mb-6">Diensten</h3>
            <ul className="space-y-3">
              <li className="text-gray-400">Energiecontract advies</li>
              <li className="text-gray-400">Contractvergelijking</li>
              <li className="text-gray-400">Overstapservice</li>
              <li className="text-gray-400">Contractbeheer</li>
              <li className="text-gray-400">Groene energie</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@pakketadvies.nl" className="text-gray-400 hover:text-white transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-primary-500/20 flex items-center justify-center transition-all duration-300">
                    <Envelope weight="duotone" className="w-5 h-5" />
                  </div>
                  <span>info@pakketadvies.nl</span>
                </a>
              </li>
              <li>
                <a href="tel:+31201234567" className="text-gray-400 hover:text-white transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-primary-500/20 flex items-center justify-center transition-all duration-300">
                    <Phone weight="duotone" className="w-5 h-5" />
                  </div>
                  <span>020 123 4567</span>
                </a>
              </li>
              <li className="text-gray-400 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin weight="duotone" className="w-5 h-5" />
                </div>
                <span>Amsterdam, Nederland</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
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
