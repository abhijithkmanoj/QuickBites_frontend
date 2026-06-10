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

let isRefreshing = false
let refreshQueue = []
let unauthorizedHandler = null

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  refreshQueue = []
}

export const registerUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler
}

const refreshAccessToken = async () => {
  const response = await apiClient.post('/auth/refresh', null, { withCredentials: true })
  const token = response?.data?.access_token
  if (!token) {
    throw new Error('Unable to refresh access token')
  }
  setAuthToken(token)
  return token
}

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

// Response interceptor to handle 401 errors and refresh expired access tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''

    if (status === 401 && originalRequest && !originalRequest._retry && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('quickbites_access_token')
        delete apiClient.defaults.headers.common.Authorization
        if (unauthorizedHandler) {
          unauthorizedHandler()
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401) {
      console.warn('[Axios] Received 401, clearing auth')
      localStorage.removeItem('quickbites_access_token')
      delete apiClient.defaults.headers.common.Authorization
      if (unauthorizedHandler) {
        unauthorizedHandler()
      }
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
