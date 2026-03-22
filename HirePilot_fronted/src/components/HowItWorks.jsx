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
      title: "Crea tu cuenta y perfil",
      description: "Regístrate y rellena tu experiencia, estudios y proyectos. ¡Recuerda: cuanta más información proporciones, mejor será el resultado final!",
    },
    {
      number: 2,
      title: "Importa la oferta",
      description: "Pega la descripción exacta del puesto de trabajo al que quieres aplicar para que la IA sepa qué requisitos son los más importantes.",
    },
    {
      number: 3,
      title: "Configura el formato",
      description: "Elige la plantilla visual (template) que más te guste y selecciona el idioma en el que deseas que se redacte el currículum.",
    },
    {
      number: 4,
      title: "Genera con IA",
      description: "Haz clic en generar y la inteligencia artificial creará un CV completamente adaptado y optimizado para ese puesto de trabajo en segundos.",
    },
  ]

  return (
    <section id="como-funciona" className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo funciona la aplicación</h2>
          <p className="text-xl text-gray-600">Generar tu CV adaptado es un proceso muy sencillo</p>
        </div>

        {/* Cambiado a grid-cols-4 para acomodar los 4 pasos, o md:grid-cols-2 lg:grid-cols-4 para responsive */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Step key={index} number={step.number} title={step.title} description={step.description} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks