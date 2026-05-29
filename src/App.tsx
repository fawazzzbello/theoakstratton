import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AlertProvider } from './contexts/AlertContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import AlertNotifications from './components/common/AlertNotifications'

// Pages
import LandingPage from './pages/Landing'
import CheckoutPage from './pages/CheckoutPage'
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'
import CheckoutCancelPage from './pages/CheckoutCancelPage'
import LoginPage from './pages/Admin/LoginPage'
import DashboardPage from './pages/Admin/DashboardPage'
import LeadsPage from './pages/Admin/LeadsPage'
import TemplatesPage from './pages/Admin/TemplatesPage'
import AnalyticsPage from './pages/Admin/AnalyticsPage'
import WaitlistPage from './pages/Admin/WaitlistPage'
import EmailTrackingPage from './pages/Admin/EmailTrackingPage'
import SettingsPage from './pages/Admin/SettingsPage'
import ReportingPage from './pages/Admin/ReportingPage'
import UserManagementPage from './pages/Admin/UserManagementPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import OrdersManagementPage from './pages/Admin/OrdersManagementPage'
import EmailTemplatesPage from './pages/Admin/EmailTemplatesPage'
import EmailCampaignsPage from './pages/Admin/EmailCampaignsPage'
import NavMenuManagementPage from './pages/Admin/NavMenuManagementPage'
import NotFoundPage from './pages/NotFound'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <AlertNotifications />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <OrdersManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/templates"
              element={
                <ProtectedRoute>
                  <TemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/email-templates"
              element={
                <ProtectedRoute>
                  <EmailTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/email-campaigns"
              element={
                <ProtectedRoute>
                  <EmailCampaignsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute>
                  <NavMenuManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/waitlist"
              element={
                <ProtectedRoute>
                  <WaitlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/email-tracking"
              element={
                <ProtectedRoute>
                  <EmailTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reporting"
              element={
                <ProtectedRoute>
                  <ReportingPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
