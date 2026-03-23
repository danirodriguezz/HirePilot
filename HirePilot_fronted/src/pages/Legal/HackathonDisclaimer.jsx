import React from 'react';

const HackathonDisclaimer = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Aviso de Datos (Hackathon)</h1>
        
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Naturaleza del Proyecto</h2>
            <p>
              <strong>HirePilot</strong> es una prueba de concepto (PoC) desarrollada exclusivamente para su participación en un Hackathon. No es un producto comercial final. Al utilizar esta plataforma, reconoces que se encuentra en fase de desarrollo y pruebas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Volatilidad de los Datos</h2>
            <p>
              Como proyecto temporal, <strong>no garantizamos la persistencia de la información</strong>. La base de datos, incluyendo perfiles de usuario, historiales laborales y CVs generados, podrá ser purgada o eliminada por completo en cualquier momento, y definitivamente dentro de los 30 días posteriores a la finalización del evento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Uso de IA y Cero Retención</h2>
            <p>
              El corazón de HirePilot es nuestro motor de emparejamiento basado en Modelos de Lenguaje Grande (LLMs). Para lograr la reescritura de tu CV sin "alucinaciones", enviamos tu experiencia laboral y la descripción del puesto a proveedores de IA (ej. OpenAI/Anthropic). 
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mt-3">
              <p className="text-sm text-emerald-800 font-medium">
                Garantía Arquitectónica: Las APIs de IA están configuradas con políticas de "Zero Data Retention". Tus datos no son utilizados por estos proveedores para entrenar futuros modelos de IA.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Recomendación sobre Datos Sensibles (PII)</h2>
            <p>
              Aunque aplicamos las mejores prácticas de seguridad, al ser un entorno de pruebas, te recomendamos <strong>no ingresar Información de Identificación Personal (PII) altamente sensible</strong>. Puedes omitir tu dirección física exacta, número de teléfono real o número de identificación nacional (DNI/Pasaporte). Para evaluar la herramienta, la experiencia laboral y académica real es suficiente.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HackathonDisclaimer;