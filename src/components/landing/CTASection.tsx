import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'

interface CTAContent {
  title: string
  description: string
  offerText?: string
  primaryButtonText?: string
  secondaryButtonText?: string
}

const defaultCTA: CTAContent = {
  title: 'Ready to Boost Your Sales?',
  description: 'Join 150+ businesses already using Oakstratton to increase sales and customer satisfaction',
  offerText: '⚡ Limited Time Offer: Get setup and first month at 50% off if you sign up this week',
  primaryButtonText: 'Get Early Access',
  secondaryButtonText: 'Schedule a Demo',
}

export default function CTASection() {
  const [content, setContent] = useState<CTAContent>(defaultCTA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCTAContent()
  }, [])

  const fetchCTAContent = async () => {
    try {
      const response = await api.get('/api/landing-content')
      const data = response.data

      if (data.cta_content) {
        try {
          const parsed = JSON.parse(data.cta_content)
          setContent({ ...defaultCTA, ...parsed })
        } catch (e) {
          setContent(defaultCTA)
        }
      }
    } catch (error) {
      console.error('Failed to fetch CTA content:', error)
      setContent(defaultCTA)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section id="contact" className="py-20 bg-dark">
        <div className="container">
          <div className="animate-pulse max-w-3xl mx-auto text-center">
            <div className="h-12 bg-gray-700 rounded mb-6 max-w-lg mx-auto"></div>
            <div className="h-6 bg-gray-700 rounded mb-8 max-w-2xl mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 bg-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content.title}
          </h2>
          <p className="text-xl opacity-90 mb-8">
            {content.description}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255,199,44,0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-lg bg-accent-500 text-dark hover:bg-accent-600 font-bold"
            >
              {content.primaryButtonText || 'Get Early Access'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-lg border-2 border-white text-white hover:bg-white/10"
            >
              {content.secondaryButtonText || 'Schedule a Demo'}
            </motion.button>
          </motion.div>

          {content.offerText && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
            >
              <p className="text-sm opacity-75">
                {content.offerText}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
