"use client"

import { useState, useEffect } from "react"
import { educationService } from "../../services/educationService" // <--- Importamos servicio
import ConfirmModal from "../ui/ConfirmModal"
import toast from "react-hot-toast"

// --- MAPPERS (Conectan Front con Back) ---
const mapToBackend = (edu) => ({
  institution: edu.institution,
  degree: edu.degree,
  field_of_study: edu.field, 
  grade: edu.gpa,            
  description: edu.description,
  start_date: edu.startDate ? `${edu.startDate}-01` : null,
  end_date: edu.endDate ? `${edu.endDate}-01` : null,
  current: edu.current,
})

const mapToFrontend = (apiData) => ({
  id: apiData.id,
  institution: apiData.institution,
  degree: apiData.degree,
  field: apiData.field_of_study || "", 
  gpa: apiData.grade || "",          
  description: apiData.description || "",
  startDate: apiData.start_date ? apiData.start_date.substring(0, 7) : "",
  endDate: apiData.end_date ? apiData.end_date.substring(0, 7) : "",
  current: apiData.current,
})

const EducationSection = () => {
  const [educationList, setEducationList] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para el Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // 1. Cargar datos al iniciar
  useEffect(() => {
    loadEducation()
  }, [])

  const loadEducation = async () => {
    try {
      const data = await educationService.getAll()
      setEducationList(data.map(mapToFrontend))
    } catch (err) {
      console.error(err)
      toast.error("Error cargando educación")
    } finally {
      setLoading(false)
    }
  }

  // 2. Lógica de Guardado (Crear/Editar)
  const handleSave = async (eduLocal) => {
    const saveAction = async () => {
      const payload = mapToBackend(eduLocal)
      let savedData;

      if (eduLocal.id && typeof eduLocal.id !== 'number') {
         // Crear (ID es string temporal)
         savedData = await educationService.create(payload)
      } else {
         // Actualizar (ID es número real)
         savedData = await educationService.update(eduLocal.id, payload)
      }

      setEducationList(prev => prev.map(e => 
        e.id === eduLocal.id ? mapToFrontend(savedData) : e
      ))
      return savedData
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
      setEducationList(prev => prev.filter(e => e.id !== id))
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
      location: "", // Nota: No se guardará en backend si no actualizamos el modelo
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

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando educación...</div>

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
                
                {/* Nota: He ocultado ubicación porque no está en el backend. 
                    Si lo necesitas, descomenta y añade al backend */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => handleChange(edu.id, "location", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inicio</label>
                  <input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => handleChange(edu.id, "startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-2 mt-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => handleChange(edu.id, "current", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Estudiando actualmente</span>
                    </label>
                  </div>

                  {!edu.current && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fin</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => handleChange(edu.id, "endDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>

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