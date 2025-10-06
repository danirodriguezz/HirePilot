"use client"

import { useState } from "react"
import { routes } from "../routes/routes"
import { useNavigate } from "react-router-dom"

const Header = ({ isScrolled }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          className={`hidden lg:flex items-center space-x-8 ${
            isMobileMenuOpen
              ? "absolute top-full left-0 right-0 bg-white flex-col py-4 shadow-lg lg:relative lg:top-auto lg:shadow-none lg:bg-transparent lg:flex-row lg:py-0"
              : ""
          }`}
        >
          <button
            className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            onClick={() => scrollToSection("servicios")}
          >
            Servicios
          </button>
          <button
            className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            onClick={() => scrollToSection("como-funciona")}
          >
            Cómo Funciona
          </button>
          <button
            className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            onClick={() => scrollToSection("testimonios")}
          >
            Testimonios
          </button>
          <button
            className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            onClick={() => scrollToSection("precios")}
          >
            Precios
          </button>
        </nav>

       {/* Botones de autenticación */}
        <div className="hidden lg:flex space-x-2">
          <button
            className="bg-white border border-emerald-600 text-emerald-600 px-5 py-2 rounded-lg font-semibold transition-colors hover:bg-emerald-50"
            onClick={() => navigate(routes.login)}
          >
            Iniciar Sesión
          </button>
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
            onClick={() => navigate(routes.register)}
          >
            Registrarse
          </button>
        </div>

        <button className="lg:hidden text-emerald-600 text-xl" onClick={toggleMobileMenu}>
          <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="absolute top-full left-0 right-0 bg-white flex flex-col py-4 shadow-lg lg:hidden">
            <button
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4"
              onClick={() => scrollToSection("servicios")}
            >
              Servicios
            </button>
            <button
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4"
              onClick={() => scrollToSection("como-funciona")}
            >
              Cómo Funciona
            </button>
            <button
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4"
              onClick={() => scrollToSection("testimonios")}
            >
              Testimonios
            </button>
            <button
              className="text-gray-600 hover:text-emerald-600 transition-colors font-medium py-2 px-4"
              onClick={() => scrollToSection("precios")}
            >
              Precios
            </button>
            <div className="flex flex-col space-y-2 px-4 mt-2">
              <button
                className="bg-white border border-emerald-600 text-emerald-600 px-5 py-2 rounded-lg font-semibold transition-colors hover:bg-emerald-50"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate(routes.login)
                }}
              >
                Iniciar Sesión
              </button>
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  navigate(routes.register)
                }}
              >
                Registrarse
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
