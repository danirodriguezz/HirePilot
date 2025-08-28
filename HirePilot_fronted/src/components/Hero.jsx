"use client"
import { useNavigate } from "react-router-dom"
import { routes } from "../routes/routes";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // alert("¡Gracias por tu interés! Esta es una demo. Aquí se abriría el formulario de registro.")
    navigate(routes.register); // Redirige al usuario a la página de registro
  }

  const handleViewExample = () => {
    alert("Aquí se mostraría un ejemplo de CV personalizado.")
  }

  return (
    <section className="py-20 px-4 pt-32">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-block mb-6 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
          ✨ Aumenta tus posibilidades de contratación hasta un 300%
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Currículums que se
          <span className="text-emerald-600 block">adaptan a cada trabajo</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
          Personaliza tu CV automáticamente para cada oferta laboral. Nuestro servicio utiliza IA para optimizar tu
          currículum y destacar las habilidades más relevantes para cada posición.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
            onClick={handleGetStarted}
          >
            Personalizar mi CV
            <i className="fas fa-arrow-right"></i>
          </button>
          <button
            className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            onClick={handleViewExample}
          >
            Ver Ejemplo
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <i className="fas fa-users text-emerald-600"></i>
            +5,000 profesionales
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-star text-yellow-500"></i>
            4.9/5 valoración
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-chart-line text-emerald-600"></i>
            85% más entrevistas
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
