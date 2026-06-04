import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { addToCart, getCartItems } from '../lib/cart'
import cartService from '../features/cart/cartService'
import { useSelector } from 'react-redux'

function AvailabilityBadge({ isAvailable }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>
  )
}

function VegBadge({ isVeg }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
      {isVeg ? 'Veg' : 'Non-Veg'}
    </span>
  )
}

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

    setAdding(true)
    try {
      const local = addToCart(user.id, {
        id: item.id,
        restaurant_id: item.restaurant_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        quantity: 1,
      })

      await cartService.addItem(user.id, {
        id: item.id,
        restaurant_id: item.restaurant_id,
        name: item.name,
        price: item.price,
        quantity: 1,
      })

      setAdded(true)
      toast.success(`${item.name} added to cart.`)
      return local
    } catch (err) {
      setAdded(false)
      toast.error('Could not add to cart. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  const isAdding = adding || !user?.id

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white 
                    shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={item.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
          onError={(e) => { 
            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>' 
          }}
        />
        {/* Vegan Badge */}
        {item.is_veg && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-medium 
                        px-2 py-1 rounded-full">
            Veg
          </div>
        )}
        {/* Availability Badge */}
        {!item.is_available && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-medium 
                        px-2 py-1 rounded-full">
            Unavailable
          </div>
        )}
        {/* New/Badge */}
        {/* Could add a "New" or "Popular" badge here */}
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{item.name}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                            ${item.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
              {item.is_veg ? 'Veg' : 'Non-Veg'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full 
                            ${item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
          {item.description || 'A delicious menu item selected just for you.'}
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">
            ₹{item.price.toFixed(2)}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!item.is_available || isAdding}
              className={item.is_available && !isAdding 
                ? 'flex-1 px-4 py-2 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-transform transform hover:-translate-y-1 shadow-md hover:shadow-lg'
                : 'flex-1 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl cursor-not-allowed'}
            >
              {adding 
                ? 'Adding...' 
                : added 
                  ? 'Added' 
                  : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
