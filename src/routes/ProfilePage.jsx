import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loadUser, logout } from '../features/auth/authSlice'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, status } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!user && status === 'idle') {
      dispatch(loadUser())
    }
  }, [dispatch, status, user])

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out successfully.')
    navigate('/login')
  }

  if (status === 'loading' && !user) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900">Loading profile…</div>
  }

  if (!user) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900">No profile available.</div>
  }

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your profile</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your account information and session.</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Logout
        </button>
      </div>
      <div className="grid gap-4 rounded-3xl bg-slate-50 p-6 text-slate-800">
        <div>
          <p className="text-sm font-semibold text-slate-600">Name</p>
          <p className="mt-1 text-base text-slate-900">{user.name}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">Email</p>
          <p className="mt-1 text-base text-slate-900">{user.email}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">Phone</p>
          <p className="mt-1 text-base text-slate-900">{user.phone || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">Role</p>
          <p className="mt-1 text-base text-slate-900">{user.role}</p>
        </div>
      </div>
    </div>
  )
}
