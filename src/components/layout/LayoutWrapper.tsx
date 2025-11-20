'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (isAdminRoute) {
    // Admin routes: no header/footer, just children
    return <>{children}</>
  }
  
  // Regular routes: include header and footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

