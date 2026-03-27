"use client"

import { useState, useEffect } from "react"
import { skillService, mapToFrontendSkill, mapToBackendSkill } from "../../services/skillService"
import toast from "react-hot-toast"
import ConfirmModal from "../ui/ConfirmModal"

const SkillsSection = ({ data, onUpdate }) => {
  const [technicalSkills, setTechnicalSkills] = useState(data.technical || [])
  const [softSkills, setSoftSkills] = useState(data.soft || [])

  const [newTechnicalSkill, setNewTechnicalSkill] = useState("")
  const [newSoftSkill, setNewSoftSkill] = useState("")

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const skillLevels = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
    { value: "expert", label: "Experto" },
  ]

  // 1. LÓGICA DE DIRTY STATE (Solo para Habilidades Técnicas)
  const isTechnicalSkillDirty = (skill) => {
    const original = (data.technical || []).find(s => s.id === skill.id)
    if (!original) return true // Si no está en data, es nueva/modificada
    return skill.name !== original.name || skill.level !== original.level
  }

  const isAnyDirty = technicalSkills.some(isTechnicalSkillDirty)

  // Evitar cierre de pestaña accidental
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isAnyDirty) {
        e.preventDefault()
        e.returnValue = "" 
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isAnyDirty])

  // Cargar Habilidades
  useEffect(() => {
    setTechnicalSkills(data.technical || [])
    setSoftSkills(data.soft || [])
  }, [data])


  // --- LÓGICA: AÑADIR ---
  const addTechnicalSkill = async () => {
    if (!newTechnicalSkill.trim()) return

    const tempSkill = { name: newTechnicalSkill.trim(), level: "intermediate" }
    const payload = mapToBackendSkill(tempSkill, "technical")

    try {
      const savedData = await skillService.create(payload)
      const newSkillFrontend = mapToFrontendSkill(savedData)
      
      const newTechnicalList = [...technicalSkills, newSkillFrontend]
      setTechnicalSkills(newTechnicalList)
      
      onUpdate({
          technical: newTechnicalList,
          soft: softSkills 
      })

      setNewTechnicalSkill("")
      toast.success("Habilidad técnica añadida")
    } catch (error) {
      toast.error("Error al añadir habilidad")
    }
  }

  const addSoftSkill = async () => {
    if (!newSoftSkill.trim()) return

    const tempSkill = { name: newSoftSkill.trim(), level: "expert" } 
    const payload = mapToBackendSkill(tempSkill, "soft")

    try {
      const savedData = await skillService.create(payload)
      const newSkillFrontend = mapToFrontendSkill(savedData)
      
      const newSoftList = [...softSkills, newSkillFrontend]
      setSoftSkills(newSoftList)
      
      onUpdate({
          technical: technicalSkills,
          soft: newSoftList 
      })
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
    const payload = mapToBackendSkill(skill, "technical")
    
    try {
      await skillService.update(skill.id, payload)
      toast.success('Habilidad actualizada')
      
      onUpdate({
        technical: technicalSkills,
        soft: softSkills
      })

    } catch (error) {
      toast.error('Error al actualizar')
    }
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

    const updateAfterDelete = () => {
      const newTechList = technicalSkills.filter(s => s.id !== id)
      const newSoftList = softSkills.filter(s => s.id !== id)

      setTechnicalSkills(newTechList)
      setSoftSkills(newSoftList)

      onUpdate({
        technical: newTechList,
        soft: newSoftList
      })
    }

    if (typeof id !== 'number') {
        updateAfterDelete()
        return
    }

    try {
      await skillService.delete(id)
      updateAfterDelete()
      toast.success("Habilidad eliminada")
    } catch (error) {
      toast.error("Error al eliminar")
    }
    setItemToDelete(null)
  }

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault() 
      if (type === "technical") addTechnicalSkill()
      else addSoftSkill()
    }
  }

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
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Habilidades Técnicas</h2>
            <p className="text-gray-600">Añade tus competencias técnicas y herramientas</p>
          </div>
          {/* Indicador global opcional si hay cambios */}
          {isAnyDirty && (
            <span className="text-amber-600 text-xs font-medium animate-pulse hidden sm:flex items-center bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              <i className="fas fa-exclamation-circle mr-1"></i> Cambios sin guardar
            </span>
          )}
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTechnicalSkill}
              onChange={(e) => setNewTechnicalSkill(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "technical")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: JavaScript, Python, Photoshop..."
            />
            <button
              onClick={addTechnicalSkill}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
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
            {technicalSkills.map((skill) => {
              
              const isDirty = isTechnicalSkillDirty(skill);

              return (
                <div 
                  key={skill.id} 
                  // Adaptación responsiva: Las filas se vuelven columnas en móvil y se iluminan si hay cambios
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border rounded-lg transition-all duration-300 ${
                    isDirty 
                      ? "border-amber-400 ring-1 ring-amber-400/50 bg-amber-50/10 shadow-sm" 
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => handleUpdateLocal(skill.id, "name", e.target.value)}
                      className="w-full px-2 py-1.5 border border-transparent focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium hover:bg-gray-50 rounded"
                    />
                  </div>
                  
                  <div className="w-full sm:w-40">
                    <select
                      value={skill.level}
                      onChange={(e) => handleUpdateLocal(skill.id, "level", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    >
                      {skillLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Botones de acción alineados */}
                  <div className="flex w-full sm:w-auto justify-end items-center gap-2 mt-2 sm:mt-0 border-t sm:border-0 pt-3 sm:pt-0 border-gray-100">
                    
                    {isDirty && (
                      <span className="sm:hidden text-amber-600 text-xs italic mr-auto">
                        *Sin guardar
                      </span>
                    )}

                    <button 
                        onClick={() => saveUpdatedSkill(skill)} 
                        disabled={!isDirty && skill.id}
                        className={`transition-colors flex items-center justify-center gap-2 rounded px-3 py-1.5 sm:p-2 sm:px-2
                          ${isDirty 
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm w-full sm:w-auto' 
                            : 'text-emerald-600 hover:bg-emerald-50 bg-transparent opacity-50 cursor-not-allowed sm:opacity-100'
                          }
                        `}
                        title="Guardar cambios"
                    >
                      <i className="fas fa-save"></i>
                      {/* Texto visible en móvil para hacer el botón más "clicable" */}
                      {isDirty && <span className="sm:hidden font-medium text-sm">Guardar</span>}
                    </button>

                    <button 
                        onClick={() => openDeleteModal(skill.id)} 
                        className="text-red-600 hover:bg-red-50 p-1.5 sm:p-2 rounded transition-colors"
                        title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Habilidades Blandas (Se mantiene igual, sin estado "Dirty") */}
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
              onKeyDown={(e) => handleKeyDown(e, "soft")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Ej: Liderazgo, Comunicación..."
            />
            <button
              onClick={addSoftSkill}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
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
                    className="text-emerald-600 hover:text-emerald-800 focus:outline-none"
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