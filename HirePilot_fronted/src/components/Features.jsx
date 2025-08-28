"use client"

import { useEffect, useRef } from "react"

const FeatureCard = ({ icon, title, description }) => {
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up")
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    } 

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 opacity-0 translate-y-8"
    >
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-6">
        <i className={icon}></i>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

const Features = () => {
  const features = [
    {
      icon: "fas fa-bullseye",
      title: "Adaptación Inteligente",
      description:
        "Analizamos cada oferta de trabajo y ajustamos tu CV para destacar las habilidades y experiencias más relevantes.",
    },
    {
      icon: "fas fa-bolt",
      title: "Optimización ATS",
      description:
        "Optimizamos tu currículum para superar los sistemas de seguimiento de candidatos (ATS) que usan las empresas.",
    },
    {
      icon: "fas fa-chart-line",
      title: "Resultados Medibles",
      description:
        "Nuestros clientes obtienen 3x más entrevistas y aumentan sus posibilidades de contratación significativamente.",
    },
  ]

  return (
    <section id="servicios" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué personalizar tu currículum?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cada trabajo es único. Tu currículum también debería serlo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
