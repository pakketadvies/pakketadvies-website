import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookieverklaring | PakketAdvies',
  description: 'Lees onze cookieverklaring om te zien welke cookies PakketAdvies gebruikt en waarvoor.',
  alternates: {
    canonical: 'https://pakketadvies.nl/cookies',
  },
}

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

