import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import Papa from 'papaparse'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  phone: string
  source: 'waitlist' | 'contact' | 'payment'
  status: 'new' | 'contacted' | 'qualified' | 'customer'
  date: string
}

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', company: 'Acme Corp', phone: '0123456789', source: 'waitlist', status: 'new', date: '2024-05-22' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@test.com', company: 'Tech Inc', phone: '0987654321', source: 'contact', status: 'contacted', date: '2024-05-21' },
  { id: '3', name: 'Mike Chen', email: 'mike@business.com', company: 'Design Co', phone: '0112233445', source: 'payment', status: 'qualified', date: '2024-05-20' },
  { id: '4', name: 'Emma Davis', email: 'emma@startup.io', company: 'Startup LLC', phone: '0556677889', source: 'waitlist', status: 'customer', date: '2024-05-19' },
  { id: '5', name: 'Alex Brown', email: 'alex@company.com', company: 'Corp Solutions', phone: '0998877665', source: 'contact', status: 'new', date: '2024-05-18' },
  { id: '6', name: 'Lisa Wang', email: 'lisa@innovation.com', company: 'Innovation Lab', phone: '0334455667', source: 'contact', status: 'qualified', date: '2024-05-17' },
  { id: '7', name: 'Tom Harris', email: 'tom@retail.com', company: 'Retail Plus', phone: '0778899001', source: 'payment', status: 'customer', date: '2024-05-16' },
  { id: '8', name: 'Jessica Lee', email: 'jess@fashion.com', company: 'Fashion Boutique', phone: '0223344556', source: 'waitlist', status: 'contacted', date: '2024-05-15' },
]

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(MOCK_LEADS)
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | Lead['source']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Lead['status']>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const { success } = useAlert()

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

      return matchesSearch && matchesSource && matchesStatus
    })
  }, [leads, searchTerm, sourceFilter, statusFilter])

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id))
    }
  }

  const handleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    )
  }

  const exportCSV = () => {
    const dataToExport = selectedLeads.length > 0
      ? leads.filter((lead) => selectedLeads.includes(lead.id))
      : filteredLeads

    const csv = Papa.unparse(dataToExport)
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    success(`Exported ${dataToExport.length} leads`)
  }

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      customer: 'bg-green-100 text-green-800',
    }
    return colors[status]
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header with Filters */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sources</option>
              <option value="waitlist">Waitlist</option>
              <option value="contact">Contact</option>
              <option value="payment">Payment</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <span className="text-sm font-medium text-blue-900">
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={exportCSV}
                className="btn btn-primary btn-sm"
              >
                📥 Export Selected
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedLeads([])}
                className="btn btn-outline btn-sm"
              >
                Clear Selection
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Leads Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Company</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Source</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="border-b border-gray-100 hover:bg-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.company}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.date}</td>
                    <td className="px-6 py-4 text-right">
                      <motion.button whileHover={{ scale: 1.1 }} className="text-primary-500 hover:text-primary-700 font-semibold">
                        →
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">No leads found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>

        {/* Export All Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={exportCSV}
          disabled={filteredLeads.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📥 Export All {filteredLeads.length > 0 && `(${filteredLeads.length})`}
        </motion.button>
      </motion.div>
    </AdminLayout>
  )
}
