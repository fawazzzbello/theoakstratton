import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'

interface NotificationPreferences {
  emailAlerts: {
    newLeads: boolean
    deliveryFailures: boolean
    campaignMetrics: boolean
    weeklyReport: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly'
  exportSettings: {
    autoExport: boolean
    exportFrequency: 'daily' | 'weekly' | 'monthly'
    exportFormat: 'csv' | 'json' | 'both'
    includeMetrics: boolean
  }
  apiSettings: {
    apiKey: string
    webhooksEnabled: boolean
    retryPolicy: 'aggressive' | 'moderate' | 'conservative'
  }
}

export default function SettingsPage() {
  const { success } = useAlert()
  const [activeTab, setActiveTab] = useState<'notifications' | 'export' | 'api'>('notifications')
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailAlerts: {
      newLeads: true,
      deliveryFailures: true,
      campaignMetrics: true,
      weeklyReport: true,
    },
    frequency: 'daily',
    exportSettings: {
      autoExport: false,
      exportFrequency: 'weekly',
      exportFormat: 'csv',
      includeMetrics: true,
    },
    apiSettings: {
      apiKey: 'sk_test_51234567890abcdef1234567890',
      webhooksEnabled: true,
      retryPolicy: 'moderate',
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => {
      success('Settings saved successfully')
      setIsSaving(false)
    }, 800)
  }

  const tabs = [
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'export', label: '📥 Exports', icon: '📥' },
    { id: 'api', label: '🔑 API Settings', icon: '🔑' },
  ] as const

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-3xl font-bold text-dark">Settings</h2>
          <p className="text-gray-600 text-sm">Manage preferences and integrations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-all relative ${
                activeTab === tab.id ? 'text-primary-500' : 'text-gray-600 hover:text-dark'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-6">
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-dark mb-6">Email Notifications</h3>

                <div className="space-y-4 mb-8">
                  {[
                    { key: 'newLeads', label: 'New Leads', description: 'Get notified when new leads are added' },
                    { key: 'deliveryFailures', label: 'Delivery Failures', description: 'Alert when emails fail to deliver' },
                    { key: 'campaignMetrics', label: 'Campaign Metrics', description: 'Receive email campaign performance updates' },
                    { key: 'weeklyReport', label: 'Weekly Report', description: 'Get a summary every Monday' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-4 p-4 bg-light rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.emailAlerts[item.key as keyof typeof preferences.emailAlerts]}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            emailAlerts: {
                              ...preferences.emailAlerts,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="mt-1.5 w-5 h-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-dark">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-semibold text-dark mb-4">Notification Frequency</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['immediate', 'daily', 'weekly'] as const).map((freq) => (
                      <motion.label
                        key={freq}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          preferences.frequency === freq
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={freq}
                          checked={preferences.frequency === freq}
                          onChange={(e) => setPreferences({ ...preferences, frequency: e.target.value as any })}
                          className="mb-2"
                        />
                        <p className="font-semibold text-dark capitalize">{freq}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {freq === 'immediate' && 'Real-time updates'}
                          {freq === 'daily' && 'Daily digest at 9 AM'}
                          {freq === 'weekly' && 'Weekly on Mondays'}
                        </p>
                      </motion.label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'export' && (
            <motion.div key="export" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-6">
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-dark mb-6">Automated Exports</h3>

                <div className="space-y-6">
                  <label className="flex items-start gap-4 p-6 bg-light rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border-2 border-gray-200">
                    <input
                      type="checkbox"
                      checked={preferences.exportSettings.autoExport}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          exportSettings: { ...preferences.exportSettings, autoExport: e.target.checked },
                        })
                      }
                      className="mt-1.5 w-5 h-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-dark text-lg">Enable Automated Exports</p>
                      <p className="text-sm text-gray-600 mt-1">Automatically export leads and metrics on a schedule</p>
                    </div>
                  </label>

                  {preferences.exportSettings.autoExport && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <label className="block text-sm font-semibold text-dark mb-3">Export Frequency</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                            <motion.label
                              key={freq}
                              whileHover={{ scale: 1.02 }}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                preferences.exportSettings.exportFrequency === freq
                                  ? 'border-primary-500 bg-white'
                                  : 'border-gray-200 bg-white hover:border-primary-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="exportFreq"
                                value={freq}
                                checked={preferences.exportSettings.exportFrequency === freq}
                                onChange={(e) =>
                                  setPreferences({
                                    ...preferences,
                                    exportSettings: { ...preferences.exportSettings, exportFrequency: e.target.value as any },
                                  })
                                }
                                className="mb-1"
                              />
                              <p className="text-sm font-semibold text-dark capitalize">{freq}</p>
                            </motion.label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-dark mb-3">Export Format</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['csv', 'json', 'both'] as const).map((format) => (
                            <motion.label
                              key={format}
                              whileHover={{ scale: 1.02 }}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                preferences.exportSettings.exportFormat === format
                                  ? 'border-primary-500 bg-white'
                                  : 'border-gray-200 bg-white hover:border-primary-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="exportFormat"
                                value={format}
                                checked={preferences.exportSettings.exportFormat === format}
                                onChange={(e) =>
                                  setPreferences({
                                    ...preferences,
                                    exportSettings: { ...preferences.exportSettings, exportFormat: e.target.value as any },
                                  })
                                }
                                className="mb-1"
                              />
                              <p className="text-sm font-semibold text-dark capitalize">{format}</p>
                            </motion.label>
                          ))}
                        </div>
                      </div>

                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={preferences.exportSettings.includeMetrics}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              exportSettings: { ...preferences.exportSettings, includeMetrics: e.target.checked },
                            })
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-dark">Include email metrics in exports</span>
                      </label>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div key="api" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="space-y-6">
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-dark mb-6">API Configuration</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-3">API Key</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={preferences.apiSettings.apiKey}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-3 text-gray-600 hover:text-dark"
                        >
                          {showApiKey ? '👁‍🗨' : '🔒'}
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="btn btn-outline"
                        onClick={() => {
                          navigator.clipboard.writeText(preferences.apiSettings.apiKey)
                          success('API key copied to clipboard')
                        }}
                      >
                        Copy
                      </motion.button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Keep this key secure. Never share it publicly.</p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <label className="flex items-start gap-4 p-4 bg-light rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-4">
                      <input
                        type="checkbox"
                        checked={preferences.apiSettings.webhooksEnabled}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            apiSettings: { ...preferences.apiSettings, webhooksEnabled: e.target.checked },
                          })
                        }
                        className="mt-1.5 w-5 h-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-dark">Enable Webhooks</p>
                        <p className="text-sm text-gray-600">Receive real-time event notifications</p>
                      </div>
                    </label>

                    <div>
                      <label className="block text-sm font-semibold text-dark mb-3">Retry Policy</label>
                      <div className="grid grid-cols-3 gap-4">
                        {(['conservative', 'moderate', 'aggressive'] as const).map((policy) => (
                          <motion.label
                            key={policy}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              preferences.apiSettings.retryPolicy === policy
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 bg-white hover:border-primary-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="retryPolicy"
                              value={policy}
                              checked={preferences.apiSettings.retryPolicy === policy}
                              onChange={(e) =>
                                setPreferences({
                                  ...preferences,
                                  apiSettings: { ...preferences.apiSettings, retryPolicy: e.target.value as any },
                                })
                              }
                              className="mb-2"
                            />
                            <p className="font-semibold text-dark capitalize">{policy}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {policy === 'conservative' && '3 retries, 10s delays'}
                              {policy === 'moderate' && '5 retries, 5s delays'}
                              {policy === 'aggressive' && '10 retries, 1s delays'}
                            </p>
                          </motion.label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <motion.button whileHover={{ scale: 1.05 }} className="btn btn-outline">
            Reset to Defaults
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={handleSave} disabled={isSaving} className="btn btn-primary disabled:opacity-50">
            {isSaving ? 'Saving...' : '💾 Save Settings'}
          </motion.button>
        </div>
      </motion.div>
    </AdminLayout>
  )
}
