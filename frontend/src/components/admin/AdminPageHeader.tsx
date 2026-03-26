import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type AdminPageHeaderProps = {
  title: string
  subtitle: string
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
}

export default function AdminPageHeader({ title, subtitle, icon: Icon, actions, className = '' }: AdminPageHeaderProps) {
  return (
    <div className={`mb-8 rounded-2xl border border-border bg-white overflow-hidden shadow-sm ${className}`.trim()}>
      <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-secondary" />
      <div className="px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {Icon ? (
            <div className="mt-0.5 bg-primary/10 p-2 rounded-lg flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-secondary leading-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2 sm:pt-0.5">{actions}</div> : null}
      </div>
    </div>
  )
}
