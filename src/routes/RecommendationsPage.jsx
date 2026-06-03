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
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load recommendations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  if (type === 'similar_food') {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">You might also like</h1>
            <p className="mt-2 text-sm text-slate-600">Similar dishes you may enjoy.</p>
          </div>
          <button type="button" onClick={fetchRecommendations} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh</button>
        </div>
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.description || item.category}</p>
                <p className="mt-2 text-sm text-slate-600">Restaurant: {item.restaurant_name || 'N/A'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-semibold text-slate-900">₹{item.price.toFixed(2)}</span>
                  <Link to={item.restaurant_id ? `/restaurants/${item.restaurant_id}` : '#'} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">View Item</Link>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && <p className="text-slate-600">No similar dishes found.</p>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Recommended For You</h1>
          <p className="mt-2 text-sm text-slate-600">Based on your order history and preferences.</p>
        </div>
        <button type="button" onClick={fetchRecommendations} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh</button>
      </div>
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((r) => (
            <div key={r.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{r.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{r.cuisine}</p>
              <p className="mt-2 text-sm text-slate-600">{r.address}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">★ {r.rating.toFixed(1)} • {r.delivery_time} mins</span>
                <Link to={`/restaurants/${r.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Order Now</Link>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && <p className="text-slate-600">No recommendations yet.</p>}
        </div>
      )}
    </div>
  )
}
