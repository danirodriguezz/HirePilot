"use client"

const Footer = () => {
  const footerSections = [
    {
      title: "Servicios",
      links: ["Personalización de CV", "Optimización ATS", "Cartas de presentación", "Consultoría profesional"],
    },
    {
      title: "Empresa",
      links: ["Sobre nosotros", "Blog", "Contacto", "Ayuda"],
    },
    {
      title: "Legal",
      links: ["Términos de servicio", "Política de privacidad", "Cookies"],
    },
  ]

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-file-alt text-2xl text-emerald-600"></i>
              <span className="text-2xl font-bold">HirePilot</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Personaliza tu currículum para cada oportunidad y aumenta tus posibilidades de éxito.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={(e) => e.preventDefault()}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 HirePilot. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
