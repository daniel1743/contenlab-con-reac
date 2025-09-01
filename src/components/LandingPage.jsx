
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Target, Users, BarChart3, Lightbulb, Activity, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PricingSection from '@/components/PricingSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import BrandsCarousel from '@/components/BrandsCarousel';

const LandingPage = ({ onAuthClick }) => {
  const features = [
    { icon: Sparkles, title: 'Generador de Contenido IA', description: 'Crea contenido viral optimizado para cada plataforma con algoritmos de última generación', color: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, title: 'Análisis de Tendencias', description: 'Descubre qué contenido está funcionando en tu nicho con análisis en tiempo real', color: 'from-blue-500 to-purple-500' },
    { icon: Zap, title: 'Editor de Miniaturas Pro', description: 'Diseña miniaturas impactantes con herramientas profesionales y plantillas optimizadas', color: 'from-green-500 to-blue-500' },
    { icon: Target, title: 'Calendario Inteligente', description: 'Programa y automatiza tus publicaciones en todas las plataformas sociales', color: 'from-orange-500 to-red-500' },
    { icon: Users, title: 'Analytics Avanzados', description: 'Métricas detalladas de rendimiento, engagement y crecimiento de audiencia', color: 'from-pink-500 to-purple-500' },
    { icon: BarChart3, title: 'Dashboard Inteligente', description: 'Visualiza todo tu rendimiento en un panel unificado con insights accionables', color: 'from-indigo-500 to-blue-500' }
  ];

  const stats = [
    { value: '10K+', label: 'Creadores Activos' },
    { value: '500%', label: 'Más Engagement' },
    { value: '24/7', label: 'IA Asistente' },
    { value: '99.9%', label: 'Uptime' }
  ];

  const storyElements = [
    { icon: Lightbulb, title: 'De la Idea a la Viralidad', text: 'Nuestra IA analiza tendencias para sugerirte ideas de contenido con alto potencial de viralización.' },
    { icon: Activity, title: 'Diseño en Minutos, no Horas', text: 'Con nuestro editor intuitivo, crea miniaturas profesionales que capturan la atención al instante.' },
    { icon: Briefcase, title: 'Consistencia es la Clave', text: 'Planifica y automatiza tus publicaciones. Mantén a tu audiencia enganchada sin esfuerzo.' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-900">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center space-y-8 px-4 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">ContentLab<br /><span className="text-white">Premium</span></h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">La suite profesional definitiva para creadores de contenido digital. Combina IA, análisis de tendencias y diseño avanzado.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button onClick={onAuthClick} className="px-8 py-4 gradient-primary rounded-xl text-white font-semibold text-lg shadow-glow hover:opacity-90 transition-all duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Comenzar Gratis</motion.button>
              <motion.button className="px-8 py-4 glass-effect border border-purple-500/20 rounded-xl text-white font-semibold text-lg hover:bg-purple-500/10 transition-all duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Ver Demo</motion.button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat) => (<motion.div key={stat.label} className="text-center" whileHover={{ scale: 1.05 }}><div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</div><div className="text-gray-400 text-sm md:text-base">{stat.label}</div></motion.div>))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Tu Flujo de Trabajo, Reinventado</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Transforma horas de trabajo en minutos de creatividad con nuestra suite integrada.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {storyElements.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.2 }} viewport={{ once: true }}>
                  <Card className="glass-effect h-full border-purple-500/20 text-center p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-gray-300">{item.text}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-6">
                      <motion.div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" initial={{ width: 0 }} whileInView={{ width: `${(index + 1) * 33.3}%` }} transition={{ duration: 1.5, delay: 0.5 }} viewport={{ once: true }}></motion.div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Herramientas Profesionales</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Todo lo que necesitas para dominar las redes sociales y crear contenido viral.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ scale: 1.05 }} className="glass-effect border border-purple-500/20 rounded-2xl p-8 hover:shadow-glow transition-all duration-300">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}><Icon className="w-8 h-8 text-white" /></div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <PricingSection onAuthClick={onAuthClick} />
      <TestimonialsCarousel />
      <BrandsCarousel />

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="glass-effect border border-purple-500/20 rounded-3xl p-12 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient">¿Listo para Transformar tu Contenido?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Únete a miles de creadores que ya están usando ContentLab Premium para crear contenido viral y hacer crecer su audiencia.</p>
            <motion.button onClick={onAuthClick} className="px-12 py-4 gradient-primary rounded-xl text-white font-bold text-xl shadow-glow hover:opacity-90 transition-all duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Comenzar Ahora - Es Gratis</motion.button>
            <p className="text-sm text-gray-400">No se requiere tarjeta de crédito • Acceso inmediato • Soporte 24/7</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
