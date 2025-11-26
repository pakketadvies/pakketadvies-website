'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  User, 
  Envelope, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle,
  Calendar,
  House,
  Warning
} from '@phosphor-icons/react'
import type { ContractOptie } from '@/types/calculator'

const particulierAanvraagSchema = z.object({
  // Klant check
  isKlantBijLeverancier: z.boolean(),
  
  // Persoonlijke gegevens
  aanhef: z.enum(['dhr', 'mevr']),
  voornaam: z.string().min(2, 'Vul je voornaam in'),
  voorletters: z.string().optional(),
  tussenvoegsel: z.string().optional(),
  achternaam: z.string().min(2, 'Vul je achternaam in'),
  geboortedatum: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Vul een geldige geboortedatum in (dd-mm-jjjj)'),
  telefoonnummer: z.string().min(10, 'Vul een geldig telefoonnummer in'),
  emailadres: z.string().email('Vul een geldig e-mailadres in'),
  herhaalEmailadres: z.string().email('Vul een geldig e-mailadres in'),
  
  // IBAN
  iban: z.string().min(15, 'Vul een geldig IBAN in'),
  rekeningOpAndereNaam: z.boolean(),
  
  // Levering
  heeftVerblijfsfunctie: z.boolean(),
  gaatVerhuizen: z.boolean(),
  wanneerOverstappen: z.enum(['zo_snel_mogelijk', 'na_contract_verlopen']),
  
  // Correspondentieadres (optioneel)
  anderCorrespondentieadres: z.boolean(),
  correspondentieStraat: z.string().optional(),
  correspondentieHuisnummer: z.string().optional(),
  correspondentiePostcode: z.string().optional(),
  correspondentiePlaats: z.string().optional(),
  
  // Akkoorden
  voorwaarden: z.boolean().refine(val => val === true, 'Je moet akkoord gaan met de voorwaarden'),
  privacy: z.boolean().refine(val => val === true, 'Je moet akkoord gaan met het privacybeleid'),
  herinneringContract: z.boolean(),
  nieuwsbrief: z.boolean(),
}).refine(data => data.emailadres === data.herhaalEmailadres, {
  message: 'E-mailadressen komen niet overeen',
  path: ['herhaalEmailadres'],
})

type ParticulierAanvraagFormData = z.infer<typeof particulierAanvraagSchema>

interface ParticulierAanvraagFormProps {
  contract: ContractOptie | null
}

export function ParticulierAanvraagForm({ contract }: ParticulierAanvraagFormProps) {
  const router = useRouter()
  const { verbruik, vorigeStap } = useCalculatorStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdresWijzigen, setShowAdresWijzigen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ParticulierAanvraagFormData>({
    resolver: zodResolver(particulierAanvraagSchema),
    defaultValues: {
      isKlantBijLeverancier: false,
      aanhef: 'dhr',
      heeftVerblijfsfunctie: true,
      gaatVerhuizen: false,
      wanneerOverstappen: 'zo_snel_mogelijk',
      rekeningOpAndereNaam: false,
      anderCorrespondentieadres: false,
      voorwaarden: false,
      privacy: false,
      herinneringContract: false,
      nieuwsbrief: false,
    },
  })

  const heeftVerblijfsfunctie = watch('heeftVerblijfsfunctie')
  const anderCorrespondentieadres = watch('anderCorrespondentieadres')
  const gaatVerhuizen = watch('gaatVerhuizen')

  // Haal leveringsadres op uit verbruik
  const leveringsadres = verbruik?.leveringsadressen?.[0] || null

  const onSubmit = async (data: ParticulierAanvraagFormData) => {
    setIsSubmitting(true)

    // Hier zou je de data naar de backend sturen
    const aanvraagData = {
      contract: contract,
      verbruik: verbruik,
      persoonlijkeGegevens: data,
    }

    console.log('Particulier aanvraag data:', aanvraagData)

    // Simuleer API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    router.push('/contract/bevestiging')
  }

  const contractNaam = contract?.contractNaam || `${contract?.type === 'vast' ? 'Vast' : 'Dynamisch'} contract`
  const leverancierNaam = contract?.leverancier.naam || 'Energieleverancier'
  const korting = contract?.besparing ? contract.besparing * 12 : null // Jaarlijkse besparing als korting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
      {/* Header: Meld u nu aan */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-navy-500 mb-2">
          Meld u nu aan bij {leverancierNaam}
        </h2>
        <p className="text-base md:text-lg text-gray-600 mb-4">
          Meld u nu aan voor {contractNaam}. {leverancierNaam} verzorgt uw volledige overstap. 
          U komt geen moment zonder stroom en gas te zitten.
        </p>
        
        {/* Korting badge (als van toepassing) */}
        {korting && korting > 0 && (
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 border-2 border-green-300 rounded-xl px-4 py-2 font-bold text-lg">
            <span>Korting</span>
            <span className="text-2xl">€ {korting.toLocaleString('nl-NL')},-</span>
          </div>
        )}
      </div>

      {/* Bent u momenteel klant? */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bent u momenteel klant bij {leverancierNaam}?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                <input
                  type="radio"
                  value="ja"
                  checked={watch('isKlantBijLeverancier') === true}
                  onChange={() => setValue('isKlantBijLeverancier', true)}
                  className="w-5 h-5 text-brand-teal-500"
                />
                <span className="font-medium">Ja</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                <input
                  type="radio"
                  value="nee"
                  checked={watch('isKlantBijLeverancier') === false}
                  onChange={() => setValue('isKlantBijLeverancier', false)}
                  className="w-5 h-5 text-brand-teal-500"
                />
                <span className="font-medium">Nee</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leveringsadres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
              <MapPin weight="duotone" className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Leveringsadres</h2>
          </div>

          {leveringsadres ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-brand-navy-500 mb-1">
                  {leveringsadres.straat} {leveringsadres.huisnummer}
                  {leveringsadres.toevoeging ? ` ${leveringsadres.toevoeging}` : ''}
                </div>
                <div className="text-gray-600">
                  {leveringsadres.postcode} {leveringsadres.plaats}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdresWijzigen(!showAdresWijzigen)}
                className="text-sm text-brand-teal-600 hover:text-brand-teal-700 font-semibold underline"
              >
                Adres wijzigen
              </button>

              {/* Adres wijzigen formulier (wordt later geïmplementeerd) */}
              {showAdresWijzigen && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    Adres wijzigen functionaliteit wordt hier geïmplementeerd...
                  </p>
                </div>
              )}

              {/* Checkbox: Post op ander adres */}
              <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('anderCorrespondentieadres')}
                  className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ik wil post van {leverancierNaam} op een ander adres ontvangen dan het leveringsadres
                </span>
              </label>

              {/* Correspondentieadres velden (als checkbox aangevinkt) */}
              {anderCorrespondentieadres && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <Input
                    label="Straatnaam"
                    {...register('correspondentieStraat')}
                    error={errors.correspondentieStraat?.message}
                    placeholder="Bijv. Weena"
                  />
                  <Input
                    label="Huisnummer"
                    {...register('correspondentieHuisnummer')}
                    error={errors.correspondentieHuisnummer?.message}
                    placeholder="12"
                  />
                  <Input
                    label="Postcode"
                    {...register('correspondentiePostcode')}
                    error={errors.correspondentiePostcode?.message}
                    placeholder="1234 AB"
                  />
                  <Input
                    label="Plaats"
                    {...register('correspondentiePlaats')}
                    error={errors.correspondentiePlaats?.message}
                    placeholder="Amsterdam"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700">Geen leveringsadres gevonden. Ga terug naar stap 1 om een adres in te vullen.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uw gegevens */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-navy-500 rounded-xl flex items-center justify-center">
              <User weight="duotone" className="w-5 h-5 text-brand-teal-500" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Uw gegevens</h2>
          </div>

          <div className="space-y-4">
            {/* Aanhef */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Aanhef <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="dhr"
                    {...register('aanhef')}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Dhr.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="mevr"
                    {...register('aanhef')}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Mevr.</span>
                </label>
              </div>
            </div>

            {/* Voornaam */}
            <Input
              label="Voornaam"
              {...register('voornaam')}
              error={errors.voornaam?.message}
              placeholder="Jan"
              required
              icon={<User weight="duotone" className="w-5 h-5" />}
            />

            {/* Voorletters */}
            <div>
              <Input
                label="Voorletters"
                {...register('voorletters')}
                error={errors.voorletters?.message}
                placeholder="bijv. J.H."
                helpText="De eerste letter(s) van uw voornaam"
              />
            </div>

            {/* Tussenvoegsel */}
            <Input
              label="Tussenvoegsel"
              {...register('tussenvoegsel')}
              error={errors.tussenvoegsel?.message}
              placeholder="van"
            />

            {/* Achternaam */}
            <Input
              label="Achternaam"
              {...register('achternaam')}
              error={errors.achternaam?.message}
              placeholder="Jansen"
              required
            />

            {/* Geboortedatum */}
            <Input
              label="Geboortedatum"
              {...register('geboortedatum')}
              error={errors.geboortedatum?.message}
              placeholder="bijv. 15-01-1970"
              required
              icon={<Calendar weight="duotone" className="w-5 h-5" />}
            />

            {/* Telefoonnummer */}
            <Input
              label="Telefoonnummer"
              type="tel"
              {...register('telefoonnummer')}
              error={errors.telefoonnummer?.message}
              placeholder="bijv. 0612345678"
              required
              icon={<Phone weight="duotone" className="w-5 h-5" />}
            />

            {/* E-mailadres */}
            <Input
              label="E-mailadres"
              type="email"
              {...register('emailadres')}
              error={errors.emailadres?.message}
              placeholder="naam@voorbeeld.nl"
              required
              icon={<Envelope weight="duotone" className="w-5 h-5" />}
            />

            {/* Herhaal e-mailadres */}
            <Input
              label="Herhaal e-mailadres"
              type="email"
              {...register('herhaalEmailadres')}
              error={errors.herhaalEmailadres?.message}
              placeholder="naam@voorbeeld.nl"
              required
              icon={<Envelope weight="duotone" className="w-5 h-5" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Maandelijkse betaling */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-navy-500 rounded-xl flex items-center justify-center">
              <CreditCard weight="duotone" className="w-5 h-5 text-brand-teal-500" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Maandelijkse betaling</h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Bij {leverancierNaam} betaalt u via automatische incasso.
            </p>

            {/* IBAN */}
            <div>
              <Input
                label="IBAN (rekeningnummer)"
                {...register('iban')}
                error={errors.iban?.message}
                placeholder="NL91ABNA0417164300"
                required
                icon={<CreditCard weight="duotone" className="w-5 h-5" />}
              />
              <a
                href="https://www.iban.nl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-teal-600 hover:text-brand-teal-700 font-semibold underline mt-1 inline-block"
              >
                IBAN bepalen
              </a>
            </div>

            {/* Checkbox: Rekening op andere naam */}
            <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                {...register('rekeningOpAndereNaam')}
                className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
              />
              <span className="text-sm font-medium text-gray-700">
                De rekening staat op een andere naam
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Levering */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-navy-500 rounded-xl flex items-center justify-center">
              <House weight="duotone" className="w-5 h-5 text-brand-teal-500" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Levering</h2>
          </div>

          <div className="space-y-6">
            {/* Heeft uw adres een verblijfsfunctie? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Heeft uw adres een verblijfsfunctie (woon-/werkadres)? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="ja"
                    checked={heeftVerblijfsfunctie === true}
                    onChange={() => setValue('heeftVerblijfsfunctie', true)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Ja</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="nee"
                    checked={heeftVerblijfsfunctie === false}
                    onChange={() => setValue('heeftVerblijfsfunctie', false)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Nee</span>
                </label>
              </div>
              {!heeftVerblijfsfunctie && (
                <div className="mt-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Warning weight="duotone" className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      <strong>Let op:</strong> U heeft geen recht op vermindering energiebelasting als uw adres geen verblijfsfunctie heeft.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gaat u binnenkort verhuizen? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Gaat u binnenkort verhuizen, of bent u onlangs verhuisd?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="nee"
                    checked={gaatVerhuizen === false}
                    onChange={() => setValue('gaatVerhuizen', false)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Nee</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors flex-1">
                  <input
                    type="radio"
                    value="ja"
                    checked={gaatVerhuizen === true}
                    onChange={() => setValue('gaatVerhuizen', true)}
                    className="w-5 h-5 text-brand-teal-500"
                  />
                  <span className="font-medium">Ja</span>
                </label>
              </div>
            </div>

            {/* Wanneer wilt u overstappen? */}
            {!gaatVerhuizen && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Wanneer wilt u overstappen? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors">
                    <input
                      type="radio"
                      value="zo_snel_mogelijk"
                      {...register('wanneerOverstappen')}
                      className="w-5 h-5 mt-0.5 text-brand-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-brand-navy-500 mb-1">
                        Zo snel mogelijk overstappen
                      </div>
                      <div className="text-sm text-gray-600">
                        Contract is verlopen, onbepaalde tijd of voortijdig opzeggen
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-brand-teal-500 transition-colors">
                    <input
                      type="radio"
                      value="na_contract_verlopen"
                      {...register('wanneerOverstappen')}
                      className="w-5 h-5 mt-0.5 text-brand-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-brand-navy-500 mb-1">
                        Zodra mijn vaste contract afloopt
                      </div>
                      <div className="text-sm text-gray-600">
                        Stap pas over nadat het vaste contract afloopt en voorkom een opzegboete
                      </div>
                    </div>
                  </label>
                </div>

                {/* Info blok: Hoe snel stapt u over? */}
                <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-brand-navy-500 mb-2">Hoe snel stapt u over?</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    De verwerkingstijd van een overstap is gemiddeld 30 dagen.
                    <br />
                    Als uw contract eerder ingaat, is dit geen probleem en regelen de leveranciers dit onderling.
                    <br />
                    Van de energieleverancier ontvangt u een contractbevestiging. Hierin vindt u de exacte startdatum.
                  </p>
                </div>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('herinneringContract')}
                  className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ja, ik word graag door PakketAdvies herinnerd wanneer mijn contract bijna afloopt
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  {...register('nieuwsbrief')}
                  className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ja, ik ontvang graag nieuws en marktontwikkelingen van PakketAdvies
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Akkoord en privacyverklaring */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-navy-500 rounded-xl flex items-center justify-center">
              <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-500" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy-500">Akkoord en privacyverklaring</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                {...register('voorwaarden')}
                className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-brand-navy-500">
                  Door aan te melden gaat u akkoord met de voorwaarden en sluit u een overeenkomst met betalingsverplichting met {leverancierNaam}. 
                  U heeft 14 kalenderdagen bedenktijd na ontvangst contract leverancier.
                </span>
                <button
                  type="button"
                  className="block text-xs text-brand-teal-500 hover:underline mt-1"
                >
                  Lees algemene voorwaarden
                </button>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                {...register('privacy')}
                className="w-5 h-5 mt-0.5 rounded-md text-brand-teal-500 border-gray-300 focus:ring-brand-teal-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-brand-navy-500">
                  Ik geef toestemming voor verwerking van mijn gegevens conform het privacybeleid
                </span>
                <button
                  type="button"
                  className="block text-xs text-brand-teal-500 hover:underline mt-1"
                >
                  Lees privacybeleid
                </button>
              </div>
            </label>

            {/* Security badges */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
              <div className="flex flex-wrap items-center gap-4 justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <ShieldCheck weight="duotone" className="w-4 h-4 text-brand-teal-600" />
                  <span>Secure GlobalSign</span>
                </div>
                <div className="text-xs text-gray-600">
                  Uw gegevens worden via een beveiligde verbinding verstuurd
                </div>
                <div className="text-xs text-gray-600">
                  Beveiligd met reCAPTCHA - <a href="#" className="text-brand-teal-600 hover:underline">Privacy</a> - <a href="#" className="text-brand-teal-600 hover:underline">Voorwaarden</a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <Button 
          type="button" 
          variant="ghost" 
          size="lg" 
          onClick={vorigeStap} 
          className="w-full sm:flex-1 text-sm md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Terug
        </Button>
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting}
          className="w-full sm:flex-1 bg-brand-teal-500 hover:bg-brand-teal-600"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Bezig...
            </>
          ) : (
            'Contract aanvragen'
          )}
        </Button>
      </div>
    </form>
  )
}

