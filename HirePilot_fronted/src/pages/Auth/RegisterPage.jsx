"use client"
import api from "../../api/axiosInstance"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { routes } from "../../routes/routes"

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Paso 2: Información profesional
    profession: "",
    experience: "",
    industry: "",
    // Paso 3: Preferencias
    plan: "basic",
    newsletter: true,
    terms: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [industryChoices, setIndustryChoices] = useState([])
  const [experienceChoices, setExperienceChoices] = useState([])

  // Cargar opciones de industria al montar el componente
  useEffect(() => {
    api.get("registration-options/")
      .then((response) => {
        setIndustryChoices(response.data.industries)
        setExperienceChoices(response.data.experience_ranges)
      })
      .catch((error) => {
        console.error("Error al cargar las industrias:", error)
      })
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido"
      if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido"
      if (!formData.email) {
        newErrors.email = "El email es requerido"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "El email no es válido"
      }
      if (!formData.password) {
        newErrors.password = "La contraseña es requerida"
      } else if (formData.password.length < 8) {
        newErrors.password = "La contraseña debe tener al menos 8 caracteres"
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "La contraseña debe contener mayúsculas, minúsculas y números"
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    if (step === 2) {
      if (!formData.profession.trim()) newErrors.profession = "La profesión es requerida"
      if (!formData.experience) newErrors.experience = "La experiencia es requerida"
      if (!formData.industry) newErrors.industry = "La industria es requerida"
    }

    if (step === 3) {
      if (!formData.terms) newErrors.terms = "Debes aceptar los términos y condiciones"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep(3)) return;
  setIsLoading(true);

  try {
    const response = await api.post(
      "/register",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);
    localStorage.setItem("user_id", response.data.user_id);
    window.location.href = "/dashboard";
  } catch (error) {
    if (error.response) {
      // Errores desde el backend
      setErrors({
        general:
          error.response.data.error ||
          "Error al crear la cuenta. Inténtalo de nuevo.",
      });
    } else {
      // Errores de red u otros
      setErrors({
        general: "No se pudo conectar con el servidor. Inténtalo más tarde.",
      });
    }
  } finally {
    setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]
  const strengthLabels = ["Muy débil", "Débil", "Regular", "Fuerte", "Muy fuerte"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <i className="fas fa-file-alt text-3xl text-emerald-600"></i>
            <span className="text-3xl font-bold text-gray-900">HirePilot</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crea tu cuenta</h1>
          <p className="text-gray-600">Únete a miles de profesionales que ya optimizan su carrera</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Paso {currentStep} de 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <i className="fas fa-exclamation-circle"></i>
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Paso 1: Información básica */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Información básica</h2>
                  <p className="text-gray-600">Empecemos con tus datos personales</p>
                </div>

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.firstName
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-emerald-500"
                      }`}
                      placeholder="Juan"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.lastName
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-emerald-500"
                      }`}
                      placeholder="Pérez"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-emerald-500"
                      }`}
                      placeholder="juan@email.com"
                    />
                    <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-12 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-emerald-500"
                      }`}
                      placeholder="••••••••"
                    />
                    <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>

                  {/* Indicador de fortaleza */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                            }`}
                          ></div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        Fortaleza: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ""}
                      </p>
                    </div>
                  )}

                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pl-12 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors.confirmPassword
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-emerald-500"
                      }`}
                      placeholder="••••••••"
                    />
                    <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Paso 2: Información profesional */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Información profesional</h2>
                  <p className="text-gray-600">Cuéntanos sobre tu carrera</p>
                </div>

                {/* Profesión */}
                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cuál es tu profesión?
                  </label>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.profession
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    }`}
                    placeholder="Ej: Desarrollador Frontend, Marketing Manager..."
                  />
                  {errors.profession && <p className="mt-1 text-sm text-red-600">{errors.profession}</p>}
                </div>

                {/* Experiencia */}
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Años de experiencia
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.experience
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    }`}
                  >
                    <option value="">Selecciona tu experiencia</option>
                    {experienceChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
                </div>

                {/* Industria */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industria
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.industry
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-emerald-500"
                    }`}
                  >
                    <option value="">Selecciona tu industria</option>
                    {industryChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
                </div>
              </div>
            )}

            {/* Paso 3: Preferencias */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Casi terminamos</h2>
                  <p className="text-gray-600">Elige tu plan y preferencias</p>
                </div>

                {/* Planes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Elige tu plan</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="plan"
                        value="basic"
                        checked={formData.plan === "basic"}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Plan Básico</span>
                          <span className="text-emerald-600 font-bold">€29/CV</span>
                        </div>
                        <p className="text-sm text-gray-600">1 CV personalizado, optimización ATS</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-emerald-600 rounded-lg cursor-pointer bg-emerald-50 transition-colors">
                      <input
                        type="radio"
                        name="plan"
                        value="professional"
                        checked={formData.plan === "professional"}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">Plan Profesional</span>
                            <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                              Recomendado
                            </span>
                          </div>
                          <span className="text-emerald-600 font-bold">€79/mes</span>
                        </div>
                        <p className="text-sm text-gray-600">5 CVs personalizados, cartas de presentación</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="plan"
                        value="premium"
                        checked={formData.plan === "premium"}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Plan Premium</span>
                          <span className="text-emerald-600 font-bold">€149/mes</span>
                        </div>
                        <p className="text-sm text-gray-600">CVs ilimitados, consultoría 1:1</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Preferencias */}
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Quiero recibir consejos de carrera y ofertas especiales por email
                    </span>
                  </label>

                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Acepto los{" "}
                      <Link to="/terms" className="text-emerald-600 hover:underline">
                        Términos de Servicio
                      </Link>{" "}
                      y la{" "}
                      <Link to="/privacy" className="text-emerald-600 hover:underline">
                        Política de Privacidad
                      </Link>
                    </span>
                  </label>
                  {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i>
                  Anterior
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Siguiente
                  <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      Crear cuenta
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link to={ routes.login} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
