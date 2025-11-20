'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase/client'

interface DeleteLeverancierButtonProps {
  id: string
  naam: string
}

export function DeleteLeverancierButton({ id, naam }: DeleteLeverancierButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Weet je zeker dat je "${naam}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return
    }

    setDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('leveranciers')
        .delete()
        .eq('id', id)

      if (error) throw error

      router.refresh()
    } catch (err: any) {
      alert(`Fout bij verwijderen: ${err.message}`)
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
      <Trash size={18} className="text-red-600" />
    </button>
  )
}

