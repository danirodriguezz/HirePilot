"use client"

// Versión más simple de la página 404
const NotFoundPage = () => {
  const handleGoHome = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Número 404 */}
        <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text mb-8">
          404
        </div>

        {/* Contenido */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Página no encontrada</h1>

        <p className="text-xl text-gray-600 mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>

        {/* Botón */}
        <button
          onClick={handleGoHome}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
        >
          <i className="fas fa-home"></i>
          Volver al Inicio
        </button>

        {/* Branding */}
        <div className="mt-12 flex items-center justify-center gap-2 text-gray-500">
          <i className="fas fa-file-alt text-emerald-600"></i>
          <span className="font-semibold text-emerald-600">HirePilot</span>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage

