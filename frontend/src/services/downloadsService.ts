import api from './api'
import type { DownloadItemDto } from '../types'

type ListResponse = {
  success: boolean
  data: DownloadItemDto[]
}

type ItemResponse = {
  success: boolean
  data: DownloadItemDto
  message?: string
}

export type DownloadInput = {
  category: string
  title: string
  language: string
  fileUrl: string
  activeStatus?: boolean
}

export const fetchPublicDownloads = async (): Promise<DownloadItemDto[]> => {
  const { data } = await api.get<ListResponse>('/downloads/public')
  return data.data || []
}

export const fetchAdminDownloads = async (): Promise<DownloadItemDto[]> => {
  const { data } = await api.get<ListResponse>('/downloads/admin')
  return data.data || []
}

export const createDownloadItem = async (payload: DownloadInput): Promise<DownloadItemDto> => {
  const { data } = await api.post<ItemResponse>('/downloads/admin', payload)
  return data.data
}

export const updateDownloadItem = async (id: string, payload: Partial<DownloadInput>): Promise<DownloadItemDto> => {
  const { data } = await api.put<ItemResponse>(`/downloads/admin/${id}`, payload)
  return data.data
}

export const deleteDownloadItem = async (id: string): Promise<void> => {
  await api.delete(`/downloads/admin/${id}`)
}

export const approveDownloadItem = async (id: string): Promise<DownloadItemDto> => {
  const { data } = await api.patch<ItemResponse>(`/downloads/admin/${id}/approve`)
  return data.data
}

export const rejectDownloadItem = async (id: string, rejectionReason: string): Promise<DownloadItemDto> => {
  const { data } = await api.patch<ItemResponse>(`/downloads/admin/${id}/reject`, { rejectionReason })
  return data.data
}

export const fetchDeletedDownloads = async (): Promise<DownloadItemDto[]> => {
  const { data } = await api.get<ListResponse>('/downloads/deleted/all')
  return data.data || []
}

export const restoreDownloadItem = async (id: string): Promise<DownloadItemDto> => {
  const { data } = await api.patch<ItemResponse>(`/downloads/deleted/${id}/restore`)
  return data.data
}

export const permanentlyDeleteDownloadItem = async (id: string): Promise<void> => {
  await api.delete(`/downloads/deleted/${id}/permanent`)
}

export const uploadDownloadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<{ success: boolean; data: { fileUrl: string } }>('/downloads/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data.data.fileUrl
}