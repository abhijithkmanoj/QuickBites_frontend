import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../../lib/axios'

const STORAGE_KEY = 'qb_notifications_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    // ignore
  }
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const resp = await apiClient.get('/notifications/', { params: { skip: 0, limit: 50 } })
      const data = resp.data || { items: [], total: 0 }
      // Merge with any local notifications, avoiding duplicates by id
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch notifications')
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await apiClient.post('/notifications/mark-read', { notification_id: notificationId })
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark notification as read')
    }
  }
)

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/notifications/mark-read', { mark_all: true })
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to mark all as read')
    }
  }
)

const initialItems = loadFromStorage() // { id, type, title, body, order_id, read, created_at }

const initialState = {
  items: initialItems,
  unreadCount: initialItems.filter((i) => !i.read).length,
  status: 'idle',
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      const n = action.payload
      n.read = n.read || false
      n.created_at = n.created_at || new Date().toISOString()
      // Avoid duplicates by id
      const exists = state.items.some((i) => i.id === n.id)
      if (!exists) {
        state.items.unshift(n)
        if (!n.read) state.unreadCount++
        if (state.items.length > 200) state.items.pop()
        saveToStorage(state.items)
      }
    },
    setNotifications(state, action) {
      state.items = action.payload
      state.unreadCount = state.items.filter((i) => !i.read).length
      saveToStorage(state.items)
    },
    markRead(state, action) {
      const id = action.payload
      const it = state.items.find((i) => i.id === id)
      if (it && !it.read) {
        it.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      saveToStorage(state.items)
    },
    markAllRead(state) {
      state.items.forEach((i) => { i.read = true })
      state.unreadCount = 0
      saveToStorage(state.items)
    },
    clearNotifications(state) {
      state.items = []
      state.unreadCount = 0
      saveToStorage(state.items)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        const serverItems = action.payload.items || []
        // Remove stale socket-generated notifications (they now have persisted versions)
        state.items = state.items.filter((i) => !i.id?.startsWith('socket_'))
        // Merge server items with local: dedupe by id
        const existingIds = new Set(state.items.map((i) => i.id))
        const newItems = serverItems.filter((i) => !existingIds.has(i.id))
        if (newItems.length > 0) {
          state.items = [...newItems, ...state.items].slice(0, 200)
          saveToStorage(state.items)
        }
        state.unreadCount = state.items.filter((i) => !i.read).length
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Mark notification read
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload
        const it = state.items.find((i) => i.id === id)
        if (it && !it.read) {
          it.read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        saveToStorage(state.items)
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        console.warn('Failed to mark notification read:', action.payload)
      })
      // Mark all read
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((i) => { i.read = true })
        state.unreadCount = 0
        saveToStorage(state.items)
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        console.warn('Failed to mark all notifications read:', action.payload)
      })
  },
})

export const { addNotification, setNotifications, markRead, markAllRead, clearNotifications } = notificationsSlice.actions
export default notificationsSlice.reducer
