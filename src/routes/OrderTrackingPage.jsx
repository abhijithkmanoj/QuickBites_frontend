import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import apiClient from '../lib/axios'
import MapView from '../components/MapView'
import ETADisplay from '../components/tracking/ETADisplay'
import ChatPanel from '../components/chat/ChatPanel'
import { io } from 'socket.io-client'
import { loadAccessToken } from '../features/auth/authService'

export default function OrderTrackingPage() {
  const { id } = useParams()
  const [tracking, setTracking] = useState(null)
    const [showChat, setShowChat] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!id) return
    fetchTracking()
    setupSocket()
    return () => {
      try {
        socketRef.current?.disconnect()
      } catch (e) {}
    }
  }, [id])

  async function fetchTracking() {
    try {
      const resp = await apiClient.get(`/delivery/order/${id}/tracking`)
      setTracking(resp.data)
    } catch (e) {
      // ignore
    }
  }

  function setupSocket() {
    const token = loadAccessToken()
    if (!token) {
      console.warn('No auth token available for socket connection')
      return
    }

    const baseApi = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api/v1' : '')
    const socketOrigin = baseApi.replace('/api/v1', '')
    const socket = io(socketOrigin, { 
      path: '/socket.io', 
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join_order_room', id)
    })

    socket.on('connect_error', (error) => {
      console.error('Tracking socket connection error:', error)
    })

    socket.on('order:location', (payload) => {
      if (!payload) return
      // payload expected to be order-like; refetch to get normalized fields
      fetchTracking()
    })
  }

  const center = tracking?.partner_lat && tracking?.partner_lng ? { lat: tracking.partner_lat, lng: tracking.partner_lng } : (tracking?.delivery_lat && tracking?.delivery_lng ? { lat: tracking.delivery_lat, lng: tracking.delivery_lng } : { lat: 20.0, lng: 77.0 })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Track Order</h2>
        <p className="mt-1 text-sm text-slate-500">Live driver location and ETA for order {id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div>
          <MapView center={center} />
        </div>
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">ETA</h3>
            <div className="mt-3">
              <ETADisplay etaMinutes={tracking?.eta_minutes} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Driver</h3>
            <p className="mt-2 text-sm text-slate-700">{tracking?.delivery_partner_name || 'Unassigned'}</p>
            <p className="mt-1 text-xs text-slate-500">Current location: {tracking?.partner_lat ? `${tracking.partner_lat.toFixed(5)}, ${tracking.partner_lng.toFixed(5)}` : '—'}</p>
                          <button onClick={() => setShowChat(true)} className="rounded-md bg-sky-600 px-3 py-1 text-white text-sm">Chat</button>
            {showChat && <ChatPanel orderId={id} onClose={() => setShowChat(false)} />}
          </section>
        </aside>
      </div>
    </div>
  )
}
