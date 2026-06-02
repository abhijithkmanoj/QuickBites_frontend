import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { addToCart, getCartItems } from '../lib/cart'
import cartService from '../features/cart/cartService'

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
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const current = getCartItems().find((cartItem) => cartItem.id === item.id)
    setAdded(Boolean(current))
  }, [item.id])

  const handleAddToCart = async () => {
    const local = addToCart({
      id: item.id,
      restaurant_id: item.restaurant_id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1,
    })
    setAdded(true)
    toast.success(`${item.name} added to cart.`)

    // attempt to persist to backend if authenticated
    try {
      await cartService.addItem({
        id: item.id,
        restaurant_id: item.restaurant_id,
        name: item.name,
        price: item.price,
        quantity: 1,
      })
    } catch (err) {
      // ignore - local fallback retained
    }
    return local
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-3xl bg-slate-100">
          <img
            src={item.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>' }}
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
            <VegBadge isVeg={item.is_veg} />
            <AvailabilityBadge isAvailable={item.is_available} />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description || 'A delicious menu item selected just for you.'}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xl font-semibold text-slate-900">₹{item.price.toFixed(2)}</span>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!item.is_available}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${item.is_available ? 'bg-slate-900 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-200 text-slate-500'}`}
            >
              {added ? 'Added' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
