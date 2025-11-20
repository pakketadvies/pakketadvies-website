'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

interface DeleteContractButtonProps {
  id: string
  naam: string
}

export default function DeleteContractButton({ id, naam }: DeleteContractButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je "${naam}" wilt verwijderen?`)) {
      return
    }

    setDeleting(true)
    try {
      const supabase = await createClient()
      
      // Delete zal cascade naar contract_details door ON DELETE CASCADE
      const { error } = await supabase
        .from('contracten')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      alert('Fout bij verwijderen: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Verwijderen"
    >
      <Trash size={20} className="text-red-600" />
    </button>
  )
}

