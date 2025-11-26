import Link from 'next/link'

export default function GrootverbruikKleinverbruikPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link 
            href="/kennisbank"
            className="inline-flex items-center gap-2 text-brand-teal-600 hover:text-brand-teal-700 mb-6 transition-colors"
          >
            <span>← Terug naar kennisbank</span>
          </Link>

          <h1 className="text-4xl font-bold text-brand-navy-500 mb-8">
            Wanneer bent u een grootverbruiker?
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Grootverbruik */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-md">
              <h2 className="text-2xl font-bold text-brand-navy-500 mb-4">
                Grootverbruik
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong className="text-brand-navy-500">Criterium:</strong> Uw elektriciteitsaansluiting is groter dan 3x 80 Ampère 
                  en/of uw gasaansluiting is groter dan G25 (meer dan 40 m³ per uur).
                </li>
                <li>
                  <strong className="text-brand-navy-500">Facturering:</strong> U ontvangt maandelijks een factuur voor de daadwerkelijk 
                  verbruikte hoeveelheid elektriciteit en gas.
                </li>
                <li>
                  <strong className="text-brand-navy-500">Contract Type:</strong> U heeft een energiecontract volgens het netbeheerdersmodel, 
                  waarbij u aparte facturen krijgt voor energielevering en netbeheerkosten.
                </li>
              </ul>
            </div>
            
            {/* Kleinverbruik */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-md">
              <h2 className="text-2xl font-bold text-brand-navy-500 mb-4">
                Kleinverbruik
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong className="text-brand-navy-500">Criterium:</strong> U heeft een elektriciteitsaansluiting van maximaal 3 x 80 Ampère 
                  en/of een gasaansluiting van maximaal G25 (maximaal 25 m³ per uur).
                </li>
                <li>
                  <strong className="text-brand-navy-500">Facturering:</strong> U betaalt maandelijks uw energierekening op basis van een 
                  voorschotbedrag en ontvangt u aan het einde van het jaar een jaarafrekening.
                </li>
                <li>
                  <strong className="text-brand-navy-500">Contract Type:</strong> U heeft een energiecontract volgens het leveranciersmodel, 
                  waarbij u een totaalfactuur krijgt voor zowel energielevering als netbeheerkosten.
                </li>
              </ul>
            </div>
          </div>
          
          {/* Extra informatie */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-md">
            <h2 className="text-xl font-bold text-brand-navy-500 mb-4">
              Meer informatie
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Werkt u vanuit huis? Dan gaat u naar <Link href="/sectoren/zzp" className="text-brand-teal-600 hover:underline font-semibold">ZZP</Link>.
              </p>
              <p className="text-gray-700">
                Werkt u vanuit een bedrijfspand, dan gaat u naar <Link href="/sectoren/mkb" className="text-brand-teal-600 hover:underline font-semibold">MKB</Link>.
              </p>
              <div className="pt-4 border-t border-gray-200">
                <Link 
                  href="/calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal-600 text-white rounded-lg hover:bg-brand-teal-700 transition-colors font-semibold"
                >
                  Bereken uw besparing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

