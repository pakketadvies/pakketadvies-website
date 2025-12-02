import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - Neem contact op met PakketAdvies',
  description: 'Neem contact op met PakketAdvies voor persoonlijk energieadvies. Wij helpen u graag bij het vinden van het perfecte energiecontract voor uw bedrijf.',
  keywords: 'contact, energieadvies, energiecontract, zakelijke energie, energie besparen, energieadviseur',
  openGraph: {
    title: 'Contact - Neem contact op met PakketAdvies',
    description: 'Neem contact op met PakketAdvies voor persoonlijk energieadvies.',
    type: 'website',
    url: 'https://pakketadvies.nl/contact',
    siteName: 'PakketAdvies',
    images: [
      {
        url: 'https://pakketadvies.nl/images/office-team.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact PakketAdvies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact - Neem contact op met PakketAdvies',
    description: 'Neem contact op met PakketAdvies voor persoonlijk energieadvies.',
    images: ['https://pakketadvies.nl/images/office-team.jpg'],
  },
  alternates: {
    canonical: 'https://pakketadvies.nl/contact',
  },
  metadataBase: new URL('https://pakketadvies.nl'),
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

