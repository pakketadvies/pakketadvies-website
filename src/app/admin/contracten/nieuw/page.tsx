'use client'

import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Lightning, TrendUp, Wrench, ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import Link from 'next/link'

export default function NieuwContractPage() {
  const router = useRouter()

  const contractTypes = [
    {
      type: 'vast',
      icon: Lightning,
      title: 'Vast contract',
      description: 'Vaste tarieven voor elektriciteit en gas met vaste looptijd',
      features: [
        'Vaste kWh tarieven',
        'Prijsgarantie mogelijk',
        'Looptijd van 1-5 jaar',
        'Eenvoudig te vergelijken',
      ],
      color: 'navy',  // Vast = foundation = navy
      href: '/admin/contracten/nieuw/vast',
    },
    {
      type: 'dynamisch',
      icon: TrendUp,
      title: 'Dynamisch contract',
      description: 'Variabele tarieven op basis van marktprijzen',
      features: [
        'Opslag bovenop marktprijs',
        'Dagelijks wisselende tarieven',
        'Index-gebaseerd (EPEX)',
        'Maximale prijscap mogelijk',
      ],
      color: 'purple',
      href: '/admin/contracten/nieuw/dynamisch',
    },
    {
      type: 'maatwerk',
      icon: Wrench,
      title: 'Maatwerk contract',
      description: 'Op maat gemaakte contracten voor specifieke klanten',
      features: [
        'Persoonlijke offerte',
        'Minimaal verbruik vereist',
        'Direct contact met leverancier',
        'Flexibele voorwaarden',
      ],
      color: 'purple',  // Maatwerk = premium = purple
      href: '/admin/contracten/nieuw/maatwerk',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/contracten"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-brand-navy-500 mb-2">Nieuw contract</h1>
            <p className="text-gray-600">Kies het type contract dat je wilt toevoegen</p>
          </div>
        </div>

        {/* Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contractTypes.map((contractType) => {
            const Icon = contractType.icon
            return (
              <Link
                key={contractType.type}
                href={contractType.href}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-brand-teal-300 hover:shadow-lg transition-all group"
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${
                    contractType.color === 'navy' ? 'bg-brand-navy-50' :
                    contractType.color === 'purple' ? 'bg-brand-purple-50' :
                    'bg-gray-50'
                  } flex items-center justify-center group-hover:bg-brand-teal-50 transition-colors`}>
                    <Icon size={28} weight="fill" className={`${
                      contractType.color === 'navy' ? 'text-brand-navy-600' :
                      contractType.color === 'purple' ? 'text-brand-purple-600' :
                      'text-gray-600'
                    } group-hover:text-brand-teal-600`} />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy-500 mb-2">
                      {contractType.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {contractType.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {contractType.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-brand-teal-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-brand-teal-600 font-semibold group-hover:gap-3 transition-all">
                      <span>Contract toevoegen</span>
                      <ArrowRight size={18} weight="bold" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}

