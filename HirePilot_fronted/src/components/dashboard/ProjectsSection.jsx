"use client"

import { useState, useEffect } from "react"
import { projectService, mapToBackendProject, mapToFrontendProject } from "../../services/projectService"
import toast from "react-hot-toast"
import ConfirmModal from "../ui/ConfirmModal"
import CustomDatePicker from "../ui/CustomDatePicker"

const ProjectsSection = ({ data, availableSkills, onUpdate }) => {
  const [projects, setProjects] = useState(data || []) 

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

  // 1. LÓGICA DE DIRTY STATE (Cambios sin guardar)
  const isProjectDirty = (proj) => {
    const original = data.find(d => d.id === proj.id)
    if (!original) return true // Es un borrador nuevo
    return JSON.stringify(proj) !== JSON.stringify(original)
  }

  const isAnyDirty = projects.some(isProjectDirty)

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

  // Cargar Proyectos
  useEffect(() => {
    setProjects(data)
  }, [data])

  // 2. Guardar
  const handleSave = async (projLocal) => {
    const saveAction = async () => {
      const payload = mapToBackendProject(projLocal)
      let savedDataBackend
      
      // Verificación segura de ID temporal
      if (projLocal.id && typeof projLocal.id === 'string' && projLocal.id.startsWith('temp-')) {
         savedDataBackend = await projectService.create(payload)
      } else {
         savedDataBackend = await projectService.update(projLocal.id, payload)
      }

      const savedDataFrontend = mapToFrontendProject(savedDataBackend)

      // Actualizar local
      const newList = projects.map(p => p.id === projLocal.id ? savedDataFrontend : p)
      setProjects(newList)
      
      // Actualizar PADRE
      onUpdate(newList)

      return savedDataFrontend
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
    const isTemp = typeof id === 'string' && id.startsWith('temp-')

    const deleteAction = async () => {
      if (!isTemp) await projectService.delete(id)
      
      const newList = projects.filter(p => p.id !== id)
      setProjects(newList)
      onUpdate(newList)
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
      const currentSkills = p.selectedSkills || []
      if (currentSkills.includes(skillId)) {
        return { ...p, selectedSkills: currentSkills.filter(id => id !== skillId) }
      } else {
        return { ...p, selectedSkills: [...currentSkills, skillId] }
      }
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 text-sm sm:text-base space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Proyectos y Portafolio</h2>
          <p className="text-gray-600">Destaca tus trabajos, campañas o logros clave</p>
        </div>
        <button
          onClick={addProject}
          className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm"
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
          {projects.map((proj, index) => {
            
            // Calculamos si ESTE proyecto tiene cambios
            const isDirty = isProjectDirty(proj);

            return (
              <div 
                key={proj.id} 
                className={`border rounded-lg p-6 transition-all duration-300 relative ${
                  isDirty 
                    ? "border-amber-400 ring-1 ring-amber-400/50 bg-amber-50/5 pb-24 md:pb-6" 
                    : "border-gray-200 bg-gray-50/50"
                }`}
              >
                
                {/* Header Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Proyecto {projects.length - index}
                    {isDirty && <span className="ml-2 text-xs text-amber-600 font-normal italic">*Modificado</span>}
                  </h3>
                  <button 
                    onClick={() => openDeleteModal(proj.id)} 
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Eliminar proyecto"
                  >
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
                      className="w-full px-3 py-2 border rounded-md font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
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
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      placeholder="Ej: Lead Designer, Copywriter..."
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={proj.category}
                      onChange={(e) => handleChange(proj.id, "category", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      placeholder="Ej: Coca-Cola, Freelance..."
                    />
                  </div>

                  <div className="hidden md:block"></div>

                  {/* Fechas */}
                  <div>
                    <CustomDatePicker 
                      label="Inicio"
                      value={proj.startDate}
                      onChange={(val) => handleChange(proj.id, "startDate", val)}
                      showMonthYearPicker={true}
                      placeholder="Fecha inicio"
                    />
                  </div>
                  <div>
                    <CustomDatePicker 
                      label="Fin"
                      value={proj.endDate}
                      onChange={(val) => handleChange(proj.id, "endDate", val)}
                      showMonthYearPicker={true}
                      placeholder="Fecha fin"
                      minDate={proj.startDate ? new Date(proj.startDate) : null}
                    />
                  </div>

                  {/* Links */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enlace Principal</label>
                    <input
                      type="url"
                      value={proj.url}
                      onChange={(e) => handleChange(proj.id, "url", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      placeholder="https://tucampana.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recurso Adicional (PDF, Video...)</label>
                    <input
                      type="url"
                      value={proj.resource}
                      onChange={(e) => handleChange(proj.id, "resource", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
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
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                      placeholder="Describe el impacto, KPIs alcanzados o el concepto creativo..."
                    />
                  </div>

                  {/* Selector de Skills */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Herramientas / Habilidades utilizadas</label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border rounded-md bg-white">
                      {availableSkills && availableSkills.length > 0 ? availableSkills.map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => toggleSkill(proj.id, skill.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            proj.selectedSkills?.includes(skill.id)
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {skill.name}
                        </button>
                      )) : <p className="text-xs text-gray-400">Añade habilidades en la sección "Habilidades" primero.</p>}
                    </div>
                  </div>

                </div> {/* <--- FIN DEL GRID DE INPUTS */}

                {/* FOOTER DE LA TARJETA (Sticky bar en móviles) */}
                <div
                  className={`flex items-center justify-between transition-all duration-300
                    ${isDirty
                      // MÓVIL: Fijo en la parte inferior
                      ? "fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-amber-200 shadow-[0_-8px_15px_rgba(0,0,0,0.08)] " +
                      // ESCRITORIO (md): Estático dentro de la tarjeta
                      "md:static md:w-auto md:bg-amber-50/50 md:p-4 md:-mx-6 md:-mb-6 md:rounded-b-lg md:shadow-none mt-0 md:mt-6 md:border-t-0"
                      // ESTADO GUARDADO: Diseño normal
                      : "mt-6 pt-4 border-t border-gray-100 flex justify-end"
                    }
                  `}
                >
                  {isDirty && (
                    <div>
                      <p className="text-amber-700 text-sm flex items-center animate-pulse font-medium">
                        <i className="fas fa-circle-exclamation mr-2"></i>
                        <span className="hidden sm:inline">Cambios sin guardar</span>
                        <span className="sm:hidden">Sin guardar</span>
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleSave(proj)}
                    disabled={!isDirty && proj.id} // Deshabilitado si no hay cambios
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

export default ProjectsSection