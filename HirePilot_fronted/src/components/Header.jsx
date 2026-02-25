"use client"

import { useState, useEffect } from "react"
import { routes } from "../routes/routes"
import { useNavigate } from "react-router-dom"

const Header = ({ isScrolled }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 1. Añadimos el estado para saber si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 2. Comprobamos la sesión al montar el componente y escuchamos cierres de sesión
  useEffect(() => {
    // Función para comprobar el token
    const checkAuth = () => {
      const token = localStorage.getItem("access_token")
      setIsAuthenticated(!!token)
    }

    // Comprobamos al cargar
    checkAuth()

    // Escuchamos el evento personalizado que creamos en axiosInstance.js
    window.addEventListener("auth:logout", checkAuth)

    // Limpieza del listener
    return () => {
      window.removeEventListener("auth:logout", checkAuth)
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 80
      const targetPosition = element.offsetTop - headerHeight
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }
    setIsMobileMenuOpen(false)
  }

  // 3. Subcomponente para renderizar los botones dinámicamente
  const AuthButtons = ({ isMobile }) => {
    // Si ESTÁ autenticado, mostramos el botón del Dashboard
    if (isAuthenticated) {
      return (
        <button
          className={`bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors ${
            isMobile ? "w-full py-2 px-5 mt-2" : "px-5 py-2"
          }`}
          onClick={() => {
            setIsMobileMenuOpen(false)
            navigate(routes.dashboard || "/dashboard") // Asegúrate de que esta ruta exista
          }}
        >
          Ir al Dashboard
        </button>
      )
    }

    // Si NO ESTÁ autenticado, mostramos Login y Registro
    return (
      <>
        <button
          className={`bg-white border border-emerald-600 text-emerald-600 rounded-lg font-semibold transition-colors hover:bg-emerald-50 ${
            isMobile ? "w-full py-2 px-5 mb-2 mt-2" : "px-5 py-2"
          }`}
          onClick={() => {
            setIsMobileMenuOpen(false)
            navigate(routes.login)
          }}
        >
          Iniciar Sesión
        </button>
        <button
          className={`bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors ${
            isMobile ? "w-full py-2 px-5" : "px-5 py-2"
          }`}
          onClick={() => {
            setIsMobileMenuOpen(false)
            navigate(routes.register)
          }}
        >
          Registrarse
        </button>
      </>
    )
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm transition-all duration-300 ${
        isScrolled ? "bg-white/95" : "bg-white/80"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className="fas fa-file-alt h-8 w-8 text-2xl text-emerald-600"></i>
          <span className="text-2xl font-bold text-gray-900">HirePilot</span>
        </div>

        <nav
          className={`hidden lg:flex items-center space-x-8`}
        >
          <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium" onClick={() => scrollToSection("servicios")}>
            Servicios
          </button>
          <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium" onClick={() => scrollToSection("como-funciona")}>
            Cómo Funciona
          </button>
          <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium" onClick={() => scrollToSection("testimonios")}>
            Testimonios
          </button>
          <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium" onClick={() => scrollToSection("precios")}>
            Precios
          </button>
        </nav>

        {/* 4. Usamos el componente AuthButtons para Desktop */}
        <div className="hidden lg:flex space-x-2">
          <AuthButtons isMobile={false} />
        </div>

        <button className="lg:hidden text-emerald-600 text-xl" onClick={toggleMobileMenu}>
          <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="absolute top-full left-0 right-0 bg-white flex flex-col py-4 shadow-lg lg:hidden">
            <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4" onClick={() => scrollToSection("servicios")}>Servicios</button>
            <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4" onClick={() => scrollToSection("como-funciona")}>Cómo Funciona</button>
            <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4" onClick={() => scrollToSection("testimonios")}>Testimonios</button>
            <button className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4" onClick={() => scrollToSection("precios")}>Precios</button>
            
            {/* 5. Usamos el componente AuthButtons para Mobile */}
            <div className="flex flex-col px-4 border-t border-gray-100 mt-2 pt-2">
              <AuthButtons isMobile={true} />
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header