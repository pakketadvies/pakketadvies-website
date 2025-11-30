'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Lightning,
  SquaresFour,
  Buildings,
  FileText,
  SignOut,
  List,
  X,
  CurrencyEur,
  ClipboardText,
} from '@phosphor-icons/react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: SquaresFour,
      active: pathname === '/admin',
    },
    {
      name: 'Leveranciers',
      href: '/admin/leveranciers',
      icon: Buildings,
      active: pathname.startsWith('/admin/leveranciers'),
    },
    {
      name: 'Contracten',
      href: '/admin/contracten',
      icon: FileText,
      active: pathname.startsWith('/admin/contracten'),
    },
    {
      name: 'Aanvragen',
      href: '/admin/aanvragen',
      icon: ClipboardText,
      active: pathname.startsWith('/admin/aanvragen'),
    },
    {
      name: 'Tarieven',
      href: '/admin/tarieven',
      icon: CurrencyEur,
      active: pathname.startsWith('/admin/tarieven'),
    },
    {
      name: 'Energieprijzen',
      href: '/admin/energieprijzen',
      icon: Lightning,
      active: pathname.startsWith('/admin/energieprijzen'),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-teal-600 flex items-center justify-center">
            <Lightning size={20} weight="bold" className="text-white" />
          </div>
          <span className="font-bold text-brand-navy-500">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal-600 flex items-center justify-center">
                <Lightning size={24} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-brand-navy-500">PakketAdvies</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                    ${
                      item.active
                        ? 'bg-brand-teal-50 text-brand-teal-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon size={20} weight={item.active ? 'fill' : 'regular'} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
            >
              <SignOut size={20} />
              <span>{signingOut ? 'Uitloggen...' : 'Uitloggen'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

