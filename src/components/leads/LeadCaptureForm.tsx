'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { captureComparisonLead, updateComparisonLeadContext } from '@/lib/lead-capture'
import type {
  ComparisonLeadExtraContext,
  ComparisonLeadFlow,
  ComparisonLeadSource,
} from '@/types/comparison-leads'

interface LeadCaptureFormProps {
  source: ComparisonLeadSource
  flow: ComparisonLeadFlow
  title: string
  subtitle?: string
  buttonText?: string
  compact?: boolean
  onComplete?: () => void
}

export function LeadCaptureForm({
  source,
  flow,
  title,
  subtitle,
  buttonText = 'Stuur mijn aanbod',
  compact = false,
  onComplete,
}: LeadCaptureFormProps) {
  const [stage, setStage] = useState<'capture' | 'offer_enrichment' | 'enrich' | 'done'>('capture')
  const [leadId, setLeadId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [locationType, setLocationType] = useState<ComparisonLeadExtraContext['locationType']>('onbekend')
  const [electricityUsageRange, setElectricityUsageRange] =
    useState<ComparisonLeadExtraContext['electricityUsageRange']>('unknown')
  const [gasUsageRange, setGasUsageRange] = useState<ComparisonLeadExtraContext['gasUsageRange']>('unknown')
  const [switchMoment, setSwitchMoment] = useState<ComparisonLeadExtraContext['switchMoment']>('orienting')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnrichmentSubmitting, setIsEnrichmentSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const consentText = useMemo(
    () => 'Ik geef toestemming om contact op te nemen over energie-aanbod van PakketAdvies.',
    []
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Vul een geldig e-mailadres in.')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await captureComparisonLead({
        email: email.trim(),
        phone: phone.trim() || undefined,
        source,
        flow,
        consentText,
      })
      setLeadId(response.id || null)
      setStage('offer_enrichment')
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : 'Opslaan mislukt. Probeer het opnieuw.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkipEnrichment = () => {
    setStage('done')
    onComplete?.()
  }

  const handleSubmitEnrichment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!leadId) {
      setStage('done')
      onComplete?.()
      return
    }

    try {
      setIsEnrichmentSubmitting(true)
      setEnrichmentError(null)
      await updateComparisonLeadContext({
        leadId,
        extraContext: {
          locationType,
          electricityUsageRange,
          gasUsageRange,
          switchMoment,
          note: note.trim() || undefined,
        },
      })
      setStage('done')
      onComplete?.()
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Opslaan van extra informatie is mislukt. Probeer opnieuw.'
      setEnrichmentError(message)
    } finally {
      setIsEnrichmentSubmitting(false)
    }
  }

  const contentByStage = {
    done: (
      <div className="rounded-xl border border-brand-teal-200 bg-brand-teal-50 px-4 py-4">
        <p className="text-sm font-semibold text-brand-teal-700">Top, je aanvraag staat klaar.</p>
        <p className="mt-1 text-sm text-gray-700">
          We sturen je snel een passend voorstel op basis van jouw situatie.
        </p>
      </div>
    ),
    offer_enrichment: (
      <div className="rounded-xl border border-brand-teal-200 bg-brand-teal-50/70 px-4 py-4 space-y-3">
        <p className="text-sm md:text-base font-semibold text-brand-navy-600">
          Wil je een nog scherper voorstel? (optioneel)
        </p>
        <p className="text-sm text-gray-700">
          Met een paar extra gegevens maken we je aanbod nauwkeuriger. Kost ongeveer 20 seconden.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            size={compact ? 'sm' : 'md'}
            className="w-full sm:w-auto"
            onClick={() => setStage('enrich')}
          >
            Ja, verfijn mijn voorstel
          </Button>
          <Button
            type="button"
            variant="outline"
            size={compact ? 'sm' : 'md'}
            className="w-full sm:w-auto"
            onClick={handleSkipEnrichment}
          >
            Nee, is goed zo
          </Button>
        </div>
      </div>
    ),
    enrich: (
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        <div>
          <h3 className={compact ? 'text-base font-bold text-brand-navy-500' : 'text-lg font-bold text-brand-navy-500'}>
            Maak je voorstel nog persoonlijker
          </h3>
          <p className="mt-1 text-sm text-gray-600">Volledig optioneel, maar helpt ons om gerichter te adviseren.</p>
        </div>

        <form onSubmit={handleSubmitEnrichment} className={compact ? 'space-y-3' : 'space-y-4'}>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Type locatie</label>
            <select
              value={locationType}
              onChange={(event) =>
                setLocationType(event.target.value as ComparisonLeadExtraContext['locationType'])
              }
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            >
              <option value="onbekend">Niet opgegeven</option>
              <option value="woning">Woning</option>
              <option value="zakelijk_pand">Zakelijk pand</option>
              <option value="zakelijk_aan_huis">Zakelijk aan huis</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Jaarverbruik stroom</label>
              <select
                value={electricityUsageRange}
                onChange={(event) =>
                  setElectricityUsageRange(
                    event.target.value as ComparisonLeadExtraContext['electricityUsageRange']
                  )
                }
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              >
                <option value="unknown">Niet opgegeven</option>
                <option value="lt_2500">Minder dan 2.500 kWh</option>
                <option value="2500_5000">2.500 - 5.000 kWh</option>
                <option value="5000_10000">5.000 - 10.000 kWh</option>
                <option value="gt_10000">Meer dan 10.000 kWh</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Jaarverbruik gas</label>
              <select
                value={gasUsageRange}
                onChange={(event) =>
                  setGasUsageRange(event.target.value as ComparisonLeadExtraContext['gasUsageRange'])
                }
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
              >
                <option value="unknown">Niet opgegeven</option>
                <option value="none">Geen gas</option>
                <option value="lt_1000">Minder dan 1.000 m3</option>
                <option value="1000_2000">1.000 - 2.000 m3</option>
                <option value="2000_4000">2.000 - 4.000 m3</option>
                <option value="gt_4000">Meer dan 4.000 m3</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Wanneer wil je overstappen?</label>
            <select
              value={switchMoment}
              onChange={(event) =>
                setSwitchMoment(event.target.value as ComparisonLeadExtraContext['switchMoment'])
              }
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            >
              <option value="direct">Zo snel mogelijk</option>
              <option value="within_3_months">Binnen 3 maanden</option>
              <option value="orienting">Ik ben me nog aan het orienteren</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Extra toelichting (optioneel)</label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={compact ? 3 : 4}
              maxLength={600}
              placeholder="Bijvoorbeeld: huidig contract loopt af in mei, belangrijk dat tarieven stabiel zijn."
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm text-brand-navy-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            />
          </div>

          {enrichmentError && <p className="text-sm font-medium text-red-600">{enrichmentError}</p>}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              variant="primary"
              size={compact ? 'sm' : 'md'}
              loading={isEnrichmentSubmitting}
              className="w-full sm:w-auto"
            >
              Sla extra informatie op
            </Button>
            <Button
              type="button"
              variant="ghost"
              size={compact ? 'sm' : 'md'}
              className="w-full sm:w-auto"
              onClick={handleSkipEnrichment}
            >
              Overslaan
            </Button>
          </div>
        </form>
      </div>
    ),
    capture: (
      <div className={compact ? 'space-y-3' : 'space-y-4'}>
        <div>
          <h3 className={compact ? 'text-base font-bold text-brand-navy-500' : 'text-lg font-bold text-brand-navy-500'}>
            {title}
          </h3>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>

        <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
          <Input
            type="email"
            label="E-mailadres"
            placeholder="naam@voorbeeld.nl"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            inputSize={compact ? 'sm' : 'md'}
          />

          <Input
            type="tel"
            label="Telefoonnummer (optioneel)"
            placeholder="06 12345678"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputSize={compact ? 'sm' : 'md'}
          />

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" variant="primary" size={compact ? 'sm' : 'md'} loading={isSubmitting} className="w-full">
            {buttonText}
          </Button>

          <p className="text-xs text-gray-500">
            Met versturen ga je akkoord dat we je mogen benaderen over energiecontracten.
          </p>
        </form>
      </div>
    ),
  } as const

  const stageMotion = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.99 },
        transition: { duration: 0.22, ease: 'easeOut' },
      }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stage}
        initial={stageMotion.initial}
        animate={stageMotion.animate}
        exit={stageMotion.exit}
        transition={stageMotion.transition}
      >
        {contentByStage[stage]}
      </motion.div>
    </AnimatePresence>
  )
}
