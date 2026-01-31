"use client"

import { useState , useEffect} from "react"
import api from "../../api/axiosInstance"

const ProfileSection = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(data)
  const [saveStatus, setSaveStatus] = useState("idle") // "idle", "saving", "saved", "error"
  
  // Esto actualiza el formulario cuando el padre termina de cargar los datos
  useEffect(() => {
    setFormData(data)
  }, [data])

  // [Cambio 2] Nueva función para guardar manualmente al hacer clic
  const handleSave = async () => {
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
      
      setSaveStatus("saved")
      
      // Opcional: Volver al estado "idle" después de unos segundos para limpiar el mensaje de "Guardado"
      setTimeout(() => setSaveStatus("idle"), 3000)

    } catch (error) {
      console.error("Error al guardar perfil:", error)
      setSaveStatus("error")
    }
  }


  const handleChange = (e) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    onUpdate(updatedData)
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      
      <div className="flex justify-between items-start mb-6">
        {/* Cabecera de la tarjeta con Flexbox para alinear título y estado */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Información Personal</h2>
          <p className="text-gray-600 text-sm">Completa tu información básica.</p>
        </div>

        {/* Indicador de Estado Visual (Opcional, puedes mantenerlo o quitarlo si prefieres solo el botón) */}
        <div className="text-xs font-medium transition-colors mt-1">
          {saveStatus === 'saved' && <span className="text-emerald-600 flex items-center bg-emerald-50 px-2 py-1 rounded-full"><i className="fas fa-check mr-2"></i>Guardado</span>}
          {saveStatus === 'error' && <span className="text-red-600 flex items-center bg-red-50 px-2 py-1 rounded-full"><i className="fas fa-exclamation-circle mr-2"></i>Error</span>}
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
      <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
        <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`
              flex items-center gap-2 px-6 py-2 rounded-md text-white font-medium shadow-sm transition-all
              ${saveStatus === 'saving' ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md'}
            `}
        >
            {saveStatus === 'saving' ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Guardar Cambios
              </>
            )}
        </button>
      </div>
    </div>
  )
}

export default ProfileSection
