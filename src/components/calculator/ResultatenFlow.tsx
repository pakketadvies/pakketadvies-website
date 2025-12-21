'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import ContractCard from '@/components/calculator/ContractCard'
import EditVerbruikPanel from '@/components/calculator/EditVerbruikPanel'
import FloatingEditButton from '@/components/calculator/FloatingEditButton'
import EditVerbruikModal from '@/components/calculator/EditVerbruikModal'
import { useCalculatorStore } from '@/store/calculatorStore'
import { Lightning, SlidersHorizontal, X, ArrowsDownUp, Leaf } from '@phosphor-icons/react'
import Link from 'next/link'
import type { ContractOptie, VerbruikData } from '@/types/calculator'
import {
  isGrootverbruik,
  isGrootverbruikElektriciteitAansluitwaarde,
  isGrootverbruikGasAansluitwaarde,
} from '@/lib/verbruik-type'

type AudienceMode = 'business' | 'consumer'

function getStartPath(audience: AudienceMode) {
  return audience === 'consumer' ? '/particulier/energie-vergelijken' : '/calculator'
}

// Helper: Calculate estimated cost for contract
// NOTE: This is a SIMPLIFIED calculation for the results page
// It calculates ONLY the leverancier costs (excl. taxes, netbeheer)
// For the FULL calculation with all costs, the energie-berekening.ts would be used
// But that requires netbeheerder lookup which is async and heavy for list pages
const berekenContractKostenVereenvoudigd = (
  contract: any,
  verbruikElektriciteitNormaal: number,
  verbruikElektriciteitDal: number,
  verbruikGas: number,
  heeftEnkeleMeter: boolean = false,
  terugleveringJaar: number = 0, // voor saldering
  aansluitwaardeElektriciteit?: string, // voor grootverbruik check
  aansluitwaardeGas?: string, // voor grootverbruik check
  enecoModelMaandbedrag?: number | null // Eneco modelcontract maandbedrag voor besparingsberekening
): { maandbedrag: number; jaarbedrag: number; besparing: number } => {
  let totaalJaar = 0

  // ============================================
  // STAP 1: SALDERINGSREGELING TOEPASSEN
  // ============================================
  let nettoElektriciteitNormaal = verbruikElektriciteitNormaal
  let nettoElektriciteitDal = verbruikElektriciteitDal

  if (terugleveringJaar > 0) {
    if (heeftEnkeleMeter) {
      const totaalVerbruik = verbruikElektriciteitNormaal + verbruikElektriciteitDal
      const nettoTotaal = Math.max(0, totaalVerbruik - terugleveringJaar)
      nettoElektriciteitNormaal = nettoTotaal
      nettoElektriciteitDal = 0
    } else {
      const terugleveringNormaal = terugleveringJaar / 2
      const terugleveringDal = terugleveringJaar / 2

      let normaal_na_aftrek = verbruikElektriciteitNormaal - terugleveringNormaal
      let dal_na_aftrek = verbruikElektriciteitDal - terugleveringDal

      if (normaal_na_aftrek < 0) {
        const overschot_normaal = -normaal_na_aftrek
        dal_na_aftrek = Math.max(0, dal_na_aftrek - overschot_normaal)
        normaal_na_aftrek = 0
      } else if (dal_na_aftrek < 0) {
        const overschot_dal = -dal_na_aftrek
        normaal_na_aftrek = Math.max(0, normaal_na_aftrek - overschot_dal)
        dal_na_aftrek = 0
      }

      nettoElektriciteitNormaal = Math.max(0, normaal_na_aftrek)
      nettoElektriciteitDal = Math.max(0, dal_na_aftrek)
    }
  }

  if (contract.type === 'vast' && contract.details_vast) {
    const {
      tarief_elektriciteit_enkel,
      tarief_elektriciteit_normaal,
      tarief_elektriciteit_dal,
      tarief_gas,
      tarief_teruglevering_kwh,
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      vaste_kosten_maand,
    } = contract.details_vast

    if (heeftEnkeleMeter && tarief_elektriciteit_enkel) {
      const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
      totaalJaar =
        totaalElektriciteit * tarief_elektriciteit_enkel +
        verbruikGas * (tarief_gas || 0) +
        (vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12
    } else if (!heeftEnkeleMeter && tarief_elektriciteit_normaal && tarief_elektriciteit_dal) {
      totaalJaar =
        nettoElektriciteitNormaal * tarief_elektriciteit_normaal +
        nettoElektriciteitDal * tarief_elektriciteit_dal +
        verbruikGas * (tarief_gas || 0) +
        (vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12
    } else {
      const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
      const tariefElektriciteit = tarief_elektriciteit_enkel || tarief_elektriciteit_normaal || 0
      totaalJaar =
        totaalElektriciteit * tariefElektriciteit +
        verbruikGas * (tarief_gas || 0) +
        (vastrecht_stroom_maand || vaste_kosten_maand || 4) * 12
    }

    if (terugleveringJaar > 0 && tarief_teruglevering_kwh) {
      totaalJaar += terugleveringJaar * tarief_teruglevering_kwh
    }

    const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
    const ebElektriciteit = totaalElektriciteit * 0.10154
    const ebGas = verbruikGas * 0.57816
    const vermindering = 524.95

    let netbeheerElektriciteit = 430.0
    if (aansluitwaardeElektriciteit && isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
      netbeheerElektriciteit = 0
    }
    let netbeheerGas = verbruikGas > 0 ? 245.0 : 0
    if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
      netbeheerGas = 0
    }
    const netbeheerKosten = netbeheerElektriciteit + netbeheerGas

    const geschatteExtraKosten = ebElektriciteit + ebGas - vermindering + netbeheerKosten
    totaalJaar += geschatteExtraKosten

    const totaalExclBtw = totaalJaar
    const btw = totaalExclBtw * 0.21
    totaalJaar = totaalExclBtw + btw
  } else if (contract.type === 'dynamisch' && contract.details_dynamisch) {
    const { opslag_elektriciteit_normaal, opslag_gas, vaste_kosten_maand } = contract.details_dynamisch
    const marktPrijsElektriciteit = 0.2
    const marktPrijsGas = 0.8

    const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
    totaalJaar =
      totaalElektriciteit * (marktPrijsElektriciteit + opslag_elektriciteit_normaal) +
      verbruikGas * (marktPrijsGas + (opslag_gas || 0)) +
      (vaste_kosten_maand || 0) * 12

    const ebElektriciteit = totaalElektriciteit * 0.10154
    const ebGas = verbruikGas * 0.57816
    const vermindering = 524.95

    let netbeheerElektriciteit = 430.0
    if (aansluitwaardeElektriciteit && isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
      netbeheerElektriciteit = 0
    }
    let netbeheerGas = verbruikGas > 0 ? 245.0 : 0
    if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
      netbeheerGas = 0
    }
    const netbeheerKosten = netbeheerElektriciteit + netbeheerGas

    const geschatteExtraKosten = ebElektriciteit + ebGas - vermindering + netbeheerKosten
    totaalJaar += geschatteExtraKosten

    const totaalExclBtw = totaalJaar
    const btw = totaalExclBtw * 0.21
    totaalJaar = totaalExclBtw + btw
  } else if (contract.type === 'maatwerk' && contract.details_maatwerk) {
    const details = contract.details_maatwerk
    const tarief_elektriciteit_enkel = details.tarief_elektriciteit_enkel
    const tarief_elektriciteit_normaal = details.tarief_elektriciteit_normaal
    const tarief_elektriciteit_dal = details.tarief_elektriciteit_dal
    const tarief_gas = details.tarief_gas
    const tarief_teruglevering_kwh = details.tarief_teruglevering_kwh || 0
    const vastrecht_stroom_maand = details.vastrecht_stroom_maand || 4.0
    const vastrecht_gas_maand = details.vastrecht_gas_maand || 4.0

    let nettoEN = verbruikElektriciteitNormaal
    let nettoED = verbruikElektriciteitDal || 0

    if (terugleveringJaar > 0) {
      if (heeftEnkeleMeter) {
        const totaalVerbruik = verbruikElektriciteitNormaal
        nettoEN = Math.max(0, totaalVerbruik - terugleveringJaar)
      } else {
        const terugleveringNormaal = terugleveringJaar / 2
        const terugleveringDal = terugleveringJaar / 2

        let normaal_na_aftrek = verbruikElektriciteitNormaal - terugleveringNormaal
        let dal_na_aftrek = (verbruikElektriciteitDal || 0) - terugleveringDal

        if (normaal_na_aftrek < 0) {
          const overschot_normaal = -normaal_na_aftrek
          dal_na_aftrek = Math.max(0, dal_na_aftrek - overschot_normaal)
          normaal_na_aftrek = 0
        } else if (dal_na_aftrek < 0) {
          const overschot_dal = -dal_na_aftrek
          normaal_na_aftrek = Math.max(0, normaal_na_aftrek - overschot_dal)
          dal_na_aftrek = 0
        }

        nettoEN = Math.max(0, normaal_na_aftrek)
        nettoED = Math.max(0, dal_na_aftrek)
      }
    }

    let totaalJaarMaatwerk = 0

    if (heeftEnkeleMeter && tarief_elektriciteit_enkel) {
      totaalJaarMaatwerk =
        nettoEN * tarief_elektriciteit_enkel +
        verbruikGas * (tarief_gas || 0) +
        vastrecht_stroom_maand * 12 +
        (verbruikGas > 0 ? vastrecht_gas_maand * 12 : 0)
    } else if (!heeftEnkeleMeter && tarief_elektriciteit_normaal && tarief_elektriciteit_dal) {
      totaalJaarMaatwerk =
        nettoEN * tarief_elektriciteit_normaal +
        nettoED * tarief_elektriciteit_dal +
        verbruikGas * (tarief_gas || 0) +
        vastrecht_stroom_maand * 12 +
        (verbruikGas > 0 ? vastrecht_gas_maand * 12 : 0)
    } else {
      const totaalElektriciteit = nettoEN + nettoED
      const tariefElektriciteit = tarief_elektriciteit_enkel || tarief_elektriciteit_normaal || 0
      totaalJaarMaatwerk =
        totaalElektriciteit * tariefElektriciteit +
        verbruikGas * (tarief_gas || 0) +
        vastrecht_stroom_maand * 12 +
        (verbruikGas > 0 ? vastrecht_gas_maand * 12 : 0)
    }

    if (terugleveringJaar > 0 && tarief_teruglevering_kwh) {
      totaalJaarMaatwerk += terugleveringJaar * tarief_teruglevering_kwh
    }

    const totaalElektriciteit = nettoEN + nettoED
    const ebElektriciteit = totaalElektriciteit * 0.10154
    const ebGas = verbruikGas * 0.57816
    const vermindering = 524.95

    let netbeheerElektriciteit = 430.0
    if (aansluitwaardeElektriciteit && isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
      netbeheerElektriciteit = 0
    }
    let netbeheerGas = verbruikGas > 0 ? 245.0 : 0
    if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
      netbeheerGas = 0
    }
    const netbeheerKosten = netbeheerElektriciteit + netbeheerGas
    const geschatteExtraKosten = ebElektriciteit + ebGas - vermindering + netbeheerKosten
    totaalJaarMaatwerk += geschatteExtraKosten

    const totaalExclBtw = totaalJaarMaatwerk
    const btw = totaalExclBtw * 0.21
    totaalJaarMaatwerk = totaalExclBtw + btw

    const maandbedrag = Math.round(totaalJaarMaatwerk / 12)
    const jaarbedrag = Math.round(totaalJaarMaatwerk)

    let besparing = 0
    if (enecoModelMaandbedrag && enecoModelMaandbedrag > 0) {
      besparing = Math.max(0, enecoModelMaandbedrag - maandbedrag)
    } else {
      const totaalElektriciteitVoorBesparing = verbruikElektriciteitNormaal + verbruikElektriciteitDal
      const gemiddeldeMaandbedrag = Math.round(((totaalElektriciteitVoorBesparing * 0.35 + verbruikGas * 1.5 + 700) / 12) as any)
      besparing = Math.max(0, gemiddeldeMaandbedrag - maandbedrag)
    }

    return { maandbedrag, jaarbedrag, besparing }
  }

  const totaalExclBtw = totaalJaar
  const btw = totaalExclBtw * 0.21
  totaalJaar = totaalExclBtw + btw

  const maandbedrag = Math.round(totaalJaar / 12)
  const jaarbedrag = Math.round(totaalJaar)

  let besparing = 0
  if (enecoModelMaandbedrag && enecoModelMaandbedrag > 0) {
    besparing = Math.max(0, enecoModelMaandbedrag - maandbedrag)
  } else {
    const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
    const gemiddeldeMaandbedrag = Math.round(((totaalElektriciteit * 0.35 + verbruikGas * 1.5 + 700) / 12) as any)
    besparing = Math.max(0, gemiddeldeMaandbedrag - maandbedrag)
  }

  return { maandbedrag, jaarbedrag, besparing }
}

// Transform API contract to ContractOptie
const transformContractToOptie = (
  contract: any,
  verbruikElektriciteitNormaal: number,
  verbruikElektriciteitDal: number,
  verbruikGas: number,
  heeftEnkeleMeter: boolean = false,
  terugleveringJaar: number = 0,
  aansluitwaardeElektriciteit?: string,
  aansluitwaardeGas?: string,
  enecoModelMaandbedrag?: number | null
): ContractOptie | null => {
  let maandbedrag: number
  let jaarbedrag: number

  if (contract.exactMaandbedrag && contract.exactJaarbedrag) {
    maandbedrag = contract.exactMaandbedrag
    jaarbedrag = contract.exactJaarbedrag
  } else {
    const berekend = berekenContractKostenVereenvoudigd(
      contract,
      verbruikElektriciteitNormaal,
      verbruikElektriciteitDal,
      verbruikGas,
      heeftEnkeleMeter,
      terugleveringJaar,
      aansluitwaardeElektriciteit,
      aansluitwaardeGas,
      enecoModelMaandbedrag
    )
    maandbedrag = berekend.maandbedrag
    jaarbedrag = berekend.jaarbedrag
  }

  const leverancier = contract.leverancier || {}
  const details = contract.details_vast || contract.details_dynamisch || contract.details_maatwerk || {}

  let contractLooptijd: number | undefined = undefined
  if (contract.type === 'vast' && contract.details_vast) {
    contractLooptijd = contract.details_vast.looptijd
  } else if (contract.type === 'maatwerk' && contract.details_maatwerk) {
    contractLooptijd = contract.details_maatwerk.looptijd
  }

  const contractRating = details.rating || 0
  const contractAantalReviews = details.aantal_reviews || 0

  let besparing = 0
  if (enecoModelMaandbedrag && enecoModelMaandbedrag > 0) {
    besparing = Math.max(0, enecoModelMaandbedrag - maandbedrag)
  } else {
    const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
    const gemiddeldeMaandbedrag = Math.round(((totaalElektriciteit * 0.35 + verbruikGas * 1.5 + 700) / 12) as any)
    besparing = Math.max(0, gemiddeldeMaandbedrag - maandbedrag)
  }

  return {
    id: contract.id,
    leverancier: {
      id: leverancier.id || '',
      naam: leverancier.naam || 'Onbekende leverancier',
      logo: leverancier.logo_url || '',
      website: leverancier.website || '',
      overLeverancier: leverancier.over_leverancier || undefined,
    },
    type: contract.type === 'maatwerk' ? 'vast' : contract.type,
    looptijd: contractLooptijd,
    maandbedrag,
    jaarbedrag,
    tariefElektriciteit: details.tarief_elektriciteit_normaal || details.opslag_elektriciteit_normaal || 0,
    tariefElektriciteitEnkel: details.tarief_elektriciteit_enkel || undefined,
    tariefElektriciteitDal: details.tarief_elektriciteit_dal || undefined,
    tariefGas: details.tarief_gas || details.opslag_gas || 0,
    groeneEnergie: details.groene_energie || false,
    targetAudience: contract.target_audience || undefined,
    contractNaam: contract.naam || undefined,
    rating: contractRating,
    aantalReviews: contractAantalReviews,
    voorwaarden: details.voorwaarden || [],
    opzegtermijn: details.opzegtermijn || 1,
    bijzonderheden: details.bijzonderheden || [],
    besparing,
    aanbevolen: contract.aanbevolen || false,
    populair: contract.populair || false,
    breakdown: contract.breakdown || undefined,
  }
}

function ResultatenContent({ audience }: { audience: AudienceMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verbruik, setVerbruik, reset, setResultaten: setResultatenInStore } = useCalculatorStore()

  const [resultaten, setResultaten] = useState<ContractOptie[]>([])
  const [filteredResultaten, setFilteredResultaten] = useState<ContractOptie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: 'alle' as 'alle' | 'vast' | 'dynamisch',
    groeneEnergie: false,
    maxPrijs: 99999,
    minRating: 0,
  })
  const [sortBy, setSortBy] = useState<'prijs-laag' | 'prijs-hoog' | 'besparing' | 'rating'>('besparing')

  // kept for backward compatibility (quick calc param), but we rely on store
  const isQuickCalc = searchParams?.get('quick') === 'true'

  const startPath = getStartPath(audience)

  const loadResultaten = async (verbruikData?: VerbruikData) => {
    try {
      setLoading(true)
      setError(null)

      let data = verbruikData || verbruik

      // If coming from quick calc and store is empty, fallback to localStorage
      if (!data && isQuickCalc) {
        const quickData = localStorage.getItem('quickcalc-data')
        if (quickData) {
          const parsed = JSON.parse(quickData)
          data = parsed.verbruik
        }
      }

      if (!data?.elektriciteitNormaal) {
        router.push(startPath)
        return
      }

      const elektriciteitNormaal = data.elektriciteitNormaal
      const elektriciteitDal = data.elektriciteitDal || 0
      const totaalGas = data.gasJaar || 0

      const heeftEnkeleMeter = data?.heeftEnkeleMeter || false
      const aansluitwaardeElektriciteit = data.aansluitwaardeElektriciteit || '3x25A'
      const aansluitwaardeGas = data.aansluitwaardeGas || 'G6'

      // Eneco modelcontract for saving calculations
      let enecoModelMaandbedrag: number | null = null
      try {
        const enecoResponse = await fetch('/api/model-tarieven/bereken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verbruikElektriciteitNormaal: elektriciteitNormaal,
            verbruikElektriciteitDal: elektriciteitDal,
            verbruikGas: totaalGas,
            heeftEnkeleMeter,
            aansluitwaardeElektriciteit,
            aansluitwaardeGas,
          }),
        })
        if (enecoResponse.ok) {
          const enecoData = await enecoResponse.json()
          enecoModelMaandbedrag = enecoData.maandbedrag || null
        }
      } catch (err) {
        console.error('❌ [RESULTATEN] Exception bij ophalen Eneco modeltarieven:', err)
      }

      const response = await fetch('/api/contracten/actief')
      if (!response.ok) throw new Error('Failed to fetch contracts')
      const { contracten } = await response.json()

      const postcode = data.leveringsadressen?.[0]?.postcode || '0000AA'

      const contractenMetKosten = await Promise.all(
        contracten.map(async (contract: any) => {
          try {
            const details = contract.details_vast || contract.details_dynamisch || contract.details_maatwerk || {}

            // maatwerk: threshold checks
            if (contract.type === 'maatwerk' && contract.details_maatwerk) {
              const maatwerkDetails = contract.details_maatwerk
              const totaalElektriciteit = elektriciteitNormaal + elektriciteitDal

              const heeftElektriciteitDrempel =
                maatwerkDetails.min_verbruik_elektriciteit !== null && maatwerkDetails.min_verbruik_elektriciteit !== undefined
              const heeftGasDrempel = maatwerkDetails.min_verbruik_gas !== null && maatwerkDetails.min_verbruik_gas !== undefined

              if (heeftElektriciteitDrempel || heeftGasDrempel) {
                let voldoetElektriciteit = false
                let voldoetGas = false

                if (heeftElektriciteitDrempel) {
                  voldoetElektriciteit = totaalElektriciteit >= maatwerkDetails.min_verbruik_elektriciteit!
                }
                if (heeftGasDrempel) {
                  voldoetGas = totaalGas > 0 ? totaalGas >= maatwerkDetails.min_verbruik_gas! : false
                }

                if (!heeftElektriciteitDrempel) voldoetElektriciteit = true
                if (!heeftGasDrempel) voldoetGas = true

                if (!voldoetElektriciteit && !voldoetGas) return null
              }

              // verbruik_type filter for maatwerk
              const verbruikType = maatwerkDetails.verbruik_type || 'beide'
              if (verbruikType !== 'beide') {
                const gebruikerIsGrootverbruik = isGrootverbruik(data?.aansluitwaardeElektriciteit, data?.aansluitwaardeGas)
                if (verbruikType === 'kleinverbruik' && gebruikerIsGrootverbruik) return null
                if (verbruikType === 'grootverbruik' && !gebruikerIsGrootverbruik) return null
              }
            }

            // verbruik_type filter for vast & dynamisch
            if (contract.type === 'vast' && contract.details_vast) {
              const verbruikType = contract.details_vast.verbruik_type || 'beide'
              if (verbruikType !== 'beide') {
                const gebruikerIsGrootverbruik = isGrootverbruik(data?.aansluitwaardeElektriciteit, data?.aansluitwaardeGas)
                if (verbruikType === 'kleinverbruik' && gebruikerIsGrootverbruik) return null
                if (verbruikType === 'grootverbruik' && !gebruikerIsGrootverbruik) return null
              }
            }

            if (contract.type === 'dynamisch' && contract.details_dynamisch) {
              const verbruikType = contract.details_dynamisch.verbruik_type || 'beide'
              if (verbruikType !== 'beide') {
                const gebruikerIsGrootverbruik = isGrootverbruik(data?.aansluitwaardeElektriciteit, data?.aansluitwaardeGas)
                if (verbruikType === 'kleinverbruik' && gebruikerIsGrootverbruik) return null
                if (verbruikType === 'grootverbruik' && !gebruikerIsGrootverbruik) return null
              }
            }

            // Exact cost calc
            const heeftDubbeleMeter = data?.heeftEnkeleMeter === true ? false : !data?.heeftEnkeleMeter
            const kostenResponse = await fetch('/api/energie/bereken-contract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                elektriciteitNormaal,
                elektriciteitDal,
                gas: totaalGas,
                terugleveringJaar: data?.terugleveringJaar || 0,
                aansluitwaardeElektriciteit,
                aansluitwaardeGas,
                postcode,
                contractType: contract.type,
                tariefElektriciteitNormaal:
                  details.tarief_elektriciteit_normaal ||
                  details.opslag_elektriciteit_normaal ||
                  details.opslag_elektriciteit ||
                  0,
                tariefElektriciteitDal: details.tarief_elektriciteit_dal || 0,
                tariefElektriciteitEnkel: details.tarief_elektriciteit_enkel || 0,
                tariefGas: details.tarief_gas || details.opslag_gas || 0,
                tariefTerugleveringKwh: details.tarief_teruglevering_kwh || 0,
                opslagElektriciteit: details.opslag_elektriciteit || details.opslag_elektriciteit_normaal || 0,
                opslagGas: details.opslag_gas || 0,
                opslagTeruglevering: details.opslag_teruglevering || 0,
                vastrechtStroomMaand: details.vastrecht_stroom_maand || 4.0,
                vastrechtGasMaand: details.vastrecht_gas_maand || 4.0,
                heeftDubbeleMeter,
              }),
            })

            if (kostenResponse.ok) {
              const { breakdown } = await kostenResponse.json()
              return {
                ...contract,
                exactMaandbedrag: Math.round(breakdown.totaal.maandExclBtw),
                exactJaarbedrag: Math.round(breakdown.totaal.jaarExclBtw),
                breakdown,
              }
            }
          } catch (err) {
            console.error('Error calculating costs for contract:', contract.id, err)
          }
          return contract
        })
      )

      // Filter null values (maatwerk not eligible)
      let validContracten = contractenMetKosten.filter((c: any) => c !== null)

      // teruglevering filter
      const heeftTeruglevering = (data?.terugleveringJaar || 0) > 0
      validContracten = validContracten.filter((c: any) => {
        if (c.zichtbaar_bij_teruglevering === null || c.zichtbaar_bij_teruglevering === undefined) return true
        if (c.zichtbaar_bij_teruglevering === true) return heeftTeruglevering
        return !heeftTeruglevering
      })

      // addressType -> target_audience filter
      const effectiveAddressType = data?.addressType || verbruik?.addressType
      if (effectiveAddressType) {
        validContracten = validContracten.filter((c: any) => {
          const targetAudience = c.target_audience
          if (!targetAudience) return true
          if (targetAudience === 'both') return true
          return targetAudience === effectiveAddressType
        })
      }

      const transformed = validContracten
        .map((c: any) =>
          transformContractToOptie(
            c,
            elektriciteitNormaal,
            elektriciteitDal,
            totaalGas,
            data?.heeftEnkeleMeter || false,
            data?.terugleveringJaar || 0,
            aansluitwaardeElektriciteit,
            aansluitwaardeGas,
            enecoModelMaandbedrag
          )
        )
        .filter((c: any) => c !== null) as ContractOptie[]

      setResultaten(transformed)
      setFilteredResultaten(transformed)
      setResultatenInStore(transformed)
      setLoading(false)
    } catch (err) {
      console.error('Error loading resultaten:', err)
      setError('Er ging iets mis bij het ophalen van de resultaten. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  const handleVerbruikUpdate = async (newVerbruikData: VerbruikData) => {
    setIsUpdating(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
    try {
      setVerbruik(newVerbruikData)
      setIsModalOpen(false)
      await loadResultaten(newVerbruikData)
      setTimeout(() => {
        const resultsSection = document.querySelector('[data-results-section]')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: 300, behavior: 'smooth' })
        }
      }, 100)
    } catch (err) {
      console.error('Error updating verbruik:', err)
      setError('Er ging iets mis bij het herberekenen. Probeer het opnieuw.')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    loadResultaten()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuickCalc, router, verbruik?.addressType])

  useEffect(() => {
    let filtered = [...resultaten]

    if (verbruik?.addressType) {
      filtered = filtered.filter((r) => {
        if (!r.targetAudience) return true
        if (r.targetAudience === 'both') return true
        return r.targetAudience === verbruik.addressType
      })
    }

    if (filters.type !== 'alle') filtered = filtered.filter((r) => r.type === filters.type)
    if (filters.groeneEnergie) filtered = filtered.filter((r) => r.groeneEnergie)
    filtered = filtered.filter((r) => r.maandbedrag <= filters.maxPrijs)
    filtered = filtered.filter((r) => r.rating >= filters.minRating)

    switch (sortBy) {
      case 'prijs-laag':
        filtered.sort((a, b) => a.maandbedrag - b.maandbedrag)
        break
      case 'prijs-hoog':
        filtered.sort((a, b) => b.maandbedrag - a.maandbedrag)
        break
      case 'besparing':
        filtered.sort((a, b) => (b.besparing || 0) - (a.besparing || 0))
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
    }

    setFilteredResultaten(filtered)
  }, [resultaten, filters, sortBy, verbruik?.addressType])

  const handleStartOpnieuw = () => {
    reset()
    localStorage.removeItem('quickcalc-data')
    router.push(startPath)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="container-custom">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="w-full h-full border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin" />
            </div>
            <p className="text-lg text-gray-600">We zoeken de beste opties voor jou...</p>
            <p className="text-sm text-gray-500 mt-2">Dit duurt maar een paar seconden</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X weight="bold" className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy-500 mb-2">Er ging iets mis</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>Probeer opnieuw</Button>
              <Button variant="outline" onClick={handleStartOpnieuw}>
                Start opnieuw
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 md:pt-32 pb-12">
      <div className="container-custom max-w-7xl">
        <div className="mb-6 md:mb-8 pt-4 md:pt-6">
          {verbruik && (
            <div className="mb-6 hidden lg:block">
              <EditVerbruikPanel currentData={verbruik} onUpdate={handleVerbruikUpdate} isUpdating={isUpdating} />
            </div>
          )}

          {verbruik && (
            <>
              <div className="lg:hidden">
                <FloatingEditButton onClick={() => setIsModalOpen(true)} />
              </div>

              <EditVerbruikModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentData={verbruik}
                onSave={handleVerbruikUpdate}
                isUpdating={isUpdating}
                filters={filters}
                onFiltersChange={(newFilters) => setFilters(newFilters)}
                sortBy={sortBy}
                onSortByChange={(newSortBy) => setSortBy(newSortBy)}
              />
            </>
          )}

          <div className="hidden md:block bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4" data-results-section>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, type: 'alle' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'alle'
                      ? 'bg-brand-teal-500 text-white shadow-md'
                      : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setFilters({ ...filters, type: 'vast' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'vast'
                      ? 'bg-brand-teal-500 text-white shadow-md'
                      : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                  }`}
                >
                  Vast
                </button>
                <button
                  onClick={() => setFilters({ ...filters, type: 'dynamisch' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'dynamisch'
                      ? 'bg-brand-teal-500 text-white shadow-md'
                      : 'bg-brand-navy-50 text-brand-navy-600 hover:bg-brand-navy-100'
                  }`}
                >
                  Dynamisch
                </button>
                <button
                  onClick={() => setFilters({ ...filters, groeneEnergie: !filters.groeneEnergie })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    filters.groeneEnergie ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Leaf weight="duotone" className="w-4 h-4" />
                  Groen
                </button>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <SlidersHorizontal weight="bold" className="w-4 h-4" />
                  Meer filters
                  {showAdvancedFilters ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <ArrowsDownUp weight="bold" className="w-5 h-5 text-gray-500 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                >
                  <option value="besparing">Hoogste besparing</option>
                  <option value="prijs-laag">Laagste prijs</option>
                  <option value="prijs-hoog">Hoogste prijs</option>
                  <option value="rating">Beste beoordeling</option>
                </select>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-down">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Min. beoordeling</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent"
                  >
                    <option value="0">Alle</option>
                    <option value="4">4+ sterren</option>
                    <option value="4.5">4.5+ sterren</option>
                    <option value="4.8">4.8+ sterren</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Link
                    href="/producten/dynamisch-contract"
                    className="w-full px-4 py-2 text-sm font-medium text-brand-teal-600 hover:text-brand-teal-700 hover:bg-brand-teal-50 rounded-lg transition-colors border-2 border-brand-teal-200 hover:border-brand-teal-300 flex items-center justify-center gap-2"
                  >
                    <Lightning weight="duotone" className="w-4 h-4" />
                    Hoe werkt dynamisch?
                  </Link>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ type: 'alle', groeneEnergie: false, maxPrijs: 99999, minRating: 0 })}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-navy-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <X weight="bold" className="w-4 h-4 inline mr-1" />
                    Reset filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {filteredResultaten.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-600 mb-4">Geen contracten gevonden met deze filters</p>
            <Button variant="outline" onClick={() => setFilters({ type: 'alle', groeneEnergie: false, maxPrijs: 99999, minRating: 0 })}>
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResultaten.map((contract, index) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                meterType={verbruik?.meterType || 'weet_niet'}
                heeftEnkeleMeter={verbruik?.heeftEnkeleMeter || false}
                verbruikElektriciteitNormaal={verbruik?.elektriciteitNormaal || 0}
                verbruikElektriciteitDal={verbruik?.elektriciteitDal || 0}
                verbruikGas={verbruik?.gasJaar || 0}
                terugleveringJaar={verbruik?.terugleveringJaar || 0}
                aansluitwaardeElektriciteit={verbruik?.aansluitwaardeElektriciteit || '3x25A'}
                aansluitwaardeGas={verbruik?.aansluitwaardeGas || 'G6'}
                postcode={verbruik?.leveringsadressen?.[0]?.postcode || ''}
                position={index + 1}
              />
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-2xl p-6 md:p-8 text-center shadow-md">
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy-500 mb-3">Hulp nodig bij het kiezen?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            {audience === 'consumer'
              ? 'We helpen je graag om het contract te kiezen dat past bij jouw huishouden.'
              : 'Onze energiespecialisten helpen je graag om het beste contract te vinden dat perfect bij jouw bedrijf past.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/contact?reason=advies">
              <Button className="w-full sm:w-auto">{audience === 'consumer' ? 'Vraag hulp bij kiezen' : 'Vraag persoonlijk advies'}</Button>
            </Link>
            <Link href="tel:+31850477065">
              <Button variant="outline" className="w-full sm:w-auto">
                Bel 085 047 7065
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResultatenFlow({ audience }: { audience: AudienceMode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 pt-32 pb-12">
          <div className="container-custom">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="w-full h-full border-4 border-brand-teal-50 border-t-brand-teal-500 rounded-full animate-spin" />
              </div>
              <p className="text-lg text-gray-600">Laden...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResultatenContent audience={audience} />
    </Suspense>
  )
}


