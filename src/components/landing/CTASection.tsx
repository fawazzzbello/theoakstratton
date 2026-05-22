import { motion } from 'framer-motion'

export default function CTASection() {
  return (
    <section id="contact" className="py-20 bg-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Boost Your Sales?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join 150+ businesses already using Oakstratton to increase sales and customer satisfaction
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255,199,44,0.3)' }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-lg bg-accent-500 text-dark hover:bg-accent-600 font-bold"
            >
              Get Early Access
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-lg border-2 border-white text-white hover:bg-white/10"
            >
              Schedule a Demo
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg"
          >
            <p className="text-sm opacity-75">
              ⚡ <span className="font-bold">Limited Time Offer:</span> Get setup and first month at 50% off if you
              sign up this week
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
