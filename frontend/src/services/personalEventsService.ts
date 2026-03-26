import api from './api'
import type { PersonalEventDto, PersonalEventInput } from '../types'

type ListPersonalEventsResponse = {
  success: boolean
  data: PersonalEventDto[]
}

type ItemPersonalEventResponse = {
  success: boolean
  message?: string
  data: PersonalEventDto
}

export const fetchPersonalEvents = async (): Promise<PersonalEventDto[]> => {
  const { data } = await api.get<ListPersonalEventsResponse>('/personal-events')
  return data.data || []
}

export const fetchPersonalEventsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<PersonalEventDto[]> => {
  const { data } = await api.get<ListPersonalEventsResponse>(
    `/personal-events/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  )
  return data.data || []
}

export const createPersonalEvent = async (payload: PersonalEventInput): Promise<PersonalEventDto> => {
  const { data } = await api.post<ItemPersonalEventResponse>('/personal-events', payload)
  return data.data
}

export const updatePersonalEvent = async (
  id: string,
  payload: Partial<PersonalEventInput>
): Promise<PersonalEventDto> => {
  const { data } = await api.put<ItemPersonalEventResponse>(`/personal-events/${id}`, payload)
  return data.data
}

export const deletePersonalEvent = async (id: string): Promise<void> => {
  await api.delete(`/personal-events/${id}`)
}
