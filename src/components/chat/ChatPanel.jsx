import { useEffect, useState, useRef } from 'react'
import apiClient from '../../lib/axios'
import { io } from 'socket.io-client'
import { loadAccessToken } from '../../features/auth/authService'

export default function ChatPanel({ orderId, onClose }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const socketRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    setupSocket()
    return () => { try { socketRef.current?.disconnect() } catch (e) {} }
  }, [orderId])

  async function fetchMessages() {
    try {
      const resp = await apiClient.get(`/orders/${orderId}/chat`)
      setMessages(resp.data || [])
    } catch (e) {}
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
      reconnectionAttempts: 3,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join_order_room', orderId)
    })

    socket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error)
    })

    socket.on('chat:message', (payload) => {
      if (!payload) return
      setMessages((prev) => [...prev, payload])
    })
  }

  async function sendMessage() {
    if (!text) return
    try {
      const resp = await apiClient.post(`/orders/${orderId}/chat`, { content: text })
      setText('')
      // server will emit and socket listener will append
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 w-[360px] max-h-[60vh] rounded-2xl border bg-white shadow-lg flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="font-semibold">Chat</div>
        <button onClick={onClose} className="text-sm text-slate-500">Close</button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-lg p-2 ${m.sender_role==='customer' ? 'bg-slate-100 self-end' : 'bg-slate-50'}`}>
            <div className="text-sm text-slate-800">{m.content}</div>
            <div className="text-xs text-slate-400 mt-1">{new Date(m.sent_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message" className="flex-1 rounded-xl border px-3 py-2 text-sm" />
          <button onClick={sendMessage} className="rounded-xl bg-slate-900 px-3 py-2 text-white">Send</button>
        </div>
      </div>
    </div>
  )
}
