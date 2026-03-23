import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Información que Recopilamos</h2>
            <p>
              Para proporcionar el servicio de personalización de CVs, recopilamos la información que proporcionas directamente al crear tu "Master Data". Esto incluye: nombre, correo electrónico, historial académico, experiencia laboral, habilidades y proyectos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Uso de la Información</h2>
            <p>
              La información recopilada se utiliza de forma exclusiva para:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Autenticarte en la plataforma.</li>
              <li>Analizar semánticamente tu perfil frente a ofertas de trabajo (Job Descriptions).</li>
              <li>Generar un currículum en formato PDF adaptado a dichas ofertas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Compartir con Terceros (Proveedores de IA)</h2>
            <p>
              Tus datos curriculares son procesados a través de APIs de Modelos de Lenguaje (LLMs) de terceros estrictamente para la reescritura de textos. No vendemos, alquilamos ni comercializamos tu información personal a terceros bajo ninguna circunstancia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Seguridad y Retención</h2>
            <p>
              Almacenamos tu información en bases de datos seguras (PostgreSQL). No obstante, en el contexto actual del proyecto (Hackathon), todos los datos se consideran efímeros y están sujetos a ser eliminados periódicamente. Tienes derecho a eliminar tu cuenta y todos tus datos asociados en cualquier momento desde el panel de control.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;