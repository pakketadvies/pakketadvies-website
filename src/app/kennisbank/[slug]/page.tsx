import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/data/articles'
import { generateArticleMetadata, generateStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo'
import Link from 'next/link'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  
  if (!article) {
    return {
      title: 'Artikel niet gevonden | PakketAdvies',
    }
  }

  return generateArticleMetadata(article)
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const structuredData = generateStructuredData(article, article.content)
  const breadcrumbData = generateBreadcrumbStructuredData(article.slug, article.title)

  // Parse markdown-like content to HTML
  const parseContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index, array) => {
        // Headers
        if (line.startsWith('# ')) {
          return `<h1 class="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-6 mt-8">${line.substring(2)}</h1>`
        }
        if (line.startsWith('## ')) {
          return `<h2 class="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4 mt-8">${line.substring(3)}</h2>`
        }
        if (line.startsWith('### ')) {
          return `<h3 class="font-display text-xl md:text-2xl font-bold text-brand-navy-500 mb-3 mt-6">${line.substring(4)}</h3>`
        }
        
        // Lists
        if (line.trim().startsWith('- ')) {
          const text = line.substring(2).trim()
          const isBold = text.includes('**')
          const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-navy-500">$1</strong>')
          
          if (index === 0 || !array[index - 1].trim().startsWith('- ')) {
            return `<ul class="list-disc list-inside space-y-2 mb-4 ml-4"><li class="text-gray-700 leading-relaxed">${processedText}</li>`
          }
          return `<li class="text-gray-700 leading-relaxed">${processedText}</li>`
        }
        
        // Close list
        if (line.trim() === '' && index > 0 && array[index - 1].trim().startsWith('- ')) {
          return '</ul>'
        }
        
        // Paragraphs
        if (line.trim() !== '') {
          const processedText = line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-navy-500">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
          return `<p class="text-gray-700 leading-relaxed mb-4">${processedText}</p>`
        }
        
        return ''
      })
      .filter(line => line !== '')
      .join('\n')
  }

  const htmlContent = parseContent(article.content)

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-brand-navy-500 text-white py-12 md:py-16 pt-32 md:pt-40">
          <div className="container-custom max-w-4xl">
            <Link 
              href="/kennisbank"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Terug naar kennisbank</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
              <span className="text-sm font-semibold text-brand-teal-200">{article.category}</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(article.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{article.readTime} leestijd</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container-custom max-w-4xl">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-md">
              <div className="pt-8">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Hulp nodig bij uw energiecontract?
              </h3>
              <p className="text-gray-600 mb-6">
                Wij helpen u graag met persoonlijk advies en het vinden van het perfecte energiecontract.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/calculator"
                  className="inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 px-6 py-3 text-base bg-brand-teal-500 text-white shadow-lg shadow-brand-teal-500/30 hover:shadow-xl hover:shadow-brand-teal-500/40 hover:scale-105 hover:bg-brand-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500"
                >
                  Bereken uw besparing
                </Link>
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 px-6 py-3 text-base bg-brand-navy-500 text-white shadow-lg shadow-brand-navy-500/30 hover:shadow-xl hover:shadow-brand-navy-500/40 hover:scale-105 hover:bg-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy-500"
                >
                  Neem contact op
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
