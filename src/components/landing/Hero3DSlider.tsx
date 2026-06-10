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
    stat3: '72hrs Settlement Time',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    displayOrder: 1,
  },
  {
    id: '3',
    title: 'Multiple Payment Options',
    subtitle: 'Offer every major payment format — from split payments to extended credit terms',
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
    }, 10000)
    return () => clearInterval(timer)
  }, [slides.length, loading])

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length)
  }

  const loadingSlot = (
    <section className="relative min-h-[100svh] pt-16 bg-gradient-to-br from-primary-500 to-secondary-500 flex flex-col">
      <div className="relative container flex-1 flex flex-col justify-center py-8 animate-pulse">
        <div className="text-center text-white">
          <div className="h-10 sm:h-14 bg-white/20 rounded mb-4 max-w-xl mx-auto" />
          <div className="h-6 bg-white/20 rounded mb-8 max-w-md mx-auto" />
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-white/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )

  if (loading) return loadingSlot

  const slide = slides[current]
  if (!slide) return loadingSlot

  return (
    <section id="hero" className="relative min-h-[100svh] pt-16 overflow-hidden flex flex-col">
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
            background:
              slide.backgroundType === 'gradient'
                ? slide.backgroundGradient
                : `url(${slide.backgroundImage})`,
            backgroundSize: slide.backgroundType === 'image' ? 'cover' : 'auto',
            backgroundPosition: 'center',
          }}
        />

        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-10 right-10 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"
        />
      </div>

      {/* Content */}
      <div className="relative container flex-1 flex flex-col justify-center py-8 md:py-16 px-4 sm:px-6 lg:px-8">
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
              opacity: { duration: 0.4 },
            }}
            className="text-center text-white z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-base sm:text-xl md:text-2xl opacity-90 mb-6 md:mb-10 max-w-2xl mx-auto px-2"
            >
              {slide.subtitle}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 md:mb-10 max-w-2xl mx-auto"
            >
              {[slide.stat1, slide.stat2, slide.stat3].map((stat, idx) => {
                const [value, ...labelParts] = stat.split(' ')
                const label = labelParts.join(' ')
                return (
                  <div
                    key={idx}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 sm:p-5 md:p-6 hover:bg-white/20 transition-all"
                  >
                    <div className="text-xl sm:text-3xl md:text-4xl font-bold mb-1">{value}</div>
                    <div className="text-xs sm:text-sm opacity-90 leading-tight">{label}</div>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-3 mt-6 md:mt-8">
          {slides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > current ? 1 : -1)
                setCurrent(idx)
              }}
              animate={{
                width: idx === current ? 32 : 8,
                backgroundColor:
                  idx === current ? '#ffffff' : 'rgba(255,255,255,0.5)',
              }}
              className="h-2 rounded-full transition-all cursor-pointer"
              whileHover={{ scale: 1.2 }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <motion.button
          whileHover={{ scale: 1.1, x: -3 }}
          onClick={() => paginate(-1)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm"
          aria-label="Previous slide"
        >
          ←
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, x: 3 }}
          onClick={() => paginate(1)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm"
          aria-label="Next slide"
        >
          →
        </motion.button>
      </div>
    </section>
  )
}
