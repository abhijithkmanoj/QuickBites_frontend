import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function AdminOwnerApprovalsPage() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOwners = async (status = '') => {
    setLoading(true)
    try {
      const query = status ? `?verification_status=${status}` : ''
      const res = await apiClient.get(`/admin/owners${query}`)
      setOwners(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load owner profiles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  const updateOwnerStatus = async (owner, action) => {
    setUpdatingId(owner.id)
    try {
      await apiClient.patch(`/admin/owners/${owner.user_id}/${action}`, {
        reason: action === 'reject' ? 'Verification rejected by admin.' : undefined,
      })
      setOwners((prev) => prev.filter((item) => item.id !== owner.id))
      toast.success(`Owner ${action}ed successfully.`)
    } catch (err) {
      toast.error(err.response?.data?.detail || `Could not ${action} owner.`)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Restaurant Owner Approvals</h1>
          <p className="mt-2 text-sm text-slate-600">Review and approve pending restaurant owner verification requests.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              fetchOwners(e.target.value)
            }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button type="button" onClick={() => fetchOwners(statusFilter)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading owner profiles...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Owner ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Rejection Reason</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {owners.map((owner) => (
                <tr key={owner.id}>
                  <td className="px-6 py-4 text-sm text-slate-900">{owner.business_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 break-all">{owner.user_id}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${owner.verification_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : owner.verification_status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {owner.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{owner.rejection_reason || '-'}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => updateOwnerStatus(owner, 'approve')}
                      disabled={updatingId === owner.id || owner.verification_status === 'approved'}
                      className="mr-2 rounded-full border border-emerald-200 px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOwnerStatus(owner, 'reject')}
                      disabled={updatingId === owner.id || owner.verification_status === 'rejected'}
                      className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {owners.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-600">No owner profiles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
