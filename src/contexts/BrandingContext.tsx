import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '@/services/api'

interface BrandingData {
  logoType: 'text' | 'image'
  logoText: string
  logoUrl: string
  faviconUrl: string
}

interface BrandingContextType {
  branding: BrandingData
  updateBranding: (data: BrandingData) => void
  loading: boolean
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

const DEFAULT_BRANDING: BrandingData = {
  logoType: 'text',
  logoText: 'Oakstratton',
  logoUrl: '',
  faviconUrl: '',
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingData>(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    try {
      const response = await api.get('/api/landing-content')
      if (response.data.branding) {
        try {
          const parsed = JSON.parse(response.data.branding)
          setBranding(parsed)
          if (parsed.faviconUrl) {
            setFavicon(parsed.faviconUrl)
          }
        } catch (e) {
          setBranding(DEFAULT_BRANDING)
        }
      }
    } catch (err) {
      console.error('Failed to fetch branding:', err)
    } finally {
      setLoading(false)
    }
  }

  const setFavicon = (url: string) => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (link) {
      link.href = url
    } else {
      const newLink = document.createElement('link')
      newLink.rel = 'icon'
      newLink.href = url
      document.head.appendChild(newLink)
    }
  }

  const updateBranding = (data: BrandingData) => {
    setBranding(data)
    if (data.faviconUrl) {
      setFavicon(data.faviconUrl)
    }
  }

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider')
  }
  return context
}
