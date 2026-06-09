import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCartItems, removeFromCart, updateQuantity, clearCart } from '../lib/cart'
import cartService from '../features/cart/cartService'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { loadAccessToken } from '../features/auth/authService'

function CartItemRow({ item, onRemove, onUpdate, userId }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-50/50 border border-surface-100 transition-all duration-200 hover:bg-surface-50 hover:border-surface-200">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
        <img src={item.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23f0f0ea"/><text x="50%" y="50%" font-family="Inter" font-size="10" fill="%23a3a39e" text-anchor="middle" dy=".3em">No img</text></svg>'} alt={item.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-semibold text-navy-900 truncate">{item.name}</div>
            <div className="text-sm text-surface-500 mt-0.5">₹{item.price.toFixed(2)} each</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => onUpdate(item, Math.max(1, (item.quantity || 1) - 1))} 
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100 text-navy-700 hover:bg-surface-200 transition font-medium text-lg">−</button>
            <span className="w-8 text-center font-semibold text-navy-900 text-sm">{item.quantity || 1}</span>
            <button type="button" onClick={() => onUpdate(item, (item.quantity || 1) + 1)} 
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-100 text-navy-700 hover:bg-surface-200 transition font-medium text-lg">+</button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <button type="button" onClick={() => onRemove(item)} 
            className="text-xs font-medium text-rose-500 hover:text-rose-600 transition flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
          <span className="text-sm font-bold text-navy-900">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const { user, status } = useSelector((state) => state.auth)
  const [items, setItems] = useState([])
  const [placing, setPlacing] = useState(false)

  const userId = user?.id

  const refreshLocal = () => setItems(getCartItems(userId))

  useEffect(() => {
    refreshLocal()
  }, [userId])

  const handleUpdate = async (item, qty) => {
    updateQuantity(userId, item.id, qty)
    refreshLocal()
    try { await cartService.updateItem(userId, item.id, qty) } catch {}
  }

  const handleRemove = async (item) => {
    removeFromCart(userId, item.id)
    refreshLocal()
    try { await cartService.removeItem(userId, item.id) } catch {}
  }

  const handleClear = async () => {
    clearCart(userId)
    refreshLocal()
    try { await cartService.clearCartServer(userId) } catch {}
  }

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const gst = (subtotal + deliveryFee) * 0.05
  const total = subtotal + deliveryFee + gst

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Shopping Cart</h1>
          <p className="mt-1 text-sm text-surface-500">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
        <Link to="/restaurants" className="btn-ghost !text-surface-400 !text-xs">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {(() => {
        if (status === 'loading' || (!user && loadAccessToken())) {
          return (
            <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                <p className="text-sm text-surface-500">Loading your cart...</p>
              </div>
            </div>
          )
        }

        if (!user) {
          return (
            <div className="rounded-2xl border border-surface-200/80 bg-white p-12 text-center shadow-card">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
                  <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy-900">Please log in</h3>
                <p className="text-sm text-surface-500">Sign in to view your cart and place orders.</p>
                <Link to="/login" className="btn-primary">Sign in</Link>
              </div>
            </div>
          )
        }

        if (items.length === 0) {
          return (
            <div className="rounded-2xl border border-surface-200/80 bg-white p-16 text-center shadow-card">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-amber-50">
                  <svg className="h-10 w-10 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-900">Your cart is empty</h3>
                <p className="text-surface-500 max-w-sm">Add some delicious items to get started!</p>
                <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
              </div>
        </div>
          )
        }

        return (
          <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
            {/* Cart Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-navy-900">
                  Your Items ({items.reduce((c, i) => c + (i.quantity || 1), 0)})
                </h2>
                <button onClick={handleClear} className="text-xs font-medium text-surface-400 hover:text-rose-500 transition">
                  Clear all
                </button>
              </div>
              <div className="space-y-3">
                {items.map((it) => (
                  <CartItemRow key={it.id} item={it} onRemove={handleRemove} onUpdate={handleUpdate} userId={userId} />
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-2xl border border-surface-200/80 bg-white p-6 shadow-card">
                <h3 className="text-lg font-bold text-navy-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Subtotal</span>
                    <span className="font-semibold text-navy-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Delivery Fee</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? 'text-emerald-600' : 'text-navy-900'}`}>
                      {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 500 && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      Add ₹{(500 - subtotal).toFixed(2)} more for free delivery
                    </p>
                  )}
                  <div className="flex justify-between">
                    <span className="text-surface-500">GST (5%)</span>
                    <span className="font-semibold text-navy-900">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="divider" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-navy-900">Total</span>
                    <span className="font-bold text-navy-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  disabled={placing}
                  className="btn-primary w-full mt-6"
                >
                  {placing ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      Proceed to Checkout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
