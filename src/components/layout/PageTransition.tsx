'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

// Custom easing voor soepele, natuurlijke beweging
const smoothEasing = [0.22, 1, 0.36, 1] // Custom cubic-bezier

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: smoothEasing,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: smoothEasing,
    },
  },
}

interface PageTransitionProps {
  children: ReactNode
  disableTransition?: boolean
}

export function PageTransition({ children, disableTransition = false }: PageTransitionProps) {
  const pathname = usePathname()

  // Scroll naar top bij route change (behalve bij hash navigatie)
  useEffect(() => {
    // Alleen scrollen als er geen hash in de URL zit en we niet al bovenaan zijn
    if (!window.location.hash && window.scrollY > 0) {
      // Gebruik requestAnimationFrame voor soepele scroll tijdens animatie
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
      })
    }
  }, [pathname])

  // Als transitions uitgeschakeld zijn (bijv. admin routes), render gewoon children
  if (disableTransition) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

