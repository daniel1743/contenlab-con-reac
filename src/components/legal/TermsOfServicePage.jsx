import React from 'react';

const sections = [
  {
    title: '1. Introducción',
    content: `Estos Términos de Servicio (“Términos”) regulan el acceso y uso de CreoVision, suite
    web ubicada en https://creovision.io (el “Sitio”) y de todas las funcionalidades
    asociadas, incluyendo hub de herramientas (“Centro Creativo”), paneles de análisis,
    integraciones con APIs de terceros y módulos impulsados por inteligencia artificial
    (conjuntamente, la “Plataforma”). Al crear una cuenta, acceder o utilizar cualquier parte
    de la Plataforma, aceptas expresamente los presentes Términos. Si no estás de acuerdo,
    debes abstenerte de utilizar nuestros servicios. Este documento es emitido por CreoVision
    Labs Spa, con domicilio operativo en Santiago de Chile.`
  },
  {
    title: '2. Descripción de la Plataforma',
    content: `CreoVision ofrece herramientas para análisis de contenidos, predicción de performance,
    generación asistida por IA y dashboards con datos agregados. La Plataforma se orienta
    a creadores, equipos de marketing y organizaciones que desean tomar decisiones basadas
    en datos. Bajo ningún contexto constituimos asesoría legal, financiera ni
    garantizamos resultados comerciales específicos.`
  },
  {
    title: '3. Requisitos de Uso',
    bullets: [
      'Debes tener al menos 18 años o la mayoría de edad legal en tu país.',
      'Debes proporcionar información veraz y mantener actualizados tus datos de contacto.',
      'El acceso puede estar sujeto a la verificación de tu identidad o perfil profesional.',
      'Nos reservamos el derecho de suspender cuentas que contravengan estos Términos.'
    ]
  },
  {
    title: '4. Cuentas y Seguridad',
    bullets: [
      'Cada cuenta es personal e intransferible. Eres responsable por el uso que se haga con tus credenciales.',
      'Debes notificar inmediatamente a CreoVision frente a accesos no autorizados o cualquier incidente de seguridad.',
      'Nos reservamos el derecho de limitar el acceso cuando detectemos actividad sospechosa o incumplimientos.'
    ]
  },
  {
    title: '5. Créditos y Pagos',
    content: `Algunas funcionalidades premium requieren consumo de créditos virtuales. Los créditos
    no constituyen moneda, son intransferibles y no reembolsables. El costo de cada acción
    se indicará en la interfaz. Podemos modificar los precios o políticas de consumo
    notificando con al menos 10 días de anticipación.`
  },
  {
    title: '6. Integraciones de Terceros',
    content: `La Plataforma puede conectarse con APIs externas (por ejemplo, YouTube, TikTok,
    Twitter/X, Google, Meta y servicios de IA como Gemini o DeepSeek) para ofrecer
    análisis enriquecidos. Al habilitar dichas integraciones aceptas las condiciones y
    políticas de cada proveedor. CreoVision no controla los datos que esos terceros
    comparten y no es responsable por interrupciones o cambios en sus servicios.`
  },
  {
    title: '7. Uso Aceptable',
    bullets: [
      'Está prohibido utilizar CreoVision para actividades ilícitas, difamatorias, fraudulentas o que vulneren derechos de terceros.',
      'No debes intentar acceder a información o funcionalidades para las cuales no tienes autorización.',
      'No puedes descompilar, desensamblar ni realizar ingeniería inversa sobre la Plataforma.',
      'No puedes utilizar los resultados de la IA para spam, desinformación, suplantación o cualquier actividad que contravenga políticas de plataformas sociales.'
    ]
  },
  {
    title: '8. Contenido Generado por IA',
    content: `Los módulos de IA generan contenido basado en prompts y datos de referencia. Aun
    cuando tomamos medidas para minimizar sesgos y errores, no garantizamos exactitud
    total. Eres responsable de revisar, validar y atribuir cuando corresponda el contenido
    generado antes de publicarlo.`
  },
  {
    title: '9. Datos del Usuario',
    content: `Recolectamos y tratamos datos conforme a nuestra Política de Privacidad. Puedes
    solicitar la eliminación de tu cuenta siguiendo los canales indicados en dicha
    política. Aceptas que usemos datos agregados y anónimos para mejorar la Plataforma y
    elaborar reportes estadísticos.`
  },
  {
    title: '10. Propiedad Intelectual',
    content: `CreoVision, su nombre comercial, logotipo, código, diseños, flujos, documentación y
    modelos de IA a medida son propiedad de CreoVision o de sus licenciantes. El uso de la
    Plataforma no implica cesión de derechos de propiedad intelectual salvo la licencia
    limitada y revocable necesaria para operar los servicios conforme a estos Términos.`
  },
  {
    title: '11. Límites de Responsabilidad',
    content: `La Plataforma se provee “tal cual” y “según disponibilidad”. No garantizamos que el
    servicio sea continuo, libre de errores o adecuado para propósitos particulares.
    CreoVision no será responsable por daños indirectos, incidentales, especiales o
    consecuentes derivados del uso o imposibilidad de uso de la Plataforma. Nuestra
    responsabilidad acumulada frente a cualquier reclamación no excederá los montos
    pagados en los últimos 6 meses por la funcionalidad concreta.`
  },
  {
    title: '12. Suspensión y Terminación',
    content: `Podemos suspender o cancelar tu acceso si incumples estos Términos, si recibimos
    requerimientos de autoridad competente o si detectamos riesgos que afecten la
    seguridad del ecosistema. Puedes cancelar tu cuenta en cualquier momento desde la
    configuración o enviando una solicitud a soporte.`
  },
  {
    title: '13. Modificaciones',
    content: `Actualizaremos estos Términos cuando incorporemos nuevas funcionalidades, cambien
    requisitos regulatorios o ajustemos nuestras políticas. Publicaremos la versión
    vigente con al menos 10 días de anticipación antes de que surta efecto. Continuar
    utilizando la Plataforma después de dicho plazo supone la aceptación de los cambios.`
  },
  {
    title: '14. Ley Aplicable y Jurisdicción',
    content: `Estos Términos se regirán por las leyes de la República de Chile. Cualquier disputa se someterá a
    los tribunales competentes de Santiago de Chile, renunciando a cualquier otro fuero que
    pudiera corresponder.`
  },
  {
    title: '15. Contacto',
    content: `Para consultas sobre estos Términos o sobre el uso de la Plataforma, puedes escribir
    a impulsa@creovision.io (Daniel Falcón, CEO).`
  }
];

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <header className="mb-10 space-y-3">
        <h1 className="text-4xl font-bold text-white">Términos de Servicio de CreoVision</h1>
        <p className="text-sm text-gray-400">
          Última actualización: 10 de noviembre de 2025. Documento aplicable a todos los usuarios
          de https://creovision.io y módulos afiliados.
        </p>
      </header>

      <section className="space-y-8 leading-relaxed">
        {sections.map((section) => (
          <article key={section.title} className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-900/20">
            <h2 className="text-2xl font-semibold text-purple-200 mb-3">{section.title}</h2>
            {section.content && <p className="text-sm text-gray-200 whitespace-pre-line">{section.content}</p>}
            {section.bullets && (
              <ul className="mt-3 space-y-2 text-sm text-gray-200">
                {section.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      <footer className="mt-12 text-xs text-gray-400">
        Si detectas inconsistencias o requieres una versión firmada de este documento, escríbenos a
        legal@creovision.io indicando el nombre de tu organización y la fecha de la solicitud.
      </footer>
    </div>
  );
}

