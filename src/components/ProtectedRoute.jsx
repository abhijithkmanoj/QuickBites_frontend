import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { loadAccessToken } from '../features/auth/authService'

export default function ProtectedRoute({ redirectTo = '/login', requireOwnerVerification = false }) {
  const { user, status } = useSelector((state) => state.auth)
  const token = loadAccessToken()

  if (status === 'loading' || (!user && token)) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900">Loading session...</div>
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  // Restaurant owners must complete onboarding before accessing dashboard
  if (requireOwnerVerification && user.role === 'restaurant_owner') {
    return <Navigate to="/restaurant-owner/onboard" replace />
  }

  return <Outlet />
}