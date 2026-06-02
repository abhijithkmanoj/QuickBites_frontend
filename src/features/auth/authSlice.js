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
} from './authService'
import cartService from '../cart/cartService'
import { setAuthToken } from '../../lib/axios'

const initialState = {
  user: null,
  accessToken: loadAccessToken(),
  status: 'idle',
  error: null,
}

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
    return thunkAPI.rejectWithValue('Session refresh failed.')
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
  } catch (error) {
    // Ignore backend logout failures so client can still clear local session.
  }
  clearAccessToken()
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth(state) {
      state.user = null
      state.accessToken = null
      state.status = 'idle'
      state.error = null
      clearAccessToken()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.accessToken = action.payload.access_token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(loadUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        try {
          cartService.syncLocalCart()
        } catch (err) {
          // noop
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.status = 'idle'
        state.user = null
        state.accessToken = null
      })
      .addCase(refreshSession.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        try {
          cartService.syncLocalCart()
        } catch (err) {
          // noop
        }
      })
      .addCase(refreshSession.rejected, (state) => {
        state.status = 'idle'
        state.user = null
        state.accessToken = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.status = 'idle'
        state.error = null
      })
  },
})

export const { resetAuth } = authSlice.actions
export default authSlice.reducer
