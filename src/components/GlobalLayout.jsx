import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'

export default function GlobalLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900">
      <header className="sticky top-0 z-20 border-b border-surface-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-brand-600 transition hover:text-brand-700"
          >
            QuickBites
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link
              to="/"
              className="rounded-full px-3 py-1.5 text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
            >
              Home
            </Link>
            <Link
              to="/restaurants"
              className="rounded-full px-3 py-1.5 text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
            >
              Restaurants
            </Link>
            <Link
              to="/cart"
              className="rounded-full px-3 py-1.5 text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
            >
              Cart
            </Link>
            {user ? (
              <>
                {user.role === 'restaurant_owner' && (
                  <Link
                    to="/restaurant-owner/dashboard"
                    className="rounded-full px-3 py-1.5 text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === 'delivery_partner' && (
                  <Link
                    to="/delivery-partner/dashboard"
                    className="rounded-full px-3 py-1.5 text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="rounded-full px-3 py-1.5 text-surface-700 transition hover:bg-surface-100 hover:text-surface-900"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-surface-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-surface-800 active:scale-[0.98]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-surface-200 bg-white/85 py-6 text-center text-sm text-surface-500">
        <span className="font-semibold text-brand-600">QuickBites</span>
        <span className="mx-2">·</span>
        <span>© {new Date().getFullYear()} QuickBites. Built for Phase 8.</span>
      </footer>
    </div>
  )
}