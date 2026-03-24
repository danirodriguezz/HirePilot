"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import { routes } from "../../routes/routes";

// --- Constantes y Funciones Auxiliares ---
const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-500",
];

const getPasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

// Generador de clases para inputs (DRY - Don't Repeat Yourself)
const getInputClassName = (hasError, extraClasses = "") =>
  `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${hasError
    ? "border-red-300 focus:ring-red-500"
    : "border-gray-300 focus:ring-emerald-500"
  } ${extraClasses}`;

// --- Componente Principal ---
const RegisterPage = () => {
  // 1. Estados Globales
  const [currentStep, setCurrentStep] = useState(1);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados del Formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profession: "",
    experience: "",
    industry: "",
    terms: false,
  });

  // En tus variables derivadas (antes del return)
  const isStep2Valid = formData.profession.trim() !== "" && formData.experience !== "" && formData.industry !== "" && formData.terms;
  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Opciones de Selects
  const [industryChoices, setIndustryChoices] = useState([]);
  const [experienceChoices, setExperienceChoices] = useState([]);

  // 2. Efectos
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get("registration-options/");
        setIndustryChoices(response.data.industries);
        setExperienceChoices(response.data.experience_ranges);
      } catch (error) {
        console.error("Error al cargar las opciones de registro:", error);
      }
    };

    fetchOptions();
  }, []);

  // 3. Manejadores de Eventos (Handlers)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error del campo específico si el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido";
      if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido";

      if (!formData.email) {
        newErrors.email = "El email es requerido";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "El email no es válido";
      }

      if (!formData.password) {
        newErrors.password = "La contraseña es requerida";
      } else if (formData.password.length < 8) {
        newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "La contraseña debe contener mayúsculas, minúsculas y números";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    } else if (step === 2) {
      if (!formData.profession.trim()) newErrors.profession = "La profesión es requerida";
      if (!formData.experience) newErrors.experience = "La experiencia es requerida";
      if (!formData.industry) newErrors.industry = "La industria es requerida";
      if (!formData.terms) newErrors.terms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Intentando registrar con datos:", formData);
    if (currentStep !== 2) {
      handleNext();
      return;
    }

    if (!validateStep(2)) return;

    setIsLoading(true);

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      profession: formData.profession,
      experience: formData.experience,
      industry: formData.industry,
    };

    try {
      await api.post("register/", payload);
      setIsRegistrationSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setErrors({
        general: "Error en el registro. Verifica los datos.",
        ...(error.response?.data || {})
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Variables Derivadas
  const passwordStrength = getPasswordStrength(formData.password);
  const progressPercentage = (currentStep / 2) * 100;

  // --- RENDERIZADO CONDICIONAL: PANTALLA DE ÉXITO ---
  if (isRegistrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-envelope-open-text text-4xl text-emerald-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Casi estamos listos!</h2>
          <p className="text-gray-600 mb-6">
            Hemos enviado un correo de confirmación a <strong>{formData.email}</strong>.
            <br /><br />
            Por favor, haz clic en el enlace del correo para activar tu cuenta y empezar a usar la plataforma.
          </p>
          <Link
            to={routes.login}
            className="block w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
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
          <p className="text-gray-600">Únete a cientos de profesionales en este hackathon</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Paso {currentStep} de 2</span>
            <span className="text-sm text-gray-500">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Contenedor del Formulario */}
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
            {/* --- Paso 1: Información básica --- */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Información básica</h2>
                  <p className="text-gray-600">Empecemos con tus datos personales</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={getInputClassName(errors.firstName)}
                      placeholder="Juan"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={getInputClassName(errors.lastName)}
                      placeholder="Pérez"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={getInputClassName(errors.email, "pl-12")}
                      placeholder="juan@email.com"
                    />
                    <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={getInputClassName(errors.password, "pl-12 pr-12")}
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

                  {formData.password && (
                    <div className="mt-2 flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${i < passwordStrength ? STRENGTH_COLORS[passwordStrength - 1] : "bg-gray-200"
                            }`}
                        ></div>
                      ))}
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={getInputClassName(errors.confirmPassword, "pl-12 pr-12")}
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

            {/* --- Paso 2: Información profesional --- */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Información profesional</h2>
                  <p className="text-gray-600">Cuéntanos sobre tu carrera para finalizar</p>
                </div>

                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">¿Cuál es tu profesión?</label>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className={getInputClassName(errors.profession)}
                    placeholder="Ej: Desarrollador Frontend"
                  />
                  {errors.profession && <p className="mt-1 text-sm text-red-600">{errors.profession}</p>}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">Años de experiencia</label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={getInputClassName(errors.experience)}
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

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">Industria</label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={getInputClassName(errors.industry)}
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

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Acepto los <Link to="/terms" className="text-emerald-600 hover:underline">Términos</Link> y la <Link to="/privacy" className="text-emerald-600 hover:underline">Política de Privacidad</Link>
                    </span>
                  </label>
                  {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
                </div>
              </div>
            )}

            {/* --- Botones de Navegación --- */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i> Anterior
                </button>
              )}

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Siguiente <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading || !isStep2Valid} // <-- Deshabilitado si no han llenado los datos
                  className="ml-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Finalizar Registro
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta? <Link to={routes.login} className="text-emerald-600 hover:text-emerald-700 font-semibold">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;