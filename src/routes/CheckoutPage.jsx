import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../lib/axios'
import { getCartItems, clearCart } from '../lib/cart'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import AddressAutocomplete from '../components/common/AddressAutocomplete'
import PaymentForm from '../components/payments/PaymentForm'
import PromoCodeInput from '../components/checkout/PromoCodeInput'

function PaymentWidget({ orderId, amountCents, onSuccess }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <PaymentForm amountCents={amountCents} currency="inr" orderId={orderId} onSuccess={onSuccess} />
    </div>
  )
}

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
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAddressForm, setNewAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    landmark: '',
    address_line2: '',
    unit: '',
    is_default: false,
    latitude: null,
    longitude: null,
    formatted_address: '',
    place_id: '',
  })
  const [placing, setPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [paymentProcessingResult, setPaymentProcessingResult] = useState(null)
  const [tipAmount, setTipAmount] = useState(0)
  const [appliedPromos, setAppliedPromos] = useState([])
  const [promoDiscountCents, setPromoDiscountCents] = useState(0)

  useEffect(() => {
    // Ensure user is logged in before proceeding
    if (!user?.id) {
      console.warn('[CheckoutPage] User not loaded yet')
      return
    }

    const items = getCartItems(user.id)
    if (!items || items.length === 0) {
      navigate('/cart')
      return
    }
    setCartItems(items)
    fetchAddresses()
  }, [user?.id, navigate])

  async function fetchAddresses() {
    setLoadingAddresses(true)
    try {
      console.log('[CheckoutPage] Fetching addresses for user:', user?.id)
      const resp = await apiClient.get('/addresses')
      const data = resp.data || []
      console.log('[CheckoutPage] Successfully loaded addresses:', data.length)
      setAddresses(data)
      const defaultAddr = data.find((a) => a.is_default)
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id)
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id)
      }
    } catch (err) {
      const status = err?.response?.status
      const errorDetail = err?.response?.data?.detail || err?.message
      console.error('[CheckoutPage] Failed to load addresses:', { status, error: errorDetail })
      
      if (status === 401 || status === 403) {
        toast.error('Please log in to continue.')
        navigate('/login')
      } else if (status === 500) {
        toast.error('Server error. Please try again later.')
      } else {
        toast.error('Could not load addresses. Please try again.')
      }
    } finally {
      setLoadingAddresses(false)
    }
  }

  function openAddForm() {
    setNewAddressForm({
      street: '',
      city: '',
      state: '',
      postal_code: '',
      phone: '',
      landmark: '',
      address_line2: '',
      unit: '',
      is_default: false,
      latitude: null,
      longitude: null,
      formatted_address: '',
      place_id: '',
    })
    setShowAddForm(true)
  }

  function handleNewAddressChange(e) {
    const { name, value, type, checked } = e.target
    setNewAddressForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleNewAddressSelect(addrObj) {
    setNewAddressForm((prev) => ({
      ...prev,
      street: addrObj.formatted_address || addrObj.description || prev.street,
      formatted_address: addrObj.formatted_address || prev.formatted_address,
      place_id: addrObj.place_id || prev.place_id,
      latitude: addrObj.lat ?? prev.latitude,
      longitude: addrObj.lng ?? prev.longitude,
      city: addrObj.city || prev.city,
      state: addrObj.state || prev.state,
      postal_code: addrObj.postal_code || prev.postal_code,
    }))
  }

  async function handleSaveNewAddress(e) {
    e.preventDefault()
    
    // Validate required fields before sending
    if (!newAddressForm.street?.trim()) {
      toast.error('Street address is required.')
      return
    }
    if (!newAddressForm.city?.trim()) {
      toast.error('City is required.')
      return
    }
    if (!newAddressForm.state?.trim()) {
      toast.error('State is required.')
      return
    }
    if (!newAddressForm.postal_code?.trim()) {
      toast.error('Postal code is required.')
      return
    }

    try {
      console.log('[CheckoutPage] Saving new address:', newAddressForm)
      // Sanitize form data: ensure place_id is a string and empty strings become null
      const sanitized = Object.fromEntries(
        Object.entries(newAddressForm).map(([key, value]) => {
          if (value === "" && key !== "street" && key !== "city" && key !== "state" && key !== "postal_code") {
            return [key, null]
          }
          if (key === "place_id" && value !== null && value !== undefined) {
            return [key, String(value)]
          }
          return [key, value]
        })
      )
      const resp = await apiClient.post('/addresses', sanitized)
      const saved = resp.data
      console.log('[CheckoutPage] Address saved successfully:', saved.id)
      await fetchAddresses()
      if (saved && saved.id) setSelectedAddressId(saved.id)
      setShowAddForm(false)
      toast.success('Address added and selected.')
    } catch (err) {
      const status = err?.response?.status
      const errorDetail = err?.response?.data?.detail || err?.message
      console.error('[CheckoutPage] Failed to save address:', { status, error: errorDetail, form: newAddressForm })
      
      if (status === 422) {
        // Validation error - show specific field errors
        const errors = err?.response?.data?.detail
        if (Array.isArray(errors)) {
          const fieldErrors = errors.map((e) => `${e.loc?.[1] || 'Field'}: ${e.msg}`).join(', ')
          toast.error(`Validation error: ${fieldErrors}`)
        } else {
          toast.error('Please fill in all required address fields.')
        }
      } else {
        toast.error(errorDetail || 'Failed to save address.')
      }
    }
  }

  const subtotal = cartItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const gst = Math.round(subtotal * GST_RATE * 100) / 100
  const total = Math.round((subtotal + gst + deliveryFee + tipAmount) * 100) / 100
  const promoDiscount = Math.round(promoDiscountCents / 100) / 100
  const totalAfterPromo = Math.max(0, Math.round((total - promoDiscount) * 100) / 100)

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
        payment_method: paymentMethod,
        promo_codes: appliedPromos.map((p) => p.code),
      })
      // backend previously returned { order: <order> } in some responses.
      // Accept both shapes to avoid `undefined` order IDs.
      const order = resp.data?.order || resp.data
      if (paymentMethod === 'cod') {
        clearCart(user?.id)
        toast.success('Order placed successfully!')
        // attach tip if any
        if (tipAmount && tipAmount > 0) {
          try {
            await apiClient.post(`/payouts/orders/${order.id}/tip`, { amount: tipAmount })
          } catch (e) {
            // non-fatal
            console.error('Tip attach failed', e)
          }
        }
        navigate(`/orders/${order.id}`)
      } else {
        // If non-COD, let PaymentForm handle client-side flow. Show info to user.
        toast.info('Proceed to pay using the payment section.')
        setPaymentProcessingResult({ orderId: order.id, totalCents: Math.round(total * 100) })
      }
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
                <button onClick={openAddForm} className="font-semibold text-slate-900 underline">
                  Add one now
                </button>
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
                      {addr.address_line2 && <p className="text-sm text-slate-600">{addr.address_line2}</p>}
                      {addr.unit && <p className="text-sm text-slate-600">Unit: {addr.unit}</p>}
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
            <div className="mt-4">
              {!showAddForm ? (
                <button onClick={openAddForm} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                  + Add New Address
                </button>
              ) : (
                <form onSubmit={handleSaveNewAddress} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <AddressAutocomplete defaultValue={newAddressForm.street} onAddressSelect={handleNewAddressSelect} placeholder="Street / Building / Apartment" />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input name="phone" value={newAddressForm.phone} onChange={handleNewAddressChange} placeholder="Phone (optional)" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                    <input name="landmark" value={newAddressForm.landmark} onChange={handleNewAddressChange} placeholder="Landmark (optional)" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                    <input name="unit" value={newAddressForm.unit} onChange={handleNewAddressChange} placeholder="Unit / Flat / Room (optional)" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                    <input name="address_line2" value={newAddressForm.address_line2} onChange={handleNewAddressChange} placeholder="Address line 2 (optional)" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                    <input name="city" value={newAddressForm.city} onChange={handleNewAddressChange} placeholder="City" required className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                    <input name="state" value={newAddressForm.state} onChange={handleNewAddressChange} placeholder="State" required className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                    <input name="postal_code" value={newAddressForm.postal_code} onChange={handleNewAddressChange} placeholder="Postal Code" required className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="is_default" checked={newAddressForm.is_default} onChange={handleNewAddressChange} className="h-4 w-4" />
                      <span className="text-sm text-slate-700">Set as default</span>
                    </label>
                    <div className="ml-auto flex gap-2">
                      <button type="button" onClick={() => setShowAddForm(false)} className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white">Save & Select</button>
                    </div>
                  </div>
                </form>
              )}
            </div>
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
              {promoDiscount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Promotion</span>
                  <span className="text-emerald-600">-₹{promoDiscount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-slate-200" />
              <div className="flex justify-between text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{totalAfterPromo.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Payment</p>
                  <p className="mt-1 text-xs">Choose a payment method for this order.</p>
                </div>
                <div className="text-sm">
                  <label className="mr-2">
                    <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> COD
                  </label>
                  <label>
                    <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Promo code</label>
              <div className="mt-2">
                <PromoCodeInput cartTotalCents={Math.round(total * 100)} onApplied={(data) => {
                  if (!data) return
                  // avoid duplicates
                  if (appliedPromos.find((p) => p.code === data.code)) return
                  setAppliedPromos((prev) => [...prev, { code: data.code, promo_id: data.promo_id, discount_cents: data.discount_cents }])
                  setPromoDiscountCents((prev) => prev + (data.discount_cents || 0))
                }} />
                <div className="mt-2 flex gap-2">
                  {appliedPromos.map((p) => (
                    <div key={p.code} className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                      <span>{p.code}</span>
                      <button onClick={() => {
                        setAppliedPromos((prev) => prev.filter(x => x.code !== p.code))
                        setPromoDiscountCents((prev) => prev - (p.discount_cents || 0))
                      }} className="text-xs underline">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-700 mt-4">Tip for delivery partner</label>
              <div className="mt-2 flex items-center gap-2">
                {[0,10,20,50].map((t) => (
                  <button key={t} onClick={() => setTipAmount(t)} className={`rounded-full px-3 py-1 text-sm ${tipAmount===t? 'bg-slate-900 text-white':'border border-slate-200'}`}>
                    {t===0?'No Tip':`₹${t}`}
                  </button>
                ))}
                <input type="number" value={tipAmount} onChange={(e)=>setTipAmount(Number(e.target.value||0))} className="ml-2 w-24 rounded-xl border border-slate-200 px-3 py-1 text-sm" />
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddressId || cartItems.length === 0}
              className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placing ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Place Order (Pay)'}
            </button>

            {paymentMethod === 'card' && paymentProcessingResult && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold">Pay for Order #{paymentProcessingResult.orderId}</h4>
                <PaymentWidget orderId={paymentProcessingResult.orderId} amountCents={paymentProcessingResult.totalCents} onSuccess={() => { clearCart(user?.id); navigate(`/orders/${paymentProcessingResult.orderId}`) }} />
              </div>
            )}

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
