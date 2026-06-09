import { configureStore } from '@reduxjs/toolkit'
import appReducer from '../features/app/appSlice'
import authReducer from '../features/auth/authSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    notifications: notificationsReducer,
  },
})
