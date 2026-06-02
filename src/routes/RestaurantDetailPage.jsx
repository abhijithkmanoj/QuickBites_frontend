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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Restaurant Details</h1>
          <p className="mt-2 text-sm text-slate-600">Browse menu items, filter by category, and add favorites to your cart.</p>
        </div>
        <Link to="/restaurants" className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
          Back to restaurants
        </Link>
      </div>

      {status && <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{status}</div>}

      {restaurant && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img
                src={restaurant.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
                alt={restaurant.name}
                className="h-48 w-full rounded-3xl object-cover sm:h-56 sm:w-80"
                onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>' }}
              />
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">{restaurant.cuisine || 'Cuisine'}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Rating: {restaurant.rating ?? '—'}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">Delivery: {restaurant.delivery_time ?? 'N/A'} mins</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">{restaurant.name}</h2>
                <p className="text-sm leading-7 text-slate-600">{restaurant.description || 'A lovely restaurant serving tasty meals and local favorites.'}</p>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p>{restaurant.address}</p>
                  <p className="mt-2">{restaurant.is_active ? 'Open for orders' : 'Currently unavailable'}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Restaurant Summary</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">Cuisine</span>: {restaurant.cuisine || 'Unknown'}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Address</span>: {restaurant.address}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Menu Items</span>: {menuItems.length}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Status</span>: {restaurant.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </aside>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Menu</h2>
            <p className="mt-1 text-sm text-slate-600">Explore dishes by category and add items to your cart.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredMenu.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No menu items match this category yet.
            </div>
          ) : (
            filteredMenu.map((item) => <MenuItemCard key={item.id} item={item} />)
          )}
        </div>
      </section>
    </div>
  )
}
