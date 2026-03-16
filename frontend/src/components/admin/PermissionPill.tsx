import type { AuthorityCode } from '../../types'

interface PermissionPillProps {
  authority: AuthorityCode
  showLabel?: boolean
}

const authorityConfig: Record<AuthorityCode, { label: string; className: string }> = {
  E: {
    label: 'Enter',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  C: {
    label: 'Check',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  A: {
    label: 'Approve',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  M: {
    label: 'Manager',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
}

export default function PermissionPill({ authority, showLabel = true }: PermissionPillProps) {
  const config = authorityConfig[authority]

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {authority}
      {showLabel && <span className="ml-1">- {config.label}</span>}
    </span>
  )
}
