import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function OrdersListPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const resp = await apiClient.get('/orders')
      setOrders(resp.data || [])
    } catch {
      toast.error('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-indigo-100 text-indigo-800',
    picked_up: 'bg-purple-100 text-purple-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">My Orders</h1>
        <p className="mt-2 text-sm text-slate-600">Track and review all your orders.</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          <p>No orders yet.</p>
          <Link to="/restaurants" className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900">{order.items?.length || 0} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-slate-900">₹{order.total_amount?.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{order.payment?.method === 'cod' ? 'Cash on Delivery' : order.payment?.method}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
