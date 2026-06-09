import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MapView from '../components/MapView'
import apiClient from '../lib/axios'
import RestaurantCard from '../components/RestaurantCard'
import CuisineFilters from '../components/CuisineFilters'

export default function RestaurantsPage() {
  const [query, setQuery] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [center, setCenter] = useState(null)
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
      setCenter({ lat: latitude, lng: longitude })
      // reverse geocode using Nominatim (OpenStreetMap)
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
          headers: { 'User-Agent': 'QuickBites/1.0 (+https://example.com)' },
        })
        const geoData = await geoRes.json()
        if (geoData && geoData.display_name) setStatus(`Location: ${geoData.display_name}`)
      } catch (e) {
        // ignore reverse geocode errors
      }
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
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Restaurants</h1>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Home
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="relative w-full sm:w-1/2">
              <label className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 10.5h-6a1.5 1.5 0 010-3h6a1.5 1.5 0 010 3z"></path>
                </svg>
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisine, address..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-3 w-full sm:w-1/2">
              <button 
                type="submit"
                className="flex-1 px-5 py-3 bg-brand-600 text-white font-medium rounded-xl 
                           hover:bg-brand-700 transition-transform transform hover:-translate-y-1 shadow-md hover:shadow-lg"
              >
                Search
              </button>
              <button
                type="button"
                onClick={findNearby}
                className="flex-1 px-5 py-3 border border-slate-200 rounded-xl 
                           hover:bg-slate-50 transition-transform transform hover:-translate-y-1"
              >
                Find Nearby
              </button>
            </div>
          </div>
        </form>
        
        {/* Cuisine Filters */}
        {cuisines.length > 0 && (
          <div className="mt-4">
            <CuisineFilters cuisines={cuisines} selected={null} onChange={handleCuisineChange} />
          </div>
        )}
      </div>

      {status && (
        <div className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm">
          {status}
        </div>
      )}

      {/* Results Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'} found
          </h2>
          <span className="text-sm text-slate-500">                          Sort by: 
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ml-2 px-3 py-1 rounded-xl border-surface-200 bg-white text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="rating">Rating</option>
              <option value="distance">Distance</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </span>
        </div>
        
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-48 w-48 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8M5 8h14M5 8a2 2 0 100 4h14a2 2 0 100-4M5 8a2 2 0 110-4h14a2 2 0 110-4z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">No restaurants found</h3>
            <p className="text-lg text-slate-500">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Link 
              to="/" 
              className="mt-6 inline-flex px-5 py-2 bg-brand-600 text-white font-medium 
                         rounded-xl hover:bg-brand-700 transition-transform transform hover:-translate-y-1"
            >
              Browse All Restaurants
            </Link>
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
