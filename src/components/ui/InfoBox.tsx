import { Info } from '@phosphor-icons/react'

interface InfoBoxProps {
  children: React.ReactNode
  variant?: 'info' | 'warning' | 'success'
}

export default function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
  const colors = {
    info: 'bg-brand-teal-50 border-brand-teal-200 text-brand-teal-800',  // Info = TEAL
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',  // Warning blijft yellow (buiten brand systeem)
    success: 'bg-brand-teal-50 border-brand-teal-200 text-brand-teal-800',  // Success = TEAL
  }

  const iconColors = {
    info: 'text-brand-teal-500',
    warning: 'text-yellow-500',  // Warning blijft yellow
    success: 'text-brand-teal-500',
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${colors[variant]}`}>
      <Info size={20} weight="fill" className={`flex-shrink-0 mt-0.5 ${iconColors[variant]}`} />
      <div className="text-sm">{children}</div>
    </div>
  )
}

