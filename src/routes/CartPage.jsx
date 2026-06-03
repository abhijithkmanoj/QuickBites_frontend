import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCartItems, removeFromCart, updateQuantity, clearCart } from '../lib/cart'
import cartService from '../features/cart/cartService'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

function CartItemRow({ item, onRemove, onUpdate, userId }) {
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
  const { user, status } = useSelector((state) => state.auth)
  const [items, setItems] = useState([])
  const [placing, setPlacing] = useState(false)

  const userId = user?.id

  const refreshLocal = () => setItems(getCartItems(userId))

  const handleUpdate = async (item, qty) => {
    updateQuantity(userId, item.id, qty)
    refreshLocal()
    try {
      await cartService.updateItem(userId, item.id, qty)
    } catch (err) {
      // ignore server error; local state retained
    }
  }

  const handleRemove = async (item) => {
    removeFromCart(userId, item.id)
    refreshLocal()
    try {
      await cartService.removeItem(userId, item.id)
    } catch (err) {
      // ignore
    }
  }

  const handleClear = async () => {
    clearCart(userId)
    refreshLocal()
    try {
      await cartService.clearCartServer(userId)
    } catch (err) {
      // ignore
    }
  }

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
  const deliveryFee = subtotal >= 500 ? 0 : 40 // Free delivery over ₹500
  const gst = (subtotal + deliveryFee) * 0.05 // 5% GST
  const total = subtotal + deliveryFee + gst

  const content = (() => {
    if (status === 'loading') {
      return (
        <div className="mt-6 text-center text-slate-600 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="mt-6 text-center">
          <p className="text-slate-600">Please log in to view your cart.</p>
          <Link 
            to="/login" 
            className="mt-4 inline-flex px-6 py-3 bg-brand-600 text-white font-medium 
                       rounded-xl hover:bg-brand-700 transition-transform transform hover:-translate-y-1 shadow-md"
          >
            Log in
          </Link>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="mt-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3-3m0 0l3 3m-3-3v8M5 8h14M5 8a2 2 0 100 4h14a2 2 0 110-4M5 8a2 2 0 110-4h14a2 2 0 110-4z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Your cart is empty</h3>
            <p className="text-lg text-slate-500">
              Add some delicious items to your cart to get started!
            </p>
            <Link 
              to="/restaurants" 
              className="mt-6 inline-flex px-6 py-3 bg-brand-600 text-white font-medium 
                         rounded-xl hover:bg-brand-700 transition-transform transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="mt-8">
        {/* Cart Items Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Your Items ({items.reduce((c, i) => c + (i.quantity || 1), 0)} items)</h2>
            <button 
              onClick={handleClear}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Clear cart
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((it) => (
              <CartItemRow 
                key={it.id} 
                item={it} 
                onRemove={handleRemove} 
                onUpdate={handleUpdate} 
                userId={userId} 
              />
            ))}
          </div>
        </section>

        {/* Order Summary Section */}
        <aside className="rounded-2xl border border-slate-100 bg-white p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Order Summary
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"></path>
              </svg>
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm text-slate-600">Items</div>
              <div className="text-sm font-medium text-slate-900 text-right">
                {items.reduce((c, i) => c + (i.quantity || 1), 0)}
              </div>
              
              <div className="text-sm text-slate-600">Subtotal</div>
              <div className="text-sm font-medium text-slate-900 text-right">₹{subtotal.toFixed(2)}</div>
              
              <div className="text-sm text-slate-600">Delivery Fee</div>
              <div className="text-sm font-medium text-slate-900 text-right">
                ₹{deliveryFee.toFixed(2)} {deliveryFee === 0 ? '(Free)' : ''}
              </div>
              
              <div className="text-sm text-slate-600">GST (5%)</div>
              <div className="text-sm font-medium text-slate-900 text-right">₹{gst.toFixed(2)}</div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-xl font-bold text-slate-900 flex justify-between">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={() => navigate('/checkout')}
                disabled={placing}
                className="w-full px-6 py-3 bg-brand-600 text-white font-medium 
                           rounded-xl hover:bg-brand-700 transition-transform transform hover:-translate-y-1 
                           shadow-lg hover:shadow-xl ${placing ? 'opacity-70' : ''}"
              >
                {placing ? 'Placing Order...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    )
  })()

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Home
        </Link>
      </div>
      {content}
    </div>
  )
}
