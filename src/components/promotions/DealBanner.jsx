import { useEffect, useState } from 'react'
import apiClient from '../../lib/axios'

export default function DealBanner() {
  const [promos, setPromos] = useState([])

  useEffect(() => {
    fetchPromos()
  }, [])

  async function fetchPromos() {
    try {
      const resp = await apiClient.get('/promotions/active')
      setPromos(resp.data.promotions || [])
    } catch (e) {
      // ignore
    }
  }

  if (!promos.length) return null

  return (
    <div className="py-6">
      <div className="mx-auto max-w-4xl overflow-x-auto">
        <div className="flex gap-4">
          {promos.map((p) => (
            <div key={p.id} className="min-w-[220px] rounded-xl border p-4 bg-white">
              <div className="font-semibold">{p.code}</div>
              <div className="text-xs text-slate-500">{p.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
