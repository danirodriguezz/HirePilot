"use client"

import { useState, useEffect } from "react"
import Header from "../components/Header"
import Hero from "../components/Hero"
import Features from "../components/Features"
import HowItWorks from "../components/HowItWorks"
import Testimonials from "../components/Testimonials"
import Pricing from "../components/Pricing"
import CTA from "../components/CTA"
import Footer from "../components/Footer"
import { testimonialsData } from "../data/testimonialsData"
import { routes } from "../routes/routes.js"

function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header isScrolled={isScrolled} />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials
        testimonials={testimonialsData}
        title="Lo que dicen nuestros clientes"
        subtitle="Testimonios reales de profesionales que han transformado su carrera con CVPro"
        columns={3}
        showNavigation={true}
        autoplay={false}
      />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}

export default HomePage
