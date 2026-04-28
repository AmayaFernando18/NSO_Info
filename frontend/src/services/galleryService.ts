import api from './api'
import type { GalleryAlbumDetailDto, GalleryAlbumDto, GalleryImageDto } from '../types'

type ListGalleryAlbumsResponse = {
  success: boolean
  data: GalleryAlbumDto[]
}

type ListGalleryImagesResponse = {
  success: boolean
  data: GalleryImageDto[]
}

type ItemGalleryAlbumResponse = {
  success: boolean
  message?: string
  data: GalleryAlbumDto
}

type ItemGalleryImageResponse = {
  success: boolean
  message?: string
  data: GalleryImageDto
}

type GalleryAlbumDetailResponse = {
  success: boolean
  data: GalleryAlbumDetailDto
}

type AdminListOptions = {
  deletedOnly?: boolean
  includeDeleted?: boolean
}

export type GalleryAlbumInput = {
  name: string
  description?: string
  coverImageUrl?: string
  displayOrder?: number
  activeStatus?: boolean
}

export type GalleryImageInput = {
  title?: string
  altText?: string
  imageUrl: string
  displayOrder?: number
  activeStatus?: boolean
}

export const fetchPublicGalleryAlbums = async (): Promise<GalleryAlbumDto[]> => {
  const { data } = await api.get<ListGalleryAlbumsResponse>('/gallery/public/albums')
  return data.data || []
}

export const fetchPublicGalleryAlbumDetail = async (id: string): Promise<GalleryAlbumDetailDto> => {
  const { data } = await api.get<GalleryAlbumDetailResponse>(`/gallery/public/albums/${id}`)
  return data.data
}

export const fetchAdminGalleryAlbums = async (): Promise<GalleryAlbumDto[]> => {
  const { data } = await api.get<ListGalleryAlbumsResponse>('/gallery/admin/albums')
  return data.data || []
}

export const fetchAdminGalleryAlbumsWithOptions = async (
  options: AdminListOptions = {}
): Promise<GalleryAlbumDto[]> => {
  const { data } = await api.get<ListGalleryAlbumsResponse>('/gallery/admin/albums', { params: options })
  return data.data || []
}

export const createGalleryAlbum = async (payload: GalleryAlbumInput): Promise<GalleryAlbumDto> => {
  const { data } = await api.post<ItemGalleryAlbumResponse>('/gallery/admin/albums', payload)
  return data.data
}

export const updateGalleryAlbum = async (id: string, payload: Partial<GalleryAlbumInput>): Promise<GalleryAlbumDto> => {
  const { data } = await api.put<ItemGalleryAlbumResponse>(`/gallery/admin/albums/${id}`, payload)
  return data.data
}

export const deleteGalleryAlbum = async (id: string): Promise<void> => {
  await api.delete(`/gallery/admin/albums/${id}`)
}

export const approveGalleryAlbum = async (id: string): Promise<GalleryAlbumDto> => {
  const { data } = await api.post<ItemGalleryAlbumResponse>(`/gallery/admin/albums/${id}/approve`)
  return data.data
}

export const rejectGalleryAlbum = async (id: string, rejectionReason?: string): Promise<GalleryAlbumDto> => {
  const { data } = await api.post<ItemGalleryAlbumResponse>(`/gallery/admin/albums/${id}/reject`, {
    rejectionReason,
  })
  return data.data
}

export const restoreGalleryAlbum = async (id: string): Promise<GalleryAlbumDto> => {
  const { data } = await api.post<ItemGalleryAlbumResponse>(`/gallery/admin/albums/${id}/restore`)
  return data.data
}

export const permanentlyDeleteGalleryAlbum = async (id: string): Promise<void> => {
  await api.delete(`/gallery/admin/albums/${id}/permanent`)
}

export const fetchAdminGalleryImages = async (albumId: string): Promise<GalleryImageDto[]> => {
  const { data } = await api.get<ListGalleryImagesResponse>(`/gallery/admin/albums/${albumId}/images`)
  return data.data || []
}

export const fetchAdminGalleryImagesWithOptions = async (
  albumId: string,
  options: AdminListOptions = {}
): Promise<GalleryImageDto[]> => {
  const { data } = await api.get<ListGalleryImagesResponse>(`/gallery/admin/albums/${albumId}/images`, {
    params: options,
  })
  return data.data || []
}

export const createGalleryImage = async (albumId: string, payload: GalleryImageInput): Promise<GalleryImageDto> => {
  const { data } = await api.post<ItemGalleryImageResponse>(`/gallery/admin/albums/${albumId}/images`, payload)
  return data.data
}

export const updateGalleryImage = async (id: string, payload: Partial<GalleryImageInput>): Promise<GalleryImageDto> => {
  const { data } = await api.put<ItemGalleryImageResponse>(`/gallery/admin/images/${id}`, payload)
  return data.data
}

export const deleteGalleryImage = async (id: string): Promise<void> => {
  await api.delete(`/gallery/admin/images/${id}`)
}

export const approveGalleryImage = async (id: string): Promise<GalleryImageDto> => {
  const { data } = await api.post<ItemGalleryImageResponse>(`/gallery/admin/images/${id}/approve`)
  return data.data
}

export const rejectGalleryImage = async (id: string, rejectionReason?: string): Promise<GalleryImageDto> => {
  const { data } = await api.post<ItemGalleryImageResponse>(`/gallery/admin/images/${id}/reject`, {
    rejectionReason,
  })
  return data.data
}

export const restoreGalleryImage = async (id: string): Promise<GalleryImageDto> => {
  const { data } = await api.post<ItemGalleryImageResponse>(`/gallery/admin/images/${id}/restore`)
  return data.data
}

export const permanentlyDeleteGalleryImage = async (id: string): Promise<void> => {
  await api.delete(`/gallery/admin/images/${id}/permanent`)
}

type UploadGalleryImageResponse = {
  success: boolean
  data: {
    imageUrl: string
  }
}

export const uploadGalleryImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await api.post<UploadGalleryImageResponse>('/gallery/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data.data.imageUrl
}
