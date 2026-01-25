"use client"

import { useState, useEffect } from "react"
import { projectService } from "../../services/projectService"
import { skillService } from "../../services/skillService"
import toast from "react-hot-toast"
import ConfirmModal from "../ui/ConfirmModal"
import CustomDatePicker from "../ui/CustomDatePicker"

// --- MAPPERS ---
const mapToBackend = (proj) => ({
  title: proj.title,
  role: proj.role,
  organization: proj.organization,
  category: proj.category,
  description: proj.description,
  project_url: proj.url,
  resource_url: proj.resource,
  start_date: proj.startDate ? `${proj.startDate}-01` : null,
  end_date: proj.endDate ? `${proj.endDate}-01` : null,
  skills: proj.selectedSkills || [] 
})

const mapToFrontend = (apiData) => ({
  id: apiData.id,
  title: apiData.title,
  role: apiData.role || "",
  organization: apiData.organization || "",
  category: apiData.category || "PROFESSIONAL",
  description: apiData.description || "",
  url: apiData.project_url || "",
  resource: apiData.resource_url || "",
  startDate: apiData.start_date ? apiData.start_date.substring(0, 7) : "",
  endDate: apiData.end_date ? apiData.end_date.substring(0, 7) : "",
  selectedSkills: apiData.skills || [] 
})

const ProjectsSection = () => {
  const [projects, setProjects] = useState([])
  const [availableSkills, setAvailableSkills] = useState([]) 
  const [loading, setLoading] = useState(true)

  // Estados Modal Borrado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const categories = [
    { value: "PROFESSIONAL", label: "Profesional / Trabajo" },
    { value: "FREELANCE", label: "Freelance / Cliente" },
    { value: "ACADEMIC", label: "Académico" },
    { value: "PERSONAL", label: "Proyecto Personal" },
    { value: "VOLUNTEER", label: "Voluntariado" },
  ]

  // 1. Cargar Proyectos y Skills disponibles
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, skillsData] = await Promise.all([
          projectService.getAll(),
          skillService.getAll()
        ])
        setProjects(projectsData.map(mapToFrontend))
        setAvailableSkills(skillsData) 
      } catch (err) {
        console.error(err)
        toast.error("Error cargando datos")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 2. Guardar
  const handleSave = async (projLocal) => {
    const saveAction = async () => {
      const payload = mapToBackend(projLocal)
      let savedData
      if (projLocal.id && typeof projLocal.id !== 'number') {
         savedData = await projectService.create(payload)
      } else {
         savedData = await projectService.update(projLocal.id, payload)
      }
      setProjects(prev => prev.map(p => p.id === projLocal.id ? mapToFrontend(savedData) : p))
      return savedData
    }

    toast.promise(saveAction(), {
      loading: 'Guardando proyecto...',
      success: 'Proyecto guardado',
      error: 'Error al guardar'
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
      if (!isTemp) await projectService.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    }

    if (isTemp) {
      deleteAction()
      toast.success("Borrador eliminado")
    } else {
      toast.promise(deleteAction(), {
        loading: 'Eliminando...',
        success: 'Proyecto eliminado',
        error: 'No se pudo eliminar'
      })
    }
    setItemToDelete(null)
  }

  // 4. Helpers Locales
  const addProject = () => {
    const newProj = {
      id: `temp-${Date.now()}`,
      title: "",
      role: "",
      organization: "",
      category: "PROFESSIONAL",
      description: "",
      url: "",
      resource: "",
      startDate: "",
      endDate: "",
      selectedSkills: []
    }
    setProjects([newProj, ...projects])
  }

  const handleChange = (id, field, value) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  // Helper para manejar selección múltiple de skills
  const toggleSkill = (projId, skillId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projId) return p
      const currentSkills = p.selectedSkills
      if (currentSkills.includes(skillId)) {
        return { ...p, selectedSkills: currentSkills.filter(id => id !== skillId) }
      } else {
        return { ...p, selectedSkills: [...currentSkills, skillId] }
      }
    }))
  }

  if (loading) return <div>Cargando portafolio...</div>

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Proyectos y Portafolio</h2>
          <p className="text-gray-600">Destaca tus trabajos, campañas o logros clave</p>
        </div>
        <button
          onClick={addProject}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Añadir Proyecto
        </button>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar proyecto?"
        message="Se eliminará este proyecto de tu portafolio."
      />

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-briefcase text-4xl mb-4"></i>
          <p>No has añadido proyectos aún</p>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((proj, index) => (
            <div key={proj.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              
              {/* Header Tarjeta */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800">Proyecto {projects.length - index}</h3>
                <button onClick={() => openDeleteModal(proj.id)} className="text-red-500 hover:text-red-700">
                  <i className="fas fa-trash"></i>
                </button>
              </div>

              {/* Formulario Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Título */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título del Proyecto / Campaña</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleChange(proj.id, "title", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md font-medium"
                    placeholder="Ej: Lanzamiento Producto X"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tu Rol</label>
                  <input
                    type="text"
                    value={proj.role}
                    onChange={(e) => handleChange(proj.id, "role", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Ej: Lead Designer, Copywriter..."
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={proj.category}
                    onChange={(e) => handleChange(proj.id, "category", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Organización */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente / Empresa (Opcional)</label>
                  <input
                    type="text"
                    value={proj.organization}
                    onChange={(e) => handleChange(proj.id, "organization", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Ej: Coca-Cola, Freelance..."
                  />
                </div>

                {/* --- 2. FECHAS CON CUSTOM DATE PICKER --- */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <CustomDatePicker 
                      label="Inicio"
                      value={proj.startDate}
                      onChange={(val) => handleChange(proj.id, "startDate", val)}
                      showMonthYearPicker={true}
                      placeholder="Fecha inicio"
                    />
                  </div>
                  <div className="flex-1">
                    <CustomDatePicker 
                      label="Fin"
                      value={proj.endDate}
                      onChange={(val) => handleChange(proj.id, "endDate", val)}
                      showMonthYearPicker={true}
                      placeholder="Fecha fin"
                      minDate={proj.startDate ? new Date(proj.startDate) : null}
                    />
                  </div>
                </div>

                {/* Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enlace Principal</label>
                  <input
                    type="url"
                    value={proj.url}
                    onChange={(e) => handleChange(proj.id, "url", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="https://tucampana.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recurso Adicional (PDF, Video...)</label>
                  <input
                    type="url"
                    value={proj.resource}
                    onChange={(e) => handleChange(proj.id, "resource", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción y Resultados</label>
                  <textarea
                    value={proj.description}
                    onChange={(e) => handleChange(proj.id, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Describe el impacto, KPIs alcanzados o el concepto creativo..."
                  />
                </div>

                {/* Selector de Skills (Herramientas usadas) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Herramientas / Habilidades utilizadas</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-white">
                    {availableSkills.length > 0 ? availableSkills.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(proj.id, skill.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          proj.selectedSkills.includes(skill.id)
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {skill.name}
                      </button>
                    )) : <p className="text-xs text-gray-400">Añade habilidades en la sección "Habilidades" primero.</p>}
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="md:col-span-2 flex justify-end mt-4">
                    <button 
                        onClick={() => handleSave(proj)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md shadow-sm text-sm font-medium flex items-center gap-2"
                    >
                        <i className="fas fa-save"></i>
                        Guardar Proyecto
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

export default ProjectsSection