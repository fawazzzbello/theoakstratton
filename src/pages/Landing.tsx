import Navbar from '@/components/landing/Navbar'
import Hero3DSlider from '@/components/landing/Hero3DSlider'
import FeaturesSection from '@/components/landing/FeaturesSection'
import ProvidersSection from '@/components/landing/ProvidersSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero3DSlider />
      <FeaturesSection />
      <ProvidersSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
