import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  stat1: string
  stat2: string
  stat3: string
  backgroundType: 'gradient' | 'image'
  backgroundGradient?: string
  backgroundImage?: string
  displayOrder: number
}

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Help Your Customers Buy More',
    subtitle: 'Offer BNPL payment plans with zero upfront cost and immediate payment to you',
    stat1: '+30% Conversion Increase',
    stat2: '+40% Average Order Value',
    stat3: '7 days Setup Time',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    displayOrder: 0,
  },
  {
    id: '2',
    title: 'No Risk to You',
    subtitle: 'Get paid immediately while BNPL providers handle all credit risk and repayment',
    stat1: '100% Payment Guaranteed',
    stat2: '0% Credit Risk',
    stat3: '24hrs Settlement Time',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    displayOrder: 1,
  },
  {
    id: '3',
    title: 'Multiple Payment Options',
    subtitle: 'Let customers choose from Klarna, Clearpay, PayPal and card payments',
    stat1: '4+ Payment Methods',
    stat2: '50M+ Active Users',
    stat3: '$2B+ Transaction Volume',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    displayOrder: 2,
  },
]

export default function Hero3DSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await api.get('/api/landing-content')
      const content = response.data

      if (content.hero_content) {
        try {
          const parsedSlides = JSON.parse(content.hero_content)
          if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
            setSlides(parsedSlides)
          }
        } catch (e) {
          setSlides(defaultSlides)
        }
      }
    } catch (error) {
      console.error('Failed to fetch hero slides:', error)
      setSlides(defaultSlides)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loading) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [slides.length, loading])

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

  if (loading) {
    return (
      <section className="relative min-h-screen pt-20 bg-gradient-to-br from-primary-500 to-secondary-500 animate-pulse">
        <div className="relative container py-20 h-full flex flex-col justify-center">
          <div className="text-center text-white">
            <div className="h-16 bg-white/20 rounded mb-6 max-w-2xl mx-auto"></div>
            <div className="h-8 bg-white/20 rounded mb-12 max-w-2xl mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

  const slide = slides[current]

  if (!slide) {
    return (
      <section className="relative min-h-screen pt-20 bg-gradient-to-br from-primary-500 to-secondary-500 animate-pulse">
        <div className="relative container py-20 h-full flex flex-col justify-center">
          <div className="text-center text-white">
            <div className="h-16 bg-white/20 rounded mb-6 max-w-2xl mx-auto"></div>
            <div className="h-8 bg-white/20 rounded mb-12 max-w-2xl mx-auto"></div>
          </div>
        </div>
      </section>
    )
  }

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
          className="absolute inset-0"
          style={{
            background: slide.backgroundType === 'gradient'
              ? slide.backgroundGradient
              : `url(${slide.backgroundImage})`,
            backgroundSize: slide.backgroundType === 'image' ? 'cover' : 'auto',
            backgroundPosition: 'center',
          }}
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
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
            >
              {[slide.stat1, slide.stat2, slide.stat3].map((stat, idx) => {
                const [value, ...labelParts] = stat.split(' ')
                const label = labelParts.join(' ')
                return (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
                    <div className="text-sm opacity-90">{label}</div>
                  </div>
                )
              })}
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
