import { useEffect, useState } from 'react'
import apiClient from '../lib/axios'
import { toast } from 'react-toastify'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/admin/users')
      setUsers(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleActive = async (user) => {
    setUpdatingId(user.id)
    try {
      await apiClient.patch(`/admin/users/${user.id}`, { is_active: !user.is_active })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: !user.is_active } : u)))
      toast.success('User updated.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update user.')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.email}"?`)) return
    setUpdatingId(user.id)
    try {
      await apiClient.delete(`/admin/users/${user.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      toast.success('User deleted.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not delete user.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">User Management</h1>
          <p className="mt-2 text-sm text-slate-600">View and manage registered users.</p>
        </div>
        <button type="button" onClick={fetchUsers} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Refresh</button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-600">Loading users...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 capitalize">{u.role}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {u.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button type="button" onClick={() => toggleActive(u)} disabled={updatingId === u.id} className="mr-3 rounded-full border border-slate-200 px-3 py-1.5 font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50">
                      {u.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button type="button" onClick={() => deleteUser(u)} disabled={updatingId === u.id} className="rounded-full border border-rose-200 px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-600">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
