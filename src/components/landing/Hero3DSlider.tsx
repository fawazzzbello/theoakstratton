import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Slide {
  id: number
  title: string
  subtitle: string
  stat1: { value: string; label: string }
  stat2: { value: string; label: string }
  stat3: { value: string; label: string }
  gradient: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Help Your Customers Buy More',
    subtitle: 'Offer BNPL payment plans with zero upfront cost and immediate payment to you',
    stat1: { value: '+30%', label: 'Conversion Increase' },
    stat2: { value: '+40%', label: 'Average Order Value' },
    stat3: { value: '7 days', label: 'Setup Time' },
    gradient: 'from-primary-500 to-secondary-500',
  },
  {
    id: 2,
    title: 'No Risk to You',
    subtitle: 'Get paid immediately while BNPL providers handle all credit risk and repayment',
    stat1: { value: '100%', label: 'Payment Guaranteed' },
    stat2: { value: '0%', label: 'Credit Risk' },
    stat3: { value: '24hrs', label: 'Settlement Time' },
    gradient: 'from-secondary-500 to-primary-500',
  },
  {
    id: 3,
    title: 'Multiple Payment Options',
    subtitle: 'Let customers choose from Klarna, Clearpay, PayPal and card payments',
    stat1: { value: '4+', label: 'Payment Methods' },
    stat2: { value: '50M+', label: 'Active Users' },
    stat3: { value: '$2B+', label: 'Transaction Volume' },
    gradient: 'from-accent-500 via-primary-500 to-secondary-500',
  },
]

export default function Hero3DSlider() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length)
  }

  const slide = slides[current]

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
        />

        {/* Animated orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative container py-20 h-full flex flex-col justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 },
            }}
            className="text-center text-white z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl mx-auto"
            >
              {slide.subtitle}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
            >
              {[slide.stat1, slide.stat2, slide.stat3].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all"
                >
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col md:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg bg-white text-primary-500 hover:bg-gray-100"
              >
                Get Early Access
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-lg border-2 border-white text-white hover:bg-white/10"
              >
                Schedule Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-3 mt-20">
          {slides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1)
                setCurrent(idx)
              }}
              animate={{
                width: idx === current ? 32 : 8,
                backgroundColor: idx === current ? '#ffffff' : 'rgba(255,255,255,0.5)',
              }}
              className="h-2 rounded-full transition-all cursor-pointer"
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          onClick={() => paginate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
        >
          ←
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, x: 5 }}
          onClick={() => paginate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
        >
          →
        </motion.button>
      </div>
    </section>
  )
}
