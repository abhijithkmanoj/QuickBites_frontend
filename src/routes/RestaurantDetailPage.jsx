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
    if (!id) {
      return
    }
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
    const unique = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean)))
    return ['All', ...unique]
  }, [menuItems])

  const filteredMenu = useMemo(() => {
    if (selectedCategory === 'All') {
      return menuItems
    }
    return menuItems.filter((item) => item.category === selectedCategory)
  }, [menuItems, selectedCategory])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      {restaurant && (
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Image Section */}
          <div className="flex-shrink-0 w-full lg:w-1/2">
            <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
              <img
                src={restaurant.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
                alt={restaurant.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => { 
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>' 
                }}
              />
              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className={`h-2 w-2 rounded-full ${restaurant.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span className={`text-xs font-medium ${restaurant.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {restaurant.is_active ? 'Open' : 'Closed'}
                </span>
              </div>
              {/* Offer Badge */}
              {restaurant.offer && (
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-medium 
                            px-3 py-2 rounded-full shadow-md">
                  {restaurant.offer}
                </div>
              )}
            </div>
          </div>
          
          {/* Details Section */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900">{restaurant.name}</h1>
              <div className="flex flex-wrap gap-3 mb-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                  {restaurant.cuisine || 'Cuisine'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                  ⏱ {restaurant.delivery_time || 'N/A'} min
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-sm font-medium">
                  ⭐ {restaurant.rating ?? '—'}
                </span>
              </div>
              <p className="text-lg leading-relaxed text-slate-600">
                {restaurant.description || 'A lovely restaurant serving tasty meals and local favorites.'}
              </p>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">Address:</strong> {restaurant.address}
                </p>
                {restaurant.phone && (
                  <p className="mt-1 text-sm text-slate-600">
                    <strong className="text-slate-900">Phone:</strong> {restaurant.phone}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Link 
                to="/restaurants" 
                className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 text-slate-700 font-medium 
                           rounded-xl hover:bg-slate-200 transition-colors"
              >
                Back to restaurants
              </Link>
              <button
                className="flex-1 sm:flex-none px-5 py-3 bg-brand-600 text-white font-medium 
                           rounded-xl hover:bg-brand-700 transition-transform transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                View Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {status && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {status}
        </div>
      )}

      {restaurant && (
        <>
          {/* Menu Section */}
          <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                Menu
                <span className="text-sm font-normal text-slate-500">
                  ({menuItems.length} items)
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Explore dishes by category and add items to your cart.
              </p>
            </div>
            
            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`${selectedCategory === category 
                      ? 'bg-brand-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-brand-700' 
                      : 'bg-slate-50 text-slate-600 px-4 py-2 rounded-full hover:bg-slate-100'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Menu Items Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMenu.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8M5 8h14M5 8a2 2 0 100 4h14a2 2 0 110-4M5 8a2 2 0 110-4h14a2 2 0 110-4z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-slate-900 mt-4">No menu items yet</h3>
                    <p className="text-sm text-slate-500">
                      This restaurant hasn't added any menu items to this category.
                    </p>
                  </div>
                </div>
              ) : (
                filteredMenu.map((item) => <MenuItemCard key={item.id} item={item} />)
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
