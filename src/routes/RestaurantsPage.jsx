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

  useEffect(() => {
    // initial list
    fetchRestaurants()
  }, [])

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
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Restaurants</h1>
        <Link to="/" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Home</Link>
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search restaurants, cuisine, address..." className="flex-1 rounded px-4 py-2 border" />
        <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit">Search</button>
        <button type="button" onClick={findNearby} className="rounded border px-4 py-2">Find Nearby</button>
      </form>

      {status && <div className="mt-3 text-sm text-rose-600">{status}</div>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <MapView center={center} restaurants={restaurants} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Results</h2>
            <CuisineFilters cuisines={cuisines} selected={null} onChange={handleCuisineChange} />
          </div>
          <ul className="mt-3 space-y-3">
            {restaurants.length === 0 && <li className="text-sm text-slate-600">No restaurants found.</li>}
            {restaurants.map((r) => (
              <li key={r.id}>
                <RestaurantCard restaurant={r} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
