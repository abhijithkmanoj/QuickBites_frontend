import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const isLocalhostApi = Boolean(
  apiBaseUrl && /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(apiBaseUrl)
)

if (import.meta.env.PROD && isLocalhostApi) {
  console.error(
    'VITE_API_BASE_URL is configured with localhost in production. A deployed site cannot call localhost directly.'
  )
}

const baseURL = apiBaseUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api/v1' : undefined)

if (!baseURL) {
  console.error(
    'VITE_API_BASE_URL is not set. Production API requests will fail unless a public backend URL is configured.'
  )
}

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

export default apiClient
