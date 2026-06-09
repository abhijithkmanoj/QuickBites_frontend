import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchOrder()
  }, [id])

  async function fetchOrder() {
    setLoading(true)
    try {
      const resp = await apiClient.get(`/orders/${id}`)
      setOrder(resp.data)
    } catch {
      toast.error('Could not load order details.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl text-center py-20">
        <p className="text-slate-600">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
          View my orders
        </Link>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-indigo-100 text-indigo-800',
    picked_up: 'bg-purple-100 text-purple-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
  }

  const statusBadge = statusColors[order.status] || 'bg-slate-100 text-slate-800'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Success Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-emerald-900">Order Placed!</h1>
        <p className="mt-2 text-sm text-emerald-700">
          Your order has been placed successfully. Pay <strong>₹{order.total_amount?.toFixed(2)}</strong> in cash when it arrives.
        </p>
      </div>

      {/* Order Info */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Items</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Address */}
          {order.delivery_address_text && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Delivery Address</h2>
              <p className="mt-2 text-sm text-slate-700">{order.delivery_address_text}</p>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 h-fit">
          {/* Order Summary */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Order ID</span>
                <span className="font-mono text-xs">{order.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge}`}>{order.status}</span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span>{order.delivery_fee === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `₹${order.delivery_fee?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5%)</span>
                <span>₹{order.gst?.toFixed(2)}</span>
              </div>
              <hr className="border-slate-200" />
              <div className="flex justify-between text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Payment Info */}
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-amber-800">Payment Method</h3>
            <p className="mt-1 text-sm text-amber-700">
              Cash on Delivery — Pay ₹{order.total_amount?.toFixed(2)} when your order arrives.
            </p>
            {order.payment && (
              <p className="mt-2 text-xs text-amber-600">
                Payment status: <span className="font-semibold capitalize">{order.payment.status}</span>
              </p>
            )}
          </section>

          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="block w-full rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              View All Orders
            </Link>
            <Link
              to="/restaurants"
              className="block w-full rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Order Again
            </Link>
            {(order.status === 'accepted' || order.status === 'picked_up' || order.status === 'out_for_delivery') && (
              <Link
                to={`/orders/${order.id}/track`}
                className="block w-full rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Track Order
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
