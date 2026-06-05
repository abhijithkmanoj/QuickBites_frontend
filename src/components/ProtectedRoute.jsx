import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import { loadAccessToken } from '../features/auth/authService'

const ROLE_FALLBACK_PATH = {
  restaurant_owner: '/restaurant-owner/dashboard',
  delivery_partner: '/delivery-partner/dashboard',
}

export default function ProtectedRoute({
  redirectTo = '/login',
  requireOwnerVerification = false,
  allowedRoles,
  excludedRoles = [],
}) {
  const { user, status } = useSelector((state) => state.auth)
  const token = loadAccessToken()

  if (status === 'loading' || (!user && token)) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900">Loading session...</div>
  }

  if (!user) {
    if (excludedRoles.length > 0 && !allowedRoles) {
      return <Outlet />
    }

    return <Navigate to={redirectTo} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_FALLBACK_PATH[user.role] || '/'} replace />
  }

  if (excludedRoles.includes(user.role)) {
    return <Navigate to={ROLE_FALLBACK_PATH[user.role] || '/'} replace />
  }

  // Restaurant owners must complete onboarding before accessing dashboard routes
  if (requireOwnerVerification && user.role === 'restaurant_owner') {
    if (user.ownerVerificationStatus === 'approved') {
      return <Outlet />
    }

    return <Navigate to="/restaurant-owner/onboard" replace />
  }

  return <Outlet />
}