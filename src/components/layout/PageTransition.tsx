'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

const pageVariants = {
  initial: {
    opacity: 0,
    x: 100, // Start van rechts
  },
  animate: {
    opacity: 1,
    x: 0, // Eindpositie
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const, // Custom easing voor soepele, natuurlijke beweging
    },
  },
  exit: {
    opacity: 0,
    x: -100, // Gaat naar links weg
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  // Scroll naar top bij route change (na animatie start)
  useEffect(() => {
    // Kleine delay om smooth scroll te voorkomen tijdens transitie
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen"
        style={{ willChange: 'transform, opacity' }} // Performance optimalisatie
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

