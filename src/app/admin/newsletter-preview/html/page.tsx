import { generateNewsletterEmail } from '@/lib/newsletter-email-template'
import { headers } from 'next/headers'

export default async function NewsletterHTMLPage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>
}) {
  const params = await searchParams
  const headersList = await headers()
  const host = headersList.get('host') || 'pakketadvies.nl'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  // Sample data based on the original newsletter
  const emailData = {
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
        link: `${baseUrl}/calculator`,
      },
      mkb: {
        title: '3-jarig vast aanbod voor het MKB',
        stroomtariefPiek: '€0,12830',
        stroomtariefDal: '€0,12069',
        gastarief: '€0,42355',
        details: 'Bovenstaande tarieven zijn exclusief alle overheidsheffingen en btw. 3 jaar vast.',
        link: `${baseUrl}/calculator`,
      },
      grootzakelijk: {
        title: 'Groot Zakelijk Aanbod',
        minVerbruik: 'Vanaf 75.000k WH (zonder zonnepanelen) gelden onderstaande tarieven:',
        stroomtariefPiek: '€0,10971',
        stroomtariefDal: '€0,09981',
        gastarief: '€0,37901',
        details: 'Bovenstaande tarieven zijn exclusief alle overheidsheffingen en btw. 3 jaar vast.',
        extraInfo: 'Mogelijkheden voor strategische inkoop, aangepaste trajecten en competitieve tarieven door volumes te clusteren. Ook mogelijkheden voor eigenaren van zonnepanelen op de dynamische energiemarkt (EPEX of imbalance) inclusief slimme sturing en batterij oplossingen.',
        link: `${baseUrl}/calculator`,
      },
      dynamisch: {
        title: 'Dynamische energietarieven',
        description: `
          Dynamische tarieven bieden scherpe en flexibele prijzen gebaseerd op marktomstandigheden, zonder langetermijnverplichtingen. 
          Voor eigenaren van zonnepanelen die te maken hebben met terugleverkosten, is een dynamisch contract de enige juiste optie, 
          zodat u kosten kunt vermijden en zelfs kunt verdienen aan teruggeleverde stroom. 
          Vergelijk direct via <a href="${baseUrl}/calculator" style="color: #00AF9B; text-decoration: underline;">${baseUrl}/calculator</a>.
        `,
        link: `${baseUrl}/calculator`,
      },
    },
    contactEmail: 'info@pakketadvies.nl',
    contactPhone: '085-0477065',
    address: 'PakketAdvies, Stavangerweg 21-1, 9723JC, Groningen',
    unsubscribeUrl: `${baseUrl}/unsubscribe`,
  }

  const emailHTML = generateNewsletterEmail(emailData)

  return (
    <div dangerouslySetInnerHTML={{ __html: emailHTML }} />
  )
}

