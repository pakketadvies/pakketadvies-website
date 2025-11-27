import { redirect } from 'next/navigation'

/**
 * DEPRECATED: Oude route voor contract afsluiten
 * Redirect naar nieuwe calculator route
 */
export default function ContractAfsluitenPage() {
  redirect('/calculator?stap=2')
}

