"use client"

import { useState, useEffect } from "react"
import { certificateService } from "../../services/certificateService"
import ConfirmModal from "../ui/ConfirmModal"
import toast from "react-hot-toast"

// --- MAPPERS (Frontend <-> Backend) ---
const mapToBackend = (cert) => ({
  name: cert.name,
  issuing_organization: cert.issuer, // Front: issuer -> Back: issuing_organization
  issue_date: cert.date ? `${cert.date}-01` : null,
  expiration_date: cert.expiryDate ? `${cert.expiryDate}-01` : null,
  credential_id: cert.credentialId,
  credential_url: cert.url,          // Front: url -> Back: credential_url
  description: cert.description,
})

const mapToFrontend = (apiData) => ({
  id: apiData.id,
  name: apiData.name,
  issuer: apiData.issuing_organization,
  date: apiData.issue_date ? apiData.issue_date.substring(0, 7) : "",
  expiryDate: apiData.expiration_date ? apiData.expiration_date.substring(0, 7) : "",
  credentialId: apiData.credential_id || "",
  url: apiData.credential_url || "",
  description: apiData.description || "",
})

const CertificatesSection = () => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados del Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // 1. Cargar datos
  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      const data = await certificateService.getAll()
      setCertificates(data.map(mapToFrontend))
    } catch (err) {
      console.error(err)
      toast.error("Error al cargar certificados")
    } finally {
      setLoading(false)
    }
  }

  // 2. Guardar (Crear o Editar)
  const handleSave = async (certLocal) => {
    const saveAction = async () => {
      const payload = mapToBackend(certLocal)
      let savedData;

      if (certLocal.id && typeof certLocal.id !== 'number') {
         // Crear (ID temporal)
         savedData = await certificateService.create(payload)
      } else {
         // Actualizar (ID real)
         savedData = await certificateService.update(certLocal.id, payload)
      }

      setCertificates(prev => prev.map(c => 
        c.id === certLocal.id ? mapToFrontend(savedData) : c
      ))
      return savedData
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
    const isTemp = typeof id !== 'number'

    const deleteAction = async () => {
      if (!isTemp) await certificateService.delete(id)
      setCertificates(prev => prev.filter(c => c.id !== id))
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
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando certificados...</div>

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Certificados y Licencias</h2>
          <p className="text-gray-600">Añade tus certificaciones profesionales</p>
        </div>
        <button
          onClick={addCertificate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
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
          {certificates.map((cert, index) => (
            <div key={cert.id} className="border border-gray-200 rounded-lg p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Certificado {certificates.length - index}</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del certificado</label>
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCertificate(cert.id, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: AWS Certified Solutions Architect"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organización emisora</label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCertificate(cert.id, "issuer", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ej: Amazon Web Services"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de emisión</label>
                  <input
                    type="month"
                    value={cert.date}
                    onChange={(e) => updateCertificate(cert.id, "date", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de expiración (opcional)</label>
                  <input
                    type="month"
                    value={cert.expiryDate}
                    onChange={(e) => updateCertificate(cert.id, "expiryDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID de credencial (opcional)</label>
                  <input
                    type="text"
                    value={cert.credentialId}
                    onChange={(e) => updateCertificate(cert.id, "credentialId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Número o código"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL de verificación (opcional)</label>
                  <input
                    type="url"
                    value={cert.url}
                    onChange={(e) => updateCertificate(cert.id, "url", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
                  <textarea
                    value={cert.description}
                    onChange={(e) => updateCertificate(cert.id, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Habilidades adquiridas..."
                  />
                </div>
                
                {/* Botón Guardar */}
                <div className="md:col-span-2 flex justify-end border-t border-gray-100 pt-4 mt-2">
                    <button 
                        onClick={() => handleSave(cert)}
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

export default CertificatesSection