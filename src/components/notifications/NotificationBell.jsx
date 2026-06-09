import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { markRead, markAllRead, fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../features/notifications/notificationsSlice'
import { useNavigate } from 'react-router-dom'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { items, unreadCount, status } = useSelector((s) => s.notifications)
  const dropdownRef = useRef(null)

  const list = (items || []).slice(0, 20)

  // Fetch notifications from backend on mount
  useEffect(() => {
    if (user && status === 'idle') {
      dispatch(fetchNotifications())
    }
  }, [user, status, dispatch])

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleClick = (it) => {
    if (!it.read) {
      dispatch(markRead(it.id))
      dispatch(markNotificationRead(it.id))
    }
    setOpen(false)
    if (it.order_id) {
      // Navigate based on user role
      if (user?.role === 'restaurant_owner') {
        navigate(`/restaurant-owner/dashboard?order=${it.order_id}`)
      } else if (user?.role === 'delivery_partner') {
        navigate(`/delivery-partner/dashboard?order=${it.order_id}`)
      } else {
        navigate(`/orders/${it.order_id}`)
      }
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffMs = now - d
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return 'Just now'
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHrs = Math.floor(diffMin / 60)
      if (diffHrs < 24) return `${diffHrs}h ago`
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    } catch { return '' }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center rounded-full p-2 hover:bg-surface-100 transition"
        aria-label="Notifications"
      >
        <svg className="h-6 w-6 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl border border-surface-200 bg-white shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-3">
            <strong className="text-sm font-semibold text-surface-900">Notifications</strong>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (                <button
                className="text-xs font-medium text-brand-600 hover:text-brand-700 transition"
                onClick={() => {
                  dispatch(markAllRead())
                  dispatch(markAllNotificationsRead())
                }}
              >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <ul className="max-h-96 divide-y divide-surface-100 overflow-auto">
            {list.length === 0 ? (
              <li className="p-6 text-center text-sm text-surface-400">
                <div className="flex flex-col items-center gap-2">
                  <svg className="h-8 w-8 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
                  </svg>
                  <span>No notifications yet</span>
                </div>
              </li>
            ) : (
              list.map((it) => (
                <li
                  key={it.id}
                  className={`px-4 py-3 cursor-pointer transition hover:bg-surface-50 ${
                    !it.read ? 'bg-brand-50/40 border-l-2 border-l-brand-500' : ''
                  }`}
                  onClick={() => handleClick(it)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm ${!it.read ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>
                        {it.title}
                      </div>
                      <div className="mt-0.5 text-xs text-surface-500 line-clamp-2">{it.body}</div>
                    </div>
                    <div className="flex-shrink-0 text-xs text-surface-400 whitespace-nowrap">
                      {formatTime(it.created_at)}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {list.length > 0 && (
            <div className="border-t border-surface-200 px-4 py-2 text-center">
              <button
                className="text-xs font-medium text-surface-500 hover:text-surface-700 transition"
                onClick={() => { setOpen(false); navigate('/profile') }}
              >
                View all in settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
