import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import NotificationToast from './notifications/NotificationToast'
import NotificationBell from './notifications/NotificationBell'
import AIChatPanel from './chat/AIChatPanel'

export default function GlobalLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  const showCustomerNav = !user || user.role === 'customer'

  const navLinkClass = 'rounded-lg px-3 py-2 text-sm font-medium text-surface-600 transition-all duration-200 hover:text-navy-900 hover:bg-surface-100/80'
  const navLinkActive = 'rounded-lg px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50/80'

  return (
    <div className="min-h-screen bg-surface-50 text-surface-800">
      {/* Premium Header with Glassmorphism */}
      <header className="sticky top-0 z-30 border-b border-surface-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-amber-600 shadow-lg shadow-brand-500/20 transition-transform duration-300 group-hover:scale-110">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-navy-900">
              Quick<span className="text-gradient">Bites</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            <div className="flex items-center gap-1 rounded-xl bg-surface-50/80 p-1">
              {showCustomerNav && (
                <>
                  <Link to="/" className={navLinkClass}>Home</Link>
                  <Link to="/restaurants" className={navLinkClass}>Restaurants</Link>
                  <Link to="/cart" className={navLinkClass}>Cart</Link>
                </>
              )}
              {user?.role === 'restaurant_owner' && (
                <>
                  <Link to="/restaurant-owner/dashboard" className={navLinkClass}>Dashboard</Link>
                  <Link to="/restaurant-owner/menu" className={navLinkClass}>Menu</Link>
                </>
              )}
              {user?.role === 'delivery_partner' && (
                <Link to="/delivery-partner/dashboard" className={navLinkClass}>Dashboard</Link>
              )}
              {user?.role === 'customer' && (
                <Link to="/orders" className={navLinkClass}>Orders</Link>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/restaurants" className={navLinkClass}>Restaurants</Link>
                  <Link to="/admin/owners" className={navLinkClass}>Approvals</Link>
                  <Link to="/admin/users" className={navLinkClass}>Users</Link>
                  <Link to="/admin/monitoring" className={navLinkClass}>Monitoring</Link>
                </>
              )}
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <Link to="/profile" className="hidden sm:flex items-center gap-2 rounded-xl bg-surface-50/80 px-3 py-2 text-sm font-medium text-surface-600 transition-all duration-200 hover:text-navy-900 hover:bg-surface-100/80">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-navy-700 to-navy-800 text-[11px] font-bold text-white">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{user.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl border-2 border-surface-200 px-4 py-2 text-sm font-semibold text-navy-700 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.97]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden md:inline">Logout</span>
                </button>
                {/* Mobile Menu Toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-surface-100 text-surface-600 transition hover:bg-surface-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !py-2.5 !px-5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !py-2.5 !px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-surface-200/80 bg-white/95 backdrop-blur-xl animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {showCustomerNav && (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Home</Link>
                  <Link to="/restaurants" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Restaurants</Link>
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Cart</Link>
                </>
              )}
              {user?.role === 'restaurant_owner' && (
                <>
                  <Link to="/restaurant-owner/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Dashboard</Link>
                  <Link to="/restaurant-owner/menu" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Menu</Link>
                </>
              )}
              {user?.role === 'delivery_partner' && (
                <Link to="/delivery-partner/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Dashboard</Link>
              )}
              {user?.role === 'customer' && (
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Orders</Link>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/restaurants" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Restaurants</Link>
                  <Link to="/admin/owners" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Approvals</Link>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Users</Link>
                  <Link to="/admin/monitoring" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-surface-600 hover:bg-surface-100 hover:text-navy-900">Monitoring</Link>
                </>
              )}
              <div className="divider my-3" />
              <button
                type="button"
                onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content with subtle entry animation */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 page-enter">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200/80 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-amber-600">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-navy-900">Quick<span className="text-gradient">Bites</span></span>
              </Link>
              <p className="text-sm text-surface-500 leading-relaxed">
                Order food from the best local restaurants with easy delivery to your doorstep.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-surface-600 hover:text-navy-900 transition">Home</Link>
                <Link to="/restaurants" className="block text-sm text-surface-600 hover:text-navy-900 transition">Restaurants</Link>
                <Link to="/cart" className="block text-sm text-surface-600 hover:text-navy-900 transition">Cart</Link>
                <Link to="/orders" className="block text-sm text-surface-600 hover:text-navy-900 transition">Orders</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Account</h4>
              <div className="space-y-2">
                <Link to="/profile" className="block text-sm text-surface-600 hover:text-navy-900 transition">Profile</Link>
                <Link to="/addresses" className="block text-sm text-surface-600 hover:text-navy-900 transition">Addresses</Link>
                <Link to="/favorites" className="block text-sm text-surface-600 hover:text-navy-900 transition">Favorites</Link>
                <Link to="/activity" className="block text-sm text-surface-600 hover:text-navy-900 transition">Activity</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Support</h4>
              <div className="space-y-2">
                <span className="block text-sm text-surface-500">Help Center</span>
                <span className="block text-sm text-surface-500">Privacy Policy</span>
                <span className="block text-sm text-surface-500">Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="divider mt-8 mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-surface-400">
              © {new Date().getFullYear()} QuickBites. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-surface-400">
              <span>Made with</span>
              <svg className="h-4 w-4 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>in India</span>
            </div>
          </div>
        </div>
      </footer>

      <NotificationToast />
      <AIChatPanel />
    </div>
  )
}