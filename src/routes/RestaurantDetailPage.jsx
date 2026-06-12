import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../lib/axios'
import MenuItemCard from '../components/MenuItemCard'

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!id) return
    fetchRestaurant()
    fetchMenu()
  }, [id])

  async function fetchRestaurant() {
    setStatus('Loading restaurant...')
    try {
      const response = await apiClient.get(`/restaurants/${id}`)
      setRestaurant(response.data)
      setStatus('')
    } catch (error) {
      setStatus('Restaurant details could not be loaded.')
    }
  }

  async function fetchMenu() {
    setStatus('Loading menu...')
    try {
      const response = await apiClient.get(`/restaurants/${id}/menu`)
      setMenuItems(response.data || [])
      setStatus('')
    } catch (error) {
      setStatus('Menu could not be loaded.')
    }
  }

  const categories = useMemo(() => {
    const seen = {}
    menuItems.forEach((item) => {
      if (item.category) {
        const key = item.category.toLowerCase()
        if (!seen[key]) seen[key] = item.category
      }
    })
    return ['All', ...Object.values(seen)]
  }, [menuItems])

  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'All') return menuItems
    return menuItems.filter((item) =>
      item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [menuItems, selectedCategory])

  return (
    <div className="space-y-8">
      {/* Restaurant Header */}
      {restaurant && (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 min-h-[320px]">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-hero-pattern opacity-20" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Image */}
                <div className="flex-shrink-0 w-full lg:w-80">
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10">
                    <img
                      src={restaurant.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f5f5f0"/><text x="50%" y="50%" font-family="Inter" font-size="14" fill="%23a3a39e" text-anchor="middle" dy=".3em">No Image</text></svg>'}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                      onError={(e) => { 
                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f5f5f0"/><text x="50%" y="50%" font-family="Inter" font-size="14" fill="%23a3a39e" text-anchor="middle" dy=".3em">No Image</text></svg>' 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" />
                    {/* Status & Offer Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                        <span className={`h-2 w-2 rounded-full ${restaurant.is_active ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'}`} />
                        <span className="text-xs font-semibold text-navy-800">{restaurant.is_active ? 'Open' : 'Closed'}</span>
                      </div>
                    </div>
                    {restaurant.offer && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg">
                        🏷️ {restaurant.offer}
                      </div>
                    )}
                    {/* Rating */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                      <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-bold text-navy-800">{restaurant.rating ?? '—'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 space-y-4 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-sm font-medium">
                      🍽️ {restaurant.cuisine || 'Cuisine'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-sm font-medium">
                      ⏱️ {restaurant.delivery_time || 'N/A'} min
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1.5 text-sm font-medium">
                      🚚 {restaurant.delivery_fee > 0 ? `₹${restaurant.delivery_fee}` : 'Free delivery'}
                    </span>
                  </div>
                  <p className="text-white/70 leading-relaxed max-w-2xl">
                    {restaurant.description || 'A lovely restaurant serving tasty meals and local favorites.'}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to restaurants
                    </Link>
                  </div>
                  <div className="pt-2 space-y-1 text-sm text-white/50">
                    <p>📍 {restaurant.address}</p>
                    {restaurant.phone && <p>📞 {restaurant.phone}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Section */}
          <section className="rounded-2xl border border-surface-200/80 bg-white p-6 md:p-8 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-navy-900">Menu</h2>
                <p className="mt-1 text-sm text-surface-500">{menuItems.length} items available</p>
              </div>
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-navy-900 text-white shadow-lg shadow-navy-900/20'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200 hover:text-navy-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Menu Items Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMenu.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-surface-300 bg-surface-50 p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-100">
                      <svg className="h-6 w-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8M5 8h14M5 8a2 2 0 100 4h14a2 2 0 110-4M5 8a2 2 0 110-4h14a2 2 0 110-4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">No menu items yet</h3>
                    <p className="text-sm text-surface-500">This restaurant hasn't added any items to this category.</p>
                  </div>
                </div>
              ) : (
                filteredMenu.map((item) => <MenuItemCard key={item.id} item={item} />)
              )}
            </div>
          </section>
        </>
      )}
      
      {status && !restaurant && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
          <p className="text-sm text-rose-700">{status}</p>
        </div>
      )}
    </div>
  )
}
