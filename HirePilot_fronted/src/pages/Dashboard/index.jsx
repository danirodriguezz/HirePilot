"use client"

import api from "../../api/axiosInstance"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import DashboardSidebar from "../../components/dashboard/DashboardSidebar"
import ProfileSection from "../../components/dashboard/ProfileSection"
import ExperienceSection from "../../components/dashboard/ExperienceSection"
import EducationSection from "../../components/dashboard/EducationSection"
import CertificatesSection from "../../components/dashboard/CertificatesSection"
import LanguagesSection from "../../components/dashboard/LanguagesSection"
import SkillsSection from "../../components/dashboard/SkillsSection"
import ProjectsSection from "../../components/dashboard/ProjectsSection"
import JobDescriptionSection from "../../components/dashboard/JobDescriptionSection"
import GenerateCVSection from "../../components/dashboard/GenerateCVSection"

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("profile")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
      summary: "",
    },
    experience: [],
    education: [],
    certificates: [],
    languages: [],
    skills: {
      technical: [],
      soft: [],
    },
    projects: [],
    jobDescription: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)

  // NUEVO: Obtener datos del usuario autenticado
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/profile")
        setUserData(prev => {
          const newState = {
            ...prev,
            profile: {
              ...prev.profile,
              firstName: res.data.user.first_name,
              lastName: res.data.user.last_name,
              email: res.data.user.email
            },
          };
          return newState;
        });
    } catch (err) {
      console.error("Error obteniendo usuario:", err)
    }
    }
    fetchUser()
  }, [])

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      await api.post("/logout", { refresh: refreshToken });
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    // Opcional: también puedes redirigir aquí si quieres
    navigate("/login");
  }
};


  const updateUserData = (section, data) => {
    setUserData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  // Función para obtener las iniciales
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ""
    const last = lastName?.charAt(0) || ""
    return (first + last).toUpperCase()
  }

  const handleGenerateCV = async (jobDescription) => {
    setIsGenerating(true)
    try {
      // Simular llamada al backend
      const payload = {
        ...userData,
        jobDescription,
        timestamp: new Date().toISOString(),
      }

      console.log("Enviando datos al backend:", payload)

      // Simular tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 3000))

      alert("¡CV generado exitosamente! Te enviaremos el resultado por email.")
    } catch (error) {
      console.error("Error generando CV:", error)
      alert("Error al generar el CV. Por favor, inténtalo de nuevo.")
    } finally {
      setIsGenerating(false)
    }
  }

  const sections = [
    { id: "profile", name: "Perfil Personal", icon: "fas fa-user" },
    { id: "experience", name: "Experiencia", icon: "fas fa-briefcase" },
    { id: "education", name: "Educación", icon: "fas fa-graduation-cap" },
    { id: "certificates", name: "Certificados", icon: "fas fa-certificate" },
    { id: "languages", name: "Idiomas", icon: "fas fa-language" },
    { id: "skills", name: "Habilidades", icon: "fas fa-cogs" },
    { id: "projects", name: "Proyectos", icon: "fas fa-project-diagram" },
    { id: "generate", name: "Generar CV", icon: "fas fa-file-pdf" },
  ]

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection data={userData.profile} onUpdate={(data) => updateUserData("profile", data)} />
      case "experience":
        return <ExperienceSection data={userData.experience} onUpdate={(data) => updateUserData("experience", data)} />
      case "education":
        return <EducationSection data={userData.education} onUpdate={(data) => updateUserData("education", data)} />
      case "certificates":
        return (
          <CertificatesSection data={userData.certificates} onUpdate={(data) => updateUserData("certificates", data)} />
        )
      case "languages":
        return <LanguagesSection data={userData.languages} onUpdate={(data) => updateUserData("languages", data)} />
      case "skills":
        return <SkillsSection data={userData.skills} onUpdate={(data) => updateUserData("skills", data)} />
      case "projects":
        return <ProjectsSection data={userData.projects} onUpdate={(data) => updateUserData("projects", data)} />
      case "generate":
        return (
          <div className="space-y-6">
            <JobDescriptionSection
              jobDescription={userData.jobDescription}
              onUpdate={(data) => updateUserData("jobDescription", data)}
            />
            <GenerateCVSection userData={userData} onGenerate={handleGenerateCV} isGenerating={isGenerating} />
          </div>
        )
      default:
        return <ProfileSection data={userData.profile} onUpdate={(data) => updateUserData("profile", data)} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>

              <Link to="/" className="flex items-center gap-2">
                <i className="fas fa-file-alt text-2xl text-emerald-600"></i>
                <span className="text-2xl font-bold text-gray-900">CVPro</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Datos guardados automáticamente
              </div>

              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-semibold text-sm">
                      {getInitials(userData.profile.firstName, userData.profile.lastName)}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {userData.profile.firstName} {userData.profile.lastName.split(" ")[0]}
                  </span>
                  <i className="fas fa-chevron-down text-xs text-gray-400"></i>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {sections.find((s) => s.id === activeSection)?.name}
                  </h1>
                  <div className="text-sm text-gray-600">
                    Completado: <span className="font-semibold text-emerald-600">75%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>

              {/* Section Content */}
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}

export default Dashboard
