import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('restaurant')

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/recommendations', { params: { limit: 20 } })
      setType(res.data.type || 'restaurant')
      setRecommendations(res.data.data || [])
    } catch (err) { toast.error(err.response?.data?.detail || 'Could not load recommendations.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRecommendations() }, [])

  const isRestaurant = type !== 'similar_food'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">
            {isRestaurant ? 'Recommended For You' : 'You Might Also Like'}
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            {isRestaurant ? 'Based on your order history and preferences.' : 'Similar dishes you may enjoy.'}
          </p>
        </div>
        <button type="button" onClick={fetchRecommendations} className="btn-secondary">Refresh</button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center shadow-card">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <p className="text-sm text-surface-500">Loading recommendations...</p>
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-16 text-center">
          <p className="text-surface-500">No recommendations yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((r) => (
            <div key={r.id} className="card-premium">
              {isRestaurant ? (
                <>
                  <h3 className="text-lg font-bold text-navy-900">{r.name}</h3>
                  <p className="mt-1 text-sm text-surface-500">{r.cuisine}</p>
                  <p className="mt-2 text-sm text-surface-400">{r.address}</p>
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-surface-100">
                    <span className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      {r.rating?.toFixed(1)} • {r.delivery_time} mins
                    </span>
                    <Link to={`/restaurants/${r.id}`} className="btn-primary !py-2 !text-xs">Order Now</Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-navy-900">{r.name}</h3>
                  <p className="mt-1 text-sm text-surface-500">{r.description || r.category}</p>
                  <p className="mt-2 text-sm text-surface-400">Restaurant: {r.restaurant_name || 'N/A'}</p>
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-surface-100">
                    <span className="text-xl font-bold text-navy-900">₹{r.price?.toFixed(2)}</span>
                    <Link to={r.restaurant_id ? `/restaurants/${r.restaurant_id}` : '#'} className="btn-primary !py-2 !text-xs">View</Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
