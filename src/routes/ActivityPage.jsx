import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import authService from '../features/auth/authService'

export default function ActivityPage() {
  const { user } = useSelector((state) => state.auth)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)

  useEffect(() => {
    if (user?.id) loadActivities()
  }, [user?.id, page])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const result = await authService.getActivityLog(page * limit, limit)
      setActivities(result.items || [])
      setTotal(result.total || 0)
    } catch { toast.error('Failed to load activity log') }
    finally { setLoading(false) }
  }

  const handleClearOldActivities = async () => {
    if (!window.confirm('Delete all activities older than 90 days?')) return
    try {
      const result = await authService.clearActivities(90)
      toast.success(result.message)
      loadActivities()
    } catch { toast.error('Failed to clear activities') }
  }

  const getActivityIcon = (activityType) => {
    const icons = { login: '🔓', order: '🛒', search: '🔍', view: '👁️', favorite: '❤️' }
    return icons[activityType] || '📝'
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Activity Log</h1>
          <p className="mt-1 text-sm text-surface-500">Track your recent actions and activities</p>
        </div>
        <button onClick={handleClearOldActivities} className="btn-secondary !text-xs !py-2">Clear Old</button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center shadow-card">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <p className="text-sm text-surface-500">Loading activity log...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
              <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-navy-900">No activities yet</h3>
            <p className="text-sm text-surface-500">Your actions like orders, searches, and logins will appear here.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="card-premium">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-navy-900 capitalize truncate">
                        {activity.activity_type.replace('_', ' ')}
                      </h3>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {new Date(activity.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {activity.activity_data && (
                      <p className="mt-1 text-xs text-surface-400 line-clamp-2">
                        {JSON.stringify(activity.activity_data).substring(0, 120)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn-secondary">Previous</button>
              <span className="text-sm text-surface-500">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn-secondary">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
