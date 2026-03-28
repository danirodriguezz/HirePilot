"use client"

import { useState, useEffect } from "react"
import { educationService, mapToBackend, mapToFrontendEducation } from "../../services/educationService"
import ConfirmModal from "../ui/ConfirmModal"
import CustomDatePicker from "../ui/CustomDatePicker"
import toast from "react-hot-toast"

const EducationSection = ({ data, onUpdate }) => {
  const [educationList, setEducationList] = useState(data || [])
  const [errors, setErrors] = useState({}) // Estado para manejar validaciones por ID
  
  // Estados para el Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // 1. LÓGICA DE DIRTY STATE
  const isEducationDirty = (edu) => {
    const original = data.find(d => d.id === edu.id)
    if (!original) return true 
    return JSON.stringify(edu) !== JSON.stringify(original)
  }

  const isAnyDirty = educationList.some(isEducationDirty)

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
    setEducationList(data)
    setErrors({}) // Limpiamos errores si vienen datos nuevos del servidor
  }, [data])

  // --- LÓGICA DE VALIDACIÓN ---
  const validateEducation = (edu) => {
    const newErrors = {}
    
    if (!edu.institution || !edu.institution.trim()) newErrors.institution = "La institución es obligatoria"
    if (!edu.degree || !edu.degree.trim()) newErrors.degree = "El título es obligatorio"
    if (!edu.field || !edu.field.trim()) newErrors.field = "El campo de estudio es obligatorio"
    if (!edu.startDate) newErrors.startDate = "La fecha de inicio es obligatoria"
    
    // La fecha final solo es obligatoria si NO sigue estudiando actualmente
    if (!edu.current && !edu.endDate) {
      newErrors.endDate = "La fecha de fin es obligatoria"
    }

    return newErrors
  }

  // 2. Lógica de Guardado (Crear/Editar)
  const handleSave = async (eduLocal) => {
    // 1. Validar antes de guardar
    const fieldErrors = validateEducation(eduLocal)
    
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, [eduLocal.id]: fieldErrors }))
      toast.error("Por favor, corrige los errores marcados antes de guardar.")
      return
    }

    const saveAction = async () => {
      const payload = mapToBackend(eduLocal)
      let savedDataBackend;

      if (eduLocal.id && typeof eduLocal.id === 'string' && eduLocal.id.startsWith('temp-')) {
         savedDataBackend = await educationService.create(payload)
      } else {
         savedDataBackend = await educationService.update(eduLocal.id, payload)
      }

      const savedDataFrontend = mapToFrontendEducation(savedDataBackend)

      const newList = educationList.map(e => 
        e.id === eduLocal.id ? savedDataFrontend : e
      )
      setEducationList(newList)
      onUpdate(newList)

      // Limpiar errores tras guardar con éxito
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[eduLocal.id]
        return newErrors
      })

      return savedDataFrontend
    }

    toast.promise(saveAction(), {
      loading: 'Guardando...',
      success: '¡Educación guardada!',
      error: 'Error al guardar',
    })
  }

  // 3. Lógica de Borrado
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
      if (!isTemp) await educationService.delete(id)
      const newList = educationList.filter(e => e.id !== id)
      setEducationList(newList)
      onUpdate(newList)

      // Limpiar errores residuales si los había
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
        success: 'Eliminado correctamente',
        error: 'No se pudo eliminar',
      })
    }
    setItemToDelete(null)
  }

  // 4. Manejo de estado local
  const handleAddEducation = () => {
    const newEducation = {
      id: `temp-${Date.now()}`,
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      description: "",
    }
    setEducationList([newEducation, ...educationList])
  }

  const handleChange = (id, field, value) => {
    setEducationList(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ))

    // Limpieza dinámica de errores
    if (errors[id] && errors[id][field]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined }
      }))
    }
  }

  // Helper de estilos CSS
  const getInputClasses = (eduId, fieldName) => `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
    ${errors[eduId]?.[fieldName] 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
    }
  `

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 text-sm sm:text-base space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Educación</h2>
          <p className="text-gray-600">Añade tu formación académica</p>
        </div>
        <button
          onClick={handleAddEducation}
          className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm"
        >
          <i className="fas fa-plus"></i>
          Añadir Educación
        </button>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar estudios?"
        message="Se eliminará permanentemente este registro educativo."
      />

      {educationList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-graduation-cap text-4xl mb-4"></i>
          <p>No has añadido información educativa aún</p>
        </div>
      ) : (
        <div className="space-y-6">
          {educationList.map((edu, index) => {
            const isDirty = isEducationDirty(edu);
            const eduErrors = errors[edu.id] || {};

            return (
              <div 
                key={edu.id} 
                className={`border rounded-lg p-6 relative transition-all duration-300 ${
                  isDirty ? "border-amber-400 ring-1 ring-amber-400/50 pb-24 md:pb-6" : "border-gray-200"
                }`}
              >
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Educación {educationList.length - index}
                    {isDirty && <span className="ml-2 text-xs text-amber-600 font-normal italic">*Modificado</span>}
                  </h3>
                  <button 
                    onClick={() => openDeleteModal(edu.id)} 
                    className="text-red-600 hover:text-red-700 p-2 transition-colors"
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institución <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={edu.institution || ""}
                      onChange={(e) => handleChange(edu.id, "institution", e.target.value)}
                      className={getInputClasses(edu.id, "institution")}
                      placeholder="Universidad o centro"
                    />
                    {eduErrors.institution && <p className="mt-1 text-xs text-red-500">{eduErrors.institution}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) => handleChange(edu.id, "degree", e.target.value)}
                      className={getInputClasses(edu.id, "degree")}
                      placeholder="Ej: Grado, Máster..."
                    />
                    {eduErrors.degree && <p className="mt-1 text-xs text-red-500">{eduErrors.degree}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campo de estudio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={edu.field || ""}
                      onChange={(e) => handleChange(edu.id, "field", e.target.value)}
                      className={getInputClasses(edu.id, "field")}
                      placeholder="Ej: Informática, Derecho..."
                    />
                    {eduErrors.field && <p className="mt-1 text-xs text-red-500">{eduErrors.field}</p>}
                  </div>
                  
                  <div className="hidden md:block"></div>

                  {/* Fechas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de inicio <span className="text-red-500">*</span>
                    </label>
                    <CustomDatePicker 
                        value={edu.startDate}
                        onChange={(val) => handleChange(edu.id, "startDate", val)}
                        showMonthYearPicker={true} 
                        placeholder="Seleccionar inicio"
                        className={eduErrors.startDate ? "border-red-300 bg-red-50" : ""}
                      />
                      {eduErrors.startDate && <p className="mt-1 text-xs text-red-500">{eduErrors.startDate}</p>}
                  </div>

                  {!edu.current ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de fin <span className="text-red-500">*</span>
                      </label>
                      <CustomDatePicker 
                          value={edu.endDate}
                          onChange={(val) => handleChange(edu.id, "endDate", val)}
                          showMonthYearPicker={true}
                          placeholder="Seleccionar fin"
                          minDate={edu.startDate ? new Date(edu.startDate) : null}
                          className={eduErrors.endDate ? "border-red-300 bg-red-50" : ""}
                        />
                        {eduErrors.endDate && <p className="mt-1 text-xs text-red-500">{eduErrors.endDate}</p>}
                    </div>
                  ) : (
                    <div className="hidden md:block"></div>
                  )}

                  <div className="md:col-span-2 flex items-center mt-2">
                      <label className="flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={edu.current}
                          onChange={(e) => {
                              handleChange(edu.id, "current", e.target.checked);
                              if (e.target.checked) handleChange(edu.id, "endDate", ""); 
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Estudiando actualmente</span>
                      </label>
                  </div>

                  {/* Nota media */}
                  <div>
                    <label className="block text-sm font-medium  mb-2 text-gray-700">
                      Nota media <span className="font-normal text-gray-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) => handleChange(edu.id, "gpa", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ej: 8.5/10"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium  mb-2 text-gray-700">
                      Descripción <span className="font-normal text-gray-500">(Recomendable)</span>
                    </label>
                    <textarea
                      value={edu.description || ""}
                      onChange={(e) => handleChange(edu.id, "description", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Logros académicos, tesis, actividades extracurriculares..."
                    />
                  </div>
                </div>

                {/* FOOTER DE LA TARJETA */}
                <div
                  className={`flex items-center justify-between transition-all duration-300
                    ${isDirty
                      ? "fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-amber-200 shadow-[0_-8px_15px_rgba(0,0,0,0.08)] md:static md:w-auto md:bg-amber-50/50 md:p-4 md:-mx-6 md:-mb-6 md:rounded-b-lg md:shadow-none mt-0 md:mt-6 md:border-t-0"
                      : "mt-6 pt-4 border-t border-gray-100"
                    }
                  `}
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
                    onClick={() => handleSave(edu)}
                    disabled={!isDirty && edu.id && !edu.id.toString().startsWith('temp-')}
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
  )
}

export default EducationSection