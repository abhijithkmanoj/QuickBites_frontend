import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/reviews')
      setReviews(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load reviews.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await apiClient.delete(`/admin/reviews/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      toast.success('Review deleted successfully.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not delete review.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Review Moderation</h1>
          <p className="mt-2 text-sm text-slate-600">Review and manage user reviews.</p>
        </div>
        <button type="button" onClick={fetchReviews} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh</button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading reviews...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Review</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm text-slate-900">Restaurant {r.restaurant_id?.slice(0, 8) || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{r.rating} / 5</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{r.review_text || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button type="button" onClick={() => deleteReview(r.id)} className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50">Remove</button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-600">No reviews found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
