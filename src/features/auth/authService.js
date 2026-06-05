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
  const currentUser = response.data

  if (currentUser?.role === 'restaurant_owner') {
    try {
      const statusResponse = await apiClient.get('/owner/verification-status')
      return {
        ...currentUser,
        ownerVerificationStatus: statusResponse.data.status,
        ownerVerificationRejectionReason: statusResponse.data.rejection_reason,
      }
    } catch (error) {
      return {
        ...currentUser,
        ownerVerificationStatus: null,
        ownerVerificationRejectionReason: null,
      }
    }
  }

  return currentUser
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

// User Profile Management
export const updateUserProfile = async (userData) => {
  const response = await apiClient.put('/users/profile', userData)
  return response.data
}

export const uploadProfileImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post('/users/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const removeProfileImage = async () => {
  const response = await apiClient.delete('/users/profile-image')
  return response.data
}

export const getUserSettings = async () => {
  const response = await apiClient.get('/users/settings')
  return response.data
}

export const updateUserSettings = async (settingsData) => {
  const response = await apiClient.put('/users/settings', settingsData)
  return response.data
}

export const changePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.post('/users/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return response.data
}

export const deactivateAccount = async (password) => {
  const response = await apiClient.post('/users/deactivate-account', { password })
  return response.data
}


// Phase 15.2 - Activity Log
export const getActivityLog = async (skip = 0, limit = 20) => {
  const response = await apiClient.get('/users/activity', {
    params: { skip, limit }
  })
  return response.data
}

export const deleteActivity = async (activityId) => {
  const response = await apiClient.delete(`/users/activity/${activityId}`)
  return response.data
}

export const clearActivities = async (days = 90) => {
  const response = await apiClient.post('/users/activity/clear', {}, {
    params: { days }
  })
  return response.data
}

// Phase 15.2 - Favorites
export const getFavorites = async (favoriteType = null, skip = 0, limit = 20) => {
  const params = { skip, limit }
  if (favoriteType) params.favorite_type = favoriteType
  const response = await apiClient.get('/users/favorites', { params })
  return response.data
}

export const addFavorite = async (favoriteId, favoriteType) => {
  const response = await apiClient.post('/users/favorites/add', {}, {
    params: { favorite_id: favoriteId, favorite_type: favoriteType }
  })
  return response.data
}

export const removeFavorite = async (favoriteId) => {
  const response = await apiClient.delete(`/users/favorites/${favoriteId}`)
  return response.data
}

export const isFavorited = async (favoriteType, favoriteId) => {
  const response = await apiClient.get(`/users/favorites/check/${favoriteType}/${favoriteId}`)
  return response.data.is_favorited
}

// Phase 15.2 - Order History
export const getOrderHistory = async (statusFilter = null, skip = 0, limit = 20) => {
  const params = { skip, limit }
  if (statusFilter) params.status_filter = statusFilter
  const response = await apiClient.get('/users/order-history', { params })
  return response.data
}

// Phase 15.2 - Saved Addresses
export const getSavedAddresses = async () => {
  const response = await apiClient.get('/users/saved-addresses')
  return response.data
}

export default {
  loginRequest,
  registerRequest,
  fetchCurrentUser,
  refreshAccessToken,
  logoutRequest,
  updateUserProfile,
  uploadProfileImage,
  removeProfileImage,
  getUserSettings,
  updateUserSettings,
  changePassword,
  deactivateAccount,
  getActivityLog,
  deleteActivity,
  clearActivities,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorited,
  getOrderHistory,
  getSavedAddresses,
}
