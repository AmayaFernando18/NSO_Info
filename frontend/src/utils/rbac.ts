import type { AuthorityCode, FunctionCode, FunctionPermission, User } from '../types'

const order: Record<AuthorityCode, number> = {
  E: 1,
  C: 2,
  A: 3,
  M: 4,
}

export const getFunctionPermission = (user: User | null, func: FunctionCode): FunctionPermission | null => {
  if (!user) return null
  if (user.isSuperAdmin) return { function: func, authority: 'M' }

  const authorities = (user.functionPermissions || [])
    .filter((item) => item.function === func)
    .map((item) => item.authority)

  if (authorities.length === 0) return null

  const highest = authorities.reduce<AuthorityCode>(
    (current, next) => (order[next] > order[current] ? next : current),
    authorities[0]
  )

  return { function: func, authority: highest }
}

export const hasAuthority = (
  user: User | null,
  func: FunctionCode,
  required: AuthorityCode
): boolean => {
  const permission = getFunctionPermission(user, func)
  if (!permission) return false
  return order[permission.authority] >= order[required]
}

export const canPerformAction = (
  user: User | null,
  func: FunctionCode,
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve'
): boolean => {
  if (!user) return false
  if (user.isSuperAdmin) return true

  const authorities = (user.functionPermissions || [])
    .filter((item) => item.function === func)
    .map((item) => item.authority)

  if (authorities.length === 0) return false

  const allow: Record<string, AuthorityCode[]> = {
    view: ['E', 'C', 'A', 'M'],
    create: ['E', 'M'],
    edit: ['M'],
    delete: ['M'],
    approve: ['A', 'M'],
  }

  return authorities.some((authority) => allow[action]?.includes(authority))
}

export const canAccessAdmin = (user: User | null): boolean => {
  if (!user) return false
  // Only RBAC users (manually added by SuperAdmin) can access admin
  // Check isRbacUser flag if available, otherwise check if they have permissions
  if (user.isRbacUser === false) return false
  if (user.isSuperAdmin) return true
  return (user.functionPermissions || []).length > 0
}

/**
 * Check if user is an RBAC user (exists in RBAC system)
 * Normal AD users who are not in RBAC system will have isRbacUser = false
 */
export const isRbacUser = (user: User | null): boolean => {
  if (!user) return false
  // If isRbacUser flag is explicitly set, use it
  if (typeof user.isRbacUser === 'boolean') return user.isRbacUser
  // Fallback: if user has isSuperAdmin or functionPermissions, they're an RBAC user
  return user.isSuperAdmin || (user.functionPermissions || []).length > 0
}
