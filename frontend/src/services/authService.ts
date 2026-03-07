import api from './api'
import type { FunctionPermission, User } from '../types'

type ApiErrorPayload = {
  message?: string
}

type ApiError = Error & {
  response?: {
    data?: ApiErrorPayload
  }
}

type LoginResponse = {
  success: boolean
  token: string
  user: {
    username: string
    displayName?: string
    email?: string
    isSuperAdmin?: boolean
    functionPermissions?: FunctionPermission[]
  }
}

type MeResponse = {
  success: boolean
  user: {
    username: string
    name?: string
    isSuperAdmin?: boolean
    functionPermissions?: FunctionPermission[]
  }
}

const normalizeUser = (payload: {
  username: string
  displayName?: string
  name?: string
  email?: string
  isSuperAdmin?: boolean
  functionPermissions?: FunctionPermission[]
}): User => ({
  username: payload.username,
  name: payload.displayName || payload.name || payload.username,
  email: payload.email,
  isSuperAdmin: Boolean(payload.isSuperAdmin),
  functionPermissions: payload.functionPermissions || [],
})

export async function login(adUsername: string, adPassword: string): Promise<User> {
  try {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      ad_user_name: adUsername,
      ad_password: adPassword,
    })

    const token = data?.token
    const userPayload = data?.user

    if (!token || !userPayload) {
      throw new Error('Invalid authentication response from server')
    }

    const user = normalizeUser(userPayload)
    localStorage.setItem('nso_token', token)
    localStorage.setItem('nso_user', JSON.stringify(user))
    return user
  } catch (error: unknown) {
    // Extract backend error message if available
    const apiError = error as ApiError
    const message =
      apiError.response?.data?.message ||
      apiError.message ||
      'Login failed. Please try again.'
    throw new Error(message)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('nso_token')
  if (!token) return null

  try {
    const { data } = await api.get<MeResponse>('/auth/me')
    const user = normalizeUser(data.user)
    localStorage.setItem('nso_user', JSON.stringify(user))
    return user
  } catch {
    localStorage.removeItem('nso_token')
    localStorage.removeItem('nso_user')
    return null
  }
}

export function logout(): void {
  localStorage.removeItem('nso_token')
  localStorage.removeItem('nso_user')
}
