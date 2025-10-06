"use client"

import { useState } from "react"

const ExperienceSection = ({ data, onUpdate }) => {
  const [experiences, setExperiences] = useState(data)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [""],
    }
    const updatedExperiences = [...experiences, newExperience]
    setExperiences(updatedExperiences)
    onUpdate(updatedExperiences)
    setIsAddingNew(true)
  }

  const updateExperience = (id, field, value) => {
    const updatedExperiences = experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    setExperiences(updatedExperiences)
    onUpdate(updatedExperiences)
  }

  const deleteExperience = (id) => {
    const updatedExperiences = experiences.filter((exp) => exp.id !== id)
    setExperiences(updatedExperiences)
    onUpdate(updatedExperiences)
  }

  const addAchievement = (expId) => {
    const updatedExperiences = experiences.map((exp) =>
      exp.id === expId ? { ...exp, achievements: [...exp.achievements, ""] } : exp,
    )
    setExperiences(updatedExperiences)
    onUpdate(updatedExperiences)
  }

  const updateAchievement = (expId, achievementIndex, value) => {
    const updatedExperiences = experiences.map((exp) =>
      exp.id === expId
        ? {
            ...exp,
            achievements: exp.achievements.map((ach, index) => (index === achievementIndex ? value : ach)),
          }
        : exp,
    )
    setExperiences(updatedExperiences)
    onUpdate(updatedExperiences)
  }

  const removeAchievement = (expId, achievementIndex) => {
    const updatedExperiences = experiences.map((exp) =>
      exp.id === expId
        ? {
            ...exp,
            achievements: exp.achievements.filter((_, index) => index !== achievementIndex),
          }
        : exp,
    )
    setExperiences(updatedExperiences)
    onUpdate(updatedExperiences)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Experiencia Profesional</h2>
            <p className="text-gray-600">Añade tu experiencia laboral más relevante</p>
          </div>
          <button
            onClick={addExperience}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Añadir Experiencia
          </button>
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-briefcase text-4xl mb-4"></i>
            <p>No has añadido experiencia profesional aún</p>
            <p className="text-sm">Haz clic en "Añadir Experiencia" para empezar</p>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((experience, index) => (
              <div key={experience.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Experiencia {index + 1}</h3>
                  <button
                    onClick={() => deleteExperience(experience.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                    <input
                      type="text"
                      value={experience.company}
                      onChange={(e) => updateExperience(experience.id, "company", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
                    <input
                      type="text"
                      value={experience.position}
                      onChange={(e) => updateExperience(experience.id, "position", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Tu puesto de trabajo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <input
                      type="text"
                      value={experience.location}
                      onChange={(e) => updateExperience(experience.id, "location", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ciudad, País"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
                    <input
                      type="month"
                      value={experience.startDate}
                      onChange={(e) => updateExperience(experience.id, "startDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={experience.current}
                          onChange={(e) => updateExperience(experience.id, "current", e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Trabajo actual</span>
                      </label>

                      {!experience.current && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin</label>
                          <input
                            type="month"
                            value={experience.endDate}
                            onChange={(e) => updateExperience(experience.id, "endDate", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={experience.description}
                    onChange={(e) => updateExperience(experience.id, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Describe tus responsabilidades principales..."
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Logros y Responsabilidades</label>
                    <button
                      onClick={() => addAchievement(experience.id)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1"
                    >
                      <i className="fas fa-plus"></i>
                      Añadir logro
                    </button>
                  </div>

                  <div className="space-y-2">
                    {experience.achievements.map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => updateAchievement(experience.id, achievementIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Ej: Aumenté las ventas en un 25%..."
                        />
                        {experience.achievements.length > 1 && (
                          <button
                            onClick={() => removeAchievement(experience.id, achievementIndex)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ExperienceSection
