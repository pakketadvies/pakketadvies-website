import type { Metadata } from 'next'

export interface ArticleMetadata {
  title: string
  description: string
  keywords: string[]
  category: string
  date: string
  slug: string
  readTime: string
  featured?: boolean
}

const BASE_URL = 'https://pakketadvies.nl'

export function generateArticleMetadata(article: ArticleMetadata): Metadata {
  const keywords = [
    ...article.keywords,
    'zakelijke energie',
    'energiecontract',
    'energieadvies',
    'PakketAdvies'
  ].join(', ')

  return {
    title: `${article.title} | PakketAdvies`,
    description: article.description,
    keywords,
    openGraph: {
      title: `${article.title} | PakketAdvies`,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      authors: ['PakketAdvies'],
      tags: article.keywords,
      url: `${BASE_URL}/kennisbank/${article.slug}`,
      siteName: 'PakketAdvies',
      images: [
        {
          url: `${BASE_URL}/images/office-team.jpg`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | PakketAdvies`,
      description: article.description,
      images: [`${BASE_URL}/images/office-team.jpg`],
    },
    alternates: {
      canonical: `${BASE_URL}/kennisbank/${article.slug}`,
    },
    metadataBase: new URL(BASE_URL),
  }
}

export function generateStructuredData(article: ArticleMetadata, content: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: `${BASE_URL}/images/office-team.jpg`,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'PakketAdvies',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'PakketAdvies',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/kennisbank/${article.slug}`,
    },
    articleSection: article.category,
    keywords: article.keywords.join(', '),
    articleBody: content,
  }
}

export function generateBreadcrumbStructuredData(slug: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Kennisbank',
        item: `${BASE_URL}/kennisbank`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${BASE_URL}/kennisbank/${slug}`,
      },
    ],
  }
}

