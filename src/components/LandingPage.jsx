import React, { useState, useEffect, useRef } from 'react';
import { motion, useTransform, useScroll, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import { Card } from '@/components/ui/card';
import PricingSection from '@/components/PricingSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import BrandsCarousel from '@/components/BrandsCarousel';


// Importar iconos animados modernos
import {
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Users,
  BarChart3,
  Lightbulb,
  Activity,
  Briefcase,
  Brain,
  Compass,
  Flame,
  Heart,
  Palette,
  Shield,
  Wand2,
  Eye,
  Megaphone,
  MessageSquare,
  Inbox,
  FolderOpen,
  Settings,
  Calendar,
  Send,
  Download,
  Bell,
  Search
} from 'lucide-react';


const LandingPage = ({ onSectionChange }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Hook para contador animado
  function AnimatedCounter({ value, suffix = '' }) {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { duration: 3000 });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
      if (isInView) {
        const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
        animate(motionValue, numericValue, { duration: 2 });
      }
    }, [isInView, value, motionValue]);

    useEffect(() => {
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = latest.toFixed(0) + suffix;
        }
      });
    }, [springValue, suffix]);

    return <span ref={ref}>{value}</span>;
  }

  // Componente Typed Text
  const TypedText = ({ texts, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000 }) => {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
      const currentText = texts[textIndex];

      const timeout = setTimeout(() => {
        if (!isDeleting) {
          if (displayText.length < currentText.length) {
            setDisplayText(currentText.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(currentText.slice(0, displayText.length - 1));
          } else {
            setIsDeleting(false);
            setTextIndex((prev) => (prev + 1) % texts.length);
          }
        }
      }, isDeleting ? deletingSpeed : typingSpeed);

      return () => clearTimeout(timeout);
    }, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseTime]);

    return (
      <span>
        {displayText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-8 md:h-12 bg-purple-400 ml-1"
        />
      </span>
    );
  };

  // Componente Ripple Button
  const RippleButton = ({ children, onClick, className }) => {
    const [ripples, setRipples] = useState([]);

    const addRipple = (e) => {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple = {
        x,
        y,
        size,
        key: Date.now()
      };

      setRipples([...ripples, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.key !== newRipple.key));
      }, 600);

      if (onClick) onClick(e);
    };

    return (
      <motion.button
        onClick={addRipple}
        className={`${className} relative overflow-hidden`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.key}
            className="absolute bg-white/30 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  };

  // Iconos animados para módulos únicos
  const AnimatedIcon = ({ Icon, delay = 0, color = "text-white" }) => (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 360,
        transition: { duration: 0.3 }
      }}
      className={`${color}`}
    >
      <Icon className="w-8 h-8" />
    </motion.div>
  );


  // Módulos reales implementados en ContentLab
  const modules = [
    {
      icon: BarChart3,
      name: 'Dashboard Inteligente',
      description: 'Analytics avanzados con predicciones IA, alertas en tiempo real y métricas de todas tus plataformas',
      color: 'from-indigo-600 to-purple-600',
      accent: 'indigo',
      section: 'dashboard'
    },
    {
      icon: Inbox,
      name: 'Bandeja Unificada',
      description: 'Gestiona mensajes, comentarios y DMs de todas tus redes sociales desde un solo lugar',
      color: 'from-blue-600 to-cyan-600',
      accent: 'blue',
      section: 'inbox'
    },
    {
      icon: Calendar,
      name: 'Calendario Avanzado',
      description: 'Programa, filtra y exporta tus publicaciones con sistema de categorías y vista multi-plataforma',
      color: 'from-purple-600 to-pink-600',
      accent: 'purple',
      section: 'calendar'
    },
    {
      icon: FolderOpen,
      name: 'Biblioteca de Contenido',
      description: 'Organiza todos tus assets en carpetas inteligentes con búsqueda, favoritos y tracking de uso',
      color: 'from-emerald-600 to-teal-600',
      accent: 'emerald',
      section: 'library'
    },
    {
      icon: Palette,
      name: 'Editor de Miniaturas',
      description: 'Crea diseños profesionales con IA, plantillas y herramientas avanzadas de edición',
      color: 'from-pink-600 to-rose-600',
      accent: 'pink',
      section: 'tools'
    },
    {
      icon: MessageSquare,
      name: 'Chat con IA',
      description: 'Asistente inteligente para generar ideas, títulos virales y estrategias de contenido',
      color: 'from-violet-600 to-purple-600',
      accent: 'violet',
      section: 'chat'
    }
  ];


  // Estadísticas con contexto emocional y sus iconos
  const emotionalStats = [
    { 
      value: '15K+', 
      label: 'Creadores Activos',
      context: 'Desde educadores hasta activistas visuales, todos encuentran aquí su espacio para crecer',
      Icon: Users,
      color: 'text-violet-300'
    },
    { 
      value: '700%', 
      label: 'Más Engagement',
      context: 'Cuando el contenido conecta con valores auténticos, el crecimiento es inevitable',
      Icon: TrendingUp,
      color: 'text-pink-400'
    },
    { 
      value: '24/7', 
      label: 'IA Creativa',
      context: 'Tu aliado digital que nunca duerme, siempre inspirando nuevas ideas',
      Icon: Zap,
      color: 'text-yellow-400'
    },
    { 
      value: '99.9%', 
      label: 'Uptime',
      context: 'Porque tu creatividad no puede esperar, nosotros siempre estamos aquí',
      Icon: Shield,
      color: 'text-cyan-400'
    }
  ];


  // Tipos de creadores específicos
  const creatorTypes = [
    {
      icon: Megaphone,
      title: 'Narradores Visuales',
      description: 'Buscan impacto emocional auténtico',
      features: ['Storytelling visual', 'Engagement emocional', 'Branding narrativo']
    },
    {
      icon: Lightbulb,
      title: 'Educadores Digitales',
      description: 'Quieren viralizar conocimiento ético',
      features: ['Contenido educativo', 'Viralización responsable', 'Comunidades de aprendizaje']
    },
    {
      icon: BarChart3,
      title: 'Analistas Creativos',
      description: 'Necesitan entender tendencias profundamente',
      features: ['Análisis de datos', 'Insights predictivos', 'Estrategias basadas en evidencia']
    }
  ];


  // Función para navegación usando el sistema de secciones existente
  const handleFreeTrial = () => {
    onSectionChange('tools'); // Cambia a la sección tools usando el callback del App.jsx
  };


  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden pt-[72px]">


      {/* Fondo degradado animado */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(-45deg, #8b5cf6, #6b21a8, #ec4899, #be185d)',
            backgroundSize: '400% 400%',
            position: "absolute",
            top: 0,
            left: 0
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>


      {/* Fondo animado mejorado con Parallax */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 200]) }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/5 to-cyan-500/5 rounded-full blur-3xl"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>


      {/* Hero Section con narrativa emocional */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="relative z-10 text-center space-y-12 px-4 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="space-y-8"
          >
            {/* Headline narrativo con Typed Text */}
            <motion.h1
              className="text-6xl md:text-8xl font-black leading-tight"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                <TypedText texts={['Impulsa tu voz', 'Amplifica tu alcance', 'Transforma tu contenido']} />
              </span>
              <br />
              <span className="text-white font-light">
                con propósito
              </span>
            </motion.h1>


            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              ContentLab Premium es más que una suite: es tu aliado creativo para{' '}
              <span className="text-violet-400 font-semibold">crecer con propósito</span>,{' '}
              <span className="text-purple-400 font-semibold">analizar con precisión</span> y{' '}
              <span className="text-pink-400 font-semibold">conectar con impacto</span>.
            </motion.p>


            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <RippleButton
                onClick={handleFreeTrial}
                className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl text-white font-semibold text-lg"
              >
                <Wand2 className="w-5 h-5 inline mr-2" />
                Probar Gratis
              </RippleButton>

              <RippleButton
                onClick={() => {}}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                Ver Demo
              </RippleButton>
            </motion.div>
          </motion.div>


          {/* Estadísticas con iconos animados y contexto emocional */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.8 }} 
          >
            {emotionalStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.07 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <AnimatedIcon Icon={stat.Icon} delay={index * 0.1} color={stat.color} />
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.value.includes('K') ? 'K+' : stat.value.includes('%') ? '%' : ''} />
                </div>
                <div className="text-white font-semibold text-sm md:text-base mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-400 text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-48 mx-auto">
                  {stat.context}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Sección "¿Para quién es esto?" */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-6">
              ¿Para quién es esto?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cada creador tiene una voz única. Descubre cómo ContentLab se adapta a tu estilo.
            </p>
          </motion.div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creatorTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center p-8 h-full hover:bg-white/10 transition-all duration-300 hover:border-violet-500/30">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <AnimatedIcon Icon={Icon} delay={index * 0.1} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{type.title}</h3>
                    <p className="text-gray-300 mb-6">{type.description}</p>
                    <div className="space-y-2">
                      {type.features.map((feature, idx) => (
                        <div key={idx} className="text-sm text-violet-300 bg-violet-500/10 rounded-full px-3 py-1 inline-block mx-1">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Módulos destacados con nombres únicos */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Tu Caja de Herramientas Creativa
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cada módulo está diseñado para potenciar un aspecto único de tu creatividad.
            </p>
          </motion.div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onSectionChange(module.section)}
                  className="group cursor-pointer"
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl p-8 h-full relative overflow-hidden hover:border-violet-500/30 transition-all duration-500">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />
                    
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 relative z-10`}>
                      <motion.div
                        animate={hoveredCard === index ? { 
                          rotate: [0, -10, 10, -5, 5, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">{module.name}</h3>
                    <p className="text-gray-300 leading-relaxed relative z-10">{module.description}</p>
                    
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* NUEVA SECCIÓN: Funcionalidades Destacadas */}
      <section className="py-24 px-4 relative bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Todo lo que Necesitas en un Solo Lugar
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Gestión completa de redes sociales con herramientas profesionales
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inbox Feature */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              onClick={() => onSectionChange('inbox')}
              className="group cursor-pointer"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl p-8 h-full relative overflow-hidden hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Inbox className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Bandeja Unificada</h3>
                    <p className="text-sm text-blue-300">Ahorra 5+ horas semanales</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    { icon: MessageSquare, text: 'Mensajes de todas las plataformas' },
                    { icon: Bell, text: 'Notificaciones en tiempo real' },
                    { icon: Send, text: 'Respuestas rápidas con IA' },
                    { icon: Eye, text: 'Filtros inteligentes' }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <item.icon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">Explorar Inbox</span>
                  <span>→</span>
                </div>
              </Card>
            </motion.div>

            {/* Content Library Feature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              onClick={() => onSectionChange('library')}
              className="group cursor-pointer"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl p-8 h-full relative overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Biblioteca de Contenido</h3>
                    <p className="text-sm text-emerald-300">Organización profesional</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    { icon: FolderOpen, text: 'Carpetas inteligentes' },
                    { icon: Search, text: 'Búsqueda instantánea' },
                    { icon: Heart, text: 'Sistema de favoritos' },
                    { icon: Download, text: 'Exportación masiva' }
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <li key={idx} className="flex items-center gap-3 text-gray-300">
                        <ItemIcon className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center gap-2 text-emerald-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">Explorar Biblioteca</span>
                  <span>→</span>
                </div>
              </Card>
            </motion.div>

            {/* Settings Feature */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              onClick={() => onSectionChange('settings')}
              className="group cursor-pointer"
            >
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl p-8 h-full relative overflow-hidden hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Centro de Control</h3>
                    <p className="text-sm text-purple-300">Personalización total</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    { icon: Users, text: 'Conecta todas tus cuentas' },
                    { icon: Bell, text: 'Notificaciones personalizadas' },
                    { icon: Shield, text: 'Seguridad avanzada' },
                    { icon: BarChart3, text: 'Gestión de suscripción' }
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <li key={idx} className="flex items-center gap-3 text-gray-300">
                        <ItemIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center gap-2 text-purple-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">Explorar Configuración</span>
                  <span>→</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Historia del flujo de trabajo */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-6">
              De la Idea al Impacto
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tu viaje creativo, reimaginado en tres pasos fluidos.
            </p>
          </motion.div>



          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Lightbulb, 
                title: 'Inspira con Datos', 
                text: 'TrendScope analiza el pulso digital para sugerirte ideas con potencial viral auténtico.',
                step: '01'
              },
              { 
                icon: Activity, 
                title: 'Crea con Propósito', 
                text: 'StoryForge y VisualCraft transforman tu visión en contenido que emociona y convierte.',
                step: '02'
              },
              { 
                icon: Briefcase, 
                title: 'Crece con Consistencia', 
                text: 'PulseRank y InsightHub automatizan tu presencia para mantener el engagement sin agotarte.',
                step: '03'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 text-center p-8 h-full relative overflow-hidden hover:border-violet-500/30 transition-all duration-300">
                    {/* Número de paso */}
                    <div className="absolute top-4 right-4 text-6xl font-black text-white/5 group-hover:text-violet-500/20 transition-colors duration-300">
                      {item.step}
                    </div>
                    
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                      <AnimatedIcon Icon={Icon} delay={index * 0.1} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{item.title}</h3>
                    <p className="text-gray-300 relative z-10 leading-relaxed">{item.text}</p>
                    
                    {/* Barra de progreso animada */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-6 relative z-10">
                      <motion.div 
                        className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full" 
                        initial={{ width: 0 }} 
                        whileInView={{ width: `${(index + 1) * 33.3}%` }} 
                        transition={{ duration: 1.5, delay: 0.5 }} 
                        viewport={{ once: true }}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Integrar componentes existentes */}
      <PricingSection />
      <TestimonialsCarousel />
      <BrandsCarousel />


      {/* CTA Final mejorado */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            viewport={{ once: true }} 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 space-y-8 relative overflow-hidden"
          >
            {/* Efectos de fondo */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            />
            
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              ¿Listo para Amplificar tu Voz?
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Únete a la nueva generación de creadores que combinan autenticidad con estrategia, 
              propósito con resultados.
            </p>
            
            <motion.button 
              onClick={handleFreeTrial}
              className="group relative px-12 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl text-white font-bold text-xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <Wand2 className="w-6 h-6" />
                Comenzar a crear ahora
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </span>
            </motion.button>
            
            <p className="text-sm text-gray-400">
              <Shield className="w-4 h-4 inline mr-2" />
              Sin tarjeta de crédito • Acceso inmediato • Soporte 24/7
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};


export default LandingPage;
