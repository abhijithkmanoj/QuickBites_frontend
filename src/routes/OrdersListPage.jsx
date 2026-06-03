import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import authService from '../features/auth/authService'

const ORDER_STATUSES = ['pending', 'accepted', 'preparing', 'picked_up', 'delivered', 'cancelled']

export default function OrdersListPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(null)
  const [sortOrder, setSortOrder] = useState('desc') // desc = newest first, asc = oldest first
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [limit] = useState(20)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, page, sortOrder])

  async function fetchOrders() {
    setLoading(true)
    try {
      const result = await authService.getOrderHistory(statusFilter, page * limit, limit)
      let ordersList = result.items || []
      
      // Sort by date
      ordersList = ordersList.sort((a, b) => {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      })
      
      setOrders(ordersList)
      setTotal(result.total || 0)
    } catch (error) {
      toast.error('Failed to load orders.')
      console.error(error)
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

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status === statusFilter ? null : status)
    setPage(0)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">My Orders</h1>
        <p className="mt-2 text-sm text-slate-600">Track and review all your orders.</p>
      </div>

      {/* Filters & Sorting */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilterChange(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                statusFilter === null
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {ORDER_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition capitalize ${
                  statusFilter === status
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Sort by Date</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder('desc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortOrder === 'desc'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortOrder('asc')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortOrder === 'asc'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Oldest First
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          <p>{statusFilter ? `No ${statusFilter} orders.` : 'No orders yet.'}</p>
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
                  <p className="font-medium text-slate-900">Order #{order.id.substring(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-slate-900">₹{order.total_price?.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">View details →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex gap-2 justify-center items-center">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-slate-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
