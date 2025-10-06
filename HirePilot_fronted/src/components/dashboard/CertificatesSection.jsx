"use client"

import { useState } from "react"

const CertificatesSection = ({ data, onUpdate }) => {
  const [certificates, setCertificates] = useState(data)

  const addCertificate = () => {
    const newCertificate = {
      id: Date.now(),
      name: "",
      issuer: "",
      date: "",
      expiryDate: "",
      credentialId: "",
      url: "",
      description: "",
    }
    const updatedCertificates = [...certificates, newCertificate]
    setCertificates(updatedCertificates)
    onUpdate(updatedCertificates)
  }

  const updateCertificate = (id, field, value) => {
    const updatedCertificates = certificates.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    setCertificates(updatedCertificates)
    onUpdate(updatedCertificates)
  }

  const deleteCertificate = (id) => {
    const updatedCertificates = certificates.filter((cert) => cert.id !== id)
    setCertificates(updatedCertificates)
    onUpdate(updatedCertificates)
  }

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

      {certificates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-certificate text-4xl mb-4"></i>
          <p>No has añadido certificados aún</p>
          <p className="text-sm">Haz clic en "Añadir Certificado" para empezar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {certificates.map((cert, index) => (
            <div key={cert.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Certificado {index + 1}</h3>
                <button onClick={() => deleteCertificate(cert.id)} className="text-red-600 hover:text-red-700 p-2">
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
                    placeholder="Número o código de verificación"
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
                    placeholder="Habilidades adquiridas, relevancia para tu carrera..."
                  />
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
