import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../lib/axios'
import RestaurantCard from '../components/RestaurantCard'
import CuisineFilters from '../components/CuisineFilters'

export default function RestaurantsPage() {
  const [query, setQuery] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    fetchRestaurants()
  }, [sortBy])

  async function fetchRestaurants(params = {}) {
    try {
      const res = await apiClient.get('/restaurants', { params })
      setRestaurants(res.data)
    } catch (err) {
      setStatus('Failed to load restaurants')
    }
  }

  const cuisines = Array.from(new Set(restaurants.map((r) => r.cuisine).filter(Boolean))).slice(0, 12)

  function handleCuisineChange(cuisine) {
    if (!cuisine) {
      fetchRestaurants()
    } else {
      fetchRestaurants({ cuisine })
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    await fetchRestaurants({ search: query })
  }

  async function findNearby() {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported')
      return
    }
    setStatus('Locating...')
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        const res = await apiClient.get('/restaurants/nearby', { params: { latitude, longitude, radius_km: 5 } })
        setRestaurants(res.data)
        setStatus('')
      } catch (err) {
        setStatus('Nearby search failed')
      }
    }, (err) => {
      setStatus('Location permission denied')
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Restaurants</h1>
          <p className="mt-1 text-sm text-surface-500">Discover the best food near you</p>
        </div>
        <Link to="/" className="btn-ghost !text-surface-400 !text-xs">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Premium Search Section */}
      <div className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-card">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, or dishes..."
                className="input-premium pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              <button type="button" onClick={findNearby} className="btn-secondary">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Near Me
              </button>
            </div>
          </div>
        </form>
        
        {cuisines.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-100">
            <CuisineFilters cuisines={cuisines} selected={null} onChange={handleCuisineChange} />
          </div>
        )}
      </div>

      {status && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <p className="text-sm text-rose-700">{status}</p>
        </div>
      )}

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-navy-900">
            {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'} found
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-surface-400 font-medium">Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
              <option value="rating">Rating</option>
              <option value="distance">Distance</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
        
        {restaurants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
                <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-900">No restaurants found</h3>
              <p className="text-surface-500 max-w-sm">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
