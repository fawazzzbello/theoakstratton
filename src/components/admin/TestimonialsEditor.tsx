import { useState } from 'react'
import { motion } from 'framer-motion'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  content: string
  image?: string
}

interface TestimonialsEditorProps {
  testimonials: Testimonial[]
  onTestimonialsChange: (testimonials: Testimonial[]) => void
  onSave: () => void
  isSaving: boolean
}

export default function TestimonialsEditor({
  testimonials,
  onTestimonialsChange,
  onSave,
  isSaving,
}: TestimonialsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: 'New Customer',
      role: 'Role',
      company: 'Company',
      content: 'Write testimonial here...',
      image: '',
    }
    onTestimonialsChange([...testimonials, newTestimonial])
  }

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    onTestimonialsChange(
      testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  const deleteTestimonial = (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      onTestimonialsChange(testimonials.filter((t) => t.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={addTestimonial}
        className="btn btn-primary btn-sm"
      >
        + Add Testimonial
      </motion.button>

      <div className="space-y-4">
        {testimonials.map((testimonial, idx) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 border-2 border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-semibold text-dark">
                Testimonial {idx + 1}
              </h4>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => deleteTestimonial(testimonial.id)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ✕
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={testimonial.name}
                onChange={(e) => updateTestimonial(testimonial.id, { name: e.target.value })}
                placeholder="Customer Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={testimonial.role}
                onChange={(e) => updateTestimonial(testimonial.id, { role: e.target.value })}
                placeholder="Role (e.g., CEO)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={testimonial.company}
                onChange={(e) => updateTestimonial(testimonial.id, { company: e.target.value })}
                placeholder="Company Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                value={testimonial.image || ''}
                onChange={(e) => updateTestimonial(testimonial.id, { image: e.target.value })}
                placeholder="Image URL"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <textarea
              value={testimonial.content}
              onChange={(e) => updateTestimonial(testimonial.id, { content: e.target.value })}
              placeholder="Testimonial text..."
              rows={3}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />

            {testimonial.image && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={onSave}
        disabled={isSaving}
        className="btn btn-primary w-full"
      >
        {isSaving ? 'Saving...' : 'Save All Testimonials'}
      </motion.button>
    </div>
  )
}
