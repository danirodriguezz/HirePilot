"use client"

import { useState } from "react"

const LanguagesSection = ({ data, onUpdate }) => {
  const [languages, setLanguages] = useState(data)

  const proficiencyLevels = [
    { value: "basic", label: "Básico (A1-A2)" },
    { value: "intermediate", label: "Intermedio (B1-B2)" },
    { value: "advanced", label: "Avanzado (C1-C2)" },
    { value: "native", label: "Nativo" },
  ]

  const addLanguage = () => {
    const newLanguage = {
      id: Date.now(),
      name: "",
      proficiency: "intermediate",
      certificates: "",
    }
    const updatedLanguages = [...languages, newLanguage]
    setLanguages(updatedLanguages)
    onUpdate(updatedLanguages)
  }

  const updateLanguage = (id, field, value) => {
    const updatedLanguages = languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang))
    setLanguages(updatedLanguages)
    onUpdate(updatedLanguages)
  }

  const deleteLanguage = (id) => {
    const updatedLanguages = languages.filter((lang) => lang.id !== id)
    setLanguages(updatedLanguages)
    onUpdate(updatedLanguages)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Idiomas</h2>
          <p className="text-gray-600">Añade los idiomas que dominas</p>
        </div>
        <button
          onClick={addLanguage}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Añadir Idioma
        </button>
      </div>

      {languages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-language text-4xl mb-4"></i>
          <p>No has añadido idiomas aún</p>
          <p className="text-sm">Haz clic en "Añadir Idioma" para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map((language, index) => (
            <div key={language.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Idioma {index + 1}</h3>
                <button onClick={() => deleteLanguage(language.id)} className="text-red-600 hover:text-red-700 p-1">
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <input
                    type="text"
                    value={language.name}
                    onChange={(e) => updateLanguage(language.id, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Inglés, Francés, Alemán"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                  <select
                    value={language.proficiency}
                    onChange={(e) => updateLanguage(language.id, "proficiency", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {proficiencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certificados (opcional)</label>
                  <input
                    type="text"
                    value={language.certificates}
                    onChange={(e) => updateLanguage(language.id, "certificates", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: TOEFL 110, DELE C1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguagesSection
