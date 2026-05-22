import { motion } from 'framer-motion'

const providers = [
  {
    name: 'Klarna',
    fee: '2.49% + 30p',
    terms: '3-4 monthly payments',
    users: '150M+',
    description: 'Best for fashion, lifestyle, and home goods',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Clearpay',
    fee: '4-6%',
    terms: '4 fortnightly payments',
    users: '20M+',
    description: 'Perfect for retail and beauty',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'PayPal Pay Later',
    fee: '~2.9%',
    terms: '4 installments',
    users: '100M+',
    description: 'For existing PayPal merchants',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    name: 'Stripe Installments',
    fee: '5.99-29.99% APR',
    terms: '3-24 months',
    users: '50M+',
    description: 'Flexible terms for any business',
    color: 'from-purple-500 to-indigo-500',
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
            Top BNPL Providers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from the leading payment providers or we can set up multiple for you
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {providers.map((provider, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{
                y: -12,
                boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
              }}
              className="card p-8 border-2 border-transparent hover:border-primary-200 transition-all group relative overflow-hidden"
            >
              {/* Gradient background on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className={`absolute inset-0 bg-gradient-to-br ${provider.color} -z-10`}
              />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-dark mb-2 group-hover:text-white transition-colors">
                  {provider.name}
                </h3>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary-500 group-hover:text-white transition-colors mb-2">
                    {provider.fee}
                  </div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-100 transition-colors">
                    {provider.terms}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👥</span>
                  <span className="text-sm text-gray-600 group-hover:text-gray-100 transition-colors">
                    {provider.users} users
                  </span>
                </div>

                <p className="text-gray-600 group-hover:text-gray-100 transition-colors text-sm mb-6">
                  {provider.description}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn btn-primary bg-primary-500 text-white hover:bg-primary-600"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Custom Setup Info */}
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
              <h4 className="text-2xl font-bold text-dark mb-2">Custom Combinations</h4>
              <p className="text-gray-600">
                Not sure which provider is best? We recommend setting up 2-3 providers to maximize
                customer choice and conversion rates. Our Growth plan includes A/B testing to find
                the best combination for your business.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
