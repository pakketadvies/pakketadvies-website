import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CalculatorState,
  VerbruikData,
  BedrijfsGegevens,
  ContractVoorkeuren,
  ContractOptie,
} from '@/types/calculator'

interface CalculatorStore extends CalculatorState {
  // Actions
  setStap: (stap: number) => void
  volgendeStap: () => void
  vorigeStap: () => void
  setVerbruik: (verbruik: VerbruikData) => void
  setBedrijfsgegevens: (bedrijfsgegevens: BedrijfsGegevens) => void
  setVoorkeuren: (voorkeuren: ContractVoorkeuren) => void
  setResultaten: (resultaten: ContractOptie[]) => void
  setAddressType: (type: 'particulier' | 'zakelijk' | null) => void
  setSelectedContract: (contract: ContractOptie | null) => void // NIEUW: set gekozen contract
  reset: () => void
}

const initialState: CalculatorState = {
  stap: 1,
  verbruik: null,
  bedrijfsgegevens: null,
  voorkeuren: null,
  resultaten: null,
  selectedContract: null,
}

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStap: (stap) => set({ stap }),

      volgendeStap: () => {
        const currentStap = get().stap
        if (currentStap < 4) {
          set({ stap: currentStap + 1 })
        }
      },

      vorigeStap: () => {
        const currentStap = get().stap
        if (currentStap > 1) {
          set({ stap: currentStap - 1 })
        }
      },

      setVerbruik: (verbruik) => set({ verbruik }),

      setBedrijfsgegevens: (bedrijfsgegevens) => set({ bedrijfsgegevens }),

      setVoorkeuren: (voorkeuren) => set({ voorkeuren }),

      setResultaten: (resultaten) => set({ resultaten }),

      setAddressType: (type) => {
        const currentVerbruik = get().verbruik
        if (currentVerbruik) {
          set({ verbruik: { ...currentVerbruik, addressType: type } })
        }
      },

      setSelectedContract: (contract) => set({ selectedContract: contract }),

      reset: () => set(initialState),
    }),
    {
      name: 'calculator-storage',
      partialize: (state) => ({
        verbruik: state.verbruik,
        bedrijfsgegevens: state.bedrijfsgegevens,
        voorkeuren: state.voorkeuren,
      }),
    }
  )
)


