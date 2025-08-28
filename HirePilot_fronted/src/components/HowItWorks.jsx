"use client"

import { useEffect, useRef } from "react"

const Step = ({ number, title, description }) => {
  const stepRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in-up")
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    if (stepRef.current) {
      observer.observe(stepRef.current)
    }

    return () => {
      if (stepRef.current) {
        observer.unobserve(stepRef.current)
      }
    }
  }, [])

  return (
    <div ref={stepRef} className="text-center opacity-0 translate-y-8">
      <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Sube tu CV",
      description: "Carga tu currículum actual y completa tu perfil profesional con toda tu experiencia y habilidades.",
    },
    {
      number: 2,
      title: "Comparte la oferta",
      description: "Envíanos el enlace o descripción de la oferta de trabajo a la que quieres aplicar.",
    },
    {
      number: 3,
      title: "Recibe tu CV optimizado",
      description: "En 24 horas recibes tu currículum personalizado y optimizado para esa posición específica.",
    },
  ]

  return (
    <section id="como-funciona" className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo funciona</h2>
          <p className="text-xl text-gray-600">Proceso simple en 3 pasos</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Step key={index} number={step.number} title={step.title} description={step.description} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
