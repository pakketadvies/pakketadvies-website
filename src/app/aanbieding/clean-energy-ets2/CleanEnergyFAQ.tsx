'use client'

import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'

interface FaqItem {
  vraag: string
  antwoord: string
}

interface CleanEnergyFAQProps {
  items: FaqItem[]
}

export function CleanEnergyFAQ({ items }: CleanEnergyFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={index} className="hover-lift">
          <CardContent className="p-0">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
            >
              <h3 className="font-display text-lg font-bold text-brand-navy-500 pr-4">
                {item.vraag}
              </h3>
              <div className="flex-shrink-0">
                {openIndex === index ? (
                  <CaretUp weight="bold" className="w-6 h-6 text-brand-teal-500" />
                ) : (
                  <CaretDown weight="bold" className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <p className="text-gray-600 leading-relaxed pt-4">{item.antwoord}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
