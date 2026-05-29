import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'

interface FooterContent {
  tagline?: string
  companySummary?: string
  madeWithText?: string
}

const defaultLinks = {
  Social: [
    { name: 'Twitter', url: 'https://www.x.com/@oakstratton' },
    { name: 'Instagram', url: 'https://www.instagram.com/oakstratton' },
    { name: 'Email', url: 'mailto:oakstratton@belloite.co.uk' },
  ],
}

const defaultContent: FooterContent = {
  tagline: 'Oakstratton Solutions',
  companySummary: 'Providing bespoke BNPL payment integration tailored to optimize business operations for up north profitability.',
  madeWithText: 'Made with ❤️ by Belloite Holdings. Helping small businesses compete globally.',
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [content, setContent] = useState<FooterContent>(defaultContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooterContent()
  }, [])

  const fetchFooterContent = async () => {
    try {
      const response = await api.get('/api/landing-content')
      const data = response.data

      if (data.footer_content) {
        try {
          const parsed = JSON.parse(data.footer_content)
          setContent({ ...defaultContent, ...parsed })
        } catch (e) {
          setContent(defaultContent)
        }
      }
    } catch (error) {
      console.error('Failed to fetch footer content:', error)
      setContent(defaultContent)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <footer className="bg-dark text-gray-300 border-t border-gray-800">
        <div className="container py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded max-w-xs"></div>
            <div className="h-4 bg-gray-700 rounded max-w-sm"></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-dark text-gray-300 border-t border-gray-800">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <h3 className="text-2xl font-bold text-gradient mb-2">
              {content.tagline || 'Oakstratton'}
            </h3>
            <p className="text-sm text-gray-400">
              {content.companySummary || defaultContent.companySummary}
            </p>
          </motion.div>

          {/* Links */}

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-3">
              {defaultLinks.Social.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors text-sm font-bold"
                  title={social.name}
                >
                  {social.name[0]}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} Oakstratton Solutions. All rights reserved.
          </p>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-white/5 rounded-lg text-center text-xs text-gray-400"
        >
          {content.madeWithText || defaultContent.madeWithText}
        </motion.div>
      </div>
    </footer>
  )
}
