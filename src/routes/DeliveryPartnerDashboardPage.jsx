import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import apiClient from '../lib/axios'

export default function DeliveryPartnerDashboardPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState(null)
  const [availableOrders, setAvailableOrders] = useState([])
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [isAvailable, setIsAvailable] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        apiClient.get('/delivery/profile'),
        apiClient.get('/delivery/available-orders'),
      ])
      setPartner(profileRes.data)
      setAvailableOrders(ordersRes.data || [])
      setIsAvailable(profileRes.data?.is_available ?? true)
    } catch (err) {
      if (err.response?.status === 404) {
        // No profile, redirect to onboarding
        navigate('/delivery-partner/onboard')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  const handleAvailabilityToggle = async () => {
    try {
      const res = await apiClient.put('/delivery/availability', { is_available: !isAvailable })
      setPartner(res.data)
      setIsAvailable(res.data.is_available)
      toast.success(`You are now ${res.data.is_available ? 'online' : 'offline'}`)
    } catch (err) {
      toast.error('Failed to update availability')
    }
  }

  const handleAcceptOrder = async (orderId) => {
    try {
      await apiClient.post(`/delivery/assignments/${orderId}/accept`)
      toast.success('Order accepted!')
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to accept order')
    }
  }

  const handleMarkPickedUp = async (orderId) => {
    try {
      await apiClient.put(`/delivery/assignments/${orderId}/picked-up`)
      toast.success('Marked as picked up')
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const handleMarkDelivered = async (orderId) => {
    try {
      await apiClient.put(`/delivery/assignments/${orderId}/delivered`)
      toast.success('Order delivered!')
      fetchDashboard()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Delivery Partner Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              {partner && `Rating: ${partner.rating || 0} • Total Deliveries: ${partner.total_deliveries || 0}`}
            </p>
          </div>
          <button
            onClick={handleAvailabilityToggle}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition ${
              isAvailable
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isAvailable ? '🟢 Online' : '⚪ Offline'}
          </button>
        </div>
      </div>

      {/* Available Orders */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Orders ({availableOrders.length})</h2>
        {availableOrders.length === 0 ? (
          <p className="text-slate-500">No orders available right now. Check back soon!</p>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">₹{order.total_amount}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.delivery_address_text}</p>
                  </div>
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={!isAvailable}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}