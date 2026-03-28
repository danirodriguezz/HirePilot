"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import api from "../../api/axiosInstance"

const ProfileSection = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(data)
  const [saveStatus, setSaveStatus] = useState("idle") // "idle", "saving", "saved", "error"
  const [errors, setErrors] = useState({}) // Nuevo estado para manejar validaciones

  // Comprobamos si hay cambios (Dirty State)
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(data)

  // Evitar que el usuario cierre la pestaña por error si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = "" // Necesario para Chrome
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Esto actualiza el formulario cuando el padre termina de cargar los datos
  useEffect(() => {
    setFormData(data)
    setErrors({}) // Limpiamos errores al recibir nuevos datos
  }, [data])

  // Función de validación del formulario
  const validateForm = () => {
    const newErrors = {}
    
    // Validaciones de campos obligatorios básicos
    if (!formData.firstName || !formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio"
    }
    if (!formData.lastName || !formData.lastName.trim()) {
      newErrors.lastName = "Los apellidos son obligatorios"
    }
    if (!formData.profession || !formData.profession.trim()) {
      newErrors.profession = "La profesión es obligatoria"
    }
    // [NUEVO] Validación para Años de Experiencia
    if (!formData.yearsOfExperience || !formData.yearsOfExperience.trim()) {
      newErrors.yearsOfExperience = "Los años de experiencia son obligatorios"
    }

    // Expresión regular básica para validar URLs (LinkedIn, Web)
    const urlPattern = /^(https?:\/\/)?([\w\d\-_]+\.+[A-Za-z]{2,})+\/?/

    if (formData.linkedin && formData.linkedin.trim() !== "" && !urlPattern.test(formData.linkedin)) {
      newErrors.linkedin = "Introduce una URL válida"
    }
    if (formData.website && formData.website.trim() !== "" && !urlPattern.test(formData.website)) {
      newErrors.website = "Introduce una URL válida"
    }

    setErrors(newErrors)
    
    // Retorna true si no hay errores (el objeto está vacío)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!hasUnsavedChanges) return

    // 1. Ejecutamos la validación antes de hacer cualquier cosa
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores marcados antes de guardar.")
      return
    }

    setSaveStatus("saving")

    try {
      // Mapear datos de Frontend a Backend
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        profile: {
          headline: formData.profession,
          phone: formData.phone,
          linkedin_url: formData.linkedin,
          summary: formData.summary,
          years_of_experience: formData.yearsOfExperience,
          personal_website: formData.website,
        }
      }

      // Petición PATCH
      await api.patch("/me/", payload)

      onUpdate(formData)
      setSaveStatus("saved")
      toast.success("Información guardada correctamente")

      // Volver al estado "idle" después de unos segundos
      setTimeout(() => setSaveStatus("idle"), 3000)

    } catch (error) {
      console.error("Error al guardar perfil:", error)
      setSaveStatus("error")
      toast.error("Hubo un error al guardar los cambios en el servidor")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    
    // Si editamos, quitamos el estado de "Guardado"
    if (saveStatus === 'saved') setSaveStatus("idle")
    
    // Si el campo modificado tenía un error, lo limpiamos dinámicamente
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // Opciones para el desplegable de experiencia
  const experienceOptions = [
    { value: "0", label: "Sin experiencia" },
    { value: "1-2", label: "Entre 1 y 2 años" },
    { value: "2-3", label: "Entre 2 y 3 años" },
    { value: "3-4", label: "Entre 3 y 4 años" },
    { value: "4-5", label: "Entre 4 y 5 años" },
    { value: "5-6", label: "Entre 5 y 6 años" },
    { value: "6+", label: "Más de 6 años" },
  ]

  // Helper para generar las clases de los inputs dependiendo de si hay error o no
  const getInputClasses = (fieldName) => `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
    ${errors[fieldName] 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
    }
  `

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-300 ${hasUnsavedChanges
        ? "border-amber-400 ring-1 ring-amber-400/50 pb-24 md:pb-6" 
        : "border-gray-200"                          
        }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Información Personal</h2>
          <p className="text-gray-600 text-sm">Completa tu información básica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            className={getInputClasses('firstName')}
            placeholder="Tu nombre"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            className={getInputClasses('lastName')}
            placeholder="Tus apellidos"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profesión <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="profession"
            value={formData.profession || ""}
            onChange={handleChange}
            className={getInputClasses('profession')}
            placeholder="Tu profesión o rol actual"
          />
          {errors.profession && <p className="mt-1 text-xs text-red-500">{errors.profession}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Años de Experiencia <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="yearsOfExperience"
              value={formData.yearsOfExperience || ""}
              onChange={handleChange}
              className={getInputClasses('yearsOfExperience') + " appearance-none bg-white"}
            >
              <option value="">Selecciona tu experiencia</option>
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
          {errors.yearsOfExperience && <p className="mt-1 text-xs text-red-500">{errors.yearsOfExperience}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className={getInputClasses('phone')}
            placeholder="123 456 789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin || ""}
            onChange={handleChange}
            className={getInputClasses('linkedin')}
            placeholder="https://linkedin.com/in/tuperfil"
          />
          {errors.linkedin && <p className="mt-1 text-xs text-red-500">{errors.linkedin}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web (Opcional)</label>
          <input
            type="url"
            name="website"
            value={formData.website || ""}
            onChange={handleChange}
            className={getInputClasses('website')}
            placeholder="https://tusitio.com"
          />
          {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Resumen Profesional</label>
          <textarea
            name="summary"
            value={formData.summary || ""}
            onChange={handleChange}
            rows={4}
            className={getInputClasses('summary')}
            placeholder="Describe brevemente tu experiencia y objetivos profesionales..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Un buen resumen profesional tiene entre 2-3 líneas y destaca tus principales fortalezas.
          </p>
        </div>
      </div>

      <div
        className={`flex items-center justify-between transition-all duration-300
          ${hasUnsavedChanges
            ? "fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-amber-200 shadow-[0_-8px_15px_rgba(0,0,0,0.08)] md:static md:w-auto md:bg-amber-50/50 md:p-4 md:-mx-6 md:-mb-6 md:rounded-b-lg md:shadow-none mt-0 md:mt-6 md:border-t-0"
            : "mt-6 pt-4 border-t border-gray-100"
          }
        `}
      >
        <div>
          {hasUnsavedChanges && (
            <p className="text-amber-700 text-sm flex items-center animate-pulse font-medium">
              <i className="fas fa-circle-exclamation mr-2"></i>
              <span className="hidden sm:inline">Tienes cambios sin guardar</span>
              <span className="sm:hidden">Sin guardar</span>
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`
              flex items-center gap-2 px-6 py-2.5 rounded-md text-white font-medium shadow-sm transition-all active:scale-95
              ${saveStatus === 'saving'
              ? 'bg-emerald-400 cursor-not-allowed'
              : hasUnsavedChanges
                ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-md ring-2 ring-offset-1 ring-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md'
            }
            `}
        >
          {saveStatus === 'saving' ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Guardando...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Guardar
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProfileSection