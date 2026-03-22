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
      icon: "fas fa-user-circle",
      title: "Perfil Centralizado",
      description:
        "Almacena toda tu trayectoria profesional: experiencia, estudios y proyectos. Cuanta más información aportes, mejor materia prima tendrá la IA para trabajar.",
    },
    {
      icon: "fas fa-brain",
      title: "Motor de IA Integrado",
      description:
        "La Inteligencia artificial compara tu perfil completo con la descripción del puesto, extrayendo y resaltando únicamente lo que la empresa está buscando.",
    },
    {
      icon: "fas fa-file-export",
      title: "Exportación a Medida",
      description:
        "Elige entre distintas plantillas visuales y selecciona el idioma. La aplicación generará un documento PDF perfectamente formateado y listo para enviar.",
    },
  ]

  return (
    <section id="servicios" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">La tecnología detrás del proyecto</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hemos diseñado un flujo de trabajo que elimina la necesidad de reescribir tu CV para cada oferta.
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