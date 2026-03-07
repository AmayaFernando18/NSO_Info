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

  return (user.functionPermissions || []).find((item) => item.function === func) || null
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

  const permission = getFunctionPermission(user, func)
  if (!permission) return false

  const allow: Record<string, AuthorityCode[]> = {
    view: ['E', 'C', 'A', 'M'],
    create: ['E', 'M'],
    edit: ['M'],
    delete: ['M'],
    approve: ['A', 'M'],
  }

  return allow[action]?.includes(permission.authority) ?? false
}

export const canAccessAdmin = (user: User | null): boolean => {
  if (!user) return false
  if (user.isSuperAdmin) return true
  return (user.functionPermissions || []).length > 0
}
