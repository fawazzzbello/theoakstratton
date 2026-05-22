import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { label: 'Leads', icon: '👥', path: '/admin/leads' },
    { label: 'Waitlist', icon: '⏳', path: '/admin/waitlist' },
    { label: 'Templates', icon: '📧', path: '/admin/templates' },
    { label: 'Email Tracking', icon: '📬', path: '/admin/email-tracking' },
    { label: 'Analytics', icon: '📈', path: '/admin/analytics' },
    { label: 'Reporting', icon: '📑', path: '/admin/reporting' },
    { label: 'Settings', icon: '⚙️', path: '/admin/settings' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-light">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-dark border-r border-gray-800 flex flex-col"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
              <h1 className="text-2xl font-bold text-gradient">Oakstratton</h1>
              <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileHover={{ x: 5 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="w-full btn btn-outline text-sm text-gray-300 border-gray-700 hover:border-primary-500 hover:text-primary-400"
              >
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-soft">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-2xl text-gray-600 hover:text-primary-500"
              >
                {sidebarOpen ? '⊗' : '☰'}
              </motion.button>
              <h1 className="text-2xl font-bold text-dark">
                {navItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="relative p-2 text-gray-600 hover:text-primary-500"
              >
                🔔
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
