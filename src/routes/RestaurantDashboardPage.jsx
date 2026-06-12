import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import apiClient from '../lib/axios'

const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ready_for_pickup: 'bg-purple-100 text-purple-800 border-purple-200',
  picked_up: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
}

const KITCHEN_COLUMNS = [
  { key: 'pending', label: 'Pending', icon: '🟡', color: 'border-t-amber-400' },
  { key: 'accepted', label: 'Accepted', icon: '🔵', color: 'border-t-blue-400' },
  { key: 'preparing', label: 'Preparing', icon: '🟣', color: 'border-t-indigo-400' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: '🟢', color: 'border-t-emerald-400' },
]

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-800'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function ElapsedTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(createdAt).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return setElapsed('Just now')
      if (mins < 60) return setElapsed(`${mins}m`)
      const hrs = Math.floor(mins / 60)
      const rem = mins % 60
      setElapsed(`${hrs}h ${rem}m`)
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [createdAt])

  return (
    <span className="text-xs text-slate-400" title={new Date(createdAt).toLocaleString()}>
      ⏱ {elapsed}
    </span>
  )
}

function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RejectModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    await onConfirm(order.id, reason)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Reject Order</h3>
        <p className="mt-1 text-sm text-slate-500">
          Rejecting order <span className="font-medium">#{order.id.slice(0, 8)}</span>
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (optional)..."
          rows={3}
          className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 outline-none transition focus:border-slate-400"
        />
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {submitting ? 'Rejecting...' : 'Reject Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Kitchen Card ─────────────────────────────────────────────

function KitchenCard({ order, onStatusAction, onReject }) {
  const nextMap = {
    pending: { status: 'accepted', label: 'Accept' },
    accepted: { status: 'preparing', label: 'Start Preparing' },
    preparing: { status: 'ready_for_pickup', label: 'Mark Ready' },
    ready_for_pickup: { status: 'delivered', label: 'Mark Delivered' },
  }

  const next = nextMap[order.status]
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">#{order.id.slice(0, 8)}</span>
            <ElapsedTimer createdAt={order.created_at} />
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">₹{order.total_amount.toFixed(2)}</p>
        </div>
        <div className="text-right text-xs text-slate-400">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Items */}
      <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
        {order.items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              <span className="font-semibold text-slate-900">{item.quantity}×</span> {item.name}
            </span>
          </div>
        ))}
        {order.items.length > 4 && (
          <p className="text-xs text-slate-400">+{order.items.length - 4} more items</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        {next && (
          <button
            onClick={() => onStatusAction(order, next.status, next.label)}
            className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            {next.label}
          </button>
        )}
        {order.status === 'pending' && (
          <button
            onClick={() => onReject(order)}
            className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
          >
            Reject
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Kitchen Kanban View ──────────────────────────────────────

function KitchenView({ orders, onStatusAction, onReject }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {KITCHEN_COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.key)
        return (
          <div key={col.key} className="flex flex-col">
            {/* Column header */}
            <div className={`mb-3 rounded-t-xl border border-slate-200 border-t-4 bg-white px-4 py-3 shadow-sm ${col.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {col.icon} {col.label}
                </h3>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {colOrders.length}
                </span>
              </div>
            </div>
            {/* Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {colOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  No orders
                </div>
              ) : (
                colOrders.map((order) => (
                  <KitchenCard
                    key={order.id}
                    order={order}
                    onStatusAction={onStatusAction}
                    onReject={onReject}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── List Order Card ──────────────────────────────────────────

function ListOrderCard({ order, onAccept, onReject }) {
  const nextStatuses = {
    pending: 'accepted',
    accepted: 'preparing',
    preparing: 'ready_for_pickup',
    ready_for_pickup: 'delivered',
  }

  const nextAction = nextStatuses[order.status]
  const actionLabel = nextAction ? {
    accepted: 'Accept Order',
    preparing: 'Start Preparing',
    ready_for_pickup: 'Mark Ready',
    delivered: 'Mark Delivered',
  }[nextAction] : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">#{order.id.slice(0, 8)}</span>
            <StatusBadge status={order.status} />
            <ElapsedTimer createdAt={order.created_at} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <p className="text-lg font-semibold text-slate-900">₹{order.total_amount.toFixed(2)}</p>
      </div>

      <div className="mt-3 space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">
              <span className="font-medium text-slate-900">{item.quantity}×</span> {item.name}
            </span>
            <span className="text-slate-500">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.delivery_address_text && (
        <p className="mt-2 text-xs text-slate-400">
          📍 {order.delivery_address_text}
        </p>
      )}

      {order.status === 'cancelled' && order.rejection_reason && (
        <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
          <p className="text-xs font-medium text-rose-700">Rejection reason</p>
          <p className="mt-0.5 text-xs text-rose-600">{order.rejection_reason}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        {nextAction && (
          <button
            onClick={() => onAccept(order.id, nextAction, STATUS_LABELS[nextAction])}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            {actionLabel}
          </button>
        )}
        {order.status === 'pending' && (
          <button
            onClick={() => onReject(order)}
            className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
          >
            Reject
          </button>
        )}
        <Link
          to={`/orders/${order.id}`}
          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

// ─── Shared Components ────────────────────────────────────────

function StatCard({ label, count, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{count}</p>
    </div>
  )
}

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-3 text-sm font-medium transition ${
        active
          ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-slate-900'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
      {count > 0 && (
        <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700">
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────

export default function RestaurantDashboardPage() {
  const { user } = useSelector((state) => state.auth)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ownerProfile, setOwnerProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('incoming')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'kitchen'
  const [confirmAction, setConfirmAction] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)
  const [togglingAutoHandle, setTogglingAutoHandle] = useState(null)
  const prevIncomingCount = useRef(0)

  // Check if owner has completed onboarding
  useEffect(() => {
    if (user?.role === 'restaurant_owner') {
apiClient
         .get('/owner/profile')
        .then((res) => {
          setOwnerProfile(res.data)
        })
        .catch(() => setOwnerProfile(null))
        .finally(() => setProfileLoading(false))
    } else {
      setProfileLoading(false)
    }
  }, [user])

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await apiClient.get('/restaurants/owner/dashboard')
      const data = res.data

      // Detect new incoming orders for alert
      const incoming = data.incoming_orders || []
      if (prevIncomingCount.current > 0 && incoming.length > prevIncomingCount.current && viewMode === 'kitchen') {
        toast.info(`🔔 ${incoming.length - prevIncomingCount.current} new order(s) received!`, {
          autoClose: 5000,
        })
      }
      prevIncomingCount.current = incoming.length

      setDashboard(data)
    } catch (err) {
    } finally {
      setLoading(false)
    }
  }, [viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  const handleStatusAction = async (order, newStatus, label) => {
    setProcessingAction(true)
    const endpoint = newStatus === 'accepted'
      ? `/orders/${order.id}/accept`
      : `/orders/${order.id}/status`
    const body = newStatus === 'accepted' ? undefined : { status: newStatus }

    try {
      await apiClient.put(endpoint, body)
      toast.success(`✅ Order ${label}!`)
      setConfirmAction(null)
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update order.')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleAccept = async (orderId, newStatus, label) => {
    const endpoint = newStatus === 'accepted'
      ? `/orders/${orderId}/accept`
      : `/orders/${orderId}/status`
    const body = newStatus === 'accepted' ? undefined : { status: newStatus }

    try {
      await apiClient.put(endpoint, body)
      toast.success(`✅ Order ${label}!`)
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update order.')
    }
  }

  const handleReject = async (orderId, reason) => {
    setProcessingAction(true)
    try {
      await apiClient.put(`/orders/${orderId}/reject`, { reason })
      toast.success('Order rejected.')
      setRejectTarget(null)
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reject order.')
    } finally {
      setProcessingAction(false)
    }
  }

  // Open confirm dialog for kitchen card status change
  const requestStatusChange = (order, newStatus, label) => {
    setConfirmAction({ order, newStatus, label })
  }

  // Check if owner needs to complete onboarding
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!ownerProfile || ownerProfile.verification_status !== 'approved') {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Restaurant Owner Onboarding Required</h1>
        <p className="mt-3 text-slate-500">
          Complete your business verification to access the dashboard.
        </p>
        <Link
          to="/restaurant-owner/onboard"
          className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Complete Onboarding
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    )
  }

  if (!dashboard || !dashboard.restaurants?.length) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Restaurant Dashboard</h1>
        <p className="mt-3 text-slate-500">You don't own any restaurants yet.</p>
        <Link
          to="/restaurants"
          className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Browse Restaurants
        </Link>
      </div>
    )
  }

  // Build combined order list from dashboard data (for kitchen view)
  const allActiveOrders = [
    ...(dashboard.incoming_orders || []),
    ...(dashboard.active_orders || []),
  ]

  const { order_counts: counts, incoming_orders: incoming, active_orders: active, completed_orders: completed, cancelled_orders: cancelled } = dashboard

  const tabData = {
    incoming: { orders: incoming, label: 'Incoming', count: counts.incoming },
    active: { orders: active, label: 'Active', count: counts.active },
    completed: { orders: completed, label: 'Completed', count: counts.completed },
    cancelled: { orders: cancelled, label: 'Cancelled', count: counts.cancelled },
  }

  const currentTab = tabData[activeTab]

  return (
    <div className="space-y-6">
      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}

      {/* Confirm Modal for status transitions */}
      {confirmAction && (
        <ConfirmModal
          title={`${confirmAction.label} Order?`}
          message={`Move order #${confirmAction.order.id.slice(0, 8)} to "${confirmAction.label}" status.`}
          confirmLabel={confirmAction.label}
          loading={processingAction}
          onConfirm={() => handleStatusAction(confirmAction.order, confirmAction.newStatus, confirmAction.label)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Restaurant Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Managing {dashboard.restaurants.length} restaurant{dashboard.restaurants.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('kitchen')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  viewMode === 'kitchen' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🍳 Kitchen
              </button>
            </div>
            <Link
              to="/restaurant-owner/menu"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              📝 Menu
            </Link>
            <button
              onClick={fetchDashboard}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              🔄 Refresh
            </button>
            {dashboard.restaurants.map((r) => (
              <div key={r.id} className="hidden items-center gap-1.5 sm:inline-flex">
                <Link
                  to={`/restaurants/${r.id}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  🏪 {r.name}
                </Link>
                <button
                  onClick={async () => {
                    setTogglingAutoHandle(r.id)
                    try {
                      const res = await apiClient.put(`/restaurants/${r.id}`, {
                        auto_handle_orders: !r.auto_handle_orders,
                      })
                      // Update the restaurant in the dashboard state
                      setDashboard((prev) => ({
                        ...prev,
                        restaurants: prev.restaurants.map((rr) =>
                          rr.id === r.id ? { ...rr, auto_handle_orders: res.data.auto_handle_orders } : rr
                        ),
                      }))
                      toast.success(
                        `Auto-handle ${res.data.auto_handle_orders ? 'enabled' : 'disabled'} for ${r.name}`
                      )
                    } catch (err) {
                      toast.error('Failed to toggle auto-handle setting.')
                    } finally {
                      setTogglingAutoHandle(null)
                    }
                  }}
                  disabled={togglingAutoHandle === r.id}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    r.auto_handle_orders ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  title={
                    r.auto_handle_orders
                      ? 'Auto-handle enabled — orders are automatically accepted/rejected based on item availability'
                      : 'Auto-handle disabled — you must manually accept/reject orders'
                  }
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                      r.auto_handle_orders ? 'translate-x-[18px]' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Total Orders" count={counts.total} color="text-slate-900" />
        <StatCard label="Incoming" count={counts.incoming} color="text-amber-600" />
        <StatCard label="In Kitchen" count={counts.active} color="text-blue-600" />
        <StatCard label="Completed" count={counts.completed} color="text-emerald-600" />
        <StatCard label="Cancelled" count={counts.cancelled} color="text-rose-600" />
      </div>

      {/* Kitchen View */}
      {viewMode === 'kitchen' ? (
        <KitchenView
          orders={allActiveOrders}
          onStatusAction={requestStatusChange}
          onReject={setRejectTarget}
        />
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="rounded-t-2xl border-b border-slate-200 bg-white shadow-sm">
            <div className="flex">
              {Object.entries(tabData).map(([key, tab]) => (
                <TabButton
                  key={key}
                  label={tab.label}
                  count={tab.count}
                  active={activeTab === key}
                  onClick={() => setActiveTab(key)}
                />
              ))}
            </div>
          </div>

          {/* Order List */}
          <div className="space-y-4">
            {currentTab.orders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-slate-500">No {currentTab.label.toLowerCase()} orders.</p>
              </div>
            ) : (
              currentTab.orders.map((order) => (
                <ListOrderCard
                  key={order.id}
                  order={order}
                  onAccept={handleAccept}
                  onReject={setRejectTarget}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
