"use client"

import { useState } from "react"

const JobDescriptionSection = ({ jobDescription, onUpdate }) => {
  const [description, setDescription] = useState(jobDescription)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const handleChange = (e) => {
    const value = e.target.value
    setDescription(value)
    onUpdate(value)
  }

  const analyzeJobDescription = async () => {
    if (!description.trim()) return

    setIsAnalyzing(true)
    try {
      // Simular análisis de la descripción del trabajo
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockAnalysis = {
        keywords: ["JavaScript", "React", "Node.js", "MongoDB", "Agile", "Team collaboration"],
        requirements: [
          "3+ años de experiencia en desarrollo web",
          "Conocimiento en frameworks modernos",
          "Experiencia con bases de datos",
          "Habilidades de comunicación",
        ],
        recommendations: [
          "Destaca tu experiencia con React en tu CV",
          "Menciona proyectos con Node.js",
          "Incluye ejemplos de trabajo en equipo",
        ],
      }

      setAnalysis(mockAnalysis)
    } catch (error) {
      console.error("Error analizando descripción:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Descripción del Puesto</h2>
        <p className="text-gray-600">
          Pega aquí la descripción del trabajo al que quieres aplicar para personalizar tu CV
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del trabajo</label>
          <textarea
            value={description}
            onChange={handleChange}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Pega aquí la descripción completa del puesto de trabajo, incluyendo requisitos, responsabilidades y cualificaciones deseadas..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {description.length} caracteres • Cuanto más detallada sea la descripción, mejor será la personalización
          </p>
        </div>

        {description.trim() && (
          <div className="flex gap-3">
            <button
              onClick={analyzeJobDescription}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analizando...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  Analizar Descripción
                </>
              )}
            </button>
          </div>
        )}

        {analysis && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              <i className="fas fa-lightbulb mr-2"></i>
              Análisis de la Oferta
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Palabras Clave</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.map((keyword, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-800 mb-2">Requisitos Clave</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {analysis.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <i className="fas fa-check text-xs mt-1"></i>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-blue-800 mb-2">Recomendaciones</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <i className="fas fa-star text-xs mt-1"></i>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDescriptionSection
