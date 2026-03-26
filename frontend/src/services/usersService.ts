import api from './api'
import type { AuthorityCode, FunctionCode, FunctionPermission } from '../types'

export type RbacUser = {
  _id?: string
  username: string
  isSuperAdmin: boolean
  functionPermissions: FunctionPermission[]
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}

type ListUsersResponse = {
  success: boolean
  users: RbacUser[]
}

type SingleUserResponse = {
  success: boolean
  user: RbacUser
  warnings?: Array<{
    function: FunctionCode
    keptAuthority: AuthorityCode
    discardedAuthorities: AuthorityCode[]
    totalEntries: number
  }>
}

type DeleteResponse = {
  success: boolean
  message: string
  username: string
}

type AssignPayload = {
  username: string
  isSuperAdmin?: boolean
  functionPermissions?: Array<{ function: FunctionCode; authority: AuthorityCode }>
}

export const fetchUsers = async (): Promise<RbacUser[]> => {
  const { data } = await api.get<ListUsersResponse>('/users/all')
  return data.users || []
}

export const fetchUserByEpf = async (epf: string): Promise<RbacUser> => {
  const { data } = await api.get<SingleUserResponse>(`/users/${epf}`)
  return data.user
}

export type AssignUserAccessResult = {
  user: RbacUser
  warnings: Array<{
    function: FunctionCode
    keptAuthority: AuthorityCode
    discardedAuthorities: AuthorityCode[]
    totalEntries: number
  }>
}

export const assignUserAccess = async (payload: AssignPayload): Promise<AssignUserAccessResult> => {
  const { data } = await api.post<SingleUserResponse>('/users/assign', payload)
  return {
    user: data.user,
    warnings: data.warnings || [],
  }
}

export const removeUserAccess = async (epf: string): Promise<DeleteResponse> => {
  const { data } = await api.delete<DeleteResponse>(`/users/${epf}`)
  if (!data.success) {
    throw new Error(data.message || 'Failed to remove user access')
  }
  return data
}
