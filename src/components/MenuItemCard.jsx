import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getCartItems } from '../lib/cart'
import cartService from '../features/cart/cartService'
import { useSelector } from 'react-redux'

export default function MenuItemCard({ item }) {
  const { user, status } = useSelector((state) => state.auth)
  const [added, setAdded] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (user?.id) {
      const current = getCartItems(user.id).find((cartItem) => 
        cartItem.id === item.id || cartItem.menu_item_id === item.id
      )
      setAdded(Boolean(current))
    }
  }, [item.id, user?.id, status])

  const handleAddToCart = async () => {
    if (!user?.id || adding) return

    if (!item.restaurant_id) {
      toast.error('Unable to add item to cart: restaurant information is missing.')
      return
    }

    const currentCart = getCartItems(user.id)
    const currentRestaurantId = currentCart?.[0]?.restaurant_id
    if (currentRestaurantId && currentRestaurantId !== item.restaurant_id) {
      toast.error('Your cart already contains items from another restaurant. Clear your cart before adding this item.')
      return
    }

    setAdding(true)
    try {
      await cartService.addItem(user.id, {
        id: item.id,
        restaurant_id: item.restaurant_id,
        name: item.name,
        price: item.price,
        quantity: 1,
      })

      setAdded(true)
      toast.success(`${item.name} added to cart.`)
    } catch (err) {
      setAdded(false)
      const message = err?.response?.data?.detail || err?.message || 'Could not add to cart. Please try again.'
      toast.error(message)
      console.error('Add to cart failed:', err)
    } finally {
      setAdding(false)
    }
  }

  const isAdding = adding || !user?.id

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-surface-200/80 bg-white 
                    shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1.5 hover:border-brand-200/70">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-surface-100 to-surface-200">
        <img
          src={item.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f5f5f0"/><text x="50%" y="50%" font-family="Inter" font-size="14" fill="%23a3a39e" text-anchor="middle" dy=".3em">No Image</text></svg>'}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e) => { 
            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f5f5f0"/><text x="50%" y="50%" font-family="Inter" font-size="14" fill="%23a3a39e" text-anchor="middle" dy=".3em">No Image</text></svg>' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 via-transparent to-transparent" />
        {/* Veg/Non-Veg Badge */}
        <div className="absolute top-3 left-3">
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 ${
            item.is_veg ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50'
          }`}>
            <span className={`h-3 w-3 rounded-full ${item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </span>
        </div>
        {/* Availability Badge */}
        {!item.is_available && (
          <div className="absolute top-3 right-3 bg-rose-500/90 backdrop-blur-sm text-white text-xs font-semibold
                        px-3 py-1 rounded-lg shadow-lg">
            Unavailable
          </div>
        )}
        {/* Popular badge */}
        {item.is_popular && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-brand-500 to-amber-500 text-white text-xs font-semibold
                        px-3 py-1 rounded-lg shadow-lg shadow-brand-500/30">
            🔥 Popular
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-navy-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{item.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="badge-surface text-[11px]">
              {item.is_veg ? '🥬 Vegetarian' : '🍖 Non-Veg'}
            </span>
            {item.category && (
              <span className="badge-surface text-[11px]">{item.category}</span>
            )}
          </div>
        </div>
        {item.description && (
          <p className="text-sm text-surface-500 leading-relaxed mb-4 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-surface-100">
          <div>
            <span className="text-xs text-surface-400 font-medium">Price</span>
            <div className="text-2xl font-bold text-navy-900">
              ₹{item.price.toFixed(2)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!item.is_available || isAdding}
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              item.is_available && !isAdding && !added
                ? 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 active:scale-[0.97]'
                : added
                  ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                  : 'bg-surface-100 text-surface-400 cursor-not-allowed'
            }`}
          >
            {adding ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding
              </>
            ) : added ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Added ✓
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
