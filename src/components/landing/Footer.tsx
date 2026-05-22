import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    Product: ['Features', 'Pricing', 'Providers', 'Security'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Cookies', 'Compliance'],
    Social: [
      { name: 'LinkedIn', url: '#' },
      { name: 'Twitter', url: '#' },
      { name: 'Instagram', url: '#' },
      { name: 'Email', url: 'mailto:support@oakstratton.com' },
    ],
  }

  return (
    <footer className="bg-dark text-gray-300 border-t border-gray-800">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <h3 className="text-2xl font-bold text-gradient mb-2">Oakstratton</h3>
            <p className="text-sm text-gray-400">
              Helping small businesses grow with modern BNPL solutions
            </p>
          </motion.div>

          {/* Links */}
          {Object.entries(links).slice(0, 3).map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx + 1) * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4">{section[0]}</h4>
              <ul className="space-y-2">
                {section[1].map((link, lidx) => (
                  <li key={lidx}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-3">
              {links.Social.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="w-10 h-10 bg-white/10 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors text-sm font-bold"
                  title={social.name}
                >
                  {social.name[0]}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Oakstratton Ltd. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {links.Legal.map((link, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-white/5 rounded-lg text-center text-xs text-gray-400"
        >
          Made with ❤️ by Oakstratton. Helping small businesses compete globally.
        </motion.div>
      </div>
    </footer>
  )
}
