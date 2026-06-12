import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import apiClient from '../lib/axios'

// ─── MenuItemForm (used for both create and edit) ────────────

function MenuItemForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_veg: false,
    is_available: true,
    stock_quantity: '',
    stock_unlimited: true,
    ...(initial ? {
      name: initial.name,
      description: initial.description || '',
      price: String(initial.price),
      category: initial.category || '',
      is_veg: initial.is_veg,
      is_available: initial.is_available,
      stock_quantity: initial.stock_quantity != null ? String(initial.stock_quantity) : '',
      stock_unlimited: initial.stock_quantity == null,
    } : {}),
  })

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Item name is required.')
      return
    }
    const price = parseFloat(form.price)
    if (isNaN(price) || price < 0) {
      toast.error('Price must be a valid positive number.')
      return
    }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      category: form.category.trim() || null,
      is_veg: form.is_veg,
      is_available: form.is_available,
      stock_quantity: form.stock_unlimited ? null : parseInt(form.stock_quantity, 10) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Name *</label>
        <input
          value={form.name}
          onChange={handleChange('name')}
          placeholder="e.g. Butter Chicken"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange('price')}
            placeholder="e.g. 299"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <input
            value={form.category}
            onChange={handleChange('category')}
            placeholder="e.g. Main Course"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={form.description}
          onChange={handleChange('description')}
          placeholder="Brief description of the item..."
          rows={2}
          className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_veg}
              onChange={handleChange('is_veg')}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600"
            />
            Vegetarian
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={handleChange('is_available')}
              className="h-4 w-4 rounded border-slate-300 text-slate-600"
            />
            Available
          </label>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.stock_unlimited}
              onChange={(e) => setForm((prev) => ({ ...prev, stock_unlimited: e.target.checked, stock_quantity: e.target.checked ? '' : '0' }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-600"
            />
            Unlimited Stock
          </label>
          {!form.stock_unlimited && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                placeholder="e.g. 50"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : initial ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  )
}

// ─── Modal wrapper ───────────────────────────────────────────

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Delete Confirm Modal ────────────────────────────────────

function DeleteConfirmModal({ item, onConfirm, onCancel, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Delete Menu Item</h3>
        <p className="mt-2 text-sm text-slate-500">
          Are you sure you want to delete <span className="font-medium text-slate-700">{item.name}</span>? This action cannot be undone.
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────

export default function MenuManagementPage() {
  const { user } = useSelector((state) => state.auth)
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [restockTarget, setRestockTarget] = useState(null)
  const [restockQty, setRestockQty] = useState('')

  // Fetch all restaurants owned by the user
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Use the dashboard endpoint to get owned restaurants
        const res = await apiClient.get('/restaurants/owner/dashboard')
        const owned = res.data.restaurants || []
        setRestaurants(owned)
        if (owned.length > 0) {
          setSelectedRestaurantId(owned[0].id)
        }
      } catch (err) {
        toast.error('Failed to load restaurants.')
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

  // Fetch menu items when the selected restaurant changes
  useEffect(() => {
    if (!selectedRestaurantId) return
    const fetchMenu = async () => {
      try {
        const res = await apiClient.get(`/restaurants/${selectedRestaurantId}/menu`)
        setMenuItems(res.data || [])
      } catch (err) {
        toast.error('Failed to load menu.')
      }
    }
    fetchMenu()
  }, [selectedRestaurantId])

  const refreshMenu = useCallback(async () => {
    if (!selectedRestaurantId) return
    try {
      const res = await apiClient.get(`/restaurants/${selectedRestaurantId}/menu`)
      setMenuItems(res.data || [])
    } catch (err) {
      toast.error('Failed to refresh menu.')
    }
  }, [selectedRestaurantId])

  // ── Create ──
  const handleCreate = async (data) => {
    setSubmitting(true)
    try {
      await apiClient.post('/menu', { ...data, restaurant_id: selectedRestaurantId })
      toast.success('Menu item created!')
      setShowCreate(false)
      refreshMenu()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create item.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Edit ──
  const handleEdit = async (data) => {
    setSubmitting(true)
    try {
      await apiClient.put(`/menu/${editTarget.id}`, data)
      toast.success('Menu item updated!')
      setEditTarget(null)
      refreshMenu()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update item.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete ──
  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await apiClient.delete(`/menu/${deleteTarget.id}`)
      toast.success('Menu item deleted.')
      setDeleteTarget(null)
      refreshMenu()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete item.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Restock ──
  const handleRestock = async (item, qty) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await apiClient.put(`/menu/${item.id}`, {
        stock_quantity: qty,
        is_available: qty > 0 ? true : item.is_available,
      })
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, stock_quantity: qty, is_available: qty > 0 ? true : m.is_available } : m)))
      toast.success(`${item.name} restocked to ${qty}.`)
      setRestockTarget(null)
      setRestockQty('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to restock item.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Toggle availability ──
  const handleToggleAvailability = async (item) => {
    try {
      const updated = await apiClient.put(`/menu/${item.id}`, {
        is_available: !item.is_available,
      })
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, is_available: updated.data.is_available } : m)))
      toast.success(`${item.name} is now ${updated.data.is_available ? 'available' : 'unavailable'}.`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to toggle availability.')
    }
  }

  // Group by category (case-insensitive — 'starter' and 'Starter' are merged)
  const categoryDisplay = {}
  const grouped = menuItems.reduce((acc, item) => {
    const rawCat = item.category || 'Uncategorized'
    const key = rawCat.toLowerCase()
    if (!acc[key]) {
      acc[key] = []
      categoryDisplay[key] = rawCat
    }
    acc[key].push(item)
    return acc
  }, {})

  const sortedCategories = Object.keys(grouped).sort((a, b) => categoryDisplay[a].localeCompare(categoryDisplay[b]))
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId)

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="text-slate-500">Loading...</div></div>
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      {showCreate && (
        <Modal title="Add Menu Item" onClose={() => setShowCreate(false)}>
          <MenuItemForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitting={submitting} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="Edit Menu Item" onClose={() => setEditTarget(null)}>
          <MenuItemForm initial={editTarget} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} submitting={submitting} />
        </Modal>
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          submitting={submitting}
        />
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Menu Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Add, edit, and manage menu items for your restaurants.
            </p>
          </div>
          <Link
            to="/restaurant-owner/dashboard"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Restaurant Selector + Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {restaurants.length === 0 ? (
            <p className="text-sm text-slate-500">You don't own any restaurants yet.</p>
          ) : (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Restaurant:</label>
              <select
                value={selectedRestaurantId || ''}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-slate-400"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
          <span className="text-sm text-slate-400">
            {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}
          </span>
        </div>
        {selectedRestaurantId && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Menu Items by Category */}
      {selectedRestaurantId && menuItems.length > 0 ? (
        <div className="space-y-6">
          {sortedCategories.map((catKey) => (
            <div key={catKey} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-base font-semibold text-slate-900">{categoryDisplay[catKey]}</h2>
                <p className="text-xs text-slate-400">{grouped[catKey].length} item{grouped[catKey].length !== 1 ? 's' : ''}</p>
              </div>
              <div className="divide-y divide-slate-100">
                {grouped[catKey].map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 truncate">{item.name}</span>
                        {item.is_veg ? (
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-bold text-emerald-700">V</span>
                        ) : (
                          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-500">NV</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-slate-500 truncate max-w-md">{item.description}</p>
                      )}
                      {/* Stock info */}
                      {item.stock_quantity != null ? (
                        <p className={`mt-0.5 text-xs ${item.stock_quantity <= 5 ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                          Stock: {item.stock_quantity}
                          {/* Inline restock */}
                          {restockTarget === item.id ? (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={restockQty}
                                onChange={(e) => setRestockQty(e.target.value)}
                                placeholder="qty"
                                className="w-16 rounded border border-slate-200 px-1.5 py-0.5 text-xs outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const qty = parseInt(restockQty, 10)
                                    if (!isNaN(qty) && qty >= 0) {
                                      handleRestock(item, qty)
                                    }
                                  }
                                  if (e.key === 'Escape') {
                                    setRestockTarget(null)
                                    setRestockQty('')
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const qty = parseInt(restockQty, 10)
                                  if (!isNaN(qty) && qty >= 0) handleRestock(item, qty)
                                }}
                                className="rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-medium text-white hover:bg-emerald-700"
                              >
                                Set
                              </button>
                              <button
                                onClick={() => { setRestockTarget(null); setRestockQty('') }}
                                className="text-xs text-slate-400 hover:text-slate-600"
                              >
                                ✕
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => { setRestockTarget(item.id); setRestockQty(String(item.stock_quantity)) }}
                              className="ml-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Restock
                            </button>
                          )}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-slate-400">
                          Unlimited stock
                          <button
                            onClick={() => { setRestockTarget(item.id); setRestockQty('0') }}
                            className="ml-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Set Stock
                          </button>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-semibold text-slate-900">₹{item.price.toFixed(2)}</span>

                      {/* Availability toggle */}
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.is_available ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={item.is_available ? 'Available — click to disable' : 'Unavailable — click to enable'}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          item.is_available ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>

                      <button
                        onClick={() => setEditTarget(item)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : selectedRestaurantId ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No menu items yet.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Add Your First Item
          </button>
        </div>
      ) : null}
    </div>
  )
}
