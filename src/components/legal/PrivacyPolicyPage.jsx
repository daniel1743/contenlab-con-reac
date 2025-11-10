import React from 'react';

const sections = [
  {
    title: '1. Resumen',
    content: `Esta Política de Privacidad explica cómo CreoVision (“nosotros”, “nuestro”) recopila,
    utiliza, divulga y protege la información personal cuando utilizas https://creovision.io
    y sus servicios asociados (“Plataforma”). Su objetivo es garantizar transparencia y
    cumplir con normativas aplicables como GDPR, LGPD, CCPA y disposiciones de TikTok
    para desarrolladores.`
  },
  {
    title: '2. Responsable del Tratamiento',
    content: `CreoVision Labs Spa, con domicilio operativo en Santiago de Chile, es
    responsable del tratamiento de datos. Para consultas puedes escribir a impulsa@creovision.io`
  },
  {
    title: '3. Datos que recopilamos',
    bullets: [
      'Datos de registro: nombre, correo electrónico, contraseña cifrada, plan contratado.',
      'Metadatos de uso: logs de acceso, interacciones con módulos IA, historial de créditos.',
      'Datos opcionales: perfil de creador, preferencias de contenido, integraciones activadas.',
      'Datos procedentes de APIs externas (YouTube, TikTok, Twitter/X, Google, Meta) en la medida en que autorices dichas conexiones.',
      'Información técnica: cookies, dirección IP, tipo de dispositivo, identificadores anónimos para analítica.'
    ]
  },
  {
    title: '4. Finalidades del Tratamiento',
    bullets: [
      'Proporcionar acceso seguro a la Plataforma y personalizar tu experiencia.',
      'Generar análisis, recomendaciones y predicciones de contenido.',
      'Gestionar el sistema de créditos, facturación y soporte.',
      'Monitorear abuso, prevenir fraudes y garantizar disponibilidad del servicio.',
      'Elaborar métricas agregadas (anónimas) para mejorar los productos.',
      'Cumplir con requisitos legales o solicitudes válidas de autoridades.'
    ]
  },
  {
    title: '5. Bases Legales',
    content: `Tratamos datos personales sobre la base de (i) la ejecución de un contrato (cuando
    creas una cuenta y utilizas funcionalidades principales), (ii) interés legítimo (mejoras
    de seguridad y prevención de fraude), (iii) consentimiento explícito (al conectar APIs
    de terceros o aceptar comunicaciones comerciales) y (iv) cumplimiento de obligaciones
    legales.`
  },
  {
    title: '6. Integraciones y Datos de Terceros',
    content: `Si decides vincular cuentas externas (por ejemplo, TikTok, YouTube, Instagram),
    recibiremos tokens de acceso y metadatos permitidos por cada proveedor. Solo
    utilizaremos esos datos para las funcionalidades habilitadas y bajo las políticas de
    cada plataforma. No vendemos ni cedemos datos identificables a terceros.`
  },
  {
    title: '7. Transferencias Internacionales',
    content: `Alojamos data y servicios en proveedores confiables (Supabase, Vercel, Google Cloud,
    AWS) ubicados en Estados Unidos y la Unión Europea. Implementamos cláusulas
    contractuales estándar y medidas de seguridad razonables para proteger la información
    durante dichas transferencias.`
  },
  {
    title: '8. Retención',
    content: `Conservamos datos personales mientras la cuenta esté activa y hasta 24 meses después
    de su cancelación para atender obligaciones legales, resolver disputas y mantener
    registros internos. Puedes solicitar la eliminación anticipada siguiendo la sección 10.`
  },
  {
    title: '9. Seguridad',
    content: `Aplicamos encriptación en tránsito (TLS), controles de acceso basados en roles, logs
    auditables, políticas anti-abuso y revisiones periódicas de nuestros modelos de IA.
    Ninguna transmisión es completamente segura; en caso de incidente notificaremos dentro
    de los plazos exigidos por la ley.`
  },
  {
    title: '10. Derechos del Titular',
    bullets: [
      'Acceder, rectificar o actualizar tus datos.',
      'Solicitar eliminación (“derecho al olvido”) en la medida permitida por la ley.',
      'Oponerte o limitar ciertos tratamientos.',
      'Retirar el consentimiento para integraciones o comunicaciones comerciales.',
      'Portar tus datos en un formato estructurado.'
    ],
    content: `Para ejercer estos derechos escribe a privacidad@creovision.io indicando el correo
    asociado a tu cuenta. Responderemos en un máximo de 30 días naturales.`
  },
  {
    title: '11. Uso de Cookies',
    content: `Utilizamos cookies propias y de terceros para recordar preferencias, autenticar sesiones,
    medir desempeño y personalizar contenidos. Puedes gestionar cookies en la configuración
    de tu navegador. Deshabilitar ciertas cookies puede afectar funcionalidades.`
  },
  {
    title: '12. Menores de Edad',
    content: `La Plataforma no está dirigida a menores de 18 años. Si detectamos el registro de un
    menor eliminaremos la cuenta y datos asociados.`
  },
  {
    title: '13. Cambios a la Política',
    content: `Podemos actualizar esta Política para reflejar ajustes regulatorios o nuevas
    funcionalidades. Publicaremos la versión actualizada indicando la fecha y, si los cambios
    son sustanciales, notificaremos mediante correo o banners dentro de la Plataforma.`
  },
  {
    title: '14. Contacto',
    content: `Dudas o comentarios sobre privacidad pueden dirigirse a impulsa@creovision.io (Daniel Falcón, CEO) o al
    formulario disponible en https://creovision.io/contacto.`
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <header className="mb-10 space-y-3">
        <h1 className="text-4xl font-bold text-white">Política de Privacidad de CreoVision</h1>
        <p className="text-sm text-gray-400">
          Última actualización: 10 de noviembre de 2025. Esta política aplica a todos los
          visitantes y usuarios registrados de https://creovision.io y servicios relacionados.
        </p>
      </header>

      <section className="space-y-8 leading-relaxed">
        {sections.map(({ title, content, bullets }) => (
          <article key={title} className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-900/20">
            <h2 className="text-2xl font-semibold text-purple-200 mb-3">{title}</h2>
            {content && <p className="text-sm text-gray-200 whitespace-pre-line">{content}</p>}
            {bullets && (
              <ul className="mt-3 space-y-2 text-sm text-gray-200">
                {bullets.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>

      <footer className="mt-12 text-xs text-gray-400">
        Si necesitas acuerdos de procesamiento de datos (DPA) o documentación adicional para integraciones
        con plataformas como TikTok, contáctanos en privacidad@creovision.io.
      </footer>
    </div>
  );
}

