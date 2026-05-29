import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface DashboardContent {
  hero?: any[]
  features?: any[]
  providers?: any[]
  testimonials?: any[]
  pricing?: any
  footer?: any
  waitlist?: any
  contact?: any
  branding?: any
}

export default function AdminDashboard() {
  const [content, setContent] = useState<DashboardContent>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('branding')
  const [saving, setSaving] = useState(false)
  const { success, error } = useAlert()

  useEffect(() => {
    fetchAllContent()
  }, [])

  const fetchAllContent = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/landing-content')
      const data = response.data

      const parsed: DashboardContent = {}

      // Parse all content sections
      if (data.hero_content) {
        try {
          parsed.hero = JSON.parse(data.hero_content)
        } catch (e) {
          parsed.hero = []
        }
      }

      if (data.features_content) {
        try {
          parsed.features = JSON.parse(data.features_content)
        } catch (e) {
          parsed.features = []
        }
      }

      if (data.providers_content) {
        try {
          parsed.providers = JSON.parse(data.providers_content)
        } catch (e) {
          parsed.providers = []
        }
      }

      if (data.testimonials_content) {
        try {
          parsed.testimonials = JSON.parse(data.testimonials_content)
        } catch (e) {
          parsed.testimonials = []
        }
      }

      if (data.pricing_title || data.pricing_subtitle) {
        parsed.pricing = {
          title: data.pricing_title,
          subtitle: data.pricing_subtitle,
        }
      }

      if (data.footer_content) {
        try {
          parsed.footer = JSON.parse(data.footer_content)
        } catch (e) {
          parsed.footer = {}
        }
      }

      if (data.waitlist_title || data.waitlist_description) {
        parsed.waitlist = {
          title: data.waitlist_title,
          description: data.waitlist_description,
        }
      }

      if (data.contact_title || data.contact_description) {
        parsed.contact = {
          title: data.contact_title,
          description: data.contact_description,
        }
      }

      if (data.branding) {
        try {
          parsed.branding = JSON.parse(data.branding)
        } catch (e) {
          parsed.branding = {
            logoType: 'text',
            logoText: 'Oakstratton',
            logoUrl: '',
            faviconUrl: '',
          }
        }
      } else {
        parsed.branding = {
          logoType: 'text',
          logoText: 'Oakstratton',
          logoUrl: '',
          faviconUrl: '',
        }
      }

      setContent(parsed)
    } catch (err) {
      error('Failed to fetch content')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (field: string, value: any) => {
    try {
      setSaving(true)
      await api.put(`/api/admin/landing-content/${field}`, {
        contentValue: typeof value === 'string' ? value : JSON.stringify(value),
        contentType: 'text',
      })
      success('Content updated successfully')
    } catch (err) {
      error('Failed to save content')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">Content Dashboard</h1>
          <p className="text-gray-600">Manage all landing page content with visual editors</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border border-gray-200 overflow-x-auto">
          {[
            { id: 'branding', label: '🎨 Branding', icon: '🎨' },
            { id: 'hero', label: '🎯 Hero Slider', icon: '🎯' },
            { id: 'features', label: '✨ Features', icon: '✨' },
            { id: 'providers', label: '💳 Providers', icon: '💳' },
            { id: 'testimonials', label: '⭐ Testimonials', icon: '⭐' },
            { id: 'pricing', label: '💰 Pricing', icon: '💰' },
            { id: 'waitlist', label: '📧 Waitlist', icon: '📧' },
            { id: 'contact', label: '💬 Contact', icon: '💬' },
            { id: 'footer', label: '🔗 Footer', icon: '🔗' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all capitalize ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {activeTab === 'branding' && <BrandingEditor content={content.branding} onSave={saveContent} />}
          {activeTab === 'hero' && <HeroEditor content={content.hero} onSave={saveContent} />}
          {activeTab === 'features' && <FeaturesEditor content={content.features} onSave={saveContent} />}
          {activeTab === 'providers' && <ProvidersEditor content={content.providers} onSave={saveContent} />}
          {activeTab === 'testimonials' && <TestimonialsEditor content={content.testimonials} onSave={saveContent} />}
          {activeTab === 'pricing' && <PricingEditor content={content.pricing} onSave={saveContent} />}
          {activeTab === 'waitlist' && <WaitlistEditor content={content.waitlist} onSave={saveContent} />}
          {activeTab === 'contact' && <ContactEditor content={content.contact} onSave={saveContent} />}
          {activeTab === 'footer' && <FooterEditor content={content.footer} onSave={saveContent} />}
        </div>
      </motion.div>
    </AdminLayout>
  )
}

// Branding Editor
function BrandingEditor({ content, onSave }: any) {
  const [branding, setBranding] = useState(content || { logoType: 'text', logoText: 'Oakstratton', logoUrl: '', faviconUrl: '' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="text-2xl font-bold text-dark mb-6">Logo Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Logo Type</label>
              <div className="flex gap-3">
                {['text', 'image'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setBranding({ ...branding, logoType: type })}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                      branding.logoType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'text' ? '📝' : '🖼️'} {type}
                  </button>
                ))}
              </div>
            </div>

            {branding.logoType === 'text' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Text</label>
                <input
                  type="text"
                  value={branding.logoText}
                  onChange={(e) => setBranding({ ...branding, logoText: e.target.value })}
                  placeholder="Enter logo text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                  <div className="text-3xl font-bold text-gradient">{branding.logoText}</div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Image URL</label>
                <input
                  type="text"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {branding.logoUrl && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Preview:</p>
                    <img src={branding.logoUrl} alt="Logo" className="h-16 object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Favicon Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h2 className="text-2xl font-bold text-dark mb-6">Favicon Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon URL</label>
              <input
                type="text"
                value={branding.faviconUrl}
                onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                placeholder="https://example.com/favicon.ico"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-2">Use a 32x32 PNG or ICO file for best results</p>
            </div>

            {branding.faviconUrl && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img src={branding.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => onSave('branding', branding)}
        className="btn btn-primary w-full"
      >
        Save Branding Settings
      </motion.button>
    </motion.div>
  )
}

// Hero Editor
function HeroEditor({ content, onSave }: any) {
  const [slides, setSlides] = useState(content || [])

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        id: Date.now().toString(),
        title: 'New Slide',
        subtitle: 'Add your subtitle here',
        stat1: '+30% Increase',
        stat2: '+40% AOV',
        stat3: '7 days',
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    ])
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark">Hero Slider</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={addSlide}
          className="btn btn-primary btn-sm"
        >
          + Add Slide
        </motion.button>
      </div>

      <div className="space-y-4">
        {slides.map((slide: any, idx: number) => (
          <motion.div key={slide.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="text-lg font-bold text-dark mb-4">Slide {idx + 1}</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={slide.title}
                onChange={(e) => {
                  const updated = [...slides]
                  updated[idx].title = e.target.value
                  setSlides(updated)
                }}
                placeholder="Slide Title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <textarea
                value={slide.subtitle}
                onChange={(e) => {
                  const updated = [...slides]
                  updated[idx].subtitle = e.target.value
                  setSlides(updated)
                }}
                placeholder="Subtitle"
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <div className="grid grid-cols-3 gap-3">
                {['stat1', 'stat2', 'stat3'].map((stat) => (
                  <input
                    key={stat}
                    type="text"
                    value={slide[stat]}
                    onChange={(e) => {
                      const updated = [...slides]
                      updated[idx][stat] = e.target.value
                      setSlides(updated)
                    }}
                    placeholder={`Stat ${stat.replace('stat', '')}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => onSave('hero_content', slides)}
        className="btn btn-primary w-full"
      >
        Save Slides
      </motion.button>
    </motion.div>
  )
}

// Features Editor
function FeaturesEditor({ content, onSave }: any) {
  const [features, setFeatures] = useState(content || [])

  const addFeature = () => {
    setFeatures([
      ...features,
      {
        icon: '✨',
        title: 'New Feature',
        description: 'Feature description',
      },
    ])
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark">Features</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={addFeature}
          className="btn btn-primary btn-sm"
        >
          + Add Feature
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature: any, idx: number) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
            <div className="space-y-3">
              <div className="text-4xl">{feature.icon}</div>
              <input
                type="text"
                value={feature.title}
                onChange={(e) => {
                  const updated = [...features]
                  updated[idx].title = e.target.value
                  setFeatures(updated)
                }}
                placeholder="Feature Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <textarea
                value={feature.description}
                onChange={(e) => {
                  const updated = [...features]
                  updated[idx].description = e.target.value
                  setFeatures(updated)
                }}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <input
                type="text"
                value={feature.icon}
                onChange={(e) => {
                  const updated = [...features]
                  updated[idx].icon = e.target.value
                  setFeatures(updated)
                }}
                placeholder="Icon emoji"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => onSave('features_content', features)}
        className="btn btn-primary w-full"
      >
        Save Features
      </motion.button>
    </motion.div>
  )
}

// Providers Editor
function ProvidersEditor({ content, onSave }: any) {
  const [providers, setProviders] = useState(content || [])

  const addProvider = () => {
    setProviders([
      ...providers,
      {
        name: 'New Provider',
        fee: '2.99%',
        terms: '4 installments',
        users: '10M+',
        description: 'Provider description',
        color: 'from-blue-500 to-cyan-500',
      },
    ])
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark">BNPL Providers</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={addProvider}
          className="btn btn-primary btn-sm"
        >
          + Add Provider
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider: any, idx: number) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
            <div className="space-y-3">
              <input
                type="text"
                value={provider.name}
                onChange={(e) => {
                  const updated = [...providers]
                  updated[idx].name = e.target.value
                  setProviders(updated)
                }}
                placeholder="Provider Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={provider.fee}
                  onChange={(e) => {
                    const updated = [...providers]
                    updated[idx].fee = e.target.value
                    setProviders(updated)
                  }}
                  placeholder="Fee"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <input
                  type="text"
                  value={provider.users}
                  onChange={(e) => {
                    const updated = [...providers]
                    updated[idx].users = e.target.value
                    setProviders(updated)
                  }}
                  placeholder="Users"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <input
                type="text"
                value={provider.terms}
                onChange={(e) => {
                  const updated = [...providers]
                  updated[idx].terms = e.target.value
                  setProviders(updated)
                }}
                placeholder="Payment Terms"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <textarea
                value={provider.description}
                onChange={(e) => {
                  const updated = [...providers]
                  updated[idx].description = e.target.value
                  setProviders(updated)
                }}
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => onSave('providers_content', providers)}
        className="btn btn-primary w-full"
      >
        Save Providers
      </motion.button>
    </motion.div>
  )
}

// Testimonials Editor
function TestimonialsEditor({ content, onSave }: any) {
  const [testimonials, setTestimonials] = useState(content || [])

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      {
        quote: 'Amazing service!',
        author: 'Customer Name',
        role: 'Title',
        rating: 5,
      },
    ])
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-dark">Testimonials</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={addTestimonial}
          className="btn btn-primary btn-sm"
        >
          + Add Testimonial
        </motion.button>
      </div>

      <div className="space-y-4">
        {testimonials.map((testimonial: any, idx: number) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
            <div className="space-y-3">
              <div className="flex gap-1 mb-2">
                {Array(5).fill(null).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const updated = [...testimonials]
                      updated[idx].rating = i + 1
                      setTestimonials(updated)
                    }}
                    className="text-2xl"
                  >
                    {i < testimonial.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <textarea
                value={testimonial.quote}
                onChange={(e) => {
                  const updated = [...testimonials]
                  updated[idx].quote = e.target.value
                  setTestimonials(updated)
                }}
                placeholder="Testimonial text"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={testimonial.author}
                  onChange={(e) => {
                    const updated = [...testimonials]
                    updated[idx].author = e.target.value
                    setTestimonials(updated)
                  }}
                  placeholder="Author Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={testimonial.role}
                  onChange={(e) => {
                    const updated = [...testimonials]
                    updated[idx].role = e.target.value
                    setTestimonials(updated)
                  }}
                  placeholder="Role/Title"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => onSave('testimonials_content', testimonials)}
        className="btn btn-primary w-full"
      >
        Save Testimonials
      </motion.button>
    </motion.div>
  )
}

// Pricing Editor
function PricingEditor({ content, onSave }: any) {
  const [pricing, setPricing] = useState(content || { title: '', subtitle: '' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-dark mb-6">Pricing Section</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
          <input
            type="text"
            value={pricing.title}
            onChange={(e) => setPricing({ ...pricing, title: e.target.value })}
            placeholder="Enter title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
          <textarea
            value={pricing.subtitle}
            onChange={(e) => setPricing({ ...pricing, subtitle: e.target.value })}
            placeholder="Enter subtitle"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          onSave('pricing_title', pricing.title)
          onSave('pricing_subtitle', pricing.subtitle)
        }}
        className="mt-6 btn btn-primary w-full"
      >
        Save Pricing
      </motion.button>
    </motion.div>
  )
}

// Waitlist Editor
function WaitlistEditor({ content, onSave }: any) {
  const [waitlist, setWaitlist] = useState(content || { title: '', description: '' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-dark mb-6">Waitlist Section</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
          <input
            type="text"
            value={waitlist.title}
            onChange={(e) => setWaitlist({ ...waitlist, title: e.target.value })}
            placeholder="Enter title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={waitlist.description}
            onChange={(e) => setWaitlist({ ...waitlist, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          onSave('waitlist_title', waitlist.title)
          onSave('waitlist_description', waitlist.description)
        }}
        className="mt-6 btn btn-primary w-full"
      >
        Save Waitlist
      </motion.button>
    </motion.div>
  )
}

// Contact Editor
function ContactEditor({ content, onSave }: any) {
  const [contact, setContact] = useState(content || { title: '', description: '' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-dark mb-6">Contact Section</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Section Title</label>
          <input
            type="text"
            value={contact.title}
            onChange={(e) => setContact({ ...contact, title: e.target.value })}
            placeholder="Enter title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={contact.description}
            onChange={(e) => setContact({ ...contact, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          onSave('contact_title', contact.title)
          onSave('contact_description', contact.description)
        }}
        className="mt-6 btn btn-primary w-full"
      >
        Save Contact
      </motion.button>
    </motion.div>
  )
}

// Footer Editor
function FooterEditor({ content, onSave }: any) {
  const [footer, setFooter] = useState(content || { tagline: '', companySummary: '', madeWithText: '' })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-dark mb-6">Footer Content</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company Tagline</label>
          <input
            type="text"
            value={footer.tagline}
            onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
            placeholder="Oakstratton Solutions"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company Summary</label>
          <textarea
            value={footer.companySummary}
            onChange={(e) => setFooter({ ...footer, companySummary: e.target.value })}
            placeholder="Brief company description"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Made With Text (HTML allowed)</label>
          <textarea
            value={footer.madeWithText}
            onChange={(e) => setFooter({ ...footer, madeWithText: e.target.value })}
            placeholder="Made with ❤️ by Company"
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => onSave('footer_content', footer)}
        className="mt-6 btn btn-primary w-full"
      >
        Save Footer
      </motion.button>
    </motion.div>
  )
}
