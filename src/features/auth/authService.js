import apiClient, { setAuthToken } from '../../lib/axios'

const ACCESS_TOKEN_KEY = 'quickbites_access_token'
const REFRESH_TOKEN_KEY = 'quickbites_refresh_token'

export const saveAccessToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  setAuthToken(token)
}

export const saveRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export const loadRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const clearRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN_KEY)

export const loadAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  setAuthToken(null)
}

export const loginRequest = async ({ email, password }) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const response = await apiClient.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    withCredentials: true,
  })
  if (response?.data?.refresh_token) {
    saveRefreshToken(response.data.refresh_token)
  }
  return response.data
}

export const registerRequest = async (userData) => {
  const response = await apiClient.post('/auth/register', userData)
  return response.data
}

export const fetchCurrentUser = async () => {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export const refreshAccessToken = async () => {
  const refreshToken = loadRefreshToken()
  if (refreshToken) {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken }, { withCredentials: true })
    if (response?.data?.refresh_token) saveRefreshToken(response.data.refresh_token)
    return response.data
  }

  const response = await apiClient.post('/auth/refresh', null, { withCredentials: true })
  if (response?.data?.refresh_token) saveRefreshToken(response.data.refresh_token)
  return response.data
}

export const logoutRequest = async () => {
  const response = await apiClient.post('/auth/logout')
  clearRefreshToken()
  return response.data
}
