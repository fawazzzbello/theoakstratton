import { useState } from 'react'
import { motion } from 'framer-motion'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  stat1: string
  stat2: string
  stat3: string
  backgroundType: 'gradient' | 'image'
  backgroundGradient?: string
  backgroundImage?: string
  displayOrder: number
}

interface Props {
  slides: HeroSlide[]
  onSlidesChange: (slides: HeroSlide[]) => void
  onSave: () => void
  isSaving?: boolean
}

const defaultGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

export default function HeroSliderEditor({ slides, onSlidesChange, onSave, isSaving }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<HeroSlide>>({})

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      title: 'New Slide',
      subtitle: 'Enter your subtitle here',
      stat1: '100%',
      stat2: '24hrs',
      stat3: '40%',
      backgroundType: 'gradient',
      backgroundGradient: defaultGradients[0],
      displayOrder: slides.length,
    }
    onSlidesChange([...slides, newSlide])
  }

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingId(slide.id)
    setFormData(slide)
  }

  const handleUpdateSlide = () => {
    if (!editingId || !formData.title) return

    const updated = slides.map((s) =>
      s.id === editingId ? { ...s, ...formData } : s
    ) as HeroSlide[]
    onSlidesChange(updated)
    setEditingId(null)
    setFormData({})
  }

  const handleDeleteSlide = (id: string) => {
    if (window.confirm('Delete this slide?')) {
      onSlidesChange(slides.filter((s) => s.id !== id))
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({})
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={handleAddSlide}
        className="btn btn-primary w-full"
      >
        ➕ Add New Slide
      </motion.button>

      {/* Edit Form */}
      {editingId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-4 bg-blue-50 border border-blue-200"
        >
          <h4 className="font-bold text-lg text-dark">Editing Slide</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <label className="block text-sm font-semibold mb-2">Stat {n}</label>
                <input
                  type="text"
                  value={formData[`stat${n}` as keyof HeroSlide] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [`stat${n}`]: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Background Type</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="gradient"
                  checked={formData.backgroundType === 'gradient'}
                  onChange={(e) =>
                    setFormData({ ...formData, backgroundType: e.target.value as 'gradient' | 'image' })
                  }
                  className="mr-2"
                />
                Gradient
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="image"
                  checked={formData.backgroundType === 'image'}
                  onChange={(e) =>
                    setFormData({ ...formData, backgroundType: e.target.value as 'gradient' | 'image' })
                  }
                  className="mr-2"
                />
                Image URL
              </label>
            </div>
          </div>

          {formData.backgroundType === 'gradient' ? (
            <div>
              <label className="block text-sm font-semibold mb-2">Select Gradient</label>
              <div className="grid grid-cols-5 gap-2">
                {defaultGradients.map((grad) => (
                  <motion.button
                    key={grad}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setFormData({ ...formData, backgroundGradient: grad })}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      formData.backgroundGradient === grad
                        ? 'border-gray-800'
                        : 'border-gray-300'
                    }`}
                    style={{ background: grad }}
                  />
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold mb-2">Custom Gradient CSS:</p>
                <input
                  type="text"
                  value={formData.backgroundGradient || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, backgroundGradient: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-2">Image URL</label>
              <input
                type="text"
                value={formData.backgroundImage || ''}
                onChange={(e) =>
                  setFormData({ ...formData, backgroundImage: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          )}

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleUpdateSlide}
              className="btn btn-primary flex-1"
            >
              💾 Update Slide
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleCancel}
              className="btn btn-outline flex-1"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        <h4 className="font-bold text-lg text-dark">Slides ({slides.length})</h4>
        {slides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No slides yet. Create one to get started!</p>
        ) : (
          slides.map((slide) => (
            <motion.div
              key={slide.id}
              whileHover={{ y: -2 }}
              className="card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-16 h-12 rounded-lg flex-shrink-0 border"
                    style={{
                      background: slide.backgroundType === 'gradient' ? slide.backgroundGradient : `url(${slide.backgroundImage})`,
                      backgroundSize: 'cover',
                    }}
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-dark truncate">{slide.title}</h5>
                    <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleEditSlide(slide)}
                  className="btn btn-outline btn-sm"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleDeleteSlide(slide.id)}
                  className="btn btn-outline btn-sm text-red-500 hover:bg-red-50"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Save Button */}
      {slides.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onSave}
          disabled={isSaving}
          className="btn btn-primary w-full"
        >
          {isSaving ? 'Saving...' : '💾 Save All Changes'}
        </motion.button>
      )}
    </div>
  )
}
