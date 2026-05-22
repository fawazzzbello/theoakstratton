import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'

interface WaitlistLead {
  id: string
  email: string
  name: string
  company: string
  joinedDate: string
  lastSeen: string
  status: 'active' | 'dormant' | 'converted'
  engagementScore: number
}

const WAITLIST_LEADS: WaitlistLead[] = [
  { id: '1', email: 'john@example.com', name: 'John Smith', company: 'Acme Corp', joinedDate: '2024-05-01', lastSeen: '2024-05-22', status: 'active', engagementScore: 85 },
  { id: '2', email: 'sarah@test.com', name: 'Sarah Johnson', company: 'Tech Inc', joinedDate: '2024-04-15', lastSeen: '2024-05-20', status: 'active', engagementScore: 72 },
  { id: '3', email: 'mike@business.com', name: 'Mike Chen', company: 'Design Co', joinedDate: '2024-03-20', lastSeen: '2024-04-10', status: 'dormant', engagementScore: 35 },
  { id: '4', email: 'emma@startup.io', name: 'Emma Davis', company: 'Startup LLC', joinedDate: '2024-02-01', lastSeen: '2024-05-22', status: 'converted', engagementScore: 95 },
  { id: '5', email: 'alex@company.com', name: 'Alex Brown', company: 'Corp Solutions', joinedDate: '2024-05-10', lastSeen: '2024-05-21', status: 'active', engagementScore: 68 },
  { id: '6', email: 'lisa@innovation.com', name: 'Lisa Wang', company: 'Innovation Lab', joinedDate: '2024-03-01', lastSeen: '2024-03-15', status: 'dormant', engagementScore: 28 },
  { id: '7', email: 'tom@retail.com', name: 'Tom Harris', company: 'Retail Plus', joinedDate: '2024-01-15', lastSeen: '2024-05-22', status: 'converted', engagementScore: 92 },
  { id: '8', email: 'jess@fashion.com', name: 'Jessica Lee', company: 'Fashion Boutique', joinedDate: '2024-04-22', lastSeen: '2024-05-19', status: 'active', engagementScore: 78 },
]

export default function WaitlistPage() {
  const [segment, setSegment] = useState<'all' | 'active' | 'dormant' | 'converted'>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const { success } = useAlert()

  const filteredLeads = useMemo(() => {
    if (segment === 'all') return WAITLIST_LEADS
    return WAITLIST_LEADS.filter((lead) => lead.status === segment)
  }, [segment])

  const stats = {
    total: WAITLIST_LEADS.length,
    active: WAITLIST_LEADS.filter((l) => l.status === 'active').length,
    dormant: WAITLIST_LEADS.filter((l) => l.status === 'dormant').length,
    converted: WAITLIST_LEADS.filter((l) => l.status === 'converted').length,
  }

  const sendEmailToSegment = () => {
    const target = selectedLeads.length > 0 ? selectedLeads.length : filteredLeads.length
    success(`Email queued to ${target} lead${target !== 1 ? 's' : ''}`)
    setSelectedLeads([])
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id))
    }
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Waitlist', value: stats.total, color: 'from-blue-500 to-blue-600' },
            { label: 'Active', value: stats.active, color: 'from-green-500 to-green-600' },
            { label: 'Dormant', value: stats.dormant, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Converted', value: stats.converted, color: 'from-purple-500 to-purple-600' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`card p-6 bg-gradient-to-br ${stat.color} text-white`}
            >
              <p className="text-white/80 text-sm mb-2">{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Segment Selector */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Waitlist', value: 'all' },
              { label: 'Active (Last 30 Days)', value: 'active' },
              { label: 'Dormant (No Activity)', value: 'dormant' },
              { label: 'Converted', value: 'converted' },
            ].map((seg) => (
              <motion.button
                key={seg.value}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSegment(seg.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  segment === seg.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-light border border-gray-300 text-gray-700 hover:border-primary-500'
                }`}
              >
                {seg.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 bg-blue-50 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">
                {selectedLeads.length} selected
              </span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={sendEmailToSegment}
                  className="btn btn-primary btn-sm"
                >
                  📧 Send Email
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedLeads([])}
                  className="btn btn-outline btn-sm"
                >
                  Clear
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Waitlist Table */}
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
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Company</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Last Seen</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Engagement</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
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
                        onChange={() =>
                          setSelectedLeads((prev) =>
                            prev.includes(lead.id)
                              ? prev.filter((id) => id !== lead.id)
                              : [...prev, lead.id]
                          )
                        }
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.company}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.joinedDate}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.lastSeen}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${lead.engagementScore}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                          />
                        </div>
                        <span className="text-sm font-bold text-primary-500">{lead.engagementScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : lead.status === 'dormant'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-600">No leads in this segment</p>
            </div>
          )}
        </div>

        {/* Bulk Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={sendEmailToSegment}
          disabled={filteredLeads.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📧 Send Email to Segment ({filteredLeads.length})
        </motion.button>
      </motion.div>
    </AdminLayout>
  )
}
