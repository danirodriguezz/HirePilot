"use client"

import { useState, useEffect } from "react"
import { certificateService, mapToFrontendCertificate, mapToBackendCertificate } from "../../services/certificateService"
import ConfirmModal from "../ui/ConfirmModal"
import CustomDatePicker from "../ui/CustomDatePicker"
import toast from "react-hot-toast"

const CertificatesSection = ({ data, onUpdate }) => {
  const [certificates, setCertificates] = useState(data || [])
  const [errors, setErrors] = useState({}) // Nuevo estado para validaciones

  // Estados del Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // 1. LÓGICA DE DIRTY STATE
  const isCertificateDirty = (cert) => {
    const original = data.find(d => d.id === cert.id)
    if (!original) return true 
    return JSON.stringify(cert) !== JSON.stringify(original)
  }

  const isAnyDirty = certificates.some(isCertificateDirty)

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

  useEffect(() => {
    setCertificates(data)
    setErrors({}) // Limpiamos errores si vienen datos nuevos
  }, [data])

  // --- LÓGICA DE VALIDACIÓN ---
  const validateCertificate = (cert) => {
    const newErrors = {}
    
    // Campos obligatorios requeridos
    if (!cert.name || !cert.name.trim()) newErrors.name = "El nombre del certificado es obligatorio"
    if (!cert.issuer || !cert.issuer.trim()) newErrors.issuer = "La organización emisora es obligatoria"
    if (!cert.date) newErrors.date = "La fecha de emisión es obligatoria"
    if (!cert.description || !cert.description.trim()) newErrors.description = "La descripción es obligatoria"
    
    // Validación extra: Si hay URL, que tenga formato válido
    const urlPattern = /^(https?:\/\/)?([\w\d\-_]+\.+[A-Za-z]{2,})+\/?/
    if (cert.url && cert.url.trim() !== "" && !urlPattern.test(cert.url)) {
      newErrors.url = "Introduce una URL válida"
    }

    return newErrors
  }

  // 2. Guardar (Crear o Editar)
  const handleSave = async (certLocal) => {
    // 1. Validar antes de hacer la petición
    const fieldErrors = validateCertificate(certLocal)
    
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, [certLocal.id]: fieldErrors }))
      toast.error("Por favor, corrige los errores marcados antes de guardar.")
      return
    }

    const saveAction = async () => {
      const payload = mapToBackendCertificate(certLocal)
      let savedDataBackend;

      if (certLocal.id && typeof certLocal.id === 'string' && certLocal.id.startsWith('temp-')) {
         savedDataBackend = await certificateService.create(payload)
      } else {
         savedDataBackend = await certificateService.update(certLocal.id, payload)
      }

      const savedDataFrontend = mapToFrontendCertificate(savedDataBackend)

      const newList = certificates.map(c => 
        c.id === certLocal.id ? savedDataFrontend : c
      )
      setCertificates(newList)
      onUpdate(newList)

      // Limpiar errores de este certificado tras éxito
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[certLocal.id]
        return newErrors
      })

      return savedDataFrontend
    }

    toast.promise(saveAction(), {
      loading: 'Guardando...',
      success: '¡Certificado guardado!',
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
      if (!isTemp) await certificateService.delete(id)
      
      const newList = certificates.filter(c => c.id !== id)
      setCertificates(newList)
      onUpdate(newList) 

      // Limpiar errores residuales de la tarjeta borrada
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
        success: 'Certificado eliminado',
        error: 'No se pudo eliminar',
      })
    }
    setItemToDelete(null)
  }

  // 4. Gestión de estado local
  const addCertificate = () => {
    const newCertificate = {
      id: `temp-${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
      expiryDate: "",
      credentialId: "",
      url: "",
      description: "",
    }
    setCertificates([newCertificate, ...certificates])
  }

  const updateCertificate = (id, field, value) => {
    setCertificates(prev => prev.map((cert) => 
      (cert.id === id ? { ...cert, [field]: value } : cert)
    ))

    // Limpieza dinámica de errores al corregir
    if (errors[id] && errors[id][field]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: undefined }
      }))
    }
  }

  // Helper de estilos CSS
  const getInputClasses = (certId, fieldName) => `
    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
    ${errors[certId]?.[fieldName] 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
    }
  `

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 text-sm sm:text-base space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Certificados y Licencias</h2>
          <p className="text-gray-600">Añade tus certificaciones profesionales</p>
        </div>
        <button
          onClick={addCertificate}
          className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 shadow-sm"
        >
          <i className="fas fa-plus"></i>
          Añadir Certificado
        </button>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar certificado?"
        message="Esta acción eliminará el certificado permanentemente."
      />

      {certificates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-certificate text-4xl mb-4"></i>
          <p>No has añadido certificados aún</p>
          <p className="text-sm">Haz clic en "Añadir Certificado" para empezar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {certificates.map((cert, index) => {
            const isDirty = isCertificateDirty(cert);
            const certErrors = errors[cert.id] || {};

            return (
              <div 
                key={cert.id} 
                className={`border rounded-lg p-6 relative transition-all duration-300 ${
                  isDirty ? "border-amber-400 ring-1 ring-amber-400/50 pb-24 md:pb-6" : "border-gray-200"
                }`}
              >
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Certificado {certificates.length - index}
                    {isDirty && <span className="ml-2 text-xs text-amber-600 font-normal italic">*Modificado</span>}
                  </h3>
                  <button 
                    onClick={() => openDeleteModal(cert.id)} 
                    className="text-red-600 hover:text-red-700 p-2 transition-colors"
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del certificado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cert.name || ""}
                      onChange={(e) => updateCertificate(cert.id, "name", e.target.value)}
                      className={getInputClasses(cert.id, "name")}
                      placeholder="Ej: AWS Certified Solutions Architect"
                    />
                    {certErrors.name && <p className="mt-1 text-xs text-red-500">{certErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organización emisora <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cert.issuer || ""}
                      onChange={(e) => updateCertificate(cert.id, "issuer", e.target.value)}
                      className={getInputClasses(cert.id, "issuer")}
                      placeholder="Ej: Amazon Web Services"
                    />
                    {certErrors.issuer && <p className="mt-1 text-xs text-red-500">{certErrors.issuer}</p>}
                  </div>

                  {/* Fechas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de emisión <span className="text-red-500">*</span>
                    </label>
                    <CustomDatePicker
                      value={cert.date}
                      onChange={(val) => updateCertificate(cert.id, "date", val)}
                      showMonthYearPicker={true}
                      placeholder="Seleccionar fecha"
                      className={certErrors.date ? "border-red-300 bg-red-50" : ""}
                    />
                    {certErrors.date && <p className="mt-1 text-xs text-red-500">{certErrors.date}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de expiración <span className="font-normal text-gray-500">(Opcional)</span>
                    </label>
                    <CustomDatePicker
                      value={cert.expiryDate}
                      onChange={(val) => updateCertificate(cert.id, "expiryDate", val)}
                      showMonthYearPicker={true}
                      placeholder="Seleccionar fecha"
                      minDate={cert.date ? new Date(cert.date) : null}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 ">
                      ID de credencial <span className="font-normal text-gray-500">(Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={cert.credentialId || ""}
                      onChange={(e) => updateCertificate(cert.id, "credentialId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Número o código"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 ">
                      URL de verificación <span className="font-normal text-gray-500">(Opcional)</span>
                    </label>
                    <input
                      type="url"
                      value={cert.url || ""}
                      onChange={(e) => updateCertificate(cert.id, "url", e.target.value)}
                      className={getInputClasses(cert.id, "url")}
                      placeholder="https://..."
                    />
                    {certErrors.url && <p className="mt-1 text-xs text-red-500">{certErrors.url}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={cert.description || ""}
                      onChange={(e) => updateCertificate(cert.id, "description", e.target.value)}
                      rows={3}
                      className={getInputClasses(cert.id, "description")}
                      placeholder="Habilidades adquiridas o breve explicación..."
                    />
                    {certErrors.description && <p className="mt-1 text-xs text-red-500">{certErrors.description}</p>}
                  </div>
                </div>

                {/* FOOTER DE LA TARJETA */}
                <div
                  className={`flex items-center justify-between transition-all duration-300
                    ${isDirty
                      ? "fixed bottom-0 left-0 w-full z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-amber-200 shadow-[0_-8px_15px_rgba(0,0,0,0.08)] md:static md:w-auto md:bg-amber-50/50 md:p-4 md:-mx-6 md:-mb-6 md:rounded-b-lg md:shadow-none mt-0 md:mt-6 md:border-t-0"
                      : "mt-6 pt-4 border-t border-gray-100"
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
                    onClick={() => handleSave(cert)}
                    disabled={!isDirty && cert.id && !cert.id.toString().startsWith('temp-')}
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

export default CertificatesSection