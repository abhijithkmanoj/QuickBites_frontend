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

// Request interceptor to ensure auth token is always included
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quickbites_access_token')
    if (token) {
      // Always use the latest token from localStorage
      config.headers.Authorization = `Bearer ${token}`
      console.debug('[Axios] Added auth token to request:', config.url)
    } else {
      console.debug('[Axios] No token in localStorage for request:', config.url)
    }
    return config
  },
  (error) => {
    console.error('[Axios] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[Axios] Received 401, clearing auth')
      localStorage.removeItem('quickbites_access_token')
      delete apiClient.defaults.headers.common.Authorization
    }
    return Promise.reject(error)
  }
)

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
    localStorage.setItem('quickbites_access_token', token)
    console.debug('[Axios] Set auth token via setAuthToken')
  } else {
    delete apiClient.defaults.headers.common.Authorization
    localStorage.removeItem('quickbites_access_token')
    console.debug('[Axios] Cleared auth token via setAuthToken')
  }
}

export default apiClient
