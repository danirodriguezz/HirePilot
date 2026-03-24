"use client"
import { useNavigate } from "react-router-dom"
import { routes } from "../routes/routes";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(routes.register);
  }

  const handleViewRepo = () => {
    window.open("https://github.com/danirodriguezz/hirepilot", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-20 px-4 pt-32">
      <div className="container mx-auto text-center max-w-4xl">
        <div className="inline-block mb-6 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
          ✨ Proyecto Hackathon: Generación de CVs con IA
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Adapta tu Currículum a la 
          <span className="text-emerald-600 block">oferta ideal usando IA</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
          Una herramienta inteligente que analiza la descripción del puesto de trabajo al que quieres aplicar y reescribe tu currículum para destacar tu experiencia, estudios y proyectos más relevantes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center gap-2"
            onClick={handleGetStarted}
          >
            Probar la Aplicación
            <i className="fas fa-arrow-right"></i>
          </button>
          <button
            className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            onClick={handleViewRepo}
          >
            Ver Repositorio
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <i className="fas fa-database text-emerald-600"></i>
            Base de datos integral
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-brain text-yellow-500"></i>
            Procesamiento con IA
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-bolt text-emerald-600"></i>
            Generación en segundos
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero