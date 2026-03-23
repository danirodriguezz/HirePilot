"use client"

const Footer = () => {
  const footerSections = [
    {
      title: "El Proyecto",
      links: [
        { name: "Repositorio (GitHub)", href: "https://github.com/danirodriguezz/HirePilot" }
      ],
    },
    {
      title: "Legal & Privacidad",
      // Es vital tener una Política de Privacidad clara si procesas PII con LLMs
      links: [
        { name: "Política de Privacidad", href: "/privacy" },
        { name: "Términos de Uso", href: "/terms" },
        { name: "Aviso de Datos (Hackathon)", href: "/hackathon-disclaimer" }, 
      ],
    },
  ]

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 border-t border-gray-800">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {/* Se asume que usas FontAwesome por la clase fas fa-file-alt del original */}
              <i className="fas fa-file-alt text-2xl text-emerald-600"></i>
              <span className="text-2xl font-bold">HirePilot</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Proyecto desarrollado para Hackatón CubePath 2026. 
              Adaptamos tu currículum usando IA bajo una estricta política de <strong>cero alucinaciones</strong> y protección de datos personales.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4 text-emerald-500">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      // Si es un enlace externo (como GitHub), ábrelo en otra pestaña
                      {...(link.href.startsWith('http') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} HirePilot. Proyecto de demostración (Hackathon).
          </p>
          <p className="mt-2 md:mt-0">
            <strong>Nota:</strong> Los datos ingresados se utilizan exclusivamente para la generación del CV y podrían ser purgados tras la evaluación del jurado.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer