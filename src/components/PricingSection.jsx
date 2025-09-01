import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PricingSection = ({ onAuthClick }) => {
  const { toast } = useToast();
  const plans = [
    {
      name: 'Gratis',
      price: '$0',
      period: '/mes',
      description: 'Para empezar a crear y explorar.',
      features: [
        '1 Proyecto',
        'Generador de ideas básico',
        '10 exportaciones de miniaturas/mes',
        'Soporte comunitario'
      ],
      cta: 'Comenzar Gratis',
      isFeatured: false,
    },
    {
      name: 'Estándar',
      price: '$4',
      period: '/mes',
      description: 'Para creadores en crecimiento.',
      features: [
        '5 Proyectos',
        'Generador de contenido IA',
        'Exportaciones ilimitadas',
        'Análisis de tendencias básico',
        'Soporte por email'
      ],
      cta: 'Elegir Estándar',
      isFeatured: false,
    },
    {
      name: 'Premium',
      price: '$8',
      period: '/mes',
      description: 'Para dominar las redes sociales.',
      features: [
        'Proyectos ilimitados',
        'Generador de contenido IA avanzado',
        'Editor de miniaturas PRO',
        'Análisis de tendencias completo',
        'Calendario de publicaciones',
        'Soporte prioritario 24/7'
      ],
      cta: 'Elegir Premium',
      isFeatured: true,
    },
    {
      name: 'Enterprise',
      price: 'Hablemos',
      period: '',
      description: 'Soluciones a medida para equipos.',
      features: [
        'Todo lo de Premium',
        'Gestión de equipos',
        'API de acceso',
        'Manager de cuenta dedicado',
        'Integraciones personalizadas'
      ],
      cta: 'Contactar Ventas',
      isFeatured: false,
    }
  ];

  const handlePlanClick = (planName) => {
    if (planName === 'Gratis') {
      onAuthClick();
    } else {
      toast({
        title: '🚧 Esta función no está implementada aún',
        description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
      });
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Planes para Cada Creador</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">Elige el plan que se adapte a tu ritmo y escala a medida que creces.</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-3xl p-8 h-full flex flex-col ${plan.isFeatured ? 'glass-effect-premium border-2 border-purple-500 shadow-glow scale-105' : 'glass-effect border border-purple-500/20'}`}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold">
                  Más Popular
                </div>
              )}
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <span className={`text-4xl font-bold ${plan.isFeatured ? 'text-gradient' : 'text-white'}`}>{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle2 className={`w-5 h-5 mr-3 ${plan.isFeatured ? 'text-purple-400' : 'text-green-400'}`} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <motion.button
                onClick={() => handlePlanClick(plan.name)}
                className={`w-full mt-8 py-3 rounded-xl font-semibold transition-all duration-300 ${plan.isFeatured ? 'gradient-primary text-white' : 'bg-purple-500/20 text-white hover:bg-purple-500/40'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;