import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/data/articles'
import { generateArticleMetadata, generateStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)
  
  if (!article) {
    return {
      title: 'Artikel niet gevonden | PakketAdvies',
    }
  }

  return generateArticleMetadata(article)
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)

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
              <ArrowLeft weight="bold" className="w-5 h-5" />
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
                <Calendar weight="duotone" className="w-5 h-5" />
                <span>{new Date(article.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock weight="duotone" className="w-5 h-5" />
                <span>{article.readTime} leestijd</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16">
          <div className="container-custom max-w-4xl">
            <Card>
              <CardContent className="pt-8">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="mt-12 text-center">
              <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                Hulp nodig bij uw energiecontract?
              </h3>
              <p className="text-gray-600 mb-6">
                Wij helpen u graag met persoonlijk advies en het vinden van het perfecte energiecontract.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/calculator">
                  <Button variant="primary" className="bg-brand-teal-500 hover:bg-brand-teal-600">
                    Bereken uw besparing
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary">
                    Neem contact op
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

