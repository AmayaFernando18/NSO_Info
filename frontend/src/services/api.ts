import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim()

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL. Set it in frontend/.env (see .env.example).')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nso_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log API errors for debugging
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    })
    return Promise.reject(error)
  }
)

export default api
