import api from './api'
import type { HeroCarouselImageDto } from '../types'

type ListResponse = {
  success: boolean
  data: HeroCarouselImageDto[]
}

type ItemResponse = {
  success: boolean
  data: HeroCarouselImageDto
  message?: string
}

export type HeroSlideInput = {
  title: string
  description: string
  imageUrl: string
  order: number
  activeStatus?: boolean
}

export const fetchPublicHeroSlides = async (): Promise<HeroCarouselImageDto[]> => {
  const { data } = await api.get<ListResponse>('/hero-slides/public')
  return data.data || []
}

export const fetchAdminHeroSlides = async (): Promise<HeroCarouselImageDto[]> => {
  const { data } = await api.get<ListResponse>('/hero-slides')
  return data.data || []
}

export const fetchDeletedHeroSlides = async (): Promise<HeroCarouselImageDto[]> => {
  const { data } = await api.get<ListResponse>('/hero-slides?deletedOnly=true')
  return data.data || []
}

export const createHeroSlide = async (payload: HeroSlideInput): Promise<HeroCarouselImageDto> => {
  const { data } = await api.post<ItemResponse>('/hero-slides', payload)
  return data.data
}

export const updateHeroSlide = async (id: string, payload: Partial<HeroSlideInput>): Promise<HeroCarouselImageDto> => {
  const { data } = await api.put<ItemResponse>(`/hero-slides/${id}`, payload)
  return data.data
}

export const deleteHeroSlide = async (id: string): Promise<void> => {
  await api.delete(`/hero-slides/${id}`)
}

export const approveHeroSlide = async (id: string): Promise<HeroCarouselImageDto> => {
  const { data } = await api.patch<ItemResponse>(`/hero-slides/${id}/approve`)
  return data.data
}

export const rejectHeroSlide = async (id: string, rejectionReason: string): Promise<HeroCarouselImageDto> => {
  const { data } = await api.patch<ItemResponse>(`/hero-slides/${id}/reject`, { rejectionReason })
  return data.data
}

export const restoreHeroSlide = async (id: string): Promise<HeroCarouselImageDto> => {
  const { data } = await api.patch<ItemResponse>(`/hero-slides/${id}/restore`)
  return data.data
}

export const permanentlyDeleteHeroSlide = async (id: string): Promise<void> => {
  await api.delete(`/hero-slides/${id}/permanent`)
}

export const reorderHeroSlides = async (orderedIds: string[]): Promise<HeroCarouselImageDto[]> => {
  const { data } = await api.patch<ListResponse>('/hero-slides/reorder', { orderedIds })
  return data.data || []
}

type UploadImageResponse = {
  success: boolean
  data: {
    imageUrl: string
  }
}

export const uploadHeroImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await api.post<UploadImageResponse>('/hero-slides/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data.data.imageUrl
}
