"use client"

import { useState, useEffect } from "react"
import { languageService, mapToBackendLenguage, mapToFrontendLanguage } from "../../services/languageService"
import ConfirmModal from "../ui/ConfirmModal"
import toast from "react-hot-toast" 

const LanguagesSection = ({ data, onUpdate }) => {
  const [languages, setLanguages] = useState(data || [])
  const [errors, setErrors] = useState({}) // Estado para manejar validaciones
  
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

  // 1. LÓGICA DE DIRTY STATE (Cambios sin guardar)
  const isLanguageDirty = (lang) => {
    const original = data.find(d => d.id === lang.id)
    if (!original) return true 
    return JSON.stringify(lang) !== JSON.stringify(original)
  }

  const isAnyDirty = languages.some(isLanguageDirty)

  // Evitar que cierre la pestaña si hay cambios sin guardar
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

  // Cargar datos
  useEffect(() => {
    setLanguages(data)
    setErrors({}) // Limpiamos errores al recibir nuevos datos
  }, [data])

  // --- LÓGICA DE VALIDACIÓN ---
  const validateLanguage = (lang) => {
    const newErrors = {}
    
    if (!lang.name || !lang.name.trim()) newErrors.name = "El idioma es obligatorio"
    if (!lang.proficiency || !lang.proficiency.trim()) newErrors.proficiency = "El nivel es obligatorio"
    
    return newErrors
  }

  // 2. Guardar (Crear o Editar)
  const handleSave = async (langLocal) => {
    // 1. Validar antes de guardar
    const fieldErrors = validateLanguage(langLocal)
    
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, [langLocal.id]: fieldErrors }))
      toast.error("Por favor, corrige los errores marcados antes de guardar.")
      return
    }

    const saveAction = async () => {
      const payload = mapToBackendLenguage(langLocal)
      let savedDataBackend;

      // Verificación segura de ID temporal
      if (langLocal.id && typeof langLocal.id === 'string' && langLocal.id.startsWith('temp-')) {
         savedDataBackend = await languageService.create(payload)
      } else {
         savedDataBackend = await languageService.update(langLocal.id, payload)
      }

      const savedDataFronted = mapToFrontendLanguage(savedDataBackend)
      const newList = languages.map(l => 
        l.id === langLocal.id ? savedDataFronted : l
      )
      
      setLanguages(newList)
      onUpdate(newList) 

      // Limpiar errores para este idioma concreto tras guardar exitosamente
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[langLocal.id]
        return newErrors
      })

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
    const isTemp = typeof id === 'string' && id.startsWith('temp-')

    const deleteAction = async () => {
      if (!isTemp) await languageService.delete(id)

      const newList = languages.filter(l => l.id !== id)
      setLanguages(newList)
      onUpdate(newList) 

      // Limpiar errores residuales del idioma borrado
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

    // Limpieza dinámica de errores al escribir
    if (errors[id] && errors[id][field]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined }
      }))
    }
  }

  // Helper de estilos CSS
  const getInputClasses = (langId, fieldName) => `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
    ${errors[langId]?.[fieldName] 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
    }
  `

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 text-sm sm:text-base">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Idiomas</h2>
          <p className="text-gray-600">Añade los idiomas que dominas</p>
        </div>
        <button
          onClick={addLanguage}
          className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm"
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
          {languages.map((language, index) => {
            const isDirty = isLanguageDirty(language);
            const langErrors = errors[language.id] || {};

            return (
              <div 
                key={language.id} 
                className={`border rounded-lg p-4 flex flex-col justify-between h-full relative transition-all duration-300 ${
                  isDirty ? "border-amber-400 ring-1 ring-amber-400/50 pb-24 md:pb-4" : "border-gray-200"
                }`}
              >
                {/* Contenido Superior */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Idioma {languages.length - index}
                      {isDirty && <span className="ml-2 text-xs text-amber-600 font-normal italic">*Modificado</span>}
                    </h3>
                    <button 
                      onClick={() => openDeleteModal(language.id)} 
                      className="text-red-600 hover:text-red-700 p-1 transition-colors"
                      title="Eliminar"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idioma <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={language.name || ""}
                        onChange={(e) => updateLanguage(language.id, "name", e.target.value)}
                        className={getInputClasses(language.id, "name")}
                        placeholder="Ej: Inglés, Francés"
                      />
                      {langErrors.name && <p className="mt-1 text-xs text-red-500">{langErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={language.proficiency || "B1"}
                        onChange={(e) => updateLanguage(language.id, "proficiency", e.target.value)}
                        className={`${getInputClasses(language.id, "proficiency")} bg-white`}
                      >
                        {proficiencyLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                      {langErrors.proficiency && <p className="mt-1 text-xs text-red-500">{langErrors.proficiency}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">
                        Certificados <span className="font-normal text-gray-500">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={language.certificates || ""}
                        onChange={(e) => updateLanguage(language.id, "certificates", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ej: TOEFL, DELE, First..."
                      />
                    </div>
                  </div>
                </div>

                {/* FOOTER DE LA TARJETA */}
                <div
                  className={`flex items-center justify-between transition-all duration-300
                    ${isDirty
                      ? "fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-amber-200 shadow-[0_-8px_15px_rgba(0,0,0,0.08)] md:static md:w-auto md:bg-amber-50/50 md:p-4 md:-mx-4 md:-mb-4 md:rounded-b-lg md:shadow-none mt-0 md:mt-4 md:border-t-0"
                      : "mt-4 pt-4 border-t border-gray-100 flex justify-end"
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
                    onClick={() => handleSave(language)}
                    disabled={!isDirty && language.id && !language.id.toString().startsWith('temp-')}
                    className={`
                        flex items-center gap-2 px-6 py-2 rounded-md text-white font-medium shadow-sm transition-all active:scale-95
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

export default LanguagesSection