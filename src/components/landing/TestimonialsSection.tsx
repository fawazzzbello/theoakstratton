import { motion } from 'framer-motion'

const testimonials = [
  {
    quote:
      'Setup took just 3 days. Within 2 weeks we saw a 25% jump in average order value. Best investment we\'ve made.',
    author: 'Sarah Chen',
    role: 'Fashion Boutique Owner',
    rating: 5,
  },
  {
    quote:
      'Our cart abandonment dropped by 40%. Customers love having payment options. Highly recommend.',
    author: 'James Morrison',
    role: 'Furniture Shop Manager',
    rating: 5,
  },
  {
    quote:
      'I was worried about fees, but the extra sales completely offset them. We\'re keeping all providers we set up.',
    author: 'Maria Rodriguez',
    role: 'Home Decor Store Owner',
    rating: 5,
  },
  {
    quote:
      'The support team was fantastic. They helped us optimize our checkout flow and we saw immediate results.',
    author: 'David Park',
    role: 'Electronics Retailer',
    rating: 5,
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
    transition: { duration: 0.6 },
  },
}

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-light to-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Loved by Business Owners
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our customers say about their experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{
                y: -8,
                boxShadow: '0 20px 40px rgba(0,94,184,0.1)',
              }}
              className="card p-8 border-l-4 border-secondary-500 hover:border-primary-500 transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array(testimonial.rating)
                  .fill(null)
                  .map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-dark">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl text-white"
        >
          {[
            { value: '150+', label: 'Businesses Helped' },
            { value: '£2M+', label: 'Revenue Increased' },
            { value: '98%', label: 'Customer Satisfaction' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <p className="text-white/80">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
