import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'

interface EmailTemplate {
  id: string
  name: string
  category: 'waitlist_welcome' | 'contact_confirmation' | 'admin_alert'
  subject: string
  content: string
  variables: string[]
  isActive: boolean
}

const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Waitlist Welcome',
    category: 'waitlist_welcome',
    subject: 'Welcome to our waitlist!',
    content: '<h2>Welcome! 🎉</h2><p>Thanks for joining our waitlist. We\'ll keep you updated on our progress.</p>',
    variables: ['name', 'email', 'company'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Contact Confirmation',
    category: 'contact_confirmation',
    subject: 'Thanks for reaching out',
    content: '<h2>We received your message</h2><p>We\'ll get back to you within 24 hours.</p>',
    variables: ['name', 'email', 'company'],
    isActive: true,
  },
]

const VARIABLES = ['name', 'email', 'company', 'phone', 'date', 'support_email']

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { success, error: showError } = useAlert()

  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'>>({
    name: '',
    category: 'contact_confirmation',
    subject: '',
    content: '',
    variables: [],
    isActive: true,
  })

  const handleNewTemplate = () => {
    setFormData({
      name: '',
      category: 'contact_confirmation',
      subject: '',
      content: '',
      variables: [],
      isActive: true,
    })
    setSelectedTemplate(null)
    setIsCreating(true)
    setIsEditing(false)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      content: template.content,
      variables: template.variables,
      isActive: template.isActive,
    })
    setSelectedTemplate(template)
    setIsEditing(true)
    setIsCreating(false)
  }

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.subject || !formData.content) {
      showError('Please fill in all required fields')
      return
    }

    if (isCreating) {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...formData,
      }
      setTemplates([...templates, newTemplate])
      success('Template created successfully')
    } else if (selectedTemplate) {
      setTemplates(
        templates.map((t) => (t.id === selectedTemplate.id ? { ...selectedTemplate, ...formData } : t))
      )
      success('Template updated successfully')
    }

    setIsEditing(false)
    setIsCreating(false)
    setSelectedTemplate(null)
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
    success('Template deleted successfully')
  }

  const toggleVariable = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter((v) => v !== variable)
        : [...prev.variables, variable],
    }))
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-dark">Email Templates</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleNewTemplate}
            className="btn btn-primary"
          >
            ➕ New Template
          </motion.button>
        </div>

        {/* Templates List */}
        {!isEditing && !isCreating && (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ y: -8 }}
                className="card p-6 cursor-pointer border-2 border-transparent hover:border-primary-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-dark mb-1">{template.name}</h3>
                    <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 capitalize mb-2">
                      {template.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {template.isActive && (
                    <span className="text-lg">✓</span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.subject}</p>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 btn btn-outline text-sm"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="flex-1 btn btn-outline text-sm text-danger"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Template Editor */}
        <AnimatePresence>
          {(isEditing || isCreating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="card p-8"
            >
              <h3 className="text-2xl font-bold text-dark mb-6">
                {isCreating ? 'Create New Template' : 'Edit Template'}
              </h3>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Template Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Welcome Email"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="waitlist_welcome">Waitlist Welcome</option>
                    <option value="contact_confirmation">Contact Confirmation</option>
                    <option value="admin_alert">Admin Alert</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Welcome to our platform!"
                  />
                </div>

                {/* Variables */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-3">Available Variables</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {VARIABLES.map((variable) => (
                      <label key={variable} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.variables.includes(variable)}
                          onChange={() => toggleVariable(variable)}
                          className="cursor-pointer"
                        />
                        <span className="text-sm text-gray-700">{`{${variable}}`}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">Email Content</label>
                  <ReactQuill
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'image'],
                        ['clean'],
                      ],
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSaveTemplate}
                    className="btn btn-primary flex-1"
                  >
                    💾 Save Template
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setIsEditing(false)
                      setIsCreating(false)
                    }}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  )
}
