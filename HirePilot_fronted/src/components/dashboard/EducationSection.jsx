"use client"

import { useState, useEffect } from "react"
import { educationService, mapToBackend, mapToFrontendEducation } from "../../services/educationService"
import ConfirmModal from "../ui/ConfirmModal"
import CustomDatePicker from "../ui/CustomDatePicker" // <--- Importado OK
import toast from "react-hot-toast"

const EducationSection = ({ data, onUpdate }) => {
  const [educationList, setEducationList] = useState([])
  
  // Estados para el Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // 1. Cargar datos al iniciar
  useEffect(() => {
    setEducationList(data)
  }, [data])

  // 2. Lógica de Guardado (Crear/Editar)
  const handleSave = async (eduLocal) => {
    const saveAction = async () => {
      const payload = mapToBackend(eduLocal)
      let savedDataBackend;

      if (eduLocal.id && typeof eduLocal.id !== 'number') {
         savedDataBackend = await educationService.create(payload)
      } else {
         savedDataBackend = await educationService.update(eduLocal.id, payload)
      }

      // 2. Convertir respuesta a Frontend
      const savedDataFrontend = mapToFrontendEducation(savedDataBackend)

      // 3. Actualizar Estado Local
      const newList = educationList.map(e => 
        e.id === eduLocal.id ? savedDataFrontend : e
      )
      setEducationList(newList)
      // Actualizar en el padre
      onUpdate(newList)
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
    const isTemp = typeof id !== 'number'

    const deleteAction = async () => {
      if (!isTemp) await educationService.delete(id)
      const newList = educationList.filter(e => e.id !== id)
      setEducationList(newList)
      // Actualizar en el padre
      onUpdate(newList)
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
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Educación</h2>
          <p className="text-gray-600">Añade tu formación académica</p>
        </div>
        <button
          onClick={handleAddEducation}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
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
          {educationList.map((edu, index) => (
            <div key={edu.id} className="border border-gray-200 rounded-lg p-6 relative">
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Educación {educationList.length - index}</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institución</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleChange(edu.id, "institution", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Universidad o centro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleChange(edu.id, "degree", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Grado, Máster..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campo de estudio</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => handleChange(edu.id, "field", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Informática, Derecho..."
                  />
                </div>
                
                {/* --- SECCIÓN FECHAS CORREGIDA --- */}
                
                {/* 1. Fecha de Inicio */}
                <div>
                  <CustomDatePicker 
                      label="Fecha de inicio"
                      value={edu.startDate}
                      onChange={(val) => handleChange(edu.id, "startDate", val)}
                      showMonthYearPicker={true} 
                      placeholder="Seleccionar inicio"
                    />
                </div>

                {/* 2. Fecha de Fin (Si no estudia actualmente) */}
                {!edu.current ? (
                  <div>
                    <CustomDatePicker 
                        label="Fecha de fin"
                        value={edu.endDate}
                        onChange={(val) => handleChange(edu.id, "endDate", val)}
                        showMonthYearPicker={true}
                        placeholder="Seleccionar fin"
                        minDate={edu.startDate ? new Date(edu.startDate) : null}
                      />
                  </div>
                ) : (
                  // Espacio vacío para mantener el grid alineado si solo hay fecha de inicio
                  <div className="hidden md:block"></div>
                )}

                {/* 3. Checkbox "Estudiando actualmente" */}
                <div className="md:col-span-2 flex items-center mt-2">
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => {
                            handleChange(edu.id, "current", e.target.checked);
                            if (e.target.checked) handleChange(edu.id, "endDate", ""); // Limpiar fecha fin
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Estudiando actualmente</span>
                    </label>
                </div>

                {/* --- FIN SECCIÓN FECHAS --- */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nota media (Opcional)</label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => handleChange(edu.id, "gpa", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: 8.5/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (Opcional)</label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => handleChange(edu.id, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Logros académicos, tesis, actividades..."
                  />
                </div>

                {/* Botón Guardar */}
                <div className="md:col-span-2 flex justify-end border-t border-gray-100 pt-4 mt-2">
                    <button 
                        onClick={() => handleSave(edu)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2"
                    >
                        <i className="fas fa-save"></i>
                        Guardar cambios
                    </button>
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