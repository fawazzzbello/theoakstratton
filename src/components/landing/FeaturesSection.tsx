import { motion } from 'framer-motion'

const features = [
  {
    icon: '🚀',
    title: 'Lightning Fast Setup',
    description: 'Get BNPL integrated in just 7 days. No complex technical requirements.',
  },
  {
    icon: '💰',
    title: 'Guaranteed Payment',
    description: 'Receive 100% payment within 24 hours. No chargeback risk to you.',
  },
  {
    icon: '🛡️',
    title: 'Zero Risk',
    description: 'BNPL providers handle all credit checks and repayment collection.',
  },
  {
    icon: '📈',
    title: 'Increase Revenue',
    description: 'Average order value increases by 40% with BNPL option.',
  },
  {
    icon: '🌍',
    title: 'Global Reach',
    description: 'Support customers in UK and expanding internationally.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    description: 'Track conversions, adoption rates, and revenue impact.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-light">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Why Choose Oakstratton?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to offer BNPL payment plans and boost your sales
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{
                y: -8,
                boxShadow: '0 20px 40px rgba(0,94,184,0.1)',
              }}
              className="card p-8 hover:border-primary-200 transition-all group cursor-pointer"
            >
              <motion.div
                className="text-5xl mb-4 group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 10, scale: 1.2 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
