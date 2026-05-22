import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
  id: string
  type: AlertType
  message: string
  title?: string
  duration?: number
}

interface AlertContextType {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, 'id'>) => string
  removeAlert: (id: string) => void
  clearAlerts: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const addAlert = useCallback((alert: Omit<Alert, 'id'>) => {
    const id = Date.now().toString()
    const newAlert: Alert = {
      ...alert,
      id,
      duration: alert.duration ?? 4000,
    }

    setAlerts((prev) => [...prev, newAlert])

    // Auto-remove alert after duration
    if (newAlert.duration && newAlert.duration > 0) {
      setTimeout(() => {
        removeAlert(id)
      }, newAlert.duration)
    }

    return id
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
  }, [])

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider')
  }

  return {
    success: (message: string, title?: string) =>
      context.addAlert({ type: 'success', message, title }),
    error: (message: string, title?: string) =>
      context.addAlert({ type: 'error', message, title }),
    warning: (message: string, title?: string) =>
      context.addAlert({ type: 'warning', message, title }),
    info: (message: string, title?: string) =>
      context.addAlert({ type: 'info', message, title }),
    remove: context.removeAlert,
    clear: context.clearAlerts,
  }
}
