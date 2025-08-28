"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setError("El email es requerido")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("El email no es válido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsSuccess(true)
    } catch (error) {
      setError("Error al enviar el email. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-envelope text-emerald-600 text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Email enviado!</h1>
            <p className="text-gray-600 mb-6">
              Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Si no recibes el email en unos minutos, revisa tu carpeta de spam.
            </p>
            <Link
              to="/login"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <i className="fas fa-file-alt text-3xl text-emerald-600"></i>
            <span className="text-3xl font-bold text-gray-900">CVPro</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Olvidaste tu contraseña?</h1>
          <p className="text-gray-600">No te preocupes, te ayudamos a recuperarla</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    error ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"
                  }`}
                  placeholder="tu@email.com"
                />
                <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Enviar enlace de recuperación
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              ← Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
