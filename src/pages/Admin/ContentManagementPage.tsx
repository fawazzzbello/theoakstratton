import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface ContentSection {
  [key: string]: string | object
}

interface LandingContent {
  [section: string]: ContentSection
}

const sections = [
  { id: 'hero', label: 'Hero (Slides)', fields: ['hero_content'], type: 'json' },
  { id: 'features', label: 'Features', fields: ['features_content'], type: 'json' },
  { id: 'providers', label: 'BNPL Providers', fields: ['providers_content'], type: 'json' },
  { id: 'pricing', label: 'Pricing', fields: ['pricing_title', 'pricing_subtitle'] },
  { id: 'waitlist', label: 'Waitlist Section', fields: ['waitlist_title', 'waitlist_description'] },
  { id: 'testimonials', label: 'Testimonials', fields: ['testimonials_content'], type: 'json' },
  { id: 'contact', label: 'Contact Form', fields: ['contact_title', 'contact_description'] },
  { id: 'cta', label: 'Call to Action', fields: ['cta_content'], type: 'json' },
  { id: 'footer', label: 'Footer', fields: ['footer_content'], type: 'json' },
]

export default function ContentManagementPage() {
  const [content, setContent] = useState<LandingContent>({})
  const [activeSection, setActiveSection] = useState('hero')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { success, error } = useAlert()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/landing-content')
      setContent(response.data)
    } catch (err) {
      error('Failed to fetch content')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleContentChange = (fieldKey: string, value: string) => {
    setContent({
      ...content,
      [activeSection]: {
        ...(content[activeSection] || {}),
        [fieldKey]: value,
      },
    })
  }

  const handleSave = async (fieldKey: string) => {
    try {
      setSaving(true)
      const value = content[activeSection]?.[fieldKey]
      await api.put(`/api/admin/landing-content/${fieldKey}`, {
        contentValue: value,
        contentType: 'text',
        sectionName: activeSection,
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

  const currentSection = sections.find((s) => s.id === activeSection)
  const currentContent = content[activeSection] || {}

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h2 className="text-3xl font-bold text-dark">Content Management</h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-2">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-primary-500 text-white font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ x: activeSection !== section.id ? 5 : 0 }}
                >
                  {section.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3 space-y-4">
            {currentSection && (
              <div className="card p-6">
                <h3 className="text-2xl font-bold text-dark mb-6">{currentSection.label}</h3>

                {currentSection.fields.map((fieldKey) => {
                  const isJsonField = fieldKey.includes('content')
                  const value = currentContent[fieldKey] as string || ''

                  return (
                    <motion.div key={fieldKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                        {fieldKey.replace(/_/g, ' ')}
                      </label>

                      {isJsonField ? (
                        <>
                          <textarea
                            value={value}
                            onChange={(e) => handleContentChange(fieldKey, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                            rows={10}
                            placeholder="Enter JSON array..."
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            {`💡 Paste valid JSON here. Eg: [{"id": 1, "name": "Item 1"}]`}
                          </p>
                        </>
                      ) : fieldKey.includes('description') ? (
                        <ReactQuill
                          value={value}
                          onChange={(val) => handleContentChange(fieldKey, val)}
                          theme="snow"
                          modules={{
                            toolbar: [['bold', 'italic', 'underline', 'link'], ['blockquote', 'code-block']],
                          }}
                          className="bg-white rounded-lg"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleContentChange(fieldKey, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleSave(fieldKey)}
                        disabled={saving}
                        className="mt-2 btn btn-primary btn-sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 bg-blue-50 border border-blue-200">
          <p className="text-blue-900">
            💡 <strong>Tip:</strong> Changes are saved immediately to the database and will be reflected on the landing page within moments.
          </p>
        </div>
      </motion.div>
    </AdminLayout>
  )
}
