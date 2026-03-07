import type { AuthorityCode } from '../../types'

interface PermissionPillProps {
  authority: AuthorityCode
}

const labelMap: Record<AuthorityCode, string> = {
  E: 'Enter',
  C: 'Check',
  A: 'Approve',
  M: 'Manager',
}

export default function PermissionPill({ authority }: PermissionPillProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
      {authority} - {labelMap[authority]}
    </span>
  )
}
