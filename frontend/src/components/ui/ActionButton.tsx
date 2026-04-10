import type { LucideIcon } from 'lucide-react'

type ActionButtonVariant =
  | 'neutral'
  | 'view'
  | 'edit'
  | 'approve'
  | 'reject'
  | 'delete'
  | 'restore'
  | 'permanentDelete'

type ActionButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
  icon?: LucideIcon
  variant?: ActionButtonVariant
  iconOnly?: boolean
}

const variantClasses: Record<ActionButtonVariant, string> = {
  neutral: 'border-border bg-white text-secondary hover:bg-muted',
  view: 'border-border bg-white text-secondary hover:bg-muted',
  edit: 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10',
  approve: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  reject: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  delete: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  restore: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  permanentDelete: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
}

export default function ActionButton({
  label,
  onClick,
  disabled = false,
  icon: Icon,
  variant = 'neutral',
  iconOnly = false,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        iconOnly ? 'h-8 w-8 p-0' : 'gap-1.5 px-3 py-1.5'
      } ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {!iconOnly ? label : null}
    </button>
  )
}
