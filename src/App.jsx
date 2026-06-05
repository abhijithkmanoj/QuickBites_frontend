import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HomePage from './routes/HomePage'
import LoginPage from './routes/LoginPage'
import RegisterPage from './routes/RegisterPage'
import ForgotPasswordPage from './routes/ForgotPasswordPage'
import ProfilePage from './routes/ProfilePage'
import RestaurantsPage from './routes/RestaurantsPage'
import RestaurantDetailPage from './routes/RestaurantDetailPage'
import AddressPage from './routes/AddressPage'
import CartPage from './routes/CartPage'
import CheckoutPage from './routes/CheckoutPage'
import OrderConfirmationPage from './routes/OrderConfirmationPage'
import OrdersListPage from './routes/OrdersListPage'
import ActivityPage from './routes/ActivityPage'
import FavoritesPage from './routes/FavoritesPage'

import AdminUsersPage from './routes/AdminUsersPage'
import AdminRestaurantsPage from './routes/AdminRestaurantsPage'
import AdminOwnerApprovalsPage from './routes/AdminOwnerApprovalsPage'
import AdminReviewsPage from './routes/AdminReviewsPage'
import AdminCouponsPage from './routes/AdminCouponsPage'
import AdminMonitoringPage from './routes/AdminMonitoringPage'
import RestaurantDashboardPage from './routes/RestaurantDashboardPage'
import MenuManagementPage from './routes/MenuManagementPage'
import OwnerOnboardingPage from './routes/OwnerOnboardingPage'
import DeliveryPartnerOnboardingPage from './routes/DeliveryPartnerOnboardingPage'
import DeliveryPartnerDashboardPage from './routes/DeliveryPartnerDashboardPage'
import NotFoundPage from './routes/NotFoundPage'
import GlobalLayout from './components/GlobalLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { store } from './app/store'
import { loadUser } from './features/auth/authSlice'
import { loadAccessToken } from './features/auth/authService'

function AppContent() {
  const dispatch = useDispatch()
  const { accessToken, status } = useSelector((state) => state.auth)

  useEffect(() => {
    const token = loadAccessToken()
    if (token) {
      dispatch(loadUser())
    }
  }, [dispatch])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<GlobalLayout />}>
            <Route element={<ProtectedRoute excludedRoles={['restaurant_owner']} redirectTo="/restaurant-owner/dashboard" />}>
              <Route index element={<HomePage />} />
              <Route path="restaurants" element={<RestaurantsPage />} />
              <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
            </Route>

            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersListPage />} />
              <Route path="orders/:id" element={<OrderConfirmationPage />} />
              <Route path="addresses" element={<AddressPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['restaurant_owner']} />}>
              <Route path="restaurant-owner/onboard" element={<OwnerOnboardingPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['restaurant_owner']} requireOwnerVerification />}>
              <Route path="restaurant-owner/dashboard" element={<RestaurantDashboardPage />} />
              <Route path="restaurant-owner/menu" element={<MenuManagementPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['delivery_partner']} />}>
              <Route path="delivery-partner/onboard" element={<DeliveryPartnerOnboardingPage />} />
              <Route path="delivery-partner/dashboard" element={<DeliveryPartnerDashboardPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/restaurants" element={<AdminRestaurantsPage />} />
              <Route path="admin/owners" element={<AdminOwnerApprovalsPage />} />
              <Route path="admin/reviews" element={<AdminReviewsPage />} />
              <Route path="admin/coupons" element={<AdminCouponsPage />} />
              <Route path="admin/monitoring" element={<AdminMonitoringPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App