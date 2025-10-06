"use client"

import { useState } from "react"

const EducationSection = ({ data, onUpdate }) => {
  const [education, setEducation] = useState(data)

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      description: "",
    }
    const updatedEducation = [...education, newEducation]
    setEducation(updatedEducation)
    onUpdate(updatedEducation)
  }

  const updateEducation = (id, field, value) => {
    const updatedEducation = education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    setEducation(updatedEducation)
    onUpdate(updatedEducation)
  }

  const deleteEducation = (id) => {
    const updatedEducation = education.filter((edu) => edu.id !== id)
    setEducation(updatedEducation)
    onUpdate(updatedEducation)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Educación</h2>
          <p className="text-gray-600">Añade tu formación académica</p>
        </div>
        <button
          onClick={addEducation}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Añadir Educación
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-graduation-cap text-4xl mb-4"></i>
          <p>No has añadido información educativa aún</p>
          <p className="text-sm">Haz clic en "Añadir Educación" para empezar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={edu.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Educación {index + 1}</h3>
                <button onClick={() => deleteEducation(edu.id)} className="text-red-600 hover:text-red-700 p-2">
                  <i className="fas fa-trash"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institución</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Universidad o centro de estudios"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Licenciatura, Máster, Doctorado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campo de estudio</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Ingeniería Informática, Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ciudad, País"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
                  <input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Estudiando actualmente</span>
                    </label>
                  </div>

                  {!edu.current && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nota media (opcional)</label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: 8.5/10, Magna Cum Laude"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Materias relevantes, proyectos destacados, actividades extracurriculares..."
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

export default EducationSection
