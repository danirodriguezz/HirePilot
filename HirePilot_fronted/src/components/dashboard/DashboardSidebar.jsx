"use client"

const DashboardSidebar = ({ sections, activeSection, onSectionChange, isOpen, onClose }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex flex-col flex-grow px-4">
            <nav className="flex-1 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <i className={`${section.icon} mr-3 text-lg`}></i>
                  {section.name}
                </button>
              ))}
            </nav>

            <div className="mt-8 p-4 bg-emerald-50 rounded-lg">
              <h3 className="text-sm font-medium text-emerald-800 mb-2">💡 Consejo</h3>
              <p className="text-xs text-emerald-700">
                Completa todas las secciones para obtener un CV más efectivo y personalizado.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-16">
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
            <button onClick={onClose} className="p-2 rounded-md text-gray-400 hover:text-gray-500">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-1 px-4 py-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id)
                    onClose()
                  }}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <i className={`${section.icon} mr-3 text-lg`}></i>
                  {section.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}

export default DashboardSidebar
