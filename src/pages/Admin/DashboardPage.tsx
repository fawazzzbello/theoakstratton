import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/services/api'

const chartData = [
  { name: 'Mon', leads: 45, conversions: 12 },
  { name: 'Tue', leads: 52, conversions: 18 },
  { name: 'Wed', leads: 48, conversions: 15 },
  { name: 'Thu', leads: 61, conversions: 22 },
  { name: 'Fri', leads: 55, conversions: 19 },
  { name: 'Sat', leads: 67, conversions: 25 },
  { name: 'Sun', leads: 43, conversions: 14 },
]

const sourceData = [
  { name: 'Waitlist', value: 325, color: '#005EB8' },
  { name: 'Contact Form', value: 218, color: '#6A5ACD' },
  { name: 'Payment', value: 157, color: '#FFC72C' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 700,
    newThisWeek: 42,
    activeTemplates: 8,
    engagementRate: '68%',
    conversionRate: '24%',
    revenue: '£12,450',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/admin/dashboard')
        // Map response to stats
        setStats({
          totalLeads: response.data.total_leads || 700,
          newThisWeek: response.data.new_this_week || 42,
          activeTemplates: response.data.active_templates || 8,
          engagementRate: `${response.data.engagement_rate || 68}%`,
          conversionRate: '24%',
          revenue: '£12,450',
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const metricCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: '👥', trend: '+12%' },
    { label: 'New This Week', value: stats.newThisWeek, icon: '✨', trend: '+8%' },
    { label: 'Active Templates', value: stats.activeTemplates, icon: '📧', trend: '+2' },
    { label: 'Engagement Rate', value: stats.engagementRate, icon: '📈', trend: '+5%' },
    { label: 'Conversion Rate', value: stats.conversionRate, icon: '🎯', trend: '+3%' },
    { label: 'Revenue This Month', value: stats.revenue, icon: '💰', trend: '+18%' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <AdminLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Metric Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricCards.map((metric, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,94,184,0.1)' }}
              className="card p-6 border-l-4 border-primary-500 hover:border-secondary-500 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-dark">{metric.value}</p>
                </div>
                <span className="text-3xl group-hover:scale-125 transition-transform">{metric.icon}</span>
              </div>
              <p className="text-success text-sm font-medium">{metric.trend} from last week</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Leads & Conversions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1f36',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="leads" stroke="#005EB8" strokeWidth={2} dot={{ fill: '#005EB8' }} />
                <Line type="monotone" dataKey="conversions" stroke="#6A5ACD" strokeWidth={2} dot={{ fill: '#6A5ACD' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Leads by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1f36', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div variants={itemVariants} className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-dark">Recent Leads</h3>
            <motion.button whileHover={{ scale: 1.05 }} className="btn btn-outline text-sm">
              View All →
            </motion.button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'John Smith', email: 'john@example.com', company: 'Acme Corp', status: 'new', date: 'Today' },
                  { name: 'Sarah Johnson', email: 'sarah@test.com', company: 'Tech Inc', status: 'contacted', date: 'Yesterday' },
                  { name: 'Mike Chen', email: 'mike@business.com', company: 'Design Co', status: 'qualified', date: '2 days ago' },
                  { name: 'Emma Davis', email: 'emma@startup.io', company: 'Startup LLC', status: 'customer', date: '3 days ago' },
                  { name: 'Alex Brown', email: 'alex@company.com', company: 'Corp Solutions', status: 'new', date: '5 days ago' },
                ].map((lead, idx) => (
                  <motion.tr key={idx} whileHover={{ backgroundColor: '#f9fafb' }} className="border-b border-gray-100 hover:bg-light transition-colors cursor-pointer">
                    <td className="py-4 px-4">{lead.name}</td>
                    <td className="py-4 px-4 text-gray-600">{lead.email}</td>
                    <td className="py-4 px-4 text-gray-600">{lead.company}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : lead.status === 'qualified'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{lead.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  )
}
