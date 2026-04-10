import type { LucideIcon } from 'lucide-react'

type ActionButtonVariant =
  | 'primary'
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
  onClick?: () => void
  disabled?: boolean
  icon?: LucideIcon
  variant?: ActionButtonVariant
  iconOnly?: boolean
  size?: 'xs' | 'sm' | 'md'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  form?: string
}

const variantClasses: Record<ActionButtonVariant, string> = {
  primary: 'border-primary bg-primary text-white hover:bg-primary/90',
  neutral: 'border-border bg-white text-secondary hover:bg-muted',
  view: 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100',
  edit: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  approve: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  reject: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  delete: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  restore: 'border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100',
  permanentDelete: 'border-red-300 bg-red-100 text-red-800 hover:bg-red-200',
}

const sizeClasses: Record<NonNullable<ActionButtonProps['size']>, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
}

export default function ActionButton({
  label,
  onClick,
  disabled = false,
  icon: Icon,
  variant = 'neutral',
  iconOnly = false,
  size = 'sm',
  className = '',
  type = 'button',
  form,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      form={form}
      className={`inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        iconOnly
          ? size === 'xs'
            ? 'h-7 w-7 p-0'
            : size === 'md'
            ? 'h-9 w-9 p-0'
            : 'h-8 w-8 p-0'
          : size === 'xs'
          ? 'gap-1 px-2 py-1'
          : size === 'md'
          ? 'gap-2 px-4 py-2'
          : 'gap-1.5 px-3 py-1.5'
      } ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
