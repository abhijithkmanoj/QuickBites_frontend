import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ redirectTo = '/login' }) {
  const { user, status } = useSelector((state) => state.auth)

  if (status === 'loading') {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900">Loading session...</div>
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
