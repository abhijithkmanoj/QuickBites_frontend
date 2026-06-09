import { useState } from 'react'
import apiClient from '../../lib/axios'

export default function PromoCodeInput({ cartTotalCents, onApplied }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function applyCode() {
    if (!code) return
    setLoading(true)
    try {
      const resp = await apiClient.post('/promotions/validate', { code, cart_total_cents: cartTotalCents })
      onApplied && onApplied(resp.data)
    } catch (e) {
      alert(e.response?.data?.detail || 'Invalid promo code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" className="rounded-xl border px-3 py-2" />
      <button onClick={applyCode} disabled={loading} className="rounded-xl bg-slate-900 px-3 py-2 text-white">{loading ? 'Applying…' : 'Apply'}</button>
    </div>
  )
}
