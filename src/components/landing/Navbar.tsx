import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'

interface NavLink {
  id?: string
  label: string
  href: string
  icon?: string
}

interface BrandingSettings {
  logoType: 'text' | 'image'
  logoText: string
  logoUrl: string
  faviconUrl: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ])
  const [branding, setBranding] = useState<BrandingSettings>({
    logoType: 'text',
    logoText: 'Oakstratton',
    logoUrl: '',
    faviconUrl: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNavMenu = async () => {
      try {
        const response = await api.get('/api/navigation-menu')
        if (response.data && Array.isArray(response.data)) {
          setNavLinks(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch navigation menu:', error)
      }
    }

    const fetchBranding = async () => {
      try {
        const response = await api.get('/api/landing-content')
        if (response.data && response.data.branding) {
          const parsed = JSON.parse(response.data.branding)
          setBranding(parsed)

          // Update favicon if URL is provided
          if (parsed.faviconUrl) {
            const link = document.querySelector("link[rel='icon']") || document.createElement('link')
            link.rel = 'icon'
            link.href = parsed.faviconUrl
            document.head.appendChild(link)
          }
        }
      } catch (error) {
        console.error('Failed to fetch branding:', error)
      }
    }

    fetchNavMenu()
    fetchBranding()
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-soft"
    >
      <div className="container py-4 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="cursor-pointer flex items-center gap-2"
        >
          {branding.logoType === 'image' && branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="h-10 object-contain" />
          ) : (
            <>
              <div className="text-2xl font-bold text-gradient">{branding.logoText}</div>
              <div className="text-xs text-secondary-500">BNPL Solutions</div>
            </>
          )}
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{ color: '#005EB8' }}
              className="text-gray-600 hover:text-primary-500 transition-colors font-medium"
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-primary-500 text-2xl"
        >
          {isOpen ? '✕' : '☰'}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-gray-100 py-4"
        >
          <div className="container space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-gray-600 hover:text-primary-500 font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
