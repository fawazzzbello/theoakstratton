import { motion } from 'framer-motion'

const planTypes = [
  {
    name: 'Pay in 4',
    highlight: '0% Interest',
    terms: '4 equal fortnightly payments',
    stat: '65%',
    statLabel: 'of shoppers prefer this',
    description: 'The most popular BNPL format — ideal for everyday retail purchases',
    color: 'from-pink-500 to-rose-500',
    icon: '✂️',
  },
  {
    name: 'Monthly Instalments',
    highlight: '3–12 Months',
    terms: 'Spread costs over months',
    stat: '2.4×',
    statLabel: 'average order value uplift',
    description: 'Great for mid-range purchases where customers need breathing room',
    color: 'from-blue-500 to-cyan-500',
    icon: '📅',
  },
  {
    name: 'Extended Finance',
    highlight: '12–24 Months',
    terms: 'Longer-term credit options',
    stat: '£800+',
    statLabel: 'avg. basket size',
    description: 'Unlocks high-value sales for furniture, electronics, and more',
    color: 'from-yellow-500 to-orange-500',
    icon: '🏷️',
  },
  {
    name: 'Flexible Credit',
    highlight: 'Pay Anytime',
    terms: 'Revolving credit line',
    stat: '30%',
    statLabel: 'repeat purchase increase',
    description: 'Keeps customers coming back with a persistent credit balance',
    color: 'from-purple-500 to-indigo-500',
    icon: '🔄',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6 },
  },
}

export default function ProvidersSection() {
  return (
    <section id="providers" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            BNPL Plans That Convert
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Offer the right payment plan for every customer — from instant split payments to long-term finance
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {planTypes.map((plan, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="card p-8 border-2 border-gray-200 hover:border-primary-200 relative cursor-pointer transition-all"
            >
              <motion.div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.color}`}
                variants={{
                  initial: { scaleX: 0 },
                  hover: { scaleX: 1 },
                }}
                transition={{ duration: 0.3 }}
                style={{ originX: 0 }}
              />

              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{plan.icon}</span>
                <h3 className="text-xl font-bold text-dark">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-primary-500 mb-2">{plan.highlight}</div>
                <p className="text-sm text-gray-600">{plan.terms}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-bold text-dark">{plan.stat}</span>
                <span className="text-sm text-gray-600">{plan.statLabel}</span>
              </div>

              <p className="text-sm text-gray-600">{plan.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Strategy Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 p-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-100"
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <h4 className="text-2xl font-bold text-dark mb-2">Stack Plans for Maximum Conversion</h4>
              <p className="text-gray-600">
                Not sure which plan fits your customers best? We recommend offering 2–3 plan types
                to maximise choice and conversion. Our Growth tier includes A/B testing to
                automatically surface the best-performing combination for your store.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
