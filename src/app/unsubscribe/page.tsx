'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Envelope } from '@phosphor-icons/react'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubscribe = async () => {
      try {
        const token = searchParams?.get('token')
        const email = searchParams?.get('email')

        if (!token && !email) {
          setStatus('error')
          setMessage('Geen token of email opgegeven. Gebruik de link uit de email.')
          return
        }

        // Call API to unsubscribe
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'U bent succesvol uitgeschreven voor onze nieuwsbrief.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Er ging iets mis bij het uitschrijven.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Er ging iets mis bij het uitschrijven. Probeer het later opnieuw.')
      }
    }

    unsubscribe()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal-50 via-white to-brand-navy-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-brand-navy-500 mb-2">
              Uitschrijven...
            </h1>
            <p className="text-gray-600">
              Even geduld, we schrijven u uit voor onze nieuwsbrief.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} weight="fill" className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-brand-navy-500 mb-2">
              Uitgeschreven
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-teal-500 text-white rounded-2xl font-semibold hover:bg-brand-teal-600 transition-colors"
            >
              Terug naar home
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} weight="fill" className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-brand-navy-500 mb-2">
              Fout
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-teal-500 text-white rounded-2xl font-semibold hover:bg-brand-teal-600 transition-colors"
              >
                Neem contact op
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-brand-navy-500 text-brand-navy-600 rounded-2xl font-semibold hover:bg-brand-navy-50 transition-colors"
              >
                Terug naar home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

