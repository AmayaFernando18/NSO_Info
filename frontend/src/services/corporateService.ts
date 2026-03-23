import api from './api'
import type { CorporateCategoryDto, CorporateMemberDto } from '../types'

type ListCorporateResponse = {
  success: boolean
  data: CorporateMemberDto[]
}

type ListCategoryResponse = {
  success: boolean
  data: CorporateCategoryDto[]
}

type ItemCorporateResponse = {
  success: boolean
  message?: string
  data: CorporateMemberDto
}

export type CorporateMemberInput = {
  name: string
  position: string
  department?: string
  phone: string
  email: string
  imageUrl?: string
  categoryId?: string
  activeStatus?: boolean
  displayOrder?: number
}

export type CorporateCategoryInput = {
  name: string
  activeStatus?: boolean
  displayOrder?: number
}

export const fetchPublicCorporateMembers = async (): Promise<CorporateMemberDto[]> => {
  const { data } = await api.get<ListCorporateResponse>('/corporate')
  return data.data || []
}

export const fetchPublicCorporateCategories = async (): Promise<CorporateCategoryDto[]> => {
  const { data } = await api.get<ListCategoryResponse>('/corporate/categories')
  return data.data || []
}

export const fetchAdminCorporateMembers = async (): Promise<CorporateMemberDto[]> => {
  const { data } = await api.get<ListCorporateResponse>('/corporate/admin/list')
  return data.data || []
}

export const fetchAdminCorporateCategories = async (): Promise<CorporateCategoryDto[]> => {
  const { data } = await api.get<ListCategoryResponse>('/corporate/categories/admin')
  return data.data || []
}

export const fetchDeletedCorporateMembers = async (): Promise<CorporateMemberDto[]> => {
  const { data } = await api.get<ListCorporateResponse>('/corporate/admin/list?deletedOnly=true')
  return data.data || []
}

export const createCorporateCategory = async (payload: CorporateCategoryInput): Promise<CorporateCategoryDto> => {
  const { data } = await api.post<{ success: boolean; data: CorporateCategoryDto }>(
    '/corporate/categories/admin',
    payload
  )
  return data.data
}

export const updateCorporateCategory = async (
  id: string,
  payload: Partial<CorporateCategoryInput>
): Promise<CorporateCategoryDto> => {
  const { data } = await api.put<{ success: boolean; data: CorporateCategoryDto }>(
    `/corporate/categories/admin/${id}`,
    payload
  )
  return data.data
}

export const deleteCorporateCategory = async (id: string): Promise<void> => {
  await api.delete(`/corporate/categories/admin/${id}`)
}

export const createCorporateMember = async (payload: CorporateMemberInput): Promise<CorporateMemberDto> => {
  const { data } = await api.post<ItemCorporateResponse>('/corporate/admin', payload)
  return data.data
}

export const updateCorporateMember = async (
  id: string,
  payload: Partial<CorporateMemberInput>
): Promise<CorporateMemberDto> => {
  const { data } = await api.put<ItemCorporateResponse>(`/corporate/admin/${id}`, payload)
  return data.data
}

export const removeCorporateMember = async (id: string): Promise<void> => {
  await api.delete(`/corporate/admin/${id}`)
}

export const restoreCorporateMember = async (id: string): Promise<CorporateMemberDto> => {
  const { data } = await api.put<ItemCorporateResponse>(`/corporate/admin/${id}/restore`)
  return data.data
}

export const permanentlyDeleteCorporateMember = async (id: string): Promise<void> => {
  await api.delete(`/corporate/admin/${id}/permanent`)
}

export const reorderCorporateMembers = async (orderedIds: string[]): Promise<CorporateMemberDto[]> => {
  const { data } = await api.patch<ListCorporateResponse>('/corporate/admin/reorder', { orderedIds })
  return data.data || []
}

type UploadImageResponse = {
  success: boolean
  data: {
    imageUrl: string
  }
}

export const uploadCorporateImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await api.post<UploadImageResponse>('/corporate/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data.data.imageUrl
}
