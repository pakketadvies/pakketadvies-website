'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import ContractCard from '@/components/calculator/ContractCard'
import { ConsumerContractRowCard } from '@/components/calculator/ConsumerContractRowCard'
import EditVerbruikPanel from '@/components/calculator/EditVerbruikPanel'
import FloatingEditButton from '@/components/calculator/FloatingEditButton'
import EditVerbruikModal from '@/components/calculator/EditVerbruikModal'
import { useCalculatorStore } from '@/store/calculatorStore'
import { X, ChatCircle, Phone, PencilSimple } from '@phosphor-icons/react'
import Link from 'next/link'
import Image from 'next/image'
import { Keuzehulp } from '@/components/particulier/Keuzehulp'
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
  enecoModelMaandbedrag?: number | null,
  addressType?: 'particulier' | 'zakelijk' | null // NIEUW: voor BTW bepaling
): ContractOptie | null => {
  let maandbedrag: number
  let jaarbedrag: number
  const isZakelijk = addressType === 'zakelijk'

  if (contract.exactMaandbedrag && contract.exactJaarbedrag) {
    // exactMaandbedrag is al correct (excl BTW voor zakelijk, incl BTW voor particulier)
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
    // berekenContractKostenVereenvoudigd geeft altijd incl BTW terug
    // Voor zakelijk moeten we BTW eraf halen
    if (isZakelijk) {
      maandbedrag = Math.round(berekend.maandbedrag / 1.21)
      jaarbedrag = Math.round(berekend.jaarbedrag / 1.21)
    } else {
      maandbedrag = berekend.maandbedrag
      jaarbedrag = berekend.jaarbedrag
    }
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
    // NIEUW: voeg details_vast en details_dynamisch toe zodat ContractDetailsCard deze kan gebruiken
    details_vast: contract.details_vast || undefined,
    details_dynamisch: contract.details_dynamisch || undefined,
    details_maatwerk: contract.details_maatwerk || undefined,
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
  const [isKeuzehulpOpen, setIsKeuzehulpOpen] = useState(false)

  // Explicit close handler for modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

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
              // Bepaal of zakelijk of particulier op basis van addressType
              const isZakelijk = data?.addressType === 'zakelijk'
              return {
                ...contract,
                // Voor zakelijk: gebruik excl BTW, voor particulier: gebruik incl BTW
                exactMaandbedrag: isZakelijk 
                  ? Math.round(breakdown.totaal.maandExclBtw)
                  : Math.round(breakdown.totaal.maandInclBtw ?? breakdown.totaal.maandExclBtw),
                exactJaarbedrag: isZakelijk
                  ? Math.round(breakdown.totaal.jaarExclBtw)
                  : Math.round(breakdown.totaal.jaarInclBtw ?? breakdown.totaal.jaarExclBtw),
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
            enecoModelMaandbedrag,
            data?.addressType || verbruik?.addressType // NIEUW: doorgeven addressType voor BTW bepaling
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
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Conditionele padding: alleen voor consumer (particulier) omdat business (zakelijk) al CalculatorLayout padding heeft */}
      <div className={audience === 'consumer' ? 'pt-24 md:pt-28' : ''}>
        {verbruik && (
            <>
              <div className="lg:hidden">
                <FloatingEditButton onClick={() => setIsModalOpen(true)} />
              </div>

              <EditVerbruikModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
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

          {/* Pricewise-style layout (sidebar + list) - EXACT same for both consumer and business */}
          {verbruik && (
            <div className="mt-5">
              <div className="mb-5 rounded-2xl bg-brand-navy-500 text-white px-4 py-4 lg:mx-auto lg:max-w-7xl lg:px-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-white/80 text-sm">Resultaten</p>
                    <h1 className="text-xl md:text-2xl font-bold">
                      {(() => {
                        const adres = verbruik.leveringsadressen?.[0]
                        const adresTekst = adres?.straat && adres?.huisnummer
                          ? `${adres.straat} ${adres.huisnummer}${adres.toevoeging ? ` ${adres.toevoeging}` : ''}`
                          : null
                        
                        const totaalElektriciteit = verbruik.elektriciteitNormaal + (verbruik.elektriciteitDal || 0)
                        const verbruikTekst = [
                          totaalElektriciteit > 0 && `${totaalElektriciteit.toLocaleString('nl-NL')} kWh stroom`,
                          verbruik.gasJaar && verbruik.gasJaar > 0 && `${verbruik.gasJaar.toLocaleString('nl-NL')} m³ gas`
                        ].filter(Boolean).join(' • ')
                        
                        if (adresTekst && verbruikTekst) {
                          return `Dit zijn onze ${filteredResultaten.length} deals voor ${adresTekst}`
                        } else if (adresTekst) {
                          return `Dit zijn onze ${filteredResultaten.length} deals voor ${adresTekst}`
                        } else {
                          return `Dit zijn onze ${filteredResultaten.length} deals voor jou`
                        }
                      })()}
                    </h1>
                    {(() => {
                      const totaalElektriciteit = verbruik.elektriciteitNormaal + (verbruik.elektriciteitDal || 0)
                      const verbruikTekst = [
                        totaalElektriciteit > 0 && `${totaalElektriciteit.toLocaleString('nl-NL')} kWh stroom`,
                        verbruik.gasJaar && verbruik.gasJaar > 0 && `${verbruik.gasJaar.toLocaleString('nl-NL')} m³ gas`
                      ].filter(Boolean).join(' • ')
                      
                      return verbruikTekst ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
                          <p className="text-white/90 text-sm md:text-base">
                            {verbruikTekst}
                          </p>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium transition-colors group self-start sm:self-auto"
                          >
                            <PencilSimple size={14} weight="bold" className="group-hover:text-white transition-colors" />
                            <span className="underline decoration-white/40 group-hover:decoration-white transition-colors">
                              Verbruik aanpassen
                            </span>
                          </button>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[340px_1fr] px-4 lg:mx-auto lg:max-w-7xl lg:px-0">
                {/* Sidebar */}
                <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                  {/* Help mij kiezen sectie */}
                  <div className="bg-gradient-to-br from-brand-navy-500 via-brand-navy-600 to-brand-teal-600 rounded-2xl p-4 text-white overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ChatCircle weight="duotone" className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1">Help mij kiezen</h3>
                          <p className="text-white/90 text-xs leading-relaxed">
                            Vind een passende energiedeal met persoonlijk advies van onze experts.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setIsKeuzehulpOpen(true)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-brand-navy-600 rounded-xl font-semibold text-xs hover:bg-white/95 transition-colors shadow-lg"
                        >
                          <ChatCircle weight="bold" className="w-3.5 h-3.5" />
                          Start keuzehulp
                        </button>
                        <a
                          href="tel:0850477065"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-xs hover:bg-white/20 transition-colors"
                        >
                          <Phone weight="bold" className="w-3.5 h-3.5" />
                          Bel ons
                        </a>
                      </div>
                    </div>
                    {/* Background image */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-20 pointer-events-none overflow-hidden rounded-bl-2xl">
                      <Image
                        src="/images/office-team.jpg"
                        alt="Team PakketAdvies"
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    </div>
                  </div>

                  {/* Pricewise-style: edit your details in the left sidebar */}
                  <div className="hidden lg:block">
                    <EditVerbruikPanel currentData={verbruik} onUpdate={handleVerbruikUpdate} isUpdating={isUpdating} layout="sidebar" />
                  </div>

                  {/* Filters - alleen op desktop zichtbaar, op mobiel in Keuzehulp */}
                  <div className="hidden lg:block space-y-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                      <div className="font-semibold text-brand-navy-600">Weergave</div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Sorteren op</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-brand-navy-600 focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-transparent transition-all"
                        >
                          <option value="besparing">Hoogste besparing</option>
                          <option value="prijs-laag">Laagste prijs</option>
                          <option value="prijs-hoog">Hoogste prijs</option>
                          <option value="rating">Beste beoordeling</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                      <div className="font-semibold text-brand-navy-600">Contract</div>
                      <div className="space-y-2 text-sm">
                        {(['alle', 'vast', 'dynamisch'] as const).map((t) => (
                          <label key={t} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="contractType"
                              checked={filters.type === t}
                              onChange={() => setFilters({ ...filters, type: t })}
                              className="text-brand-teal-600"
                            />
                            <span className="text-gray-700">
                              {t === 'alle' ? 'Alle typen' : t === 'vast' ? 'Vast' : 'Dynamisch'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                      <div className="font-semibold text-brand-navy-600">Duurzaamheid</div>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={filters.groeneEnergie}
                          onChange={() => setFilters({ ...filters, groeneEnergie: !filters.groeneEnergie })}
                          className="text-brand-teal-600"
                        />
                        <span className="text-gray-700">Alleen groene stroom</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFilters({ type: 'alle', groeneEnergie: false, maxPrijs: 99999, minRating: 0 })
                        setSortBy('besparing')
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Filters herstellen
                    </button>
                  </div>
                </aside>

                {/* Results list */}
                <section className="space-y-4">
                  {filteredResultaten.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-200">
                      <p className="text-gray-600 mb-4">Geen contracten gevonden met deze filters</p>
                      <Button
                        variant="outline"
                        onClick={() => setFilters({ type: 'alle', groeneEnergie: false, maxPrijs: 99999, minRating: 0 })}
                      >
                        Reset filters
                      </Button>
                    </div>
                  ) : (
                    filteredResultaten.map((contract, index) => (
                      <div
                        key={contract.id}
                        className="animate-fade-in"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          animationFillMode: 'both',
                        }}
                      >
                        <ConsumerContractRowCard
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
                      </div>
                    ))
                  )}
                </section>
              </div>

              {/* Keuzehulp component */}
              <Keuzehulp
                isOpen={isKeuzehulpOpen}
                onClose={() => setIsKeuzehulpOpen(false)}
                onApplyFilters={(newFilters) => {
                  setFilters({ type: newFilters.type, groeneEnergie: newFilters.groeneEnergie, maxPrijs: 99999, minRating: 0 })
                  setSortBy(newFilters.sortBy)
                  setIsKeuzehulpOpen(false)
                }}
                currentFilters={{ ...filters, sortBy }}
              />
            </div>
          )}
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


