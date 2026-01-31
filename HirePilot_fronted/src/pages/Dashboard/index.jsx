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
import { generateCVApi } from "../../services/cvService"
import { experienceService, mapToFrontend } from "../../services/experienceService"
import { profileService, mapProfileToFrontend } from "../../services/profileService"
import { educationService, mapToFrontendEducation } from "../../services/educationService"
import { certificateService, mapToFrontendCertificate } from "../../services/certificateService"
import { languageService, mapToFrontendLanguage } from "../../services/languageService"
import { skillService, mapToFrontendSkill } from "../../services/skillService"
import { projectService, mapToFrontendProject } from "../../services/projectService"

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("profile")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const profileMenuRef = useRef(null)
  const navigate = useNavigate()

  const [generatedCV, setGeneratedCV] = useState(null)

  const [userData, setUserData] = useState({
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profession: "",
      linkedin: "",
      website: "",
      summary: "",
      yearsOfExperience: "",
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

  // 1. CARGA DE DATOS UNIFICADA
  useEffect(() => {
    async function fetchAllData() {
      try {
        // Usamos Promise.all para pedir todo a la vez
        const [userRaw, experienceRes, educationRes, certificatesRes, languagesRes, skillsRes, projectsRes] = await Promise.all([
          profileService.getProfile(),
          experienceService.getAll(),
          educationService.getAll(),
          certificateService.getAll(),
          languageService.getAll(),
          skillService.getAll(),
          projectService.getAll()
        ]);

        setUserData(prev => ({
          ...prev,
          profile: mapProfileToFrontend(userRaw),
          experience: experienceRes.map(mapToFrontend),
          education: educationRes.map(mapToFrontendEducation),
          certificates: certificatesRes.map(mapToFrontendCertificate),
          languages: languagesRes.map(mapToFrontendLanguage),
          skills: {
            technical: skillsRes.filter(s => s.skill_type === "TECHNICAL").map(mapToFrontendSkill),
            soft: skillsRes.filter(s => s.skill_type === "SOFT").map(mapToFrontendSkill)
          }
          ,
          projects: projectsRes.map(mapToFrontendProject)
        }));

      } catch (err) {
        console.error("Error cargando datos:", err)
        if(err.response?.status === 401) { /* lógica de redirect */ }
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const updateUserData = (section, data) => {
    setUserData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  // Esta función se la pasaremos al hijo para que nos avise cuando guarde/borre
  const handleExperienceUpdate = (updatedExperienceList) => {
    setUserData(prev => ({
      ...prev,
      experience: updatedExperienceList
    }))
  }

  const handleEducationUpdate = (updatedEducationList) => {
    setUserData(prev => ({
      ...prev,
      education: updatedEducationList
    }))
  }

  const handleCertificateUpdate = (updatedCertificateList) => {
    setUserData(prev => ({
      ...prev,
      certificates: updatedCertificateList
    }))
  }

  const handleLenguageUpdate = (updatedLanguageList) => {
    setUserData(prev => ({
      ...prev,
      languages: updatedLanguageList
    }))
  }

  const handleSkillUpdate = (updatedSkillList) => {
    setUserData(prev => ({
      ...prev,
      skills: updatedSkillList
    }))
  }

  const handleProjectUpdate = (updatedProjectList) => {
    setUserData(prev => ({
      ...prev,
      projects: updatedProjectList
    }))
  }

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
        await api.post("/logout/", { refresh: refreshToken });
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Opcional: también puedes redirigir aquí si quieres
      navigate("/login");
    }
  };


  // Función para obtener las iniciales
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ""
    const last = lastName?.charAt(0) || ""
    return (first + last).toUpperCase()
  }

  // MODIFICADO: Lógica real para conectar con el Backend
  const handleGenerateCV = async (jobDescription) => {
    setIsGenerating(true)
    setGeneratedCV(null) 

    try {
      const response = await generateCVApi(jobDescription)

      console.log("CV Generado:", response)

      setGeneratedCV(response.structured_cv_data)

    } catch (error) {
      console.error("Error generando CV:", error)
      alert("Hubo un error al generar el CV. Por favor, revisa tu conexión o inténtalo de nuevo.")
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
        return <ExperienceSection data={userData.experience} onUpdate={handleExperienceUpdate} />
      case "education":
        return <EducationSection data={userData.education} onUpdate={handleEducationUpdate} />
      case "certificates":
        return (
          <CertificatesSection data={userData.certificates} onUpdate={handleCertificateUpdate} />
        )
      case "languages":
        return <LanguagesSection data={userData.languages} onUpdate={handleLenguageUpdate} />
      case "skills":
        return <SkillsSection data={userData.skills} onUpdate={handleSkillUpdate} />
      case "projects":
        return <ProjectsSection data={userData.projects} 
            availableSkills={[...userData.skills.technical, ...userData.skills.soft]} 
            onUpdate={handleProjectUpdate} />
      case "generate":
        return (
          <div className="space-y-6">
            <JobDescriptionSection
              jobDescription={userData.jobDescription}
              onUpdate={(data) => updateUserData("jobDescription", data)}
            />
            <GenerateCVSection 
              userData={userData} 
              onGenerate={handleGenerateCV} 
              isGenerating={isGenerating}
              generatedCV={generatedCV} // <--- NUEVA PROP: Pasamos el resultado
            />
          </div>
        )
      default:
        return <ProfileSection data={userData.profile} onUpdate={(data) => updateUserData("profile", data)} />
    }
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Cargando tu perfil...</p>
        </div>
      </div>
    )
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transform transition-all duration-200">
                  {/* Si tuvieras más opciones, irían aquí arriba con un separador */}
                  
                  <div className="p-1">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                      onClick={handleLogout}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                        <i className="fas fa-sign-out-alt text-gray-400 group-hover:text-red-500 text-xs"></i>
                      </div>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
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
