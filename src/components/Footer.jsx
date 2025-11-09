import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import InfoModal from '@/components/InfoModal';

const Footer = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const handleLinkClick = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const socialLinks = [
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Youtube, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  const footerSections = [
    {
      title: 'Sobre Nosotros',
      links: [
        { name: 'Misión', content: 'Nuestra misión es empoderar a los creadores de contenido digital con herramientas innovadoras y accesibles, transformando sus ideas en contenido viral y escalando su presencia en línea. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
        { name: 'Visión', content: 'Aspiramos a ser la plataforma líder global para la creación de contenido, reconocida por nuestra inteligencia artificial de vanguardia, diseño intuitivo y una comunidad vibrante que redefine el éxito en el ecosistema digital. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
        { name: 'Quiénes Somos', content: 'Somos un equipo apasionado de tecnólogos, diseñadores y expertos en marketing digital, unidos por la visión de simplificar y optimizar el proceso creativo. Creemos en el poder de la innovación para democratizar el acceso a herramientas profesionales. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
      ],
    },
    {
      title: 'Producto',
      links: [
        { name: 'Características', content: 'CreoVision Premium ofrece un generador de contenido IA, sistema de créditos flexible, calendario de publicaciones inteligente, asesor premium con IA y análisis de rendimiento en tiempo real. Herramientas profesionales para creadores de contenido.' },
        { name: 'Precios', content: 'Ofrecemos planes flexibles adaptados a tus necesidades, desde opciones gratuitas hasta suscripciones Premium con acceso ilimitado a todas nuestras herramientas avanzadas. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
        { name: 'Blog', content: 'Visita nuestro blog para obtener las últimas noticias, tutoriales, consejos y trucos sobre creación de contenido, marketing digital y las tendencias más recientes en redes sociales. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { name: 'FAQ', content: 'Encuentra respuestas a las preguntas más frecuentes sobre el uso de CreoVision Premium, solución de problemas y optimización de tu flujo de trabajo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
        { name: 'Contáctanos', content: '¿Necesitas ayuda personalizada? Nuestro equipo de soporte está disponible 24/7 para asistirte con cualquier consulta o problema que puedas tener. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
        { name: 'Estado del Servicio', content: 'Consulta el estado actual de nuestros servicios y mantente informado sobre cualquier mantenimiento programado o interrupción. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Términos de Servicio', content: 'Lee nuestros términos y condiciones de uso para entender tus derechos y responsabilidades al utilizar CreoVision Premium. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
        { name: 'Política de Privacidad', content: 'Conoce cómo recopilamos, usamos y protegemos tu información personal de acuerdo con nuestra política de privacidad. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
      ],
    },
  ];

  return (
    <footer className="glass-effect border-t border-purple-500/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/robot.png" alt="CreoVision Logo" className="w-10 h-10 object-contain" />
              <div className="relative">
                <span className="text-xl font-bold text-gradient">CreoVision</span>
                {/* BETA badge comentado temporalmente */}
                {/* <span className="absolute -top-3 -right-6 px-1 py-0.5 text-[7px] font-bold tracking-wide bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/50 rounded text-yellow-300 backdrop-blur-sm animate-pulse-soft shadow-lg shadow-yellow-500/20">
                  BETA
                </span> */}
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Transformando la creación de contenido con el poder de la IA.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="font-semibold text-white mb-4">{section.title}</p>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleLinkClick(link.name, link.content)}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-purple-500/20 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CreoVision. Todos los derechos reservados.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        content={modalContent}
      />
    </footer>
  );
};

export default Footer;
