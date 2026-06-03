import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/restaurants')
      setRestaurants(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load restaurants.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const updateStatus = async (restaurant, action) => {
    setUpdatingId(restaurant.id)
    try {
      await apiClient.patch(`/admin/restaurants/${restaurant.id}`, { action })
      setRestaurants((prev) => prev.map((r) => (r.id === restaurant.id ? { ...r, is_active: action === 'approve' } : r)))
      toast.success(`Restaurant ${action}d successfully.`)
    } catch (err) {
      toast.error(err.response?.data?.detail || `Could not ${action} restaurant.`)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Restaurant Management</h1>
          <p className="mt-2 text-sm text-slate-600">Approve, reject, or suspend restaurants.</p>
        </div>
        <button type="button" onClick={fetchRestaurants} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh</button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading restaurants...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Cuisine</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {restaurants.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm text-slate-900">{r.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 capitalize">{r.cuisine}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{r.address}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{r.rating?.toFixed(1)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${r.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {r.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button type="button" onClick={() => updateStatus(r, 'approve')} disabled={updatingId === r.id} className="mr-2 rounded-full border border-emerald-200 px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                      Approve
                    </button>
                    <button type="button" onClick={() => updateStatus(r, 'reject')} disabled={updatingId === r.id} className="mr-2 rounded-full border border-amber-200 px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                      Reject
                    </button>
                    <button type="button" onClick={() => updateStatus(r, 'suspend')} disabled={updatingId === r.id} className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
              {restaurants.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-600">No restaurants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
