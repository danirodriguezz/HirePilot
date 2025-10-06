"use client"

import { useState } from "react"

const SkillsSection = ({ data, onUpdate }) => {
  const [skills, setSkills] = useState(data)
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("")
  const [newSoftSkill, setNewSoftSkill] = useState("")

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim()) {
      const updatedSkills = {
        ...skills,
        technical: [...skills.technical, { id: Date.now(), name: newTechnicalSkill.trim(), level: "intermediate" }],
      }
      setSkills(updatedSkills)
      onUpdate(updatedSkills)
      setNewTechnicalSkill("")
    }
  }

  const addSoftSkill = () => {
    if (newSoftSkill.trim()) {
      const updatedSkills = {
        ...skills,
        soft: [...skills.soft, { id: Date.now(), name: newSoftSkill.trim() }],
      }
      setSkills(updatedSkills)
      onUpdate(updatedSkills)
      setNewSoftSkill("")
    }
  }

  const updateTechnicalSkill = (id, field, value) => {
    const updatedSkills = {
      ...skills,
      technical: skills.technical.map((skill) => (skill.id === id ? { ...skill, [field]: value } : skill)),
    }
    setSkills(updatedSkills)
    onUpdate(updatedSkills)
  }

  const removeTechnicalSkill = (id) => {
    const updatedSkills = {
      ...skills,
      technical: skills.technical.filter((skill) => skill.id !== id),
    }
    setSkills(updatedSkills)
    onUpdate(updatedSkills)
  }

  const removeSoftSkill = (id) => {
    const updatedSkills = {
      ...skills,
      soft: skills.soft.filter((skill) => skill.id !== id),
    }
    setSkills(updatedSkills)
    onUpdate(updatedSkills)
  }

  const skillLevels = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
    { value: "expert", label: "Experto" },
  ]

  const handleKeyPress = (e, type) => {
    if (e.key === "Enter") {
      if (type === "technical") {
        addTechnicalSkill()
      } else {
        addSoftSkill()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Habilidades Técnicas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Habilidades Técnicas</h2>
          <p className="text-gray-600">Añade tus competencias técnicas y herramientas</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTechnicalSkill}
              onChange={(e) => setNewTechnicalSkill(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "technical")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: JavaScript, Python, Adobe Photoshop..."
            />
            <button
              onClick={addTechnicalSkill}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        {skills.technical.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-cogs text-3xl mb-3"></i>
            <p>No has añadido habilidades técnicas aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.technical.map((skill) => (
              <div key={skill.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateTechnicalSkill(skill.id, "name", e.target.value)}
                    className="w-full px-2 py-1 border-0 focus:outline-none font-medium"
                  />
                </div>
                <div className="w-40">
                  <select
                    value={skill.level}
                    onChange={(e) => updateTechnicalSkill(skill.id, "level", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  >
                    {skillLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={() => removeTechnicalSkill(skill.id)} className="text-red-600 hover:text-red-700 p-1">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habilidades Blandas */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Habilidades Blandas</h2>
          <p className="text-gray-600">Añade tus competencias interpersonales y de liderazgo</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "soft")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Liderazgo, Comunicación, Trabajo en equipo..."
            />
            <button
              onClick={addSoftSkill}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        {skills.soft.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-users text-3xl mb-3"></i>
            <p>No has añadido habilidades blandas aún</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.soft.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full border border-emerald-200"
              >
                <span className="text-sm font-medium">{skill.name}</span>
                <button onClick={() => removeSoftSkill(skill.id)} className="text-emerald-600 hover:text-emerald-800">
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SkillsSection
