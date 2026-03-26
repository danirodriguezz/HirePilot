"use client"

import { useState, useEffect } from "react"

const JobDescriptionSection = ({ jobDescription, onUpdate }) => {
  const [description, setDescription] = useState(jobDescription || "")

  // Sincronizar estado local si la prop cambia desde el padre
  useEffect(() => {
    setDescription(jobDescription || "")
  }, [jobDescription])

  const handleChange = (e) => {
    const value = e.target.value
    setDescription(value)
    onUpdate(value) // Actualizar estado en Dashboard (padre)
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Oferta de Trabajo
          </label>
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
      </div>
    </div>
  )
}

export default JobDescriptionSection