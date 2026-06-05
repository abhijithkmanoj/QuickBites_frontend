import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

const emptyMenuItem = {
  name: '',
  description: '',
  category: '',
  price: '',
  image_url: '',
  is_veg: false,
  is_available: true,
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [newMenuItem, setNewMenuItem] = useState(emptyMenuItem)
  const [menuActionId, setMenuActionId] = useState(null)
  const [editingItemId, setEditingItemId] = useState(null)
  const [editedMenuItem, setEditedMenuItem] = useState({})

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/restaurants')
      setRestaurants(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load restaurants.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const updateStatus = async (restaurant, action) => {
    setUpdatingId(restaurant.id)
    try {
      await apiClient.patch(`/admin/restaurants/${restaurant.id}/${action}`)
      setRestaurants((prev) => prev.map((r) => (r.id === restaurant.id ? { ...r, is_active: action === 'approve' } : r)))
      toast.success(`Restaurant ${action}d successfully.`)
    } catch (err) {
      toast.error(err.response?.data?.detail || `Could not ${action} restaurant.`)
    } finally {
      setUpdatingId(null)
    }
  }

  const selectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant)
    setMenuItems([])
    setMenuLoading(true)
    try {
      const res = await apiClient.get(`/restaurants/${restaurant.id}/menu`)
      setMenuItems(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load menu items.')
    } finally {
      setMenuLoading(false)
    }
  }

  const resetSelectedRestaurant = () => {
    setSelectedRestaurant(null)
    setMenuItems([])
    setEditingItemId(null)
    setEditedMenuItem({})
    setNewMenuItem(emptyMenuItem)
  }

  const handleMenuItemChange = (field, value) => {
    setNewMenuItem((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateMenuItem = async () => {
    if (!selectedRestaurant) return
    if (!newMenuItem.name || newMenuItem.price === '') {
      toast.error('Name and price are required for menu items.')
      return
    }
    setMenuActionId('create')
    try {
      const payload = {
        ...newMenuItem,
        restaurant_id: selectedRestaurant.id,
        price: Number(newMenuItem.price),
      }
      const res = await apiClient.post('/menus', payload)
      setMenuItems((prev) => [...prev, res.data])
      setNewMenuItem(emptyMenuItem)
      toast.success('Menu item created.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not create menu item.')
    } finally {
      setMenuActionId(null)
    }
  }

  const handleEditClick = (item) => {
    setEditingItemId(item.id)
    setEditedMenuItem({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      price: item.price?.toString() || '',
      image_url: item.image_url || '',
      is_veg: item.is_veg,
      is_available: item.is_available,
    })
  }

  const handleEditedMenuItemChange = (field, value) => {
    setEditedMenuItem((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveMenuItem = async (item) => {
    setMenuActionId(item.id)
    try {
      const payload = {
        ...editedMenuItem,
        price: editedMenuItem.price !== '' ? Number(editedMenuItem.price) : undefined,
      }
      const res = await apiClient.put(`/menus/${item.id}`, payload)
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? res.data : m)))
      setEditingItemId(null)
      setEditedMenuItem({})
      toast.success('Menu item updated.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update menu item.')
    } finally {
      setMenuActionId(null)
    }
  }

  const handleDeleteMenuItem = async (item) => {
    setMenuActionId(item.id)
    try {
      await apiClient.delete(`/menus/${item.id}`)
      setMenuItems((prev) => prev.filter((m) => m.id !== item.id))
      toast.success('Menu item deleted.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not delete menu item.')
    } finally {
      setMenuActionId(null)
    }
  }

  const handleToggleAvailability = async (item) => {
    setMenuActionId(item.id)
    try {
      const res = await apiClient.put(`/menus/${item.id}`, { is_available: !item.is_available })
      setMenuItems((prev) => prev.map((m) => (m.id === item.id ? res.data : m)))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update availability.')
    } finally {
      setMenuActionId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Restaurant & Food Management</h1>
          <p className="mt-2 text-sm text-slate-600">Approve restaurants and manage their menu items from one admin page.</p>
        </div>
        <button type="button" onClick={fetchRestaurants} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh restaurants</button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Restaurants</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-sm text-slate-600">Loading restaurants...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Cuisine</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {restaurants.map((r) => (
                    <tr key={r.id}>
                      <td className="px-6 py-4 text-sm text-slate-900">{r.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 capitalize">{r.cuisine}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 break-all">{r.owner_id || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${r.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {r.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-1">
                        <button type="button" onClick={() => updateStatus(r, 'approve')} disabled={updatingId === r.id} className="rounded-full border border-emerald-200 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                          Approve
                        </button>
                        <button type="button" onClick={() => updateStatus(r, 'reject')} disabled={updatingId === r.id} className="rounded-full border border-amber-200 px-3 py-1.5 text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                          Reject
                        </button>
                        <button type="button" onClick={() => updateStatus(r, 'suspend')} disabled={updatingId === r.id} className="rounded-full border border-rose-200 px-3 py-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                          Suspend
                        </button>
                        <button type="button" onClick={() => selectRestaurant(r)} className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                          Manage food
                        </button>
                      </td>
                    </tr>
                  ))}
                  {restaurants.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-600">No restaurants found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Menu Management</h2>
                <p className="mt-1 text-sm text-slate-600">Select a restaurant to view and edit its menu.</p>
              </div>
              <button type="button" onClick={resetSelectedRestaurant} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                Clear
              </button>
            </div>
          </div>
          <div className="p-6">
            {!selectedRestaurant ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                Select a restaurant to manage menu items.
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Selected restaurant:</p>
                  <p className="text-lg font-semibold text-slate-900">{selectedRestaurant.name}</p>
                  <p className="text-sm text-slate-600">{selectedRestaurant.cuisine} • {selectedRestaurant.address}</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">Add new menu item</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input value={newMenuItem.name} onChange={(e) => handleMenuItemChange('name', e.target.value)} placeholder="Name" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 w-full" />
                      <input value={newMenuItem.category} onChange={(e) => handleMenuItemChange('category', e.target.value)} placeholder="Category" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 w-full" />
                      <input value={newMenuItem.price} onChange={(e) => handleMenuItemChange('price', e.target.value)} type="number" min="0" step="0.01" placeholder="Price" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 w-full" />
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" checked={newMenuItem.is_veg} onChange={(e) => handleMenuItemChange('is_veg', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                          Vegetarian
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input type="checkbox" checked={newMenuItem.is_available} onChange={(e) => handleMenuItemChange('is_available', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                          Available
                        </label>
                      </div>
                      <input value={newMenuItem.image_url} onChange={(e) => handleMenuItemChange('image_url', e.target.value)} placeholder="Image URL" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 w-full col-span-2" />
                      <textarea value={newMenuItem.description} onChange={(e) => handleMenuItemChange('description', e.target.value)} placeholder="Description" rows={3} className="col-span-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 w-full" />
                    </div>
                    <div className="mt-4 text-right">
                      <button type="button" onClick={handleCreateMenuItem} disabled={menuActionId === 'create'} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                        Add menu item
                      </button>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">Menu items</h3>
                    {menuLoading ? (
                      <div className="mt-4 text-sm text-slate-600">Loading menu items...</div>
                    ) : menuItems.length === 0 ? (
                      <div className="mt-4 text-sm text-slate-600">No menu items found for this restaurant.</div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        {menuItems.map((item) => (
                          <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            {editingItemId === item.id ? (
                              <div className="space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <input value={editedMenuItem.name} onChange={(e) => handleEditedMenuItemChange('name', e.target.value)} placeholder="Name" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm w-full" />
                                  <input value={editedMenuItem.category} onChange={(e) => handleEditedMenuItemChange('category', e.target.value)} placeholder="Category" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm w-full" />
                                  <input value={editedMenuItem.price} onChange={(e) => handleEditedMenuItemChange('price', e.target.value)} type="number" min="0" step="0.01" placeholder="Price" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm w-full" />
                                  <div className="flex items-center gap-3">
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                      <input type="checkbox" checked={editedMenuItem.is_veg} onChange={(e) => handleEditedMenuItemChange('is_veg', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                                      Vegetarian
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                      <input type="checkbox" checked={editedMenuItem.is_available} onChange={(e) => handleEditedMenuItemChange('is_available', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                                      Available
                                    </label>
                                  </div>
                                </div>
                                <textarea value={editedMenuItem.description} onChange={(e) => handleEditedMenuItemChange('description', e.target.value)} placeholder="Description" rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                                <div className="flex flex-wrap gap-2 text-right">
                                  <button type="button" onClick={() => setEditingItemId(null)} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                                  <button type="button" onClick={() => handleSaveMenuItem(item)} disabled={menuActionId === item.id} className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Save</button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
                                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{item.category || 'Uncategorized'}</span>
                                  </div>
                                  <p className="mt-1 text-sm text-slate-600">{item.description || 'No description provided.'}</p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">${item.price.toFixed(2)} · {item.is_veg ? 'Veg' : 'Non-veg'} · {item.is_available ? 'Available' : 'Unavailable'}</p>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <button type="button" onClick={() => handleToggleAvailability(item)} disabled={menuActionId === item.id} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
                                    {item.is_available ? 'Mark unavailable' : 'Mark available'}
                                  </button>
                                  <button type="button" onClick={() => handleEditClick(item)} className="rounded-full border border-emerald-200 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50">Edit</button>
                                  <button type="button" onClick={() => handleDeleteMenuItem(item)} disabled={menuActionId === item.id} className="rounded-full border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50">Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
