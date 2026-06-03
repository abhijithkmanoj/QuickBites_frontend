import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  clearAccessToken,
  fetchCurrentUser,
  loadAccessToken,
  loginRequest,
  logoutRequest,
  refreshAccessToken,
  registerRequest,
  saveAccessToken,
  updateUserProfile,
  uploadProfileImage,
  removeProfileImage,
  getUserSettings,
  updateUserSettings as updateUserSettingsAPI,
  changePassword,
  deactivateAccount,
} from './authService'
import cartService from '../cart/cartService'
import { setAuthToken } from '../../lib/axios'

const initialState = {
  user: null,
  settings: null,
  accessToken: loadAccessToken(),
  status: 'idle',
  settingsStatus: 'idle',
  error: null,
}

// ─── Auth thunks ──────────────────────────────────────────────

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const data = await loginRequest({ email, password })
    saveAccessToken(data.access_token)
    return data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Login failed.')
  }
})

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const data = await registerRequest(userData)
    return data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Registration failed.')
  }
})

export const refreshSession = createAsyncThunk('auth/refreshSession', async (_, thunkAPI) => {
  try {
    const tokenData = await refreshAccessToken()
    saveAccessToken(tokenData.access_token)
    const user = await fetchCurrentUser()
    return { user, accessToken: tokenData.access_token }
  } catch (error) {
    clearAccessToken()
    return thunkAPI.rejectWithValue('Session expired.')
  }
})

export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken || loadAccessToken()
  if (!token) {
    return thunkAPI.rejectWithValue('No access token')
  }
  try {
    setAuthToken(token)
    const user = await fetchCurrentUser()
    return { user, accessToken: token }
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const tokenData = await refreshAccessToken()
        saveAccessToken(tokenData.access_token)
        const user = await fetchCurrentUser()
        return { user, accessToken: tokenData.access_token }
      } catch (refreshError) {
        clearAccessToken()
        return thunkAPI.rejectWithValue('Session expired.')
      }
    }
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Unable to load user.')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await logoutRequest()
  } catch {
    // Ignore — client clears session regardless
  }
  clearAccessToken()
  return null
})

// ─── Profile thunks ───────────────────────────────────────────

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    return await updateUserProfile(userData)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to update profile.')
  }
})

export const uploadProfilePic = createAsyncThunk('auth/uploadProfilePic', async (file, thunkAPI) => {
  try {
    return await uploadProfileImage(file)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to upload profile picture.')
  }
})

export const removeProfilePic = createAsyncThunk('auth/removeProfilePic', async (_, thunkAPI) => {
  try {
    return await removeProfileImage()
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to remove profile picture.')
  }
})

// ─── Settings thunks ──────────────────────────────────────────

export const fetchSettings = createAsyncThunk('auth/fetchSettings', async (_, thunkAPI) => {
  try {
    return await getUserSettings()
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to fetch settings.')
  }
})

export const saveSettings = createAsyncThunk('auth/saveSettings', async (settingsData, thunkAPI) => {
  try {
    return await updateUserSettingsAPI(settingsData)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to update settings.')
  }
})

// ─── Security thunks ──────────────────────────────────────────

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, thunkAPI) => {
    try {
      return await changePassword(currentPassword, newPassword)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to change password.')
    }
  },
)

export const deactivateUser = createAsyncThunk('auth/deactivateUser', async (password, thunkAPI) => {
  try {
    return await deactivateAccount(password)
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.detail || 'Failed to deactivate account.')
  }
})

// ─── Slice ────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth(state) {
      state.user = null
      state.accessToken = null
      state.settings = null
      state.status = 'idle'
      state.settingsStatus = 'idle'
      state.error = null
      clearAccessToken()
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.accessToken = action.payload.access_token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload })

    // register
    builder
      .addCase(register.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(register.fulfilled, (state) => { state.status = 'succeeded'; state.error = null })
      .addCase(register.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload })

    // loadUser
    builder
      .addCase(loadUser.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        try { cartService.syncLocalCart() } catch { /* noop */ }
      })
      .addCase(loadUser.rejected, (state) => {
        state.status = 'idle'
        state.user = null
        state.accessToken = null
      })

    // refreshSession
    builder
      .addCase(refreshSession.pending, (state) => { state.status = 'loading'; state.error = null })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        try { cartService.syncLocalCart() } catch { /* noop */ }
      })
      .addCase(refreshSession.rejected, (state) => {
        state.status = 'idle'
        state.user = null
        state.accessToken = null
      })

    // logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null
      state.accessToken = null
      state.settings = null
      state.status = 'idle'
      state.error = null
    })

    // profile mutations — update user in state
    const updateUserInState = (state, action) => {
      if (action.payload) state.user = action.payload
    }
    builder
      .addCase(updateProfile.fulfilled, updateUserInState)
      .addCase(uploadProfilePic.fulfilled, updateUserInState)
      .addCase(removeProfilePic.fulfilled, updateUserInState)
      .addCase(saveSettings.fulfilled, updateUserInState)

    // settings
    builder
      .addCase(fetchSettings.pending, (state) => { state.settingsStatus = 'loading' })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settingsStatus = 'succeeded'
        state.settings = action.payload
      })
      .addCase(fetchSettings.rejected, (state) => { state.settingsStatus = 'failed' })
  },
})

export const { resetAuth } = authSlice.actions
export default authSlice.reducer
