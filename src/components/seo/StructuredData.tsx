// Structured data components for SEO

interface OrganizationSchemaProps {
  name?: string
  url?: string
  logo?: string
  description?: string
}

export function OrganizationSchema({ 
  name = 'PakketAdvies',
  url = 'https://pakketadvies.nl',
  logo = 'https://pakketadvies.nl/images/logo.png',
  description = 'Het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop.'
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    description,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+31-XXX-XXX-XXXX',
      contactType: 'customer service',
      areaServed: 'NL',
      availableLanguage: 'Dutch',
    },
    sameAs: [
      // Voeg hier social media links toe als beschikbaar
    ],
  }

  return (
    <script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQSchemaProps {
  questions: Array<{ question: string; answer: string }>
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ServiceSchemaProps {
  name: string
  description: string
  provider?: string
  areaServed?: string
}

export function ServiceSchema({ 
  name, 
  description, 
  provider = 'PakketAdvies',
  areaServed = 'NL'
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    areaServed: {
      '@type': 'Country',
      name: areaServed,
    },
  }

  return (
    <script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface LocalBusinessSchemaProps {
  name?: string
  description?: string
  url?: string
  telephone?: string
  email?: string
  address?: {
    streetAddress: string
    addressLocality: string
    postalCode: string
    addressCountry: string
  }
  openingHours?: string
  priceRange?: string
  logo?: string
}

export function LocalBusinessSchema({
  name = 'PakketAdvies',
  description = 'Het beste energiecontract voor uw bedrijf. Simpel, transparant en altijd met uw voordeel voorop.',
  url = 'https://pakketadvies.nl',
  telephone = '+31850477065',
  email = 'info@pakketadvies.nl',
  address = {
    streetAddress: 'Stavangerweg 13',
    addressLocality: 'Groningen',
    postalCode: '9723JC',
    addressCountry: 'NL',
  },
  openingHours = 'Mo-Fr 09:00-17:00',
  priceRange = '€€',
  logo = 'https://pakketadvies.nl/images/logo.png',
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url,
    telephone,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    priceRange,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    areaServed: {
      '@type': 'Country',
      name: 'NL',
    },
  }

  return (
    <script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface StructuredDataProps {
  data: object
  id?: string
}

export function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
