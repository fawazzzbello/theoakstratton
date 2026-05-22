import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'

interface ReportData {
  metric: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

const MONTHLY_DATA = [
  { month: 'Jan', leads: 1240, conversions: 298, revenue: 12690, cac: 42.5 },
  { month: 'Feb', leads: 1380, conversions: 345, revenue: 14662, cac: 40.0 },
  { month: 'Mar', leads: 1520, conversions: 410, revenue: 17425, cac: 37.1 },
  { month: 'Apr', leads: 1890, conversions: 512, revenue: 21760, cac: 36.8 },
  { month: 'May', leads: 2240, conversions: 634, revenue: 26945, cac: 35.3 },
  { month: 'Jun', leads: 2650, conversions: 743, revenue: 31603, cac: 35.7 },
]

const COHORT_DATA = [
  { weekCohort: 'Week 1', day0: 100, day7: 85, day14: 72, day21: 65, day28: 58, day35: 52 },
  { weekCohort: 'Week 2', day0: 120, day7: 98, day14: 82, day21: 74, day28: 68, day35: 62 },
  { weekCohort: 'Week 3', day0: 145, day7: 125, day14: 108, day21: 97, day28: 88 },
  { weekCohort: 'Week 4', day0: 160, day7: 142, day14: 124, day21: 113 },
  { weekCohort: 'Week 5', day0: 188, day7: 168, day14: 151 },
]

const CONVERSION_FUNNEL = [
  { stage: 'Leads', count: 2650, percentage: 100 },
  { stage: 'Contacted', count: 1890, percentage: 71.3 },
  { stage: 'Qualified', count: 1245, percentage: 46.9 },
  { stage: 'Customers', count: 743, percentage: 28.0 },
]

const CHANNEL_DATA = [
  { name: 'Waitlist', value: 45, fill: '#005EB8' },
  { name: 'Contact Form', value: 28, fill: '#6A5ACD' },
  { name: 'Payment', value: 18, fill: '#FFC72C' },
  { name: 'Referral', value: 9, fill: '#10B981' },
]

export default function ReportingPage() {
  const { success } = useAlert()
  const [reportType, setReportType] = useState<'summary' | 'cohort' | 'channel' | 'custom'>('summary')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')

  const handleExportReport = () => {
    const report = {
      type: reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      data: MONTHLY_DATA,
    }
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`)
    element.setAttribute('download', `report-${reportType}-${dateRange}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    success('Report exported successfully')
  }

  const summaryMetrics: ReportData[] = [
    { metric: 'Total Revenue', value: 124085, change: 18.5, trend: 'up' },
    { metric: 'Conversion Rate', value: 28, change: 4.2, trend: 'up' },
    { metric: 'Avg Lead Value', value: 46.8, change: -2.1, trend: 'down' },
    { metric: 'Customer LTV', value: 1240, change: 12.3, trend: 'up' },
  ]

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-dark">Advanced Reporting</h2>
            <p className="text-gray-600 mt-2">Comprehensive business intelligence and analytics</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleExportReport}
            className="btn btn-primary flex items-center gap-2"
          >
            📥 Export Report
          </motion.button>
        </div>

        {/* Report Type Selection */}
        <div className="flex gap-2 flex-wrap">
          {(['summary', 'cohort', 'channel', 'custom'] as const).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === type
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'summary' && '📊 Summary'}
              {type === 'cohort' && '📈 Cohort Analysis'}
              {type === 'channel' && '🌐 Channel Attribution'}
              {type === 'custom' && '⚙️ Custom'}
            </motion.button>
          ))}
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'custom'] as const).map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                dateRange === range ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : range === '90d' ? 'Last 90 days' : 'Custom'}
            </motion.button>
          ))}
        </div>

        {reportType === 'summary' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryMetrics.map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card p-6 border-l-4 border-primary-500"
                >
                  <p className="text-gray-600 text-sm mb-2">{metric.metric}</p>
                  <p className="text-3xl font-bold text-dark mb-3">
                    {metric.metric === 'Total Revenue' && `£${metric.value.toLocaleString()}`}
                    {metric.metric === 'Conversion Rate' && `${metric.value}%`}
                    {metric.metric === 'Avg Lead Value' && `£${metric.value.toFixed(2)}`}
                    {metric.metric === 'Customer LTV' && `£${metric.value.toLocaleString()}`}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      metric.trend === 'up'
                        ? 'text-success'
                        : metric.trend === 'down'
                          ? 'text-danger'
                          : 'text-gray-500'
                    }`}
                  >
                    {metric.trend === 'up' && '↑'} {metric.trend === 'down' && '↓'} {Math.abs(metric.change)}%{' '}
                    {metric.trend === 'up' ? 'increase' : metric.trend === 'down' ? 'decrease' : 'stable'}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Revenue and Conversion Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h3 className="text-xl font-bold text-dark mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={MONTHLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f36',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value) => `£${(value as number).toLocaleString()}`}
                    />
                    <Bar dataKey="revenue" fill="#005EB8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h3 className="text-xl font-bold text-dark mb-4">Conversions & CAC</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={MONTHLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#9ca3af" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f36',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="conversions"
                      stroke="#6A5ACD"
                      strokeWidth={2}
                      dot={{ fill: '#6A5ACD' }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cac"
                      stroke="#FFC72C"
                      strokeWidth={2}
                      dot={{ fill: '#FFC72C' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Conversion Funnel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
              <h3 className="text-xl font-bold text-dark mb-6">Conversion Funnel</h3>
              <div className="space-y-4">
                {CONVERSION_FUNNEL.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-semibold text-dark">{stage.stage}</div>
                    <div className="flex-1 bg-gray-100 rounded-full overflow-hidden h-8">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-end pr-3"
                      >
                        <span className="text-white text-xs font-bold">{stage.percentage.toFixed(1)}%</span>
                      </motion.div>
                    </div>
                    <div className="w-20 text-right text-sm font-semibold text-dark">{stage.count.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {reportType === 'cohort' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="text-2xl font-bold text-dark mb-6">Cohort Retention Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cohort</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Day 0</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Day 7</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Day 14</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Day 21</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Day 28</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Day 35</th>
                  </tr>
                </thead>
                <tbody>
                  {COHORT_DATA.map((cohort, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-light transition-colors">
                      <td className="px-4 py-3 font-semibold text-dark">{cohort.weekCohort}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{cohort.day0}</td>
                      <td className="px-4 py-3 text-center bg-blue-50 rounded">
                        {cohort.day7} <span className="text-xs text-gray-500">({((cohort.day7 / cohort.day0) * 100).toFixed(0)}%)</span>
                      </td>
                      <td className="px-4 py-3 text-center bg-blue-50 rounded">
                        {cohort.day14} <span className="text-xs text-gray-500">({((cohort.day14 / cohort.day0) * 100).toFixed(0)}%)</span>
                      </td>
                      <td className="px-4 py-3 text-center bg-blue-50 rounded">
                        {cohort.day21} <span className="text-xs text-gray-500">({((cohort.day21 / cohort.day0) * 100).toFixed(0)}%)</span>
                      </td>
                      <td className="px-4 py-3 text-center bg-blue-50 rounded">
                        {cohort.day28 ? (
                          <>
                            {cohort.day28} <span className="text-xs text-gray-500">({((cohort.day28 / cohort.day0) * 100).toFixed(0)}%)</span>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-center bg-blue-50 rounded">
                        {cohort.day35 ? (
                          <>
                            {cohort.day35} <span className="text-xs text-gray-500">({((cohort.day35 / cohort.day0) * 100).toFixed(0)}%)</span>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {reportType === 'channel' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div className="card p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Leads by Channel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={CHANNEL_DATA} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value}%)`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {CHANNEL_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1f36', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="card p-6">
              <h3 className="text-xl font-bold text-dark mb-4">Channel Metrics</h3>
              <div className="space-y-4">
                {CHANNEL_DATA.map((channel, idx) => (
                  <div key={idx} className="p-4 bg-light rounded-lg border-l-4" style={{ borderColor: channel.fill }}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-dark">{channel.name}</p>
                      <p className="text-lg font-bold" style={{ color: channel.fill }}>
                        {channel.value}%
                      </p>
                    </div>
                    <div className="w-full bg-white rounded-full overflow-hidden h-2">
                      <div
                        style={{ width: `${channel.value * 2}%`, backgroundColor: channel.fill }}
                        className="h-full transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {reportType === 'custom' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
            <h3 className="text-2xl font-bold text-dark mb-6">Custom Report Builder</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark mb-3">Select Metrics</label>
                <div className="space-y-2">
                  {['Total Revenue', 'Conversion Rate', 'Lead Volume', 'CAC', 'LTV', 'Retention Rate'].map((metric) => (
                    <label key={metric} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-light rounded">
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                      <span className="text-sm text-gray-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-3">Group By</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>By Channel</option>
                </select>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} className="btn btn-primary mt-6">
              Generate Custom Report
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  )
}
