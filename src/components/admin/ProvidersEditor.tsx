import { useState } from 'react'
import { motion } from 'framer-motion'

interface Provider {
  name: string
  fee: string
  terms: string
  users: string
  description: string
  color: string
}

interface ProvidersEditorProps {
  providers: Provider[]
  onProvidersChange: (providers: Provider[]) => void
  onSave: () => void
  isSaving: boolean
}

const gradientPresets = [
  'from-pink-500 to-rose-500',
  'from-blue-500 to-cyan-500',
  'from-yellow-500 to-orange-500',
  'from-purple-500 to-indigo-500',
  'from-green-500 to-teal-500',
  'from-red-500 to-pink-500',
]

export default function ProvidersEditor({
  providers,
  onProvidersChange,
  onSave,
  isSaving,
}: ProvidersEditorProps) {
  const addProvider = () => {
    const newProvider: Provider = {
      name: 'New Provider',
      fee: '2.99%',
      terms: '4 installments',
      users: '10M+',
      description: 'Provider description',
      color: 'from-blue-500 to-cyan-500',
    }
    onProvidersChange([...providers, newProvider])
  }

  const updateProvider = (index: number, updates: Partial<Provider>) => {
    const updated = [...providers]
    updated[index] = { ...updated[index], ...updates }
    onProvidersChange(updated)
  }

  const deleteProvider = (index: number) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      onProvidersChange(providers.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={addProvider}
        className="btn btn-primary btn-sm"
      >
        + Add Provider
      </motion.button>

      <div className="space-y-4">
        {providers.map((provider, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 border-2 border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-dark">
                Provider {idx + 1}
              </h4>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => deleteProvider(idx)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ✕
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={provider.name}
                onChange={(e) => updateProvider(idx, { name: e.target.value })}
                placeholder="Provider Name (e.g., Klarna)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={provider.fee}
                onChange={(e) => updateProvider(idx, { fee: e.target.value })}
                placeholder="Fee (e.g., 2.49% + 30p)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={provider.terms}
                onChange={(e) => updateProvider(idx, { terms: e.target.value })}
                placeholder="Terms (e.g., 3-4 monthly payments)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={provider.users}
                onChange={(e) => updateProvider(idx, { users: e.target.value })}
                placeholder="Users (e.g., 150M+)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <textarea
              value={provider.description}
              onChange={(e) => updateProvider(idx, { description: e.target.value })}
              placeholder="Provider description..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4"
            />

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gradient Color
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {gradientPresets.map((gradient) => (
                  <motion.button
                    key={gradient}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => updateProvider(idx, { color: gradient })}
                    className={`p-3 rounded-lg border-2 transition-all bg-gradient-to-br ${gradient} ${
                      provider.color === gradient ? 'border-dark' : 'border-transparent'
                    }`}
                    title={gradient}
                  />
                ))}
              </div>
              <input
                type="text"
                value={provider.color}
                onChange={(e) => updateProvider(idx, { color: e.target.value })}
                placeholder="Custom gradient class (e.g., from-blue-500 to-cyan-500)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            <div className={`p-4 bg-gradient-to-br ${provider.color} rounded-lg text-white`}>
              <p className="text-sm opacity-75">Preview</p>
              <h3 className="text-lg font-bold">{provider.name}</h3>
              <p className="text-sm opacity-90">{provider.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={onSave}
        disabled={isSaving}
        className="btn btn-primary w-full"
      >
        {isSaving ? 'Saving...' : 'Save All Providers'}
      </motion.button>
    </div>
  )
}
