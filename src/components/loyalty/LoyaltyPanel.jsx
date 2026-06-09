import React, { useEffect, useState } from 'react'
import apiClient from '../../lib/axios'
import { toast } from 'react-toastify'

export default function LoyaltyPanel() {
  const [points, setPoints] = useState(0)
  const [rewards, setRewards] = useState([])

  useEffect(() => {
    fetchPoints()
    fetchRewards()
  }, [])

  async function fetchPoints() {
    try {
      const resp = await apiClient.get('/loyalty/me')
      setPoints(resp.data.points || 0)
    } catch (e) {
      // ignore
    }
  }

  async function fetchRewards() {
    try {
      const resp = await apiClient.get('/loyalty/rewards')
      setRewards(resp.data.rewards || [])
    } catch (e) {
      // ignore
    }
  }

  async function redeem(rewardId) {
    try {
      const resp = await apiClient.post('/loyalty/redeem', { reward_id: rewardId })
      toast.success('Reward redeemed')
      fetchPoints()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Redemption failed')
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-white">
      <h3 className="text-lg font-semibold">Loyalty</h3>
      <p className="text-sm text-slate-600">Points: <strong>{points}</strong></p>
      <div className="mt-3 space-y-2">
        {rewards.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border p-2">
            <div>
              <div className="font-medium">{r.code}</div>
              <div className="text-xs text-slate-500">{r.description}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{r.points_cost} pts</div>
              <button onClick={() => redeem(r.id)} className="mt-2 rounded-full bg-slate-900 px-3 py-1 text-white text-sm">Redeem</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
