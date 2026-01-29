"use client"

import { useState, useEffect } from "react" // Importar useEffect

const JobDescriptionSection = ({ jobDescription, onUpdate }) => {
  const [description, setDescription] = useState(jobDescription || "")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  // NUEVO: Sincronizar estado local si la prop cambia desde el padre
  useEffect(() => {
    setDescription(jobDescription || "")
  }, [jobDescription])

  const handleChange = (e) => {
    const value = e.target.value
    setDescription(value)
    onUpdate(value) // Actualizar estado en Dashboard (padre)
  }

  // ... (El resto de la lógica de análisis mockup se puede mantener o quitar según prefieras)
  const analyzeJobDescription = async () => {
    if (!description.trim()) return

    setIsAnalyzing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // Mock analysis...
      setAnalysis({
        keywords: ["Python", "Django", "React", "REST API"],
        requirements: ["Experiencia backend", "Inglés B2"],
        recommendations: ["Resalta tus proyectos API", "Menciona uso de Docker"]
      })
    } catch (error) {
      console.error("Error analizando:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Descripción del Puesto</h2>
        <p className="text-gray-600">
          Pega aquí la descripción del trabajo al que quieres aplicar.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Oferta de Trabajo</label>
          <textarea
            value={description}
            onChange={handleChange}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ej: Buscamos desarrollador Full Stack con experiencia en React y Python..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {description.length} caracteres
          </p>
        </div>

        {/* Botón opcional de análisis previo */}
        {description.trim() && (
          <div className="flex gap-3">
             <button
              onClick={analyzeJobDescription}
              disabled={isAnalyzing}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <i className="fas fa-search-plus"></i>
              {isAnalyzing ? "Analizando palabras clave..." : "Analizar palabras clave (Opcional)"}
            </button>
          </div>
        )}

        {/* Visualización del análisis mock (opcional) */}
        {analysis && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
            <strong>Keywords detectadas:</strong> {analysis.keywords.join(", ")}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDescriptionSection