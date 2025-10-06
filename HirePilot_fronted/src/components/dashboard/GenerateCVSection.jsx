"use client"

import { useState } from "react"

const GenerateCVSection = ({ userData, onGenerate, isGenerating }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [selectedLanguage, setSelectedLanguage] = useState("es")

  const templates = [
    {
      id: "modern",
      name: "Moderno",
      description: "Diseño limpio y profesional",
      preview: "/placeholder.svg?height=200&width=150&text=Moderno",
    },
    {
      id: "classic",
      name: "Clásico",
      description: "Formato tradicional y elegante",
      preview: "/placeholder.svg?height=200&width=150&text=Clásico",
    },
    {
      id: "creative",
      name: "Creativo",
      description: "Para profesionales del diseño",
      preview: "/placeholder.svg?height=200&width=150&text=Creativo",
    },
  ]

  const languages = [
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
  ]

  const handleGenerate = () => {
    const generationData = {
      ...userData,
      template: selectedTemplate,
      language: selectedLanguage,
    }
    onGenerate(generationData.jobDescription)
  }

  const getCompletionPercentage = () => {
    let completed = 0
    const total = 7

    if (userData.profile.firstName && userData.profile.lastName) completed++
    if (userData.experience.length > 0) completed++
    if (userData.education.length > 0) completed++
    if (userData.skills.technical.length > 0 || userData.skills.soft.length > 0) completed++
    if (userData.languages.length > 0) completed++
    if (userData.jobDescription.trim()) completed++
    if (userData.profile.summary.trim()) completed++

    return Math.round((completed / total) * 100)
  }

  const completionPercentage = getCompletionPercentage()
  const canGenerate = completionPercentage >= 60 && userData.jobDescription.trim()

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Generar CV Personalizado</h2>
        <p className="text-gray-600">Selecciona el template y configuración para generar tu CV optimizado</p>
      </div>

      {/* Progress Check */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Completitud del perfil</span>
          <span
            className={`text-sm font-semibold ${completionPercentage >= 60 ? "text-green-600" : "text-orange-600"}`}
          >
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              completionPercentage >= 60 ? "bg-green-500" : "bg-orange-500"
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {completionPercentage >= 60
            ? "¡Perfil completo! Listo para generar CV"
            : "Completa más secciones para mejores resultados"}
        </p>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Selecciona un Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="text-center">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-32 object-cover rounded mb-3 bg-gray-100"
                />
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Idioma del CV</h3>
        <div className="flex gap-3">
          {languages.map((language) => (
            <label
              key={language.code}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                selectedLanguage === language.code
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="language"
                value={language.code}
                checked={selectedLanguage === language.code}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="sr-only"
              />
              <span className="font-medium">{language.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Requirements Check */}
      {!canGenerate && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
            <div>
              <h4 className="font-medium text-yellow-800">Requisitos para generar CV</h4>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {!userData.jobDescription.trim() && <li>• Añade la descripción del puesto de trabajo</li>}
                {completionPercentage < 60 && <li>• Completa al menos el 60% de tu perfil</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-3 ${
            canGenerate && !isGenerating
              ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generando CV personalizado...
            </>
          ) : (
            <>
              <i className="fas fa-magic text-xl"></i>
              Generar CV Personalizado
            </>
          )}
        </button>
      </div>

      {canGenerate && !isGenerating && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">El proceso tomará aproximadamente 30-60 segundos</p>
          <p className="text-xs text-gray-500 mt-1">Recibirás tu CV optimizado por email una vez completado</p>
        </div>
      )}
    </div>
  )
}

export default GenerateCVSection
