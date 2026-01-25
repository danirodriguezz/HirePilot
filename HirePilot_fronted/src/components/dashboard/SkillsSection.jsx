"use client"

import { useState, useEffect } from "react"
import { skillService } from "../../services/skillService"
import toast from "react-hot-toast"
import ConfirmModal from "../ui/ConfirmModal"

// --- MAPPERS ---
// Convertimos los valores del select (lowercase) a lo que espera Django (UPPERCASE)
const mapToBackend = (skill, type) => ({
  name: skill.name,
  skill_type: type === "technical" ? "TECHNICAL" : "SOFT",
  // Si es soft skill, el nivel por defecto es intermedio (aunque no se muestre)
  level: skill.level ? skill.level.toUpperCase() : "INTERMEDIATE" 
})

const mapToFrontend = (apiData) => ({
  id: apiData.id,
  name: apiData.name,
  level: apiData.level.toLowerCase(), // Backend: BEGINNER -> Front: beginner
  type: apiData.skill_type // TECHNICAL o SOFT
})

const SkillsSection = () => {
  // Estado separado para facilitar la gestión visual
  const [technicalSkills, setTechnicalSkills] = useState([])
  const [softSkills, setSoftSkills] = useState([])
  const [loading, setLoading] = useState(true)

  // Inputs para nuevas habilidades
  const [newTechnicalSkill, setNewTechnicalSkill] = useState("")
  const [newSoftSkill, setNewSoftSkill] = useState("")

  // Estado para Modal de borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Opciones de nivel
  const skillLevels = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
    { value: "expert", label: "Experto" },
  ]

  // 1. Cargar Habilidades
  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const data = await skillService.getAll()
      const formatted = data.map(mapToFrontend)
      
      // Separamos en dos listas
      setTechnicalSkills(formatted.filter(s => s.type === 'TECHNICAL'))
      setSoftSkills(formatted.filter(s => s.type === 'SOFT'))
    } catch (err) {
      console.error(err)
      toast.error("Error cargando habilidades")
    } finally {
      setLoading(false)
    }
  }

  // --- LÓGICA: AÑADIR ---
  const addTechnicalSkill = async () => {
    if (!newTechnicalSkill.trim()) return

    const tempSkill = { name: newTechnicalSkill.trim(), level: "intermediate" }
    const payload = mapToBackend(tempSkill, "technical")

    try {
      const savedData = await skillService.create(payload)
      setTechnicalSkills([...technicalSkills, mapToFrontend(savedData)])
      setNewTechnicalSkill("")
      toast.success("Habilidad técnica añadida")
    } catch (error) {
      toast.error("Error al añadir habilidad")
    }
  }

  const addSoftSkill = async () => {
    if (!newSoftSkill.trim()) return

    const tempSkill = { name: newSoftSkill.trim(), level: "expert" } // Nivel dummy para soft
    const payload = mapToBackend(tempSkill, "soft")

    try {
      const savedData = await skillService.create(payload)
      setSoftSkills([...softSkills, mapToFrontend(savedData)])
      setNewSoftSkill("")
      toast.success("Habilidad blanda añadida")
    } catch (error) {
      toast.error("Error al añadir habilidad")
    }
  }

  // --- LÓGICA: ACTUALIZAR (Solo Técnicas) ---
  const handleUpdateLocal = (id, field, value) => {
    setTechnicalSkills(prev => prev.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ))
  }

  const saveUpdatedSkill = async (skill) => {
    const payload = mapToBackend(skill, "technical")
    toast.promise(skillService.update(skill.id, payload), {
      loading: 'Actualizando...',
      success: 'Habilidad actualizada',
      error: 'Error al actualizar'
    })
  }

  // --- LÓGICA: BORRAR ---
  const openDeleteModal = (id) => {
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleteModalOpen(false)
    const id = itemToDelete

    // Función auxiliar para actualizar el estado correcto
    const removeFromState = () => {
      setTechnicalSkills(prev => prev.filter(s => s.id !== id))
      setSoftSkills(prev => prev.filter(s => s.id !== id))
    }

    // Si es ID temporal (string), solo borramos del estado
    if (typeof id !== 'number') {
        removeFromState()
        return
    }

    try {
      await skillService.delete(id)
      removeFromState()
      toast.success("Habilidad eliminada")
    } catch (error) {
      toast.error("Error al eliminar")
    }
    setItemToDelete(null)
  }

  const handleKeyPress = (e, type) => {
    if (e.key === "Enter") {
      if (type === "technical") addTechnicalSkill()
      else addSoftSkill()
    }
  }

  if (loading) return <div>Cargando habilidades...</div>

  return (
    <div className="space-y-6">
      
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar habilidad?"
        message="Esta acción no se puede deshacer."
      />

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
              placeholder="Ej: JavaScript, Python, Photoshop..."
            />
            <button
              onClick={addTechnicalSkill}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        {technicalSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-cogs text-3xl mb-3"></i>
            <p>No has añadido habilidades técnicas aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {technicalSkills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => handleUpdateLocal(skill.id, "name", e.target.value)}
                    className="w-full px-2 py-1 border-0 focus:outline-none font-medium hover:bg-gray-50 rounded"
                  />
                </div>
                <div className="w-40">
                  <select
                    value={skill.level}
                    onChange={(e) => handleUpdateLocal(skill.id, "level", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                  >
                    {skillLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Botón de Guardar Individual para Técnicas */}
                <button 
                    onClick={() => saveUpdatedSkill(skill)} 
                    className="text-emerald-600 hover:text-emerald-700 p-1"
                    title="Guardar cambios"
                >
                  <i className="fas fa-save"></i>
                </button>

                <button 
                    onClick={() => openDeleteModal(skill.id)} 
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Eliminar"
                >
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
          <p className="text-gray-600">Añade tus competencias interpersonales</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "soft")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Liderazgo, Comunicación..."
            />
            <button
              onClick={addSoftSkill}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        {softSkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-users text-3xl mb-3"></i>
            <p>No has añadido habilidades blandas aún</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full border border-emerald-200"
              >
                <span className="text-sm font-medium">{skill.name}</span>
                <button 
                    onClick={() => openDeleteModal(skill.id)} 
                    className="text-emerald-600 hover:text-emerald-800"
                >
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