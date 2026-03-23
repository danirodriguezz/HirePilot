import React from 'react';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Términos de Servicio</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Aceptación de los Términos</h2>
            <p>
              Al registrarte y utilizar HirePilot, aceptas estar sujeto a estos términos. Si no estás de acuerdo con alguna parte, te pedimos que no utilices la plataforma. Recuerda que este es un proyecto demostrativo para un Hackathon.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Filosofía de "Cero Alucinaciones" (Veracidad)</h2>
            <p>
              HirePilot está diseñado para resaltar tu experiencia, no para inventarla. Te comprometes a ingresar información veraz en tu "Master Data". El sistema se esforzará mediante IA por alinear tu perfil con la oferta de empleo de forma estratégica, pero la responsabilidad final sobre la precisión y veracidad del CV generado recae enteramente en ti.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Disponibilidad del Servicio</h2>
            <p>
              El servicio se proporciona "tal cual" (As-Is). Debido a la naturaleza del proyecto, no garantizamos un tiempo de actividad del 100% ni la ausencia de errores. Nos reservamos el derecho de suspender o detener el servicio sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Limitación de Responsabilidad</h2>
            <p>
              HirePilot es una herramienta de asistencia. No garantizamos entrevistas, contrataciones ni éxito laboral tras el uso de los CVs generados. El equipo desarrollador no será responsable por ningún daño directo o indirecto resultante del uso de esta plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;