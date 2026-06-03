import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', usage_limit: '', expiry_date: '' })
  const [saving, setSaving] = useState(false)

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/coupons')
      setCoupons(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load coupons.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/admin/coupons', {
        ...form,
        discount_value: parseFloat(form.discount_value),
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        expiry_date: form.expiry_date || null,
      })
      toast.success('Coupon created.')
      setShowForm(false)
      setForm({ code: '', discount_type: 'percentage', discount_value: '', usage_limit: '', expiry_date: '' })
      fetchCoupons()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not create coupon.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (coupon) => {
    try {
      await apiClient.patch(`/admin/coupons/${coupon.id}`, { is_active: !coupon.is_active })
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)))
      toast.success('Coupon updated.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update coupon.')
    }
  }

  const deleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon?')) return
    try {
      await apiClient.delete(`/admin/coupons/${couponId}`)
      setCoupons((prev) => prev.filter((c) => c.id !== couponId))
      toast.success('Coupon deleted.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not delete coupon.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Coupon Management</h1>
          <p className="mt-2 text-sm text-slate-600">Create and manage discount coupons.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={fetchCoupons} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh</button>
          <button type="button" onClick={() => setShowForm((v) => !v)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            {showForm ? 'Cancel' : 'New Coupon'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Code</span>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Discount Type</span>
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Discount Value</span>
              <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required min="0" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Usage Limit</span>
              <input type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} min="1" className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Expiry Date</span>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900" />
            </label>
          </div>
          <button type="submit" disabled={saving} className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading coupons...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 text-sm text-slate-900">{c.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 capitalize">{c.discount_type}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{c.discount_value}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{c.used_count || 0} / {c.usage_limit || '∞'}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button type="button" onClick={() => toggleActive(c)} className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button type="button" onClick={() => deleteCoupon(c.id)} className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50">Delete</button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-slate-600">No coupons found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
