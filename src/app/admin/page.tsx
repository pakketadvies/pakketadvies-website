import AdminLayout from '@/components/admin/AdminLayout'
import { Buildings, FileText, CheckCircle, Clock } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: totalLeveranciers },
    { count: activeLeveranciers },
    { count: totalContracten },
    { count: activeContracten },
  ] = await Promise.all([
    supabase.from('leveranciers').select('*', { count: 'exact', head: true }),
    supabase.from('leveranciers').select('*', { count: 'exact', head: true }).eq('actief', true),
    supabase.from('contracten').select('*', { count: 'exact', head: true }),
    supabase.from('contracten').select('*', { count: 'exact', head: true }).eq('actief', true),
  ])

  return {
    totalLeveranciers: totalLeveranciers || 0,
    activeLeveranciers: activeLeveranciers || 0,
    totalContracten: totalContracten || 0,
    activeContracten: activeContracten || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Totaal leveranciers',
      value: stats.totalLeveranciers,
      subtitle: `${stats.activeLeveranciers} actief`,
      icon: Buildings,
      color: 'teal',
    },
    {
      title: 'Totaal contracten',
      value: stats.totalContracten,
      subtitle: `${stats.activeContracten} actief`,
      icon: FileText,
      color: 'blue',
    },
  ]

  const quickActions = [
    {
      title: 'Nieuwe leverancier',
      description: 'Voeg een energieleverancier toe',
      href: '/admin/leveranciers/nieuw',
      icon: Buildings,
      color: 'teal',
    },
    {
      title: 'Nieuw contract',
      description: 'Voeg een energiecontract toe',
      href: '/admin/contracten/nieuw',
      icon: FileText,
      color: 'blue',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-brand-navy-500 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welkom bij het PakketAdvies admin panel</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.title}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-brand-teal-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-4xl font-bold text-brand-navy-500 mb-2">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.subtitle}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                    <Icon size={24} weight="fill" className={`text-brand-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-brand-navy-500 mb-4">Snelle acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-brand-teal-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-${action.color}-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-teal-100 transition-colors`}>
                      <Icon size={24} className={`text-brand-${action.color}-600 group-hover:text-brand-teal-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy-500 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

