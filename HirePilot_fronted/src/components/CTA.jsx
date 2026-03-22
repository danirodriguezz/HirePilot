"use client"
import { useNavigate } from "react-router-dom"
import { routes } from "../routes/routes"

const CTA = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(routes.register);
  }

  return (
    <section className="py-20 px-4 bg-emerald-600">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">¿Listo para probar el proyecto en vivo?</h2>
        <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Crea tu usuario ahora mismo, sube tus datos y experimenta de primera mano cómo la IA adapta tu perfil a cualquier oferta de trabajo.
        </p>
        <button
          className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
          onClick={handleGetStarted}
        >
          Crear una cuenta y probar
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </section>
  )
}

export default CTA