import Link from 'next/link'
import { Warning } from '@phosphor-icons/react'

export default function ContractNietGevondenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal-50 via-white to-brand-navy-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Warning weight="duotone" className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-brand-navy-500 mb-2">
          Contract niet gevonden
        </h1>
        <p className="text-gray-600 mb-6">
          Het contract dat u zoekt kon niet worden gevonden. Dit kan gebeuren als:
        </p>
        <ul className="text-left text-gray-600 mb-6 space-y-2">
          <li>• De link is verlopen (links zijn 7 dagen geldig)</li>
          <li>• De link is onjuist of beschadigd</li>
          <li>• Het contract is verwijderd</li>
        </ul>
        <div className="flex flex-col gap-3">
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center px-8 py-4 bg-brand-teal-500 text-white rounded-2xl font-semibold hover:bg-brand-teal-600 transition-colors"
          >
            Terug naar home
          </Link>
          <Link 
            href="/contact"
            className="w-full inline-flex items-center justify-center px-8 py-4 border-2 border-brand-navy-500 text-brand-navy-600 rounded-2xl font-semibold hover:bg-brand-navy-50 transition-colors"
          >
            Neem contact op
          </Link>
        </div>
      </div>
    </div>
  )
}

