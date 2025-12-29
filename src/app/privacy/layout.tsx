import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacyverklaring | PakketAdvies',
  description: 'Lees onze privacyverklaring om te zien hoe PakketAdvies omgaat met uw persoonsgegevens en privacy.',
  alternates: {
    canonical: 'https://pakketadvies.nl/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

