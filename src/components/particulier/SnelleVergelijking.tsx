'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lightning } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'

export function SnelleVergelijking() {
  const [postcode, setPostcode] = useState('')
  const [verbruik, setVerbruik] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to calculator with pre-filled data
    const params = new URLSearchParams()
    if (postcode) params.set('postcode', postcode)
    if (verbruik) params.set('stroom', verbruik)
    window.location.href = `/calculator?${params.toString()}`
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Start direct met vergelijken
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vul je postcode en verbruik in en zie direct welke energieleveranciers het beste bij jou passen
          </p>
        </div>

        <Card className="shadow-xl border-2 border-brand-teal-200">
          <CardContent className="p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="postcode" className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="1234AB"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all text-lg"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="verbruik" className="block text-sm font-semibold text-brand-navy-500 mb-2">
                    Jaarlijks verbruik (kWh)
                  </label>
                  <input
                    type="number"
                    id="verbruik"
                    value={verbruik}
                    onChange={(e) => setVerbruik(e.target.value)}
                    placeholder="3500"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-teal-500 focus:ring-2 focus:ring-brand-teal-500/20 outline-none transition-all text-lg"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-brand-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
              >
                <Lightning weight="bold" className="w-5 h-5" />
                Vergelijk nu
                <ArrowRight weight="bold" className="w-5 h-5" />
              </button>

              <p className="text-sm text-gray-500 text-center">
                <span className="inline-flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-brand-teal-500 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  </span>
                  Volledig gratis en vrijblijvend
                </span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

