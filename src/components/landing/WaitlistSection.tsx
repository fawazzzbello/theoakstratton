import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

export default function WaitlistSection() {
  const { success, error } = useAlert()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      error('Email is required')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/waitlist', { email })
      success('Thank you! You\'ve been added to our waitlist.')
      setEmail('')
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be the first to know when we launch new features and BNPL provider integrations.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary px-8 py-3 font-semibold"
            >
              {loading ? 'Joining...' : 'Join'}
            </motion.button>
          </form>

          <p className="text-sm text-gray-500 mt-4">
            No spam, just product updates. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
