import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useTransform, useScroll, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import { Card } from '@/components/ui/card';
import PricingSection from '@/components/PricingSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import BrandsCarousel from '@/components/BrandsCarousel';
import GuidedDemoModal from '@/components/GuidedDemoModal';
import AIConciergeBubble from '@/components/AIConciergeBubble';


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
  Search,
  PlayCircle,
  Clock3,
  X
} from 'lucide-react';


const LandingPage = ({ onSectionChange, onStartDemo }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVideoCarouselHovered, setIsVideoCarouselHovered] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Hook para contador animado
  function AnimatedCounter({ value, suffix }) {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 16, stiffness: 120 });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const rawValue = typeof value === 'number' ? value.toString() : value;
    const numericMatch = typeof rawValue === 'string' ? rawValue.match(/\d+(\.\d+)?/) : null;
    const shouldAnimate = typeof value === 'number' || (!!numericMatch && !(typeof rawValue === 'string' && rawValue.includes('/')));

    const derivedSuffix = (() => {
      if (suffix !== undefined) {
        return suffix;
      }
      if (typeof rawValue === 'string' && numericMatch) {
        const startIndex = (numericMatch.index ?? 0) + numericMatch[0].length;
        return rawValue.slice(startIndex);
      }
      return '';
    })();

    const decimalPlaces = (() => {
      if (typeof value === 'number') {
        const decimalPart = value.toString().split('.')[1];
        return decimalPart ? decimalPart.length : 0;
      }
      if (numericMatch && numericMatch[0].includes('.')) {
        return numericMatch[0].split('.')[1].length;
      }
      return 0;
    })();

    useEffect(() => {
      if (!isInView || !shouldAnimate) {
        return;
      }
      const targetValue = typeof value === 'number'
        ? value
        : numericMatch
          ? parseFloat(numericMatch[0])
          : 0;
      const controls = animate(motionValue, targetValue, { duration: 2, ease: "easeOut" });
      return () => controls.stop();
    }, [isInView, shouldAnimate, numericMatch, value, motionValue]);

    useEffect(() => {
      if (!shouldAnimate) {
        return;
      }
      const unsubscribe = springValue.on("change", (latest) => {
        if (!ref.current) {
          return;
        }
        const formatted = decimalPlaces > 0 ? latest.toFixed(decimalPlaces) : Math.round(latest).toString();
        ref.current.textContent = `${formatted}${derivedSuffix}`;
      });
      return () => unsubscribe();
    }, [springValue, decimalPlaces, derivedSuffix, shouldAnimate]);

    if (!shouldAnimate) {
      return <span>{value}</span>;
    }

    return <span ref={ref}>{rawValue}</span>;
  }

  // Componente Typed Text con IntersectionObserver
  const TypedText = ({ texts, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000 }) => {
    const [displayText, setDisplayText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const textRef = useRef(null);

    // Observer para detectar visibilidad
    useEffect(() => {
      const element = textRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: '50px'
        }
      );

      observer.observe(element);

      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }, []);

    // Animación de texto - solo si es visible
    useEffect(() => {
      if (!isVisible) return; // Pausa la animación si no está visible

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
    }, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseTime, isVisible]);

    return (
      <span ref={textRef}>
        {displayText}
        <motion.span
          animate={{ opacity: isVisible ? [1, 0] : 1 }}
          transition={{ duration: 0.8, repeat: isVisible ? Infinity : 0 }}
          className="inline-block w-0.5 h-8 md:h-12 bg-purple-400 ml-1"
        />
      </span>
    );
  };

  useEffect(() => {
    if (!selectedVideo) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedVideo(null);
      }
    };

    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedVideo]);

  const isVideoCarouselPaused = isVideoCarouselHovered || Boolean(selectedVideo);

  const handleVideoHoverStart = () => setIsVideoCarouselHovered(true);
  const handleVideoHoverEnd = () => setIsVideoCarouselHovered(false);

  const handleVideoCardClick = (video) => {
    setSelectedVideo(video);
  };

  const handleVideoCardKeyDown = (event, video) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      setSelectedVideo(video);
    }
  };

  const closeSelectedVideo = () => {
    setSelectedVideo(null);
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


  // Módulos reales implementados en CreoVision
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
      comingSoon: true
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
    // COMENTADO TEMPORALMENTE - ThumbnailEditor solo 5% implementado (reemplazar con Canva SDK)
    // {
    //   icon: Palette,
    //   name: 'Editor de Miniaturas',
    //   description: 'Crea diseños profesionales con IA, plantillas y herramientas avanzadas de edición',
    //   color: 'from-pink-600 to-rose-600',
    //   accent: 'pink',
    //   section: 'tools'
    // },
    // COMENTADO TEMPORALMENTE - Chat sin backend funcional (solo UI mock, mensajes hardcoded)
    // {
    //   icon: MessageSquare,
    //   name: 'Chat con IA',
    //   description: 'Asistente inteligente para generar ideas, títulos virales y estrategias de contenido',
    //   color: 'from-violet-600 to-purple-600',
    //   accent: 'violet',
    //   section: 'chat'
    // }
  ];

  const explainerVideos = [
    {
      id: 'video-tour',
      title: 'Tour completo de CreoVision',
      description: 'Recorre el dashboard inteligente, el calendario IA y el flujo de publicación omnicanal.',
      duration: '02:45',
      embedUrl: 'https://www.youtube.com/embed/8pOHS7Xk4SI'
    },
    {
      id: 'video-calendar',
      title: 'Planificación multiformato en minutos',
      description: 'Aprende a coordinar campañas para YouTube, Shorts y Reels con un solo tablero.',
      duration: '03:10',
      embedUrl: 'https://www.youtube.com/embed/c-9qU79tGQg'
    },
    {
      id: 'video-ai',
      title: 'Superpoderes IA para tu equipo',
      description: 'Genera guiones, hashtags y tarjetas estratégicas apoyadas por Gemini en un clic.',
      duration: '02:28',
      embedUrl: 'https://www.youtube.com/embed/D9ioyEvdggk'
    },
    {
      id: 'video-publicidad-emotiva',
      title: 'Publicidad Emotiva generada con IA',
      description: 'Explora cómo conectamos con audiencias sensibles utilizando storytelling audiovisual asistido por IA.',
      duration: '01:12',
      videoUrl: '/Publicidad_Emotiva_con_IA.mp4'
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
    setShowDemoModal(true);
  };

  const handleCloseDemo = () => {
    setShowDemoModal(false);
  };

  const handleCompleteDemo = () => {
    setShowDemoModal(false);
    onStartDemo?.();
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
      <section className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32">
        <div className="relative z-10 text-center space-y-12 px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Headline narrativo con Typed Text */}
            <div className="min-h-[200px] md:min-h-[280px] flex items-center justify-center">
              <motion.h1
                className="text-6xl md:text-8xl font-black leading-tight"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  <TypedText texts={['Impulsa tu voz', 'Amplifica tu alcance', 'Transforma tu contenido']} />
                </span>
                <span className="text-white font-light block mt-4">
                  con propósito
                </span>
              </motion.h1>
            </div>


            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              CreoVision Premium es más que una suite: es tu aliado creativo para{' '}
              <span className="text-violet-400 font-semibold">crecer con propósito</span>,{' '}
              <span className="text-purple-400 font-semibold">analizar con precisión</span> y{' '}
              <span className="text-pink-400 font-semibold">conectar con impacto</span>.
            </motion.p>


            {/* 🔥 CTA PRINCIPAL: Análisis de Canal GRATIS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-16 max-w-3xl mx-auto"
            >
              <div className="relative">
                {/* Badge flotante */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                >
                  <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    PRUEBA GRATIS - Tu primer análisis sin registro
                  </div>
                </motion.div>

                {/* Card principal */}
                <div className="bg-gradient-to-br from-purple-900/40 via-violet-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      Analiza cualquier canal de YouTube
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Descubre insights con IA en segundos. No necesitas crear cuenta.
                    </p>
                  </div>

                  {/* Input + Botón */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="channel-url-input"
                      type="text"
                      placeholder="https://youtube.com/@nombredelcanal"
                      className="flex-1 px-6 py-4 bg-black/40 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          window.location.href = `/channel-analysis?url=${encodeURIComponent(e.target.value.trim())}`;
                        }
                      }}
                    />
                    <RippleButton
                      onClick={(e) => {
                        const input = document.getElementById('channel-url-input');
                        if (input && input.value && input.value.trim()) {
                          window.location.href = `/channel-analysis?url=${encodeURIComponent(input.value.trim())}`;
                        }
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 rounded-xl text-white font-bold text-lg shadow-lg whitespace-nowrap"
                    >
                      <BarChart3 className="w-5 h-5 inline mr-2" />
                      Analizar Gratis
                    </RippleButton>
                  </div>

                  {/* Features rápidas */}
                  <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Brain className="w-6 h-6 text-purple-400" />
                      <span className="text-sm text-gray-300">Análisis con IA</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Zap className="w-6 h-6 text-yellow-400" />
                      <span className="text-sm text-gray-300">Resultados instantáneos</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Shield className="w-6 h-6 text-pink-400" />
                      <span className="text-sm text-gray-300">Sin registro</span>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Carrusel de videos explicativos */}
      <section id="demo-videos" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-[0.04] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="space-y-4 max-w-4xl mx-auto">
              <motion.p
                className="text-sm uppercase tracking-[0.45em] text-purple-300/80 flex items-center gap-2 justify-center font-medium"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <PlayCircle className="w-5 h-5 text-purple-200/90" />
                Mira CreoVision en acción
              </motion.p>
              <motion.h2
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#f79bff] via-[#c58cff] to-[#8cb0ff] bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Videos rápidos para entender el potencial de la plataforma
              </motion.h2>
              <motion.p
                className="text-slate-300/90 text-lg md:text-xl leading-relaxed mx-auto max-w-3xl"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Explicaciones cortas, directas y profesionales grabadas por el equipo. Perfectas para compartir con clientes o con tu equipo interno antes de migrar tus procesos.
              </motion.p>
            </div>
          </motion.div>

          <div
            className="relative overflow-hidden"
            onMouseEnter={handleVideoHoverStart}
            onMouseLeave={handleVideoHoverEnd}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080c1d] via-[#080c1d]/80 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080c1d] via-[#080c1d]/80 to-transparent z-10" />

            <motion.div
              className="flex gap-6 lg:gap-8 video-marquee"
              style={{ animationPlayState: isVideoCarouselPaused ? 'paused' : 'running' }}
            >
              {explainerVideos.concat(explainerVideos).map((video, index) => (
                <div
                  key={`${video.id}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleVideoCardClick(video)}
                  onKeyDown={(event) => handleVideoCardKeyDown(event, video)}
                  className="min-w-[280px] sm:min-w-[340px] lg:min-w-[410px] max-w-[410px] bg-[#0b1124]/95 border border-white/10 rounded-3xl overflow-hidden shadow-[0_18px_45px_-25px] shadow-purple-500/40 backdrop-blur-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/70 focus:ring-offset-2 focus:ring-offset-[#080c1d]"
                >
                  <div className="relative aspect-video">
                    {video.videoUrl ? (
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                        playsInline
                        aria-label={video.title}
                      />
                    ) : (
                      <iframe
                        src={`${video.embedUrl}?rel=0&controls=1&modestbranding=1`}
                        title={video.title}
                        className="w-full h-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    )}
                    <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-purple-200/80">
                      <span className="flex items-center gap-2 text-purple-200/80">
                        <Clock3 className="w-3.5 h-3.5" />
                        {video.duration}
                      </span>
                      <span className="flex items-center gap-1 text-pink-200/80">
                        <Sparkles className="w-3.5 h-3.5" />
                        Tutorial premium
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white/95">
                      {video.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
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
              Cada creador tiene una voz única. Descubre cómo CreoVision se adapta a tu estilo.
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
              const isComingSoon = module.comingSoon;
              return (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  onHoverStart={() => {
                    if (!isComingSoon) {
                      setHoveredCard(index);
                    }
                  }}
                  onHoverEnd={() => setHoveredCard(null)}
                  whileHover={isComingSoon ? undefined : { scale: 1.02 }}
                  onClick={() => {
                    if (!isComingSoon && module.section) {
                      onSectionChange(module.section);
                    }
                  }}
                  className={`group ${isComingSoon ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                >
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl p-8 h-full relative overflow-hidden hover:border-violet-500/30 transition-all duration-500">
                    {isComingSoon && (
                      <span className="absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-gray-100 tracking-wide z-20">
                        Proximamente
                      </span>
                    )}
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
            {/* Tendencias, Análisis & Conversaciones - POWERED BY CREOVISION AI GP-5 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              onClick={() => onSectionChange('tools')}
              className="group cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-violet-950/40 via-purple-950/40 to-fuchsia-950/40 backdrop-blur-sm border-violet-500/30 rounded-3xl p-8 h-full relative overflow-hidden hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500">
                {/* Badge Premium con animación */}
                <span className="absolute top-4 right-4 text-[10px] font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white tracking-widest uppercase shadow-lg animate-pulse">
                  🔥 IA GP-5
                </span>

                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-violet-500/50">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
                      Tendencias & Análisis IA
                    </h3>
                    <p className="text-sm font-medium bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      Powered by CreoVision AI GP-5
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  La IA más avanzada del mercado analiza tendencias virales en tiempo real y te asesora como un coach premium.
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    {
                      icon: TrendingUp,
                      text: "Tendencias virales analizadas al instante",
                      badge: "Real-time"
                    },
                    {
                      icon: Sparkles,
                      text: "Análisis profundo con IA GP-5",
                      badge: "Premium"
                    },
                    {
                      icon: MessageSquare,
                      text: "Asesor conversacional experto",
                      badge: "Coach A1"
                    },
                    {
                      icon: Lightbulb,
                      text: "Títulos, hooks y keywords SEO",
                      badge: "Pro"
                    }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between text-gray-300 group/item">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-violet-400 group-hover/item:scale-110 transition-transform" />
                        <span className="text-sm group-hover/item:text-white transition-colors">{item.text}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200 border border-violet-500/30">
                        {item.badge}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-violet-300 group-hover:gap-4 transition-all font-semibold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Descubrir Tendencias</span>
                  <span aria-hidden="true" className="text-lg">→</span>
                </div>

                {/* Contador de potencia */}
                <div className="mt-4 pt-4 border-t border-violet-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Potencia IA:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-3 rounded-full ${i < 5 ? 'bg-gradient-to-t from-violet-500 to-fuchsia-400' : 'bg-gray-700'} group-hover:animate-pulse`} style={{ animationDelay: `${i * 100}ms` }} />
                      ))}
                      <span className="ml-2 font-bold text-violet-300">GP-5</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            {/* Suite Profesional de Herramientas IA - CREOVISION ECOSYSTEM */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              onClick={() => onSectionChange('tools')}
              className="group cursor-pointer"
            >
              <Card className="bg-gradient-to-br from-purple-950/40 via-blue-950/40 to-cyan-950/40 backdrop-blur-sm border-purple-500/30 rounded-3xl p-8 h-full relative overflow-hidden hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
                {/* Badge Premium con animación */}
                <span className="absolute top-4 right-4 text-[10px] font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white tracking-widest uppercase shadow-lg">
                  ✨ SUITE PRO
                </span>

                {/* Efecto de brillo */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Partículas flotantes */}
                <div className="absolute top-20 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-30" />
                <div className="absolute bottom-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '1s' }} />

                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-300 shadow-lg shadow-purple-500/50">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      Suite Profesional IA
                    </h3>
                    <p className="text-sm font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Ecosistema CreoVision Completo
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  Todas las herramientas que necesitas, potenciadas por la IA más avanzada del mercado. Tu estudio profesional en la nube.
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    {
                      icon: Wand2,
                      text: "Generador de Contenido Viral IA",
                      badge: "GP-5"
                    },
                    {
                      icon: Zap,
                      text: "Generador de Hashtags Inteligente",
                      badge: "Auto"
                    },
                    {
                      icon: Palette,
                      text: "Diseños Visuales con IA",
                      badge: "Studio"
                    },
                    {
                      icon: Brain,
                      text: "Biblioteca de Assets Organizados",
                      badge: "Smart"
                    }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between text-gray-300 group/item">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-purple-400 group-hover/item:scale-110 transition-transform" />
                        <span className="text-sm group-hover/item:text-white transition-colors">{item.text}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.badge}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-purple-400 group-hover:gap-4 transition-all font-semibold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Explorar Herramientas</span>
                  <span aria-hidden="true" className="text-lg">→</span>
                </div>

                {/* Indicador de herramientas */}
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Herramientas activas:</span>
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {[Wand2, Zap, Palette, Brain].map((Icon, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center border-2 border-gray-900">
                            <Icon className="w-3 h-3 text-white" />
                          </div>
                        ))}
                      </div>
                      <span className="ml-2 font-bold text-purple-400">4+</span>
                    </div>
                  </div>
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
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl p-8 h-full relative overflow-hidden hover:border-pink-400/60 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-500">
                {/* Efecto de brillo */}
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
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
                  <span aria-hidden="true">&rarr;</span>
                </div>
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
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              De la Idea al Impacto
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Potenciado por <span className="font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">CreoVision AI GP-5</span>, la inteligencia artificial más avanzada del mercado.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300 font-medium">Miles de creadores lo confirman</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-violet-200 font-medium">IA de nivel profesional</span>
              </div>
            </div>
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
                  &rarr;
                </motion.div>
              </span>
            </motion.button>
            
            <p className="text-sm text-gray-400">
              <Shield className="w-4 h-4 inline mr-2" />
              Sin tarjeta de credito | Acceso inmediato | Soporte 24/7
            </p>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSelectedVideo}
          >
            <motion.div
              className="relative w-full max-w-5xl bg-[#0b1124]/95 border border-white/10 rounded-3xl shadow-[0_28px_80px_-25px_rgba(124,58,237,0.65)] overflow-hidden"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={selectedVideo.title}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeSelectedVideo}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition"
                aria-label="Cerrar video"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-video bg-black">
                {selectedVideo.videoUrl ? (
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <iframe
                    src={`${selectedVideo.embedUrl}?rel=0&controls=1&modestbranding=1&autoplay=1`}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-purple-200/80">
                  <Clock3 className="w-4 h-4" />
                  {selectedVideo.duration}
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-white">
                  {selectedVideo.title}
                </h3>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>
            </motion.div>
      </motion.div>
        )}
      </AnimatePresence>
      <GuidedDemoModal
        open={showDemoModal}
        onClose={handleCloseDemo}
        onComplete={handleCompleteDemo}
      />
      <AIConciergeBubble />
    </div>
  );
};


export default LandingPage;
