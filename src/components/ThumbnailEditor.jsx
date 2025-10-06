import React, { useState } from 'react';
import { motion, useTransform, useScroll } from 'framer-motion'; // ✅ useScroll reemplaza useViewportScroll
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
  Megaphone
} from 'lucide-react';

const LandingPage = ({ onSectionChange }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const { scrollYProgress } = useScroll(); // ✅ reemplazo de useViewportScroll
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

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

  // Módulos únicos con nombres profesionales
  const modules = [
    { 
      icon: Eye, 
      name: 'TrendScope', 
      description: 'Análisis de tendencias con IA para detectar contenido viral antes que tu competencia',
      color: 'from-violet-600 to-purple-600',
      accent: 'violet'
    },
    { 
      icon: Compass, 
      name: 'EthniMap', 
      description: 'Sectorización inteligente para identificar y conquistar nichos éticos inexplorados',
      color: 'from-emerald-600 to-teal-600',
      accent: 'emerald'
    },
    { 
      icon: Flame, 
      name: 'PulseRank', 
      description: 'Optimización SEO emocional que viraliza sin perder profundidad ni autenticidad',
      color: 'from-orange-600 to-red-600',
      accent: 'orange'
    },
    { 
      icon: Heart, 
      name: 'StoryForge', 
      description: 'Narrativa emocional que transforma datos en historias que conectan y conmueven',
      color: 'from-pink-600 to-rose-600',
      accent: 'pink'
    },
    { 
      icon: Palette, 
      name: 'VisualCraft', 
      description: 'Editor de miniaturas con IA que crea diseños irresistibles en segundos',
      color: 'from-blue-600 to-cyan-600',
      accent: 'blue'
    },
    { 
      icon: Brain, 
      name: 'InsightHub', 
      description: 'Dashboard inteligente que convierte métricas complejas en decisiones claras',
      color: 'from-indigo-600 to-purple-600',
      accent: 'indigo'
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

      {/* ... todas tus secciones, sin tocar ... */}

      {/* Botones corregidos */}
      <motion.button 
        type="button" // ✅ evita reload
        onClick={handleFreeTrial}
        className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl text-white font-semibold text-lg overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
          initial={{ x: '-100%' }}
          whileHover={{ x: '0%' }}
          transition={{ duration: 0.3 }}
        />
        <span className="relative z-10 flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Probar Gratis
        </span>
      </motion.button>

      <motion.button 
        type="button" // ✅ evita reload
        className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Ver Demo
        </span>
      </motion.button>

      {/* CTA Final */}
      <motion.button 
        type="button" // ✅ evita reload
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
    </div>
  );
};

export default LandingPage;
