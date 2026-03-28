"use client"

import { useState, useEffect } from "react"
import { experienceService, mapToBackend, mapToFrontend } from "../../services/experienceService"
import ConfirmModal from "../ui/ConfirmModal"
import CustomDatePicker from "../ui/CustomDatePicker"
import toast from "react-hot-toast"

const ExperienceSection = ({ data, onUpdate }) => {
  const [experiences, setExperiences] = useState(data)
  const [errors, setErrors] = useState({}) // Estado para manejar validaciones por ID de experiencia
  
  // Estado para el Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // 1. LÓGICA DE DIRTY STATE (Cambios sin guardar)
  const isExperienceDirty = (exp) => {
    const original = data.find(d => d.id === exp.id)
    if (!original) return true 
    return JSON.stringify(exp) !== JSON.stringify(original)
  }

  const isAnyDirty = experiences.some(isExperienceDirty)

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

  useEffect(() => {
    setExperiences(data)
    setErrors({}) // Limpiamos errores si vienen datos nuevos del servidor
  }, [data])

  // --- LÓGICA DE VALIDACIÓN ---
  const validateExperience = (exp) => {
    const newErrors = {}
    
    if (!exp.company || !exp.company.trim()) newErrors.company = "La empresa es obligatoria"
    if (!exp.position || !exp.position.trim()) newErrors.position = "El puesto es obligatorio"
    if (!exp.location || !exp.location.trim()) newErrors.location = "La ubicación es obligatoria"
    if (!exp.description || !exp.description.trim()) newErrors.description = "La descripción es obligatoria"
    if (!exp.startDate) newErrors.startDate = "La fecha de inicio es obligatoria"
    
    // La fecha final solo es obligatoria si NO es su trabajo actual
    if (!exp.current && !exp.endDate) {
      newErrors.endDate = "La fecha de fin es obligatoria"
    }

    return newErrors
  }

  // --- LÓGICA DE GUARDADO ---
  const handleSave = async (experienceLocal) => {
    // 1. SANITIZACIÓN (Limpieza de datos): 
    // Filtramos los logros que estén vacíos o solo contengan espacios
    const cleanedExperience = {
      ...experienceLocal,
      achievements: experienceLocal.achievements.filter(ach => ach && ach.trim() !== "")
    }

    // 2. Validar antes de guardar (usamos el objeto limpio)
    const fieldErrors = validateExperience(cleanedExperience)
    
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, [cleanedExperience.id]: fieldErrors }))
      toast.error("Por favor, corrige los errores marcados antes de guardar.")
      return
    }

    const saveAction = async () => {
      // 3. Mapeamos al backend usando los datos ya limpios
      const payload = mapToBackend(cleanedExperience)
      let savedDataBackend;

      if (cleanedExperience.id && typeof cleanedExperience.id === 'string' && cleanedExperience.id.startsWith('temp-')) {
         savedDataBackend = await experienceService.create(payload)
      } else {
         savedDataBackend = await experienceService.update(cleanedExperience.id, payload)
      }

      const savedDataFrontend = mapToFrontend(savedDataBackend)

      const newList = experiences.map(e => 
        e.id === cleanedExperience.id ? savedDataFrontend : e
      )
      setExperiences(newList)
      onUpdate(newList)

      // Limpiar errores para esta experiencia concreta tras guardar exitosamente
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[cleanedExperience.id]
        return newErrors
      })

      return savedDataFrontend
    }

    toast.promise(saveAction(), {
      loading: 'Guardando cambios...',
      success: '¡Experiencia guardada!',
      error: 'Error al guardar',
    })
  }

  // --- LÓGICA DE BORRADO ---
  const openDeleteModal = (id) => {
    setItemToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleteModalOpen(false)

    const id = itemToDelete
    const isTemp = typeof id === 'string' && id.startsWith('temp-')

    const deleteAction = async () => {
      if (!isTemp) {
        await experienceService.delete(id)
      }
      const newList = experiences.filter(e => e.id !== id)
      setExperiences(newList)
      onUpdate(newList)
      
      // Limpiar errores residuales de la experiencia borrada
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }

    if (isTemp) {
      deleteAction()
      toast.success("Borrador eliminado")
    } else {
      toast.promise(deleteAction(), {
        loading: 'Eliminando...',
        success: 'Experiencia eliminada',
        error: 'No se pudo eliminar',
      })
    }
    setItemToDelete(null)
  }

  // --- MANEJADORES DE ESTADO LOCAL ---
  const handleAddExperience = () => {
    const newExperience = {
      id: `temp-${Date.now()}`,
      company: "",
      position: "",
      location: "",
      description: "",
      startDate: "",
      endDate: "",
      current: false,
      achievements: [],
    }
    setExperiences([newExperience, ...experiences])
  }

  const handleChangeField = (id, field, value) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))

    // Limpieza dinámica de errores al escribir
    if (errors[id] && errors[id][field]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined }
      }))
    }
  }

  const handleAchievementChange = (expId, index, value) => {
    setExperiences(prev => prev.map(exp => {
      if (exp.id !== expId) return exp
      const newAch = [...exp.achievements]
      newAch[index] = value
      return { ...exp, achievements: newAch }
    }))
  }

  const handleAddAchievement = (expId) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === expId ? { ...exp, achievements: [...exp.achievements, ""] } : exp
    ))
  }

  const handleRemoveAchievement = (expId, index) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === expId ? { ...exp, achievements: exp.achievements.filter((_, i) => i !== index) } : exp
    ))
  }

  // Helper para generar las clases de los inputs dependiendo de si hay error o no
  const getInputClasses = (expId, fieldName) => `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
    ${errors[expId]?.[fieldName] 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
    }
  `

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 text-sm sm:text-base">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Experiencia Profesional</h2>
            <p className="text-gray-600">Añade tu experiencia laboral más relevante</p>
          </div>
          <button
            onClick={handleAddExperience}
            className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm"
          >
            <i className="fas fa-plus"></i>
            Añadir Experiencia
          </button>
        </div>

        <ConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="¿Eliminar experiencia?"
          message="Se eliminará permanentemente esta experiencia y sus logros."
        />

        {experiences.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-briefcase text-4xl mb-4"></i>
            <p>No has añadido experiencia profesional aún</p>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((experience, index) => {
              const isDirty = isExperienceDirty(experience);
              const expErrors = errors[experience.id] || {}; // Extraemos errores de esta tarjeta

              return (
                <div 
                  key={experience.id} 
                  className={`border rounded-lg p-6 relative transition-all duration-300 ${
                    isDirty ? "border-amber-400 ring-1 ring-amber-400/50 pb-24 md:pb-6" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Experiencia {experiences.length - index} 
                      {isDirty && <span className="ml-2 text-xs text-amber-600 font-normal italic">*Modificado</span>}
                    </h3>
                    <button
                        onClick={() => openDeleteModal(experience.id)}
                        className="text-red-600 hover:text-red-700 transition-colors p-2"
                        title="Eliminar experiencia"
                      >
                        <i className="fas fa-trash"></i>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={experience.company || ""}
                        onChange={(e) => handleChangeField(experience.id, "company", e.target.value)}
                        className={getInputClasses(experience.id, 'company')}
                        placeholder="Nombre de la empresa"
                      />
                      {expErrors.company && <p className="mt-1 text-xs text-red-500">{expErrors.company}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Puesto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={experience.position || ""}
                        onChange={(e) => handleChangeField(experience.id, "position", e.target.value)}
                        className={getInputClasses(experience.id, 'position')}
                        placeholder="Tu puesto"
                      />
                      {expErrors.position && <p className="mt-1 text-xs text-red-500">{expErrors.position}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={experience.location || ""}
                        onChange={(e) => handleChangeField(experience.id, "location", e.target.value)}
                        className={getInputClasses(experience.id, 'location')}
                        placeholder="Ej: Madrid, Remoto"
                      />
                      {expErrors.location && <p className="mt-1 text-xs text-red-500">{expErrors.location}</p>}
                    </div>
                    
                    <div className="hidden md:block"></div>

                    {/* FECHAS */}
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de inicio <span className="text-red-500">*</span>
                      </label>
                      <CustomDatePicker 
                        value={experience.startDate}
                        onChange={(val) => handleChangeField(experience.id, "startDate", val)}
                        showMonthYearPicker={true}
                        placeholder="Seleccionar inicio"
                        // Pasamos clase extra para el borde si falla
                        className={expErrors.startDate ? "border-red-300 bg-red-50" : ""}
                      />
                      {expErrors.startDate && <p className="mt-1 text-xs text-red-500">{expErrors.startDate}</p>}
                    </div>

                    {!experience.current ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de fin <span className="text-red-500">*</span>
                        </label>
                        <CustomDatePicker 
                          value={experience.endDate}
                          onChange={(val) => handleChangeField(experience.id, "endDate", val)}
                          showMonthYearPicker={true}
                          placeholder="Seleccionar fin"
                          minDate={experience.startDate ? new Date(experience.startDate) : null}
                          className={expErrors.endDate ? "border-red-300 bg-red-50" : ""}
                        />
                        {expErrors.endDate && <p className="mt-1 text-xs text-red-500">{expErrors.endDate}</p>}
                      </div>
                    ) : (
                      <div className="hidden md:block"></div>
                    )}

                    <div className="md:col-span-2 flex items-center mt-2">
                      <label className="flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={experience.current}
                          onChange={(e) => {
                              handleChangeField(experience.id, "current", e.target.checked);
                              if (e.target.checked) handleChangeField(experience.id, "endDate", "");
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Trabajo actual</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={experience.description || ""}
                      onChange={(e) => handleChangeField(experience.id, "description", e.target.value)}
                      rows={3}
                      className={getInputClasses(experience.id, 'description')}
                      placeholder="Describe tus responsabilidades..."
                    />
                    {expErrors.description && <p className="mt-1 text-xs text-red-500">{expErrors.description}</p>}
                  </div>

                  {/* Logros (Opcionales, no he añadido validación obligatoria aquí) */}
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logros destacados (Opcional)</label>
                      {experience.achievements.map((ach, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                              <input 
                                  type="text" 
                                  value={ach || ""} 
                                  onChange={(e) => handleAchievementChange(experience.id, i, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                                  placeholder="Ej: Aumenté las ventas un 20%..."
                              />
                              <button 
                                onClick={() => handleRemoveAchievement(experience.id, i)} 
                                className="text-gray-400 hover:text-red-500 transition-colors px-2"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                          </div>
                      ))}
                      <button 
                        onClick={() => handleAddAchievement(experience.id)} 
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-1 flex items-center gap-1"
                      >
                          <i className="fas fa-plus-circle"></i> Añadir logro
                      </button>
                  </div>
                  
                  {/* FOOTER DE LA TARJETA */}
                  <div className={`flex items-center justify-between transition-all duration-300
                      ${isDirty
                        ? "fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-amber-200 shadow-[0_-8px_15px_rgba(0,0,0,0.08)] md:static md:w-auto md:bg-amber-50/50 md:p-4 md:-mx-6 md:-mb-6 md:rounded-b-lg md:shadow-none mt-0 md:mt-6 md:border-t-0"
                        : "mt-6 pt-4 border-t border-gray-100"
                      }`}
                  >
                    <div>
                      {isDirty && (
                        <p className="text-amber-700 text-sm flex items-center animate-pulse font-medium">
                          <i className="fas fa-circle-exclamation mr-2"></i>
                          <span className="hidden sm:inline">Cambios sin guardar</span>
                          <span className="sm:hidden">Sin guardar</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSave(experience)}
                      disabled={!isDirty && experience.id && !experience.id.toString().startsWith('temp-')}
                      className={`
                          flex items-center gap-2 px-6 py-2.5 rounded-md text-white font-medium shadow-sm transition-all active:scale-95
                          ${!isDirty 
                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                            : 'bg-amber-600 hover:bg-amber-700 hover:shadow-md ring-2 ring-offset-1 ring-amber-600/30'
                          }
                        `}
                    >
                      <i className="fas fa-save"></i>
                      Guardar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ExperienceSection