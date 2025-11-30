import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default function KennisbankPage() {
  const articles = [
    {
      title: 'Energieprijzen - Inzicht in de markt',
      excerpt: 'Bekijk actuele en historische marktprijzen voor elektriciteit en gas. Interactieve grafieken en gedetailleerde prijstabellen.',
      category: 'Markt',
      date: '30 november 2025',
      readTime: '3 min',
      href: '/kennisbank/energieprijzen',
      featured: true,
    },
    {
      title: 'Grootverbruik vs. Kleinverbruik: wat is het verschil?',
      excerpt: 'Ontdek wanneer u een grootverbruiker bent en wat dit betekent voor uw energiecontract.',
      category: 'Uitleg',
      date: '15 januari 2025',
      readTime: '5 min',
      href: '/kennisbank/grootverbruik-kleinverbruik',
    },
    {
      title: 'Vast of dynamisch energiecontract: wat past bij uw bedrijf?',
      excerpt: 'Ontdek de verschillen tussen vaste en dynamische energiecontracten en welke het beste bij uw bedrijf past.',
      category: 'Advies',
      date: '15 november 2025',
      readTime: '5 min',
    },
    {
      title: 'Zo bespaart u energie in uw kantoorpand',
      excerpt: 'Praktische tips om het energieverbruik in uw kantoor te verlagen en geld te besparen.',
      category: 'Tips',
      date: '10 november 2025',
      readTime: '7 min',
    },
    {
      title: 'Groene energie voor bedrijven: alles wat u moet weten',
      excerpt: 'Van windenergie tot zonnepanelen: een complete gids over duurzame energie voor zakelijk gebruik.',
      category: 'Duurzaamheid',
      date: '5 november 2025',
      readTime: '6 min',
    },
    {
      title: 'De energiemarkt in 2025: trends en ontwikkelingen',
      excerpt: 'Een overzicht van de belangrijkste trends op de zakelijke energiemarkt dit jaar.',
      category: 'Markt',
      date: '1 november 2025',
      readTime: '8 min',
    },
    {
      title: 'Hoe leest u uw energienota?',
      excerpt: 'Stap voor stap uitleg over wat er op uw zakelijke energienota staat en waar u op moet letten.',
      category: 'Uitleg',
      date: '28 oktober 2025',
      readTime: '4 min',
    },
    {
      title: 'Subsidies voor verduurzaming van uw bedrijf',
      excerpt: 'Overzicht van beschikbare subsidies en regelingen voor zakelijke verduurzaming.',
      category: 'Subsidies',
      date: '20 oktober 2025',
      readTime: '6 min',
    },
  ]

  const faqs = [
    {
      question: 'Hoe lang duurt het om over te stappen?',
      answer: 'Een overstap naar een nieuwe energieleverancier duurt gemiddeld 2-3 weken.',
    },
    {
      question: 'Zijn er kosten verbonden aan overstappen?',
      answer: 'Nee, het overstappen naar een nieuwe leverancier is altijd gratis. Ook onze bemiddeling is kosteloos.',
    },
    {
      question: 'Wat gebeurt er met mijn huidige contract?',
      answer: 'Wij regelen de opzegging van uw huidige contract. U hoeft hier zelf niets voor te doen.',
    },
    {
      question: 'Kan ik altijd overstappen?',
      answer: 'U kunt overstappen aan het einde van uw contractperiode. Bij sommige contracten kunt u tussentijds opzeggen tegen een boete.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-12 md:py-16 pt-32 md:pt-36">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kennisbank</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Alles wat u moet weten over zakelijke energiecontracten
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16">
        <div className="container-custom max-w-6xl">
          <h2 className="text-3xl font-bold text-brand-navy-500 mb-8">Artikelen</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
            {articles.map((article, index) => {
              const isFeatured = (article as any).featured
              return (
                <Card 
                  key={index} 
                  className={`hover:shadow-xl transition-shadow ${
                    isFeatured ? 'lg:col-span-3 md:col-span-2 border-2 border-brand-teal-200 bg-gradient-to-br from-white to-brand-teal-50' : ''
                  }`}
                >
                  <CardContent className="pt-8">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant={isFeatured ? "info" : "info"}>{article.category}</Badge>
                      {isFeatured && (
                        <Badge variant="info" className="bg-brand-teal-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className={`mb-3 ${isFeatured ? 'text-2xl' : 'line-clamp-2'}`}>
                      {article.title}
                    </CardTitle>
                    <p className={`text-gray-500 text-sm mb-4 ${isFeatured ? '' : 'line-clamp-3'}`}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>{article.date}</span>
                      <span>{article.readTime} leestijd</span>
                    </div>
                    <Link
                      href={article.href || '#'}
                      className="text-brand-teal-500 hover:text-brand-teal-600 font-medium text-sm inline-flex items-center gap-1"
                    >
                      {isFeatured ? 'Bekijk energieprijzen' : 'Lees meer'}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* FAQ Section */}
          <h2 className="text-3xl font-bold text-brand-navy-500 mb-8">Veelgestelde vragen</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-8">
                  <h3 className="font-semibold text-brand-navy-500 mb-2">{faq.question}</h3>
                  <p className="text-gray-500">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

