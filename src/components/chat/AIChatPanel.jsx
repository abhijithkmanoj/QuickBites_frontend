import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSelector } from 'react-redux'
import apiClient from '../../lib/axios'

export default function AIChatPanel() {
  const { user } = useSelector((state) => state.auth)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const messagesEndRef = useRef(null)
  const panelRef = useRef(null)

  // Default position: bottom-right corner
  const defaultPosition = { x: window.innerWidth - 400, y: window.innerHeight - 560 }

  // Drag state
  const [position, setPosition] = useState(defaultPosition)
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const positionRef = useRef(position)
  const hasRestoredPosition = useRef(false)
  positionRef.current = position

  // Load chat history from backend when user changes
  useEffect(() => {
    if (!user) {
      setMessages([])
      setInitialLoading(false)
      return
    }

    const loadHistory = async () => {
      try {
        const resp = await apiClient.get('/ai-chat/history')
        const history = resp.data?.messages || []
        if (history.length === 0) {
          setMessages([
            { role: 'assistant', content: "Hi! I'm QuickBites AI. Ask me anything about our restaurants, menus, cuisines, or pricing! 🍽️" },
          ])
        } else {
          setMessages(history.map((m) => ({ id: m.id, role: m.role, content: m.content })))
        }
      } catch {
        setMessages([
          { role: 'assistant', content: "Hi! I'm QuickBites AI. Ask me anything about our restaurants, menus, cuisines, or pricing! 🍽️" },
        ])
      } finally {
        setInitialLoading(false)
      }
    }

    loadHistory()
  }, [user])

  // Restore saved position from localStorage (runs once on mount)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aiChatPosition')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(parsed)
        }
      }
    } catch {
      // ignore
    }
    hasRestoredPosition.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save position to localStorage (skip initial default write to prevent flicker)
  useEffect(() => {
    if (!hasRestoredPosition.current) return
    localStorage.setItem('aiChatPosition', JSON.stringify(position))
  }, [position])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Shared drag logic ──────────────────────────────────────

  const dragStartHandler = useCallback((clientX, clientY) => {
    if (panelRef.current?.contains(document.activeElement) &&
        document.activeElement?.tagName === 'INPUT') return
    isDragging.current = false
    dragStart.current = { x: clientX, y: clientY }
    dragOffset.current = {
      x: clientX - positionRef.current.x,
      y: clientY - positionRef.current.y,
    }
    setDragging(true)
  }, [])

  const dragMoveHandler = useCallback((clientX, clientY) => {
    if (!dragging) return

    if (
      !isDragging.current &&
      (Math.abs(clientX - dragStart.current.x) > 5 ||
        Math.abs(clientY - dragStart.current.y) > 5)
    ) {
      isDragging.current = true
    }

    if (!isDragging.current) return

    const newX = clientX - dragOffset.current.x
    const newY = clientY - dragOffset.current.y

    const panelWidth = panelRef.current?.offsetWidth || 380
    const panelHeight = panelRef.current?.offsetHeight || 500
    const maxX = window.innerWidth - panelWidth - 10
    const maxY = window.innerHeight - panelHeight - 10

    setPosition({
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY)),
    })
  }, [dragging])

  const dragEndHandler = useCallback(() => {
    setDragging(false)
    setTimeout(() => { isDragging.current = false }, 0)
  }, [])

  // Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return
    dragStartHandler(e.clientX, e.clientY)
  }, [dragStartHandler])

  const handleMouseMove = useCallback((e) => {
    dragMoveHandler(e.clientX, e.clientY)
  }, [dragMoveHandler])

  const handleMouseUp = useCallback(() => {
    dragEndHandler()
  }, [dragEndHandler])

  // Touch drag handlers
  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('button')) return
    const touch = e.touches[0]
    dragStartHandler(touch.clientX, touch.clientY)
  }, [dragStartHandler])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const touch = e.touches[0]
    dragMoveHandler(touch.clientX, touch.clientY)
  }, [dragMoveHandler])

  const handleTouchEnd = useCallback(() => {
    dragEndHandler()
  }, [dragEndHandler])

  // Attach/remove global mouse & touch listeners for drag
  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // ── Edit message ──────────────────────────────────────────

  const handleEditMessage = (index) => {
    const msg = messages[index]
    if (msg.role !== 'user') return
    setInput(msg.content)
    setEditingIndex(index)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setInput('')
  }

  // ── Send / resend message ──────────────────────────────────

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return

    const editedContent = input.trim()
    setInput('')
    setLoading(true)

    // If editing a previous message, remove the old branch first
    if (editingIndex !== null) {
      const editedMsg = messages[editingIndex]
      // Remove the old message from the backend if it was saved
      if (editedMsg?.id) {
        try {
          await apiClient.delete(`/ai-chat/messages/${editedMsg.id}`)
        } catch { /* ignore */ }
      }
      // Remove all messages from the edited point onwards in local state
      setMessages((prev) => prev.slice(0, editingIndex))
      setEditingIndex(null)
    }

    // Add the (edited) user message locally
    const userMsg = { role: 'user', content: editedContent }
    setMessages((prev) => [...prev, userMsg])

    try {
      const resp = await apiClient.post('/ai-chat', { message: editedContent })
      const reply = resp.data?.reply || 'No response received.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Please log in again to use the AI assistant.' }])
      } else if (status === 429) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'The AI assistant is temporarily unavailable. Please try again later.' }])
      } else {
        const detail = err?.response?.data?.detail || 'Sorry, I had trouble connecting. Please try again.'
        setMessages((prev) => [...prev, { role: 'assistant', content: detail }])
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Clear history ──────────────────────────────────────────

  const clearHistory = async () => {
    if (!user) return
    try {
      await apiClient.delete('/ai-chat/history')
    } catch {
      // ignore
    }
    setMessages([
      { role: 'assistant', content: "Hi! I'm QuickBites AI. Ask me anything about our restaurants, menus, cuisines, or pricing! 🍽️" },
    ])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Render ──────────────────────────────────────────────────

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-110 active:scale-95"
        style={{ bottom: '24px', right: '24px' }}
        aria-label="Open AI Chat"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 flex w-[380px] flex-col rounded-2xl border border-surface-200/80 bg-white shadow-elevated overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: dragging ? 'grabbing' : 'default',
        maxHeight: 'min(600px, calc(100vh - 20px))',
      }}
    >
      {/* Drag Handle Header */}
      <div
        className="bg-gradient-to-r from-navy-900 to-navy-800 px-4 py-3.5 cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-amber-500 shadow-md">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">QuickBites AI</div>
              <div className="text-[11px] text-white/60">Drag to move · Ask me anything!</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Clear button */}
            <button
              onClick={clearHistory}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
              aria-label="Clear chat history"
              title="Clear chat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
              aria-label="Close chat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 min-h-[300px] bg-surface-50/50">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full text-surface-400 text-sm py-12">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading chat history...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-surface-400 text-sm py-12">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`group flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-navy-800 to-navy-700 text-white rounded-br-md shadow-md'
                  : 'bg-white border border-surface-200 text-navy-800 rounded-bl-md shadow-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                      ul: ({children}) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
                      li: ({children}) => <li className="text-sm">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-navy-800">{children}</strong>,
                      em: ({children}) => <em className="italic text-navy-800">{children}</em>,
                      a: ({children, href}) => <a href={href} className="text-brand-600 underline hover:text-brand-700" target="_blank" rel="noopener noreferrer">{children}</a>,
                      code: ({children}) => <code className="bg-surface-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      h3: ({children}) => <h3 className="text-sm font-semibold text-navy-800 mt-2 mb-1">{children}</h3>,
                      h4: ({children}) => <h4 className="text-sm font-semibold text-navy-800 mt-1.5 mb-0.5">{children}</h4>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <>
                    {msg.content}
                    {/* Edit button — visible on hover */}
                    <button
                      onClick={() => handleEditMessage(i)}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-surface-200 text-surface-400 opacity-0 group-hover:opacity-100 hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm"
                      title="Edit message"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white border border-surface-200 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-surface-200/80 bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={user ? "Ask about restaurants, menus..." : "Log in to use the AI assistant"}
            className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            disabled={loading || !user}
          />
          {editingIndex !== null && (
            <button
              onClick={cancelEdit}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-300 text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition"
              title="Cancel edit"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || !user}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
              editingIndex !== null
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl'
                : 'bg-gradient-to-r from-brand-500 to-amber-500 text-white shadow-lg shadow-brand-500/20 hover:shadow-xl'
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
