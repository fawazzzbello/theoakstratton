import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    price: '£299',
    description: 'One-time setup fee',
    features: [
      'Provider recommendation',
      'One provider setup',
      'Staff training (30 min)',
      '30-day support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Growth',
    price: '£599',
    description: 'One-time setup fee',
    features: [
      '2-3 provider setup',
      'A/B test optimization',
      'Analytics setup',
      '90-day support',
      '1 check-in call',
      'Performance review',
    ],
    cta: 'Choose Plan',
    popular: true,
  },
  {
    name: 'Premium',
    price: '£999 + £99/mo',
    description: 'Full BNPL stack',
    features: [
      'Full provider setup (3+)',
      'Custom checkout optimization',
      'Monthly performance reviews',
      'Priority 24/7 support',
      'Dedicated account manager',
      'Advanced analytics',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-light">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business needs
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{
                y: plan.popular ? -20 : -8,
                boxShadow: plan.popular
                  ? '0 40px 80px rgba(0,94,184,0.2)'
                  : '0 20px 40px rgba(0,0,0,0.1)',
              }}
              className={`card relative transition-all ${
                plan.popular
                  ? 'border-2 border-primary-500 shadow-lg scale-105 md:scale-100 md:md:scale-110'
                  : 'border-2 border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-dark mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-gradient mb-2">{plan.price}</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full btn btn-lg mb-8 ${
                    plan.popular
                      ? 'btn-primary'
                      : 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50'
                  }`}
                >
                  {plan.cta}
                </motion.button>

                <div className="space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <motion.div
                      key={fidx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: fidx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-2xl">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-dark mb-8 text-center">Got Questions?</h3>
          <div className="space-y-4">
            {[
              {
                q: 'Do you offer custom pricing?',
                a: 'Yes! For enterprise needs or large volumes, we offer custom packages.',
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Absolutely. Change your plan anytime with prorated billing.',
              },
              {
                q: 'What about ongoing fees?',
                a: 'Only the Growth and Premium plans have ongoing fees. Starter is one-time only.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors"
              >
                <p className="font-bold text-dark mb-2">{faq.q}</p>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
