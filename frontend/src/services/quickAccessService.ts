import api from './api'
import type { QuickAccessDto } from '../types'

type ListResponse = {
  success: boolean
  data: QuickAccessDto[]
}

type ItemResponse = {
  success: boolean
  data: QuickAccessDto
  message?: string
}

export type QuickAccessInput = {
  title: string
  description: string
  url: string
  icon: string
  order: number
  activeStatus?: boolean
}

export const fetchPublicQuickAccess = async (): Promise<QuickAccessDto[]> => {
  const { data } = await api.get<ListResponse>('/quick-access/public')
  return data.data || []
}

export const fetchAdminQuickAccess = async (): Promise<QuickAccessDto[]> => {
  const { data } = await api.get<ListResponse>('/quick-access')
  return data.data || []
}

export const fetchDeletedQuickAccess = async (): Promise<QuickAccessDto[]> => {
  const { data } = await api.get<ListResponse>('/quick-access?deletedOnly=true')
  return data.data || []
}

export const createQuickAccess = async (payload: QuickAccessInput): Promise<QuickAccessDto> => {
  const { data } = await api.post<ItemResponse>('/quick-access', payload)
  return data.data
}

export const updateQuickAccess = async (id: string, payload: Partial<QuickAccessInput>): Promise<QuickAccessDto> => {
  const { data } = await api.put<ItemResponse>(`/quick-access/${id}`, payload)
  return data.data
}

export const deleteQuickAccess = async (id: string): Promise<void> => {
  await api.delete(`/quick-access/${id}`)
}

export const approveQuickAccess = async (id: string): Promise<QuickAccessDto> => {
  const { data } = await api.patch<ItemResponse>(`/quick-access/${id}/approve`)
  return data.data
}

export const rejectQuickAccess = async (id: string, rejectionReason: string): Promise<QuickAccessDto> => {
  const { data } = await api.patch<ItemResponse>(`/quick-access/${id}/reject`, { rejectionReason })
  return data.data
}

export const restoreQuickAccess = async (id: string): Promise<QuickAccessDto> => {
  const { data } = await api.patch<ItemResponse>(`/quick-access/${id}/restore`)
  return data.data
}

export const permanentlyDeleteQuickAccess = async (id: string): Promise<void> => {
  await api.delete(`/quick-access/${id}/permanent`)
}

export const reorderQuickAccess = async (orderedIds: string[]): Promise<QuickAccessDto[]> => {
  const { data } = await api.patch<ListResponse>('/quick-access/reorder', { orderedIds })
  return data.data || []
}
