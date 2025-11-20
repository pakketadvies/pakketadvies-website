import { Info } from '@phosphor-icons/react'

interface InfoBoxProps {
  children: React.ReactNode
  variant?: 'info' | 'warning' | 'success'
}

export default function InfoBox({ children, variant = 'info' }: InfoBoxProps) {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }

  const iconColors = {
    info: 'text-blue-500',
    warning: 'text-orange-500',
    success: 'text-green-500',
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${colors[variant]}`}>
      <Info size={20} weight="fill" className={`flex-shrink-0 mt-0.5 ${iconColors[variant]}`} />
      <div className="text-sm">{children}</div>
    </div>
  )
}

