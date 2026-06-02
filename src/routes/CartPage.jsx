import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCartItems, removeFromCart, updateQuantity, clearCart } from '../lib/cart'
import cartService from '../features/cart/cartService'
import { toast } from 'react-toastify'

function CartItemRow({ item, onRemove, onUpdate }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b last:border-b-0">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <img src={item.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900">{item.name}</div>
            <div className="text-sm text-slate-600">₹{item.price.toFixed(2)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onUpdate(item, Math.max(1, (item.quantity || 1) - 1))} className="px-3 py-1 rounded-full bg-slate-100">-</button>
            <div className="px-3">{item.quantity || 1}</div>
            <button type="button" onClick={() => onUpdate(item, (item.quantity || 1) + 1)} className="px-3 py-1 rounded-full bg-slate-100">+</button>
            <button type="button" onClick={() => onRemove(item)} className="ml-4 text-sm text-rose-600">Remove</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setItems(getCartItems())
  }, [])

  const refreshLocal = () => setItems(getCartItems())

  const handleUpdate = async (item, qty) => {
    // optimistic local update
    updateQuantity(item.id, qty)
    refreshLocal()
    try {
      // try server update (may throw if item id is menu id)
      await cartService.updateItem(item.id, qty)
    } catch (err) {
      // ignore server error; local state retained
    }
  }

  const handleRemove = async (item) => {
    // optimistic local remove
    removeFromCart(item.id)
    refreshLocal()
    try {
      await cartService.removeItem(item.id)
    } catch (err) {
      // ignore
    }
  }

  const handleClear = async () => {
    clearCart()
    refreshLocal()
    try {
      await cartService.clearCartServer()
    } catch (err) {
      // ignore
    }
  }

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="mt-6 text-center">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link to="/restaurants" className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Browse restaurants</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-2xl border border-slate-100 bg-white p-4">
            {items.map((it) => (
              <CartItemRow key={it.id} item={it} onRemove={handleRemove} onUpdate={handleUpdate} />
            ))}
          </section>

          <aside className="rounded-2xl border border-slate-100 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
            <div className="mt-4 text-sm text-slate-600">
              <div className="flex justify-between"><span>Items</span><span>{items.reduce((c, i) => c + (i.quantity || 1), 0)}</span></div>
              <div className="flex justify-between mt-2"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            </div>
            <div className="mt-6">
              <button type="button" onClick={() => navigate('/checkout')} className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Proceed to checkout</button>
              <button type="button" onClick={handleClear} className="mt-3 w-full rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Clear cart</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
