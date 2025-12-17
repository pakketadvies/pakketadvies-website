'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { generateNewsletterEmail } from '@/lib/newsletter-email-template'
import { Copy, Eye } from '@phosphor-icons/react'
import { useEffect, useState, useMemo } from 'react'

export default function NewsletterPreviewPage() {
  const [baseUrl, setBaseUrl] = useState('https://pakketadvies.nl')
  const [copied, setCopied] = useState(false)
  const [variant, setVariant] = useState<1 | 2 | 3 | 4 | 5>(1)

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  // Sample data based on the original newsletter
  const emailData = useMemo(() => ({
    baseUrl,
    recipientName: 'Klant',
    subject: 'TEST - Energietarieven December | Scherpe eindejaars-aanbiedingen',
    introText: `
      Beste klant,<br><br>
      
      We hebben uw gegevens verzameld via onze social media campagnes voor particulier en/of zakelijke energie. 
      Via deze email willen we u graag op de hoogte brengen van onze nieuwe aanbiedingen voor deze maand.<br><br>
      
      <strong style="color: #1A3756;">Let op:</strong> momenteel hebben wij voor groot MKB en grootverbruikers met een verbruik boven de 75.000kWh een heel scherp tarief voor lange looptijd.<br><br>
      
      Daarnaast hebben wij aantrekkelijke opties voor eigenaren van zonnepanelen via dynamische contracten. 
      Voor grote zakelijke klanten bieden wij strategische inkoop aan. 
      Vergelijk direct alle aanbiedingen via <a href="${baseUrl}/calculator" style="color: #00AF9B; text-decoration: underline;">${baseUrl}/calculator</a> 
      of neem contact met ons op voor persoonlijk advies.
    `,
    offers: {
      particulier: {
        title: 'Particulier 3-jarig aanbod',
        stroomtariefPiek: '€0,27811',
        stroomtariefDal: '€0,26820',
        stroomtariefEnkel: '€0,27220',
        gastarief: '€1,21207',
        details: 'Bovenstaande tarieven zijn inclusief alle overheidsheffingen en btw. 3 jaar vast.',
        link: `${baseUrl}/aanbieding/particulier-3-jaar`,
      },
      mkb: {
        title: '3-jarig vast aanbod voor het MKB',
        stroomtariefPiek: '€0,12830',
        stroomtariefDal: '€0,12069',
        gastarief: '€0,42355',
        details: 'Bovenstaande tarieven zijn exclusief alle overheidsheffingen en btw. 3 jaar vast.',
        link: `${baseUrl}/aanbieding/mkb-3-jaar`,
      },
      grootzakelijk: {
        title: 'Groot Zakelijk Aanbod',
        minVerbruik: 'Vanaf 75.000k WH (zonder zonnepanelen) gelden onderstaande tarieven:',
        stroomtariefPiek: '€0,10971',
        stroomtariefDal: '€0,09981',
        gastarief: '€0,37901',
        details: 'Bovenstaande tarieven zijn exclusief alle overheidsheffingen en btw. 3 jaar vast.',
        extraInfo: 'Mogelijkheden voor strategische inkoop, aangepaste trajecten en competitieve tarieven door volumes te clusteren. Ook mogelijkheden voor eigenaren van zonnepanelen op de dynamische energiemarkt (EPEX of imbalance) inclusief slimme sturing en batterij oplossingen.',
        link: `${baseUrl}/aanbieding/grootzakelijk`,
      },
      dynamisch: {
        title: 'Dynamische energietarieven',
        description: `
          Dynamische tarieven bieden scherpe en flexibele prijzen gebaseerd op marktomstandigheden, zonder langetermijnverplichtingen. 
          Voor eigenaren van zonnepanelen die te maken hebben met terugleverkosten, is een dynamisch contract de enige juiste optie, 
          zodat u kosten kunt vermijden en zelfs kunt verdienen aan teruggeleverde stroom. 
          Bekijk meer informatie op onze <a href="${baseUrl}/aanbieding/dynamisch" style="color: #00AF9B; text-decoration: underline;">dynamische tarieven pagina</a>.
        `,
        link: `${baseUrl}/aanbieding/dynamisch`,
      },
    },
    contactEmail: 'info@pakketadvies.nl',
    contactPhone: '085-0477065',
    address: 'PakketAdvies, Stavangerweg 21-1, 9723JC, Groningen',
    unsubscribeUrl: `${baseUrl}/unsubscribe`,
  }), [baseUrl])

  const emailHTML = useMemo(() => generateNewsletterEmail(emailData, variant), [emailData, variant])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy-500 mb-2">Newsletter Email Preview</h1>
            <p className="text-gray-600">
              Kies een van de 5 varianten hieronder. De HTML code kan worden gekopieerd voor gebruik in email marketing tools.
            </p>
          </div>
          <a
            href={`/admin/newsletter-preview/html?variant=${variant}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal-600 text-white rounded-lg hover:bg-brand-teal-700 transition-colors"
          >
            <Eye size={20} />
            Open in nieuw tabblad
          </a>
        </div>

        {/* Variant Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-brand-navy-500 mb-4">Kies een variant</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v as 1 | 2 | 3 | 4 | 5)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  variant === v
                    ? 'bg-brand-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Variant {v}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Variant {variant}:</strong>{' '}
              {variant === 1 && 'Compact met icon naast titel (horizontale layout)'}
              {variant === 2 && 'Minimalistisch met linker border accent'}
              {variant === 3 && 'Cards met gradient header'}
              {variant === 4 && 'Grote focus op prijzen met clean design'}
              {variant === 5 && 'Moderne card layout met shadow en spacing'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-brand-navy-500 mb-4">Acties</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(emailHTML).then(() => {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                })
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy-600 text-white rounded-lg hover:bg-brand-navy-700 transition-colors"
            >
              <Copy size={20} />
              {copied ? 'Gekopieerd!' : 'Kopieer HTML code'}
            </button>
            <a
              href={`data:text/html;charset=utf-8,${encodeURIComponent(emailHTML)}`}
              download="newsletter-email.html"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-teal-600 text-white rounded-lg hover:bg-brand-teal-700 transition-colors"
            >
              Download HTML bestand
            </a>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-brand-navy-500">Email Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Deze preview geeft een indicatie. Test altijd in verschillende email clients.
            </p>
          </div>
          <div className="p-8 bg-gray-100 overflow-auto">
            <div className="max-w-2xl mx-auto bg-white shadow-lg">
              <iframe
                srcDoc={emailHTML}
                className="w-full border-0"
                style={{ height: '1200px', minHeight: '800px' }}
                title="Newsletter Email Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

