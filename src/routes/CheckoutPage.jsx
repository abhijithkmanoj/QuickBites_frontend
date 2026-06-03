import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../lib/axios'
import { getCartItems, clearCart } from '../lib/cart'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const DELIVERY_FEE = 40.0
const FREE_DELIVERY_THRESHOLD = 500.0
const GST_RATE = 0.05

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    const items = getCartItems(user?.id)
    if (!items || items.length === 0) {
      navigate('/cart')
      return
    }
    setCartItems(items)
    fetchAddresses()
  }, [user?.id])

  async function fetchAddresses() {
    setLoadingAddresses(true)
    try {
      const resp = await apiClient.get('/addresses')
      const data = resp.data || []
      setAddresses(data)
      const defaultAddr = data.find((a) => a.is_default)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id)
      }
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        toast.error('Please log in to continue.')
        navigate('/login')
      } else {
        toast.error('Could not load addresses. Please try again.')
      }
    } finally {
      setLoadingAddresses(false)
    }
  }

  const subtotal = cartItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const gst = Math.round(subtotal * GST_RATE * 100) / 100
  const total = Math.round((subtotal + gst + deliveryFee) * 100) / 100

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address.')
      return
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    setPlacing(true)
    try {
      const resp = await apiClient.post('/orders', {
        address_id: selectedAddressId,
        payment_method: 'cod',
      })
      const order = resp.data
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${order.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Checkout</h1>
        <p className="mt-2 text-sm text-slate-600">Review your order and choose a delivery address.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Left - Address Selection & Items */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Delivery Address</h2>
              <Link to="/addresses" className="text-sm font-semibold text-slate-900 underline hover:text-slate-700">
                Manage addresses
              </Link>
            </div>

            {loadingAddresses ? (
              <p className="mt-4 text-sm text-slate-500">Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
                No addresses saved yet.{' '}
                <Link to="/addresses" className="font-semibold text-slate-900 underline">
                  Add one now
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      selectedAddressId === addr.id
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 h-4 w-4 text-slate-900 focus:ring-slate-500"
                    />
                    <div className="flex-1 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.postal_code}</p>
                      {addr.landmark && <p className="text-slate-500">Landmark: {addr.landmark}</p>}
                      {addr.phone && <p className="text-slate-500">Phone: {addr.phone}</p>}
                      {addr.is_default && (
                        <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Order Items */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Items ({cartItems.length})</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={item.image_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="font-medium text-slate-900">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right - Order Summary */}
        <aside className="lg:sticky lg:top-6 h-fit space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Payment Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="text-xs text-slate-500">
                  Add ₹{(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)} more for free delivery
                </p>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST (5%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold">Payment: Cash on Delivery</p>
              <p className="mt-1 text-xs">Pay when your order arrives. No online payment needed.</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddressId || cartItems.length === 0}
              className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placing ? 'Placing Order...' : 'Place Order (COD)'}
            </button>

            <Link
              to="/cart"
              className="mt-3 block w-full text-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Back to Cart
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}
