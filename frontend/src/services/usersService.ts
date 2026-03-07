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

export const assignUserAccess = async (payload: AssignPayload): Promise<RbacUser> => {
  const { data } = await api.post<SingleUserResponse>('/users/assign', payload)
  return data.user
}

export const removeUserAccess = async (epf: string): Promise<void> => {
  await api.delete(`/users/${epf}`)
}
