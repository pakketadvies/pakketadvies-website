'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy } from '@phosphor-icons/react'

interface DuplicateContractButtonProps {
  id: string
  naam: string
}

export default function DuplicateContractButton({ id, naam }: DuplicateContractButtonProps) {
  const router = useRouter()
  const [duplicating, setDuplicating] = useState(false)

  async function handleDuplicate() {
    if (!confirm(`Weet je zeker dat je "${naam}" wilt dupliceren?`)) {
      return
    }

    setDuplicating(true)
    try {
      const response = await fetch(`/api/admin/contracten/${id}/duplicate`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Fout bij dupliceren')
      }

      // Redirect to edit page of the new contract
      router.push(`/admin/contracten/${data.contractId}`)
      router.refresh()
    } catch (error: any) {
      alert('Fout bij dupliceren: ' + error.message)
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={duplicating}
      className="p-2 hover:bg-brand-teal-50 rounded-lg transition-colors disabled:opacity-50"
      title="Dupliceren"
    >
      <Copy size={20} className="text-brand-teal-600" />
    </button>
  )
}

