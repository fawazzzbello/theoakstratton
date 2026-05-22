import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/contexts/AlertContext'

export default function AlertNotifications() {
  const { alerts, removeAlert } = useAlert()

  const getAlertStyles = (type: string) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    }
    return styles[type as keyof typeof styles] || styles.info
  }

  const getIcon = (type: string) => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    }
    return icons[type as keyof typeof icons] || '•'
  }

  return (
    <div className="fixed top-6 right-6 z-50 max-w-md space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${getAlertStyles(alert.type)} border rounded-lg p-4 shadow-lg backdrop-blur-sm pointer-events-auto cursor-pointer`}
            onClick={() => removeAlert(alert.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl font-bold">{getIcon(alert.type)}</span>
              <div className="flex-1">
                {alert.title && <p className="font-semibold">{alert.title}</p>}
                <p className="text-sm opacity-90">{alert.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeAlert(alert.id)
                }}
                className="text-lg opacity-50 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
