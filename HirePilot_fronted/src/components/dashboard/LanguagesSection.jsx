"use client"

import { useState, useEffect } from "react"
import { languageService, mapToBackendLenguage, mapToFrontendLanguage } from "../../services/languageService"
import ConfirmModal from "../ui/ConfirmModal"
import toast from "react-hot-toast" 

const LanguagesSection = ({data, onUpdate}) => {
  const [languages, setLanguages] = useState(data)
  // Estados del Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Desglose de niveles por separado (Marco Común Europeo)
  const proficiencyLevels = [
    { value: "A1", label: "A1 - Acceso (Básico)" },
    { value: "A2", label: "A2 - Plataforma (Básico)" },
    { value: "B1", label: "B1 - Umbral (Intermedio)" },
    { value: "B2", label: "B2 - Avanzado (Intermedio Alto)" },
    { value: "C1", label: "C1 - Dominio (Operativo Eficaz)" },
    { value: "C2", label: "C2 - Maestría" },
    { value: "Nativo", label: "Nativo / Bilingüe" },
  ]

  // 1. Cargar datos
  useEffect(() => {
    setLanguages(data)
  }, [data])

  // 2. Guardar (Crear o Editar)
  const handleSave = async (langLocal) => {
    const saveAction = async () => {
      const payload = mapToBackendLenguage(langLocal)
      let savedDataBackend;

      if (langLocal.id && typeof langLocal.id !== 'number') {
         // Crear (ID temporal)
         savedDataBackend = await languageService.create(payload)
      } else {
         // Actualizar (ID real)
         savedDataBackend = await languageService.update(langLocal.id, payload)
      }

      const savedDataFronted = mapToFrontendLanguage(savedDataBackend)
      const newList = languages.map(l => 
        l.id === langLocal.id ? savedDataFronted : l
      )
      setLanguages(newList)
      onUpdate(newList) // Notificar al padre
      return savedDataBackend;
    }

    toast.promise(saveAction(), {
      loading: 'Guardando...',
      success: '¡Idioma guardado!',
      error: 'Error al guardar',
    })
  }

  // 3. Borrar
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
      if (!isTemp) await languageService.delete(id)
      setLanguages(prev => prev.filter(l => l.id !== id))
    }

    if (isTemp) {
      deleteAction()
      toast.success("Borrador eliminado")
    } else {
      toast.promise(deleteAction(), {
        loading: 'Eliminando...',
        success: 'Idioma eliminado',
        error: 'No se pudo eliminar',
      })
    }
    setItemToDelete(null)
  }

  // 4. Gestión de estado local
  const addLanguage = () => {
    const newLanguage = {
      id: `temp-${Date.now()}`,
      name: "",
      proficiency: "B1", // Valor por defecto
      certificates: "",
    }
    setLanguages([newLanguage, ...languages])
  }

  const updateLanguage = (id, field, value) => {
    setLanguages(prev => prev.map((lang) => 
      (lang.id === id ? { ...lang, [field]: value } : lang)
    ))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Idiomas</h2>
          <p className="text-gray-600">Añade los idiomas que dominas</p>
        </div>
        <button
          onClick={addLanguage}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Añadir Idioma
        </button>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar idioma?"
        message="Se eliminará este idioma de tu perfil permanentemente."
      />

      {languages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-language text-4xl mb-4"></i>
          <p>No has añadido idiomas aún</p>
          <p className="text-sm">Haz clic en "Añadir Idioma" para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map((language, index) => (
            <div key={language.id} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between h-full">
              {/* Contenido Superior */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Idioma {languages.length - index}</h3>
                  <button 
                    onClick={() => openDeleteModal(language.id)} 
                    className="text-red-600 hover:text-red-700 p-1 transition-colors"
                  >
                    <i className="fas fa-trash text-sm"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                    <input
                      type="text"
                      value={language.name}
                      onChange={(e) => updateLanguage(language.id, "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ej: Inglés, Francés"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                    <select
                      value={language.proficiency}
                      onChange={(e) => updateLanguage(language.id, "proficiency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {proficiencyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificados (opcional)</label>
                    <input
                      type="text"
                      value={language.certificates}
                      onChange={(e) => updateLanguage(language.id, "certificates", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ej: TOEFL, DELE, First..."
                    />
                  </div>
                </div>
              </div>

              {/* Botón Guardar (Parte inferior de la tarjeta) */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                      onClick={() => handleSave(language)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center gap-2"
                  >
                      <i className="fas fa-save"></i>
                      Guardar
                  </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguagesSection