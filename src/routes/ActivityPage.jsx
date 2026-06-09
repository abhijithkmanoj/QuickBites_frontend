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
    if (user?.id) {
      loadActivities()
    }
  }, [user?.id, page])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const result = await authService.getActivityLog(page * limit, limit)
      setActivities(result.items || [])
      setTotal(result.total || 0)
    } catch (error) {
      toast.error('Failed to load activity log')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Delete this activity entry?')) return
    try {
      await authService.deleteActivity(activityId)
      toast.success('Activity deleted')
      loadActivities()
    } catch (error) {
      toast.error('Failed to delete activity')
      console.error(error)
    }
  }

  const handleClearOldActivities = async () => {
    if (!window.confirm('Delete all activities older than 90 days?')) return
    try {
      const result = await authService.clearActivities(90)
      toast.success(result.message)
      loadActivities()
    } catch (error) {
      toast.error('Failed to clear activities')
      console.error(error)
    }
  }

  const getActivityIcon = (activityType) => {
    const icons = {
      login: '🔓',
      order: '🛒',
      search: '🔍',
      view: '👁️',
      favorite: '❤️',
    }
    return icons[activityType] || '📝'
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-surface-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-surface-900">Activity Log</h1>
        <p className="mt-2 text-sm text-surface-500">Track your recent actions and activities.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={loadActivities}
          disabled={loading}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button
          onClick={handleClearOldActivities}
          className="rounded-full border border-surface-200 px-5 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition"
        >
          Clear Old
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="rounded-3xl border border-surface-200 bg-white p-8 text-center text-sm text-surface-500">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
            <p>Loading activity log...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-surface-300 bg-surface-50 p-12 text-center">
          <p className="text-lg font-medium text-surface-900">No activities recorded yet</p>
          <p className="mt-2 text-sm text-surface-500">
            Your actions like orders, searches, and logins will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Activity List */}
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group rounded-3xl border border-surface-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-surface-900 capitalize truncate">
                        {activity.activity_type.replace('_', ' ')}
                      </h3>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="flex-shrink-0 rounded-full p-1.5 text-surface-400 opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete activity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-surface-500">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="rounded-full border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <span className="text-sm text-surface-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-full border border-surface-200 px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
