import api from './api'
import type { NewsDto } from '../types'

type ListNewsResponse = {
  success: boolean
  data: NewsDto[]
}

type ItemNewsResponse = {
  success: boolean
  message?: string
  data: NewsDto
}

export type NewsInput = {
  title: string
  summary: string
  content: string
  category: string
  imageUrl?: string
  activeStatus?: boolean
  publishedAt?: string
}

export const fetchPublicNews = async (): Promise<NewsDto[]> => {
  const { data } = await api.get<ListNewsResponse>('/news/public')
  return data.data || []
}

export const fetchAdminNews = async (): Promise<NewsDto[]> => {
  const { data } = await api.get<ListNewsResponse>('/news')
  return data.data || []
}

export const fetchDeletedNews = async (): Promise<NewsDto[]> => {
  const { data } = await api.get<ListNewsResponse>('/news?deletedOnly=true')
  return data.data || []
}

export const createNews = async (payload: NewsInput): Promise<NewsDto> => {
  const { data } = await api.post<ItemNewsResponse>('/news', payload)
  return data.data
}

export const updateNews = async (id: string, payload: Partial<NewsInput>): Promise<NewsDto> => {
  const { data } = await api.put<ItemNewsResponse>(`/news/${id}`, payload)
  return data.data
}

export const approveNews = async (id: string): Promise<NewsDto> => {
  const { data } = await api.patch<ItemNewsResponse>(`/news/${id}/approve`)
  return data.data
}

export const removeNews = async (id: string): Promise<void> => {
  await api.delete(`/news/${id}`)
}

export const restoreNews = async (id: string): Promise<NewsDto> => {
  const { data } = await api.patch<ItemNewsResponse>(`/news/${id}/restore`)
  return data.data
}

export const permanentlyDeleteNews = async (id: string): Promise<void> => {
  await api.delete(`/news/${id}/permanent`)
}

export const rejectNews = async (id: string, rejectionReason: string): Promise<NewsDto> => {
  const { data } = await api.patch<ItemNewsResponse>(`/news/${id}/reject`, { rejectionReason })
  return data.data
}

type UploadImageResponse = {
  success: boolean
  data: {
    imageUrl: string
  }
}

export const uploadNewsImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await api.post<UploadImageResponse>('/news/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data.data.imageUrl
}
