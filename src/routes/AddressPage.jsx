import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'
import AddressAutocomplete from '../components/common/AddressAutocomplete'

const emptyForm = {
  street: '',
  city: '',
  state: '',
  postal_code: '',
  phone: '',
  landmark: '',
  address_line2: '',
  unit: '',
  is_default: false,
  latitude: null,
  longitude: null,
  formatted_address: '',
  place_id: '',
}

export default function AddressPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAddresses()
  }, [])

  async function fetchAddresses() {
    setLoading(true)
    try {
      const resp = await apiClient.get('/addresses')
      setAddresses(resp.data || [])
    } catch {
      toast.error('Failed to load addresses.')
    } finally {
      setLoading(false)
    }
  }

  function openCreateForm() {
    setForm({ ...emptyForm })
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(addr) {
    setForm({
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      postal_code: addr.postal_code || '',
      phone: addr.phone || '',
      landmark: addr.landmark || '',
      address_line2: addr.address_line2 || '',
      unit: addr.unit || '',
      is_default: addr.is_default || false,
      latitude: addr.latitude ?? null,
      longitude: addr.longitude ?? null,
      formatted_address: addr.formatted_address || '',
      place_id: addr.place_id || '',
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  function handleAddressSelect(addrObj) {
    setForm((prev) => ({
      ...prev,
      street: addrObj.formatted_address || addrObj.description || prev.street,
      formatted_address: addrObj.formatted_address || prev.formatted_address,
      place_id: addrObj.place_id || prev.place_id,
      latitude: addrObj.lat ?? prev.latitude,
      longitude: addrObj.lng ?? prev.longitude,
      city: addrObj.city || prev.city,
      state: addrObj.state || prev.state,
      postal_code: addrObj.postal_code || prev.postal_code,
    }))
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ ...emptyForm })
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      // Sanitize form data: ensure place_id is a string and empty strings become null
      const sanitized = Object.fromEntries(
        Object.entries(form).map(([key, value]) => {
          if (value === "" && key !== "street" && key !== "city" && key !== "state" && key !== "postal_code") {
            return [key, null]
          }
          if (key === "place_id" && value !== null && value !== undefined) {
            return [key, String(value)]
          }
          return [key, value]
        })
      )
      if (editingId) {
        await apiClient.put(`/addresses/${editingId}`, sanitized)
        toast.success('Address updated.')
      } else {
        await apiClient.post('/addresses', sanitized)
        toast.success('Address added.')
      }
      setShowForm(false)
      setEditingId(null)
      setForm({ ...emptyForm })
      await fetchAddresses()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save address.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this address?')) return
    try {
      await apiClient.delete(`/addresses/${id}`)
      toast.success('Address deleted.')
      await fetchAddresses()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete address.')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">My Addresses</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your delivery addresses for a seamless checkout experience.</p>
        </div>
        <Link to="/cart" className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
          Back to cart
        </Link>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Street / Building / Apartment</label>
              <AddressAutocomplete defaultValue={form.street} onAddressSelect={handleAddressSelect} placeholder="Street / Building / Apartment" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit / Flat / Room (optional)</label>
              <input name="unit" value={form.unit} onChange={handleChange} placeholder="Flat/Room number"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address line 2 (optional)</label>
              <input name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Apartment, building, floor"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">City</label>
              <input name="city" value={form.city} onChange={handleChange} required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">State</label>
              <input name="state" value={form.state} onChange={handleChange} required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Postal Code</label>
              <input name="postal_code" value={form.postal_code} onChange={handleChange} required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Contact number for delivery"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Landmark (optional)</label>
              <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="E.g. near the park, opposite to mall"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_default" id="is_default" checked={form.is_default} onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
              <label htmlFor="is_default" className="text-sm font-medium text-slate-700">Set as default address</label>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button type="button" onClick={cancelForm}
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          + Add New Address
        </button>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
          No addresses saved yet. Add one above to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              {addr.is_default && (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Default
                </span>
              )}
              <div className="space-y-1 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{addr.street}{addr.address_line2?`, ${addr.address_line2}`:''}{addr.unit?` (${addr.unit})`:''}</p>
                <p>{addr.city}, {addr.state} - {addr.postal_code}</p>
                {addr.landmark && <p className="text-slate-500">Landmark: {addr.landmark}</p>}
                {addr.phone && <p className="text-slate-500">Phone: {addr.phone}</p>}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => openEditForm(addr)}
                  className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50">
                  Edit
                </button>
                <button onClick={() => handleDelete(addr.id)}
                  className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
