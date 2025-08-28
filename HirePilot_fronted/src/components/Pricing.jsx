"use client"

import { useEffect, useRef } from "react"

const PricingCard = ({ plan, price, period, features, isPopular, onSelectPlan }) => {
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
      className={`bg-white p-8 rounded-xl shadow-lg relative opacity-0 translate-y-8 ${
        isPopular ? "border-2 border-emerald-600" : "border-2 border-gray-200"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Más Popular</span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{plan}</h3>
        <div className="text-4xl font-bold text-gray-900">
          €{price}
          <span className="text-lg font-normal text-gray-500">/{period}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <i className="fas fa-check-circle text-emerald-600"></i>
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <button
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
          isPopular
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
        }`}
        onClick={() => onSelectPlan(plan)}
      >
        Elegir Plan
      </button>
    </div>
  )
}

const Pricing = () => {
  const plans = [
    {
      plan: "Básico",
      price: 29,
      period: "CV",
      features: ["1 CV personalizado", "Optimización ATS", "Entrega en 24h", "Soporte por email"],
      isPopular: false,
    },
    {
      plan: "Profesional",
      price: 79,
      period: "mes",
      features: [
        "5 CVs personalizados",
        "Optimización ATS avanzada",
        "Carta de presentación incluida",
        "Entrega en 12h",
        "Soporte prioritario",
      ],
      isPopular: true,
    },
    {
      plan: "Premium",
      price: 149,
      period: "mes",
      features: [
        "CVs ilimitados",
        "Optimización ATS premium",
        "Cartas personalizadas",
        "Entrega en 6h",
        "Consultoría 1:1",
      ],
      isPopular: false,
    },
  ]

  const handleSelectPlan = (planName) => {
    alert(`Has seleccionado el plan ${planName}. Esta es una demo. Aquí se abriría el proceso de pago.`)
  }

  return (
    <section id="precios" className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Planes que se adaptan a ti</h2>
          <p className="text-xl text-gray-600">Elige el plan perfecto para tu búsqueda de empleo</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan.plan}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              isPopular={plan.isPopular}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
