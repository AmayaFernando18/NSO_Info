import api from './api'
import type { EventDto, CalendarDataDto, HolidayDto, EventCategory, EventCategoryDto, EventCategoryInput } from '../types'

type ListEventsResponse = {
  success: boolean
  data: EventDto[]
}

type ItemEventResponse = {
  success: boolean
  message?: string
  data: EventDto
}

type ListCategoryResponse = {
  success: boolean
  data: EventCategoryDto[]
}

type ItemCategoryResponse = {
  success: boolean
  data: EventCategoryDto
}

type HolidaysResponse = {
  success: boolean
  data: {
    holidays: HolidayDto[]
    specialDays: HolidayDto[]
  }
}

type CalendarResponse = {
  success: boolean
  data: CalendarDataDto
}

export type EventInput = {
  title: string
  description: string
  category: EventCategory
  eventDate: string
  endDate?: string | null
  linkLabel?: string
  linkUrl?: string
  isHoliday?: boolean
  isSpecialDay?: boolean
  activeStatus?: boolean
}

// Public endpoints (no auth required)
export const fetchPublicEvents = async (): Promise<EventDto[]> => {
  const { data } = await api.get<ListEventsResponse>('/events/public')
  return data.data || []
}

export const fetchUpcomingEvents = async (limit = 10): Promise<EventDto[]> => {
  const { data } = await api.get<ListEventsResponse>(`/events/upcoming?limit=${limit}`)
  return data.data || []
}

export const fetchEventsByDateRange = async (startDate: string, endDate: string): Promise<EventDto[]> => {
  const { data } = await api.get<ListEventsResponse>(`/events/range?startDate=${startDate}&endDate=${endDate}`)
  return data.data || []
}

export const fetchHolidays = async (year = 2026): Promise<{ holidays: HolidayDto[]; specialDays: HolidayDto[] }> => {
  const { data } = await api.get<HolidaysResponse>(`/events/holidays?year=${year}`)
  return data.data || { holidays: [], specialDays: [] }
}

export const fetchCalendarData = async (year: number, month: number): Promise<CalendarDataDto> => {
  const { data } = await api.get<CalendarResponse>(`/events/calendar?year=${year}&month=${month}`)
  return data.data
}

export const fetchPublicEventCategories = async (): Promise<EventCategoryDto[]> => {
  const { data } = await api.get<ListCategoryResponse>('/events/categories')
  return data.data || []
}

// Admin endpoints (auth required)
export const fetchAdminEvents = async (): Promise<EventDto[]> => {
  const { data } = await api.get<ListEventsResponse>('/events')
  return data.data || []
}

export const fetchAdminEventCategories = async (): Promise<EventCategoryDto[]> => {
  const { data } = await api.get<ListCategoryResponse>('/events/categories/admin')
  return data.data || []
}

export const fetchDeletedEvents = async (): Promise<EventDto[]> => {
  const { data } = await api.get<ListEventsResponse>('/events?deletedOnly=true')
  return data.data || []
}

export const createEvent = async (payload: EventInput): Promise<EventDto> => {
  const { data } = await api.post<ItemEventResponse>('/events', payload)
  return data.data
}

export const createEventCategory = async (payload: EventCategoryInput): Promise<EventCategoryDto> => {
  const { data } = await api.post<ItemCategoryResponse>('/events/categories/admin', payload)
  return data.data
}

export const updateEvent = async (id: string, payload: Partial<EventInput>): Promise<EventDto> => {
  const { data } = await api.put<ItemEventResponse>(`/events/${id}`, payload)
  return data.data
}

export const updateEventCategory = async (
  id: string,
  payload: Partial<EventCategoryInput>
): Promise<EventCategoryDto> => {
  const { data } = await api.put<ItemCategoryResponse>(`/events/categories/admin/${id}`, payload)
  return data.data
}

export const approveEvent = async (id: string): Promise<EventDto> => {
  const { data } = await api.patch<ItemEventResponse>(`/events/${id}/approve`)
  return data.data
}

export const rejectEvent = async (id: string, rejectionReason: string): Promise<EventDto> => {
  const { data } = await api.patch<ItemEventResponse>(`/events/${id}/reject`, { rejectionReason })
  return data.data
}

export const removeEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`)
}

export const restoreEvent = async (id: string): Promise<EventDto> => {
  const { data } = await api.patch<ItemEventResponse>(`/events/${id}/restore`)
  return data.data
}

export const permanentlyDeleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}/permanent`)
}

export const deleteEventCategory = async (id: string): Promise<void> => {
  await api.delete(`/events/categories/admin/${id}`)
}
