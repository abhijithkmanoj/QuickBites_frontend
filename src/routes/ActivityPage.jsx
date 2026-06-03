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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Activity Log</h1>
          <p className="text-slate-600">Track your recent actions and activities</p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={loadActivities}
            disabled={loading}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleClearOldActivities}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
          >
            Clear Old
          </button>
        </div>

        {/* Activity List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500">No activities recorded yet</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 capitalize">
                      {activity.activity_type}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(activity.created_at)}
                    </p>
                    {activity.activity_data && (
                      <p className="text-sm text-slate-600 mt-1">
                        {JSON.stringify(activity.activity_data, null, 2).substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteActivity(activity.id)}
                  className="text-slate-400 hover:text-red-600 transition"
                  title="Delete activity"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex gap-2 justify-center items-center">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-slate-600">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
