import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import { loadAccessToken } from '../../features/auth/authService'
import { addNotification, fetchNotifications } from '../../features/notifications/notificationsSlice'

export default function NotificationToast() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { accessToken, user } = useSelector((state) => state.auth)

  useEffect(() => {
    const token = accessToken || loadAccessToken()
    if (!token || !user) return

    const baseApi = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api/v1' : '')
    const socketOrigin = baseApi.replace('/api/v1', '')

    const socket = io(socketOrigin, {
      path: '/socket.io',
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.debug('[NotificationSocket] Connected successfully')
    })

    socket.on('connect_error', (error) => {
      console.error('[NotificationSocket] Connection error:', error.message)
    })

    socket.on('disconnect', (reason) => {
      console.debug('[NotificationSocket] Disconnected:', reason)
    })

    socket.on('reconnect', (attemptNumber) => {
      console.debug('[NotificationSocket] Reconnected after', attemptNumber, 'attempts')
      // Fetch any notifications missed during disconnection
      dispatch(fetchNotifications())
    })

    socket.on('reconnect_error', (error) => {
      console.error('[NotificationSocket] Reconnection error:', error.message)
    })

    socket.on('reconnect_failed', () => {
      console.error('[NotificationSocket] Reconnection failed after all attempts')
    })

    socket.on('notification', (payload) => {
      try {
        if (!payload) return
        const title = payload.title || 'Notification'
        const body = payload.body || ''
        const orderId = payload.order_id || null
        const notifId = payload.id || `socket_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

        // Persist to Redux store & localStorage
        dispatch(addNotification({
          id: notifId,
          type: payload.type || 'order_update',
          title,
          body,
          order_id: orderId,
          read: false,
          created_at: new Date().toISOString(),
        }))

        // Show toast with click handler to navigate
        toast.info(
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (orderId) navigate(`/orders/${orderId}`)
            }}
          >
            <strong>{title}</strong>
            <div className="text-sm">{body}</div>
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            onClick: () => {
              if (orderId) navigate(`/orders/${orderId}`)
            },
          }
        )
      } catch (e) {
        console.error('[NotificationSocket] Failed to process notification:', e)
      }
    })

    return () => {
      try {
        socket.removeAllListeners()
        socket.disconnect()
      } catch (e) {}
    }
  }, [accessToken, user, dispatch, navigate])

  return null
}
