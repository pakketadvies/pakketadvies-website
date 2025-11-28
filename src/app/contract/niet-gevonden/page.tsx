'use client'

import Link from 'next/link'
import { Warning } from '@phosphor-icons/react'

export default function ContractNietGevondenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Warning className="w-8 h-8 text-red-600" weight="fill" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Contract niet gevonden
        </h1>
        
        <p className="text-gray-600 mb-6">
          Het contract dat u zoekt kon niet worden gevonden. Dit kan gebeuren als:
        </p>
        
        <ul className="text-left text-gray-600 mb-6 space-y-2">
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            <span>De link is verlopen (links zijn 7 dagen geldig)</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            <span>De link is ongeldig of beschadigd</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-600 mr-2">•</span>
            <span>Het contractnummer is onjuist</span>
          </li>
        </ul>
        
        <div className="space-y-3">
          <Link
            href="/contact"
            className="block w-full bg-brand-teal-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-brand-teal-600 transition-colors"
          >
            Neem contact op
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Terug naar homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

