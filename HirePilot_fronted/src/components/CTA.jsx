"use client"

const CTA = () => {
  const handleGetStarted = () => {
    alert("¡Gracias por tu interés! Esta es una demo. Aquí se abriría el formulario de registro.")
  }

  return (
    <section className="py-20 px-4 bg-emerald-600">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">¿Listo para conseguir más entrevistas?</h2>
        <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Únete a miles de profesionales que ya han mejorado sus oportunidades laborales con CVPro.
        </p>
        <button
          className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
          onClick={handleGetStarted}
        >
          Comenzar Ahora
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </section>
  )
}

export default CTA
