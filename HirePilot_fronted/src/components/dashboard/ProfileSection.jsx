"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import api from "../../api/axiosInstance"

const ProfileSection = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(data)
  const [saveStatus, setSaveStatus] = useState("idle") // "idle", "saving", "saved", "error"

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
  }, [data])

  // [Cambio 2] Nueva función para guardar manualmente al hacer clic
  const handleSave = async () => {
    if (!hasUnsavedChanges) return

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

      // Opcional: Volver al estado "idle" después de unos segundos para limpiar el mensaje de "Guardado"
      setTimeout(() => setSaveStatus("idle"), 3000)

    } catch (error) {
      console.error("Error al guardar perfil:", error)
      setSaveStatus("error")
      toast.error("Hubo un error al guardar los cambios")
    }
  }


  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    // [Cambio 3] Si editamos, quitamos el estado de "Guardado" para indicar que hay cambios pendientes
    if (saveStatus === 'saved') setSaveStatus("idle")
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

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-300 ${hasUnsavedChanges
        ? "border-amber-400 ring-1 ring-amber-400/50 pb-24 md:pb-6" // Borde ámbar brillante si hay cambios
        : "border-gray-200"                          // Borde gris normal si está guardado
        }`}
    >

      <div className="flex justify-between items-start mb-6">
        {/* Cabecera de la tarjeta con Flexbox para alinear título y estado */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Información Personal</h2>
          <p className="text-gray-600 text-sm">Completa tu información básica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Tus apellidos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profesión</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Tu profesión o rol actual"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Años de Experiencia</label>
          <div className="relative">
            <select
              name="yearsOfExperience"
              value={formData.yearsOfExperience || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
            >
              <option value="">Selecciona tu experiencia</option>
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Icono de flecha para el select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="123 456 789"
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="https://linkedin.com/in/tuperfil"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web (Opcional)</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="https://tusitio.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Resumen Profesional</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Describe brevemente tu experiencia y objetivos profesionales..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Un buen resumen profesional tiene entre 2-3 líneas y destaca tus principales fortalezas.
          </p>
        </div>
      </div>

      {/* [Cambio 4] Botón de Guardar añadido al final */}
      <div
        className={`flex items-center justify-between transition-all duration-300
          ${hasUnsavedChanges
            // MÓVIL: Fijo en la parte inferior de la pantalla con sombra y fondo blanco
            ? "fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-amber-200 shadow-[0_-8px_15px_rgba(0,0,0,0.08)] " +
            // ESCRITORIO (md): Vuelve a ser estático dentro de la tarjeta
            "md:static md:w-auto md:bg-amber-50/50 md:p-4 md:-mx-6 md:-mb-6 md:rounded-b-lg md:shadow-none mt-0 md:mt-6 md:border-t-0"
            // ESTADO GUARDADO: Diseño normal
            : "mt-6 pt-4 border-t border-gray-100"
          }
        `}
      >
        {/* 2. FEEDBACK VISUAL: Aviso de cambios sin guardar */}
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
                ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-md ring-2 ring-offset-1 ring-amber-600/30' // Botón llama más la atención
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
