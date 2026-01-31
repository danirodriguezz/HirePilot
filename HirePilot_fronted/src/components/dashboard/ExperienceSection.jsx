"use client"

import { useState, useEffect } from "react"
import { experienceService, mapToBackend, mapToFrontend } from "../../services/experienceService"
import ConfirmModal from "../ui/ConfirmModal"
import CustomDatePicker from "../ui/CustomDatePicker"
import toast from "react-hot-toast"


const ExperienceSection = ({ data, onUpdate }) => {
  const [experiences, setExperiences] = useState(data)
  
  // Estado para el Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Sincroniza si el padre cambia los datos (ej. al terminar de cargar la API)
  useEffect(() => {
    setExperiences(data)
  }, [data])

  // --- LÓGICA DE GUARDADO ---
  const handleSave = async (experienceLocal) => {
    const saveAction = async () => {
      const payload = mapToBackend(experienceLocal)
      let savedDataBackend;

      if (experienceLocal.id && typeof experienceLocal.id !== 'number') {
         savedDataBackend = await experienceService.create(payload)
      } else {
         savedDataBackend = await experienceService.update(experienceLocal.id, payload)
      }

      // 2. Convertir respuesta a Frontend
      const savedDataFrontend = mapToFrontend(savedDataBackend)

      // 3. Actualizar Estado Local
      const newList = experiences.map(e => 
        e.id === experienceLocal.id ? savedDataFrontend : e
      )
      setExperiences(newList)
      
      // 4. IMPORTANTE: Actualizar al Padre para que tenga la versión nueva
      onUpdate(newList)

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
    const isTemp = typeof id !== 'number'

    const deleteAction = async () => {
      if (!isTemp) {
        await experienceService.delete(id)
      }
      // Actualizar estado local
      const newList = experiences.filter(e => e.id !== id)
      setExperiences(newList)
      
      // Actualizar al Padre
      onUpdate(newList)
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
      achievements: [""],
    }
    setExperiences([newExperience, ...experiences])
  }

  const handleChangeField = (id, field, value) => {
    setExperiences(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Experiencia Profesional</h2>
            <p className="text-gray-600">Añade tu experiencia laboral más relevante</p>
          </div>
          <button
            onClick={handleAddExperience}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
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
            {experiences.map((experience, index) => (
              <div key={experience.id} className="border border-gray-200 rounded-lg p-6 relative">
                
                {/* Cabecera de la tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Experiencia {experiences.length - index}</h3>
                  <button
                      onClick={() => openDeleteModal(experience.id)}
                      className="text-red-600 hover:text-red-700 transition-colors p-2"
                      title="Eliminar experiencia"
                    >
                      <i className="fas fa-trash"></i>
                  </button>
                </div>

                {/* Formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <input
                      type="text"
                      value={experience.company}
                      onChange={(e) => handleChangeField(experience.id, "company", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                    <input
                      type="text"
                      value={experience.position}
                      onChange={(e) => handleChangeField(experience.id, "position", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Tu puesto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={experience.location}
                      onChange={(e) => handleChangeField(experience.id, "location", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  
                  {/* Celda vacía para mantener alineación en desktop, opcional */}
                  <div className="hidden md:block"></div>

                  {/* --- INTEGRACIÓN DE CUSTOM DATE PICKER --- */}
                  
                  {/* Fecha de Inicio */}
                  <div>
                    <CustomDatePicker 
                      label="Fecha de inicio"
                      value={experience.startDate}
                      onChange={(val) => handleChangeField(experience.id, "startDate", val)}
                      showMonthYearPicker={true} // True para ver solo mes y año
                      placeholder="Seleccionar inicio"
                    />
                  </div>

                  {/* Fecha de Fin (Renderizado Condicional) */}
                  {!experience.current ? (
                    <div>
                      <CustomDatePicker 
                        label="Fecha de fin"
                        value={experience.endDate}
                        onChange={(val) => handleChangeField(experience.id, "endDate", val)}
                        showMonthYearPicker={true}
                        placeholder="Seleccionar fin"
                        minDate={experience.startDate ? new Date(experience.startDate) : null}
                      />
                    </div>
                  ) : (
                    // Espacio vacío visual si está trabajando actualmente
                    <div className="hidden md:block"></div>
                  )}

                  {/* Checkbox Trabajo Actual */}
                  <div className="md:col-span-2 flex items-center mt-2">
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={experience.current}
                        onChange={(e) => {
                            // Si se marca como actual, limpiamos la fecha de fin
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={experience.description}
                    onChange={(e) => handleChangeField(experience.id, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Describe tus responsabilidades..."
                  />
                </div>

                {/* Logros */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logros</label>
                    {experience.achievements.map((ach, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                value={ach} 
                                onChange={(e) => handleAchievementChange(experience.id, i, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Logro clave..."
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
                
                {/* Botón Guardar */}
                <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                    <button 
                        onClick={() => handleSave(experience)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2"
                    >
                        <i className="fas fa-save"></i>
                        Guardar cambios
                    </button>
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