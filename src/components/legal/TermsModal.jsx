import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const TermsModal = ({ open, onAccept }) => {
  const scrollRef = useRef(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  useEffect(() => {
    if (open) {
      setHasScrolledToEnd(false);

      const el = scrollRef.current;
      if (el && el.scrollHeight <= el.clientHeight) {
        setHasScrolledToEnd(true);
      }
    }
  }, [open]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToEnd(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-gray-900 border border-purple-500/30 text-white [&_[data-radix-dialog-close]]:hidden">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-3xl font-semibold text-purple-200">
            Términos y Condiciones de Servicio – CreoVision
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Última actualización: 30 de octubre de 2025 · Dominio oficial:{' '}
            <a
              href="https://creovision.io"
              target="_blank"
              rel="noreferrer"
              className="text-purple-300 hover:text-purple-200 underline"
            >
              https://creovision.io
            </a>
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto pr-4 space-y-6 text-sm leading-relaxed text-gray-200 max-h-[50vh] scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-gray-800/50"
          style={{ scrollbarWidth: 'thin' }}
        >
          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">1. Aceptación de los términos</h3>
            <p>
              Al acceder o utilizar la plataforma CreoVision, sus aplicaciones móviles, servicios de IA o cualquier
              herramienta relacionada, usted (“el Usuario”) acepta estos Términos y Condiciones de Servicio. Si no está
              de acuerdo con estos términos, debe abstenerse de usar el servicio.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">2. Descripción del servicio</h3>
            <p>
              CreoVision es una plataforma digital de análisis, creación y optimización de contenido impulsada por
              inteligencia artificial. Ofrece herramientas para:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
              <li>Análisis de tendencias y rendimiento de contenido.</li>
              <li>Generación de ideas, guiones, textos, calendarios y estrategias.</li>
              <li>Asistentes personalizados según perfil creativo.</li>
              <li>Integración con APIs de terceros (YouTube, Twitter, Google, etc.).</li>
            </ul>
            <p className="mt-2">
              La plataforma puede incluir versiones gratuitas, de prueba y planes de suscripción (Pro, Premium,
              Enterprise).
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">3. Elegibilidad</h3>
            <p>El servicio está destinado a usuarios mayores de 16 años. Al utilizar CreoVision, declara y garantiza que:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
              <li>Tiene capacidad legal para aceptar estos términos.</li>
              <li>Cumplirá todas las leyes aplicables de su país o jurisdicción.</li>
              <li>Si utiliza CreoVision en nombre de una empresa, cuenta con autoridad para comprometerla a estos términos.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">4. Cuentas de usuario y seguridad</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Usted es responsable de la confidencialidad de sus credenciales de acceso.</li>
              <li>Cualquier actividad realizada desde su cuenta se considerará efectuada por usted.</li>
              <li>CreoVision se reserva el derecho de suspender o eliminar cuentas que incumplan políticas, abusen del servicio o vulneren derechos de terceros.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">5. Propiedad intelectual</h3>
            <p className="text-gray-300">
              <strong className="block text-purple-100">Titularidad:</strong>
              Todo el software, diseño, estructura, marca, logotipos, textos, ilustraciones y arquitectura de datos son propiedad de CreoVision o sus licenciantes.
            </p>
            <p className="text-gray-300 mt-2">
              <strong className="block text-purple-100">Derechos del usuario:</strong>
              El usuario conserva derechos sobre sus propios contenidos generados, pero concede a CreoVision una licencia limitada y no exclusiva para almacenarlos, procesarlos y mejorarlos mediante algoritmos.
            </p>
            <p className="text-gray-300 mt-2">
              <strong className="block text-purple-100">IA y resultados generados:</strong>
              Los contenidos creados por inteligencia artificial se entregan “tal como son”, sin garantía de originalidad ni exclusividad legal. El usuario asume la responsabilidad final sobre su uso, publicación o monetización.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">6. Uso permitido</h3>
            <p>El Usuario se compromete a:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
              <li>No utilizar CreoVision para difundir contenido ilegal, ofensivo, discriminatorio o engañoso.</li>
              <li>No vulnerar derechos de autor, privacidad ni normas de plataformas conectadas.</li>
              <li>No manipular, descompilar ni redistribuir el software sin autorización.</li>
              <li>No automatizar el uso del servicio (bots, scrapers, proxies masivos).</li>
            </ul>
            <p className="mt-2">El incumplimiento podrá derivar en suspensión inmediata sin reembolso.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">7. Planes, precios y pagos</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Los precios se muestran en la moneda indicada y pueden variar según país o método de pago.</li>
              <li>Las suscripciones se renuevan automáticamente salvo cancelación previa antes del siguiente ciclo.</li>
              <li>No se ofrecen reembolsos una vez iniciado el período de servicio, salvo error técnico comprobable.</li>
              <li>CreoVision puede ofrecer descuentos, pruebas gratuitas y planes personalizados sin obligación de mantenerlos a futuro.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">8. Integraciones de terceros</h3>
            <p>CreoVision se integra con servicios de terceros como YouTube, X (Twitter), Google, Gemini, DeepSeek, etc. El usuario acepta:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
              <li>Cumplir los términos de uso de dichas plataformas.</li>
              <li>Permitir a CreoVision acceder a los datos mínimos necesarios para las funciones.</li>
              <li>Entender que la disponibilidad de integraciones depende de los proveedores externos.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">9. Privacidad y datos</h3>
            <p>La información personal se gestiona bajo la Política de Privacidad disponible en el sitio. Puntos clave:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
              <li>Los datos se procesan en servidores seguros (Supabase / Vercel / Google Cloud).</li>
              <li>Se almacenan métricas de uso para mejorar el servicio.</li>
              <li>El usuario puede solicitar la eliminación de sus datos personales escribiendo a <a href="mailto:soporte@creovision.io" className="text-purple-300 underline">soporte@creovision.io</a>.</li>
              <li>No se venden datos a terceros.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">10. Limitación de responsabilidad</h3>
            <p className="text-gray-300">
              CreoVision no garantiza que los resultados generados por IA sean exactos, verídicos o adecuados para un fin específico. El usuario entiende que usa el servicio bajo su propia responsabilidad y que CreoVision no será responsable de pérdidas o daños derivados del uso o interpretación de la IA. La responsabilidad total se limita al monto pagado en los últimos 6 meses.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">11. Modificaciones del servicio o de los términos</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>CreoVision puede actualizar o interrumpir temporalmente partes del servicio.</li>
              <li>Puede cambiar funcionalidades, precios o planes.</li>
              <li>Los cambios se comunicarán en el sitio o por correo electrónico. El uso continuo implica aceptación.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">12. Suspensión y cancelación</h3>
            <p>CreoVision puede suspender, cancelar o restringir el acceso a usuarios que:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-300">
              <li>Incumplan los términos.</li>
              <li>Causen perjuicio técnico o reputacional.</li>
              <li>Utilicen indebidamente integraciones o claves API.</li>
            </ul>
            <p className="mt-2">El usuario puede cancelar su cuenta en cualquier momento desde su panel o escribiendo a <a href="mailto:soporte@creovision.io" className="text-purple-300 underline">soporte@creovision.io</a>.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">13. Legislación aplicable y jurisdicción</h3>
            <p className="text-gray-300">
              Estos términos se rigen por las leyes de Chile. Cualquier disputa se resolverá ante los tribunales competentes de Santiago de Chile, salvo acuerdo distinto entre las partes.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">14. Contacto legal</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Correo: <a href="mailto:legal@creovision.io" className="text-purple-300 underline">legal@creovision.io</a></li>
              <li>Representante: Daniel Falcon – Fundador y Administrador Legal de CreoVision.</li>
              <li>Dirección postal: agregar cuando se disponga de sede o cowork registrado.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-purple-200 mb-2">15. Disposiciones finales</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Si alguna cláusula se considera inválida, las restantes siguen vigentes.</li>
              <li>Estos términos constituyen el acuerdo completo entre el usuario y CreoVision.</li>
              <li>La falta de exigencia de un derecho no implica renuncia futura.</li>
            </ul>
          </section>

          <section className="border-t border-purple-500/30 pt-4">
            <h3 className="text-lg font-semibold text-purple-200 mb-2">Contacto general</h3>
            <p className="text-gray-300">
              Correo de soporte: <a href="mailto:soporte@creovision.io" className="text-purple-300 underline">soporte@creovision.io</a>
            </p>
          </section>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-purple-500/20">
          <p className="text-xs text-gray-400">
            Desplázate hasta el final para habilitar el botón de aceptación. La experiencia completa de CreoVision requiere aceptar estas condiciones.
          </p>
          <Button
            onClick={onAccept}
            disabled={!hasScrolledToEnd}
            className="bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Acepto los Términos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
