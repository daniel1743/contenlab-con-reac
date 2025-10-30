import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PricingSection = ({ onAuthClick }) => {
    const { toast } = useToast();

    const [selectedPlan, setSelectedPlan] = useState('Premium'); // Plan seleccionado inicialmente
    const [hoveredPlan, setHoveredPlan] = useState(null); // Plan con hover activo

    const plans = [
        {
            id: 'Gratis',
            name: 'Gratis',
            price: '$0',
            period: '/mes',
            description: 'Para empezar a crear y explorar.',
            features: [
                'Incluye: 5 proyectos',
                '25 créditos',
                '10 exportaciones',
                'Historial de los últimos 5 contenidos',
                'Análisis de tendencias básicas',
                'Acceso anticipado a próximas tendencias',
                '5 conversaciones con el agente SEO',
                'Soporte por email'
            ],
            cta: 'Comenzar Gratis',
            isFeatured: false,
        },
        {
            id: 'Estándar',
            name: 'Estándar',
            price: '$5',
            period: '/mes',
            description: 'Para creadores en crecimiento.',
            features: [
                'Incluye: 10 proyectos',
                '50 créditos',
                '30 exportaciones',
                '5 análisis de tendencias premium / 30 básicas',
                'Historial de hasta 15 contenidos',
                '20 conversaciones con el agente SEO',
                'Soporte por email'
            ],
            cta: 'Elegir Estándar',
            isFeatured: false,
        },
        {
            id: 'Premium',
            name: 'Premium',
            price: '$9',
            period: '/mes',
            description: 'Para dominar las redes sociales.',
            features: [
                'Incluye: 30 proyectos',
                '150 créditos',
                '100 exportaciones',
                'Generación de contenido con IA avanzada',
                'Análisis de tendencias completo',
                'Calendario de publicaciones',
                'Integración con YouTube',
                'Soporte prioritario'
            ],
            cta: 'Elegir Premium',
            isFeatured: true,
        },
        {
            id: 'Enterprise',
            name: 'Enterprise',
            price: 'Próximamente',
            period: '',
            description: 'Soluciones a medida para equipos.',
            features: [
                'Todo lo de Premium',
                'Gestión de equipos',
                'API de acceso',
                'Manager de cuenta dedicado',
                'Integraciones personalizadas'
            ],
            cta: 'Próximamente',
            isFeatured: false,
            isDisabled: true,
        }
    ];

    const handlePlanClick = (plan) => {
        if (plan.isDisabled) {
            toast({
                title: '🚀 ¡El plan Enterprise llegará pronto!',
                description: 'Estamos trabajando en ello. Contacta con nosotros para acceso anticipado.',
            });
            return;
        }

        setSelectedPlan(plan.id);

        if (plan.name === 'Gratis') {
            onAuthClick();
        } else {
            toast({
                title: '🚧 Pasarela de pago en construcción',
                description: `Pronto podrás suscribirte al plan ${plan.name}. ¡Gracias por tu interés!`,
            });
        }
    };

    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        initial: {
            opacity: 0,
            y: 30,
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Planes para Cada Creador</h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">Elige el plan que se adapte a tu ritmo y escala a medida que creces.</p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center"
                    variants={containerVariants}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        const isHovered = hoveredPlan === plan.id;
                        const shouldHighlight = isSelected || isHovered;
                        const isHoverable = !plan.isDisabled;

                        return (
                            <motion.div
                                key={plan.name}
                                variants={cardVariants}
                                whileHover={isHoverable ? {
                                    scale: 1.03,
                                    y: -8,
                                    transition: {
                                        duration: 0.2,
                                        ease: [0.4, 0, 0.2, 1]
                                    }
                                } : undefined}
                                initial="initial"
                                animate="animate"
                                onMouseEnter={() => isHoverable && setHoveredPlan(plan.id)}
                                onMouseLeave={() => setHoveredPlan(null)}
                                onClick={() => handlePlanClick(plan)}
                                className={`
                                    relative rounded-3xl p-8 h-full flex flex-col border-2 cursor-pointer
                                    transition-all duration-200 ease-out
                                    ${shouldHighlight
                                        ? 'glass-effect-premium border-purple-500 shadow-glow'
                                        : 'glass-effect border-transparent'
                                    }
                                    ${plan.isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:cursor-pointer'}
                                `}
                                style={{
                                    willChange: isHoverable ? 'transform' : 'auto'
                                }}
                            >
                                {(isSelected && plan.isFeatured) && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold">
                                        Más Popular
                                    </div>
                                )}

                                <div className="flex-grow">
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-gray-400 mb-6">{plan.description}</p>
                                    <div className="mb-8">
                                        <span className={`text-4xl font-bold ${shouldHighlight ? 'text-gradient' : 'text-white'} ${plan.price === 'Próximamente' ? 'text-3xl' : ''}`}>
                                            {plan.price}
                                        </span>
                                        {plan.period && <span className="text-gray-400">{plan.period}</span>}
                                    </div>
                                    <ul className="space-y-4">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center">
                                                <CheckCircle2 className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-200 ${shouldHighlight ? 'text-purple-400' : 'text-green-400'}`} />
                                                <span className="text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlanClick(plan);
                                    }}
                                    disabled={plan.isDisabled}
                                    className={`
                                        w-full mt-8 py-3 rounded-xl font-semibold transition-all duration-200
                                        ${plan.isDisabled
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : shouldHighlight
                                                ? 'gradient-primary text-white'
                                                : 'bg-purple-500/20 text-white hover:bg-purple-500/40'
                                        }
                                    `}
                                    whileHover={!plan.isDisabled ? { scale: 1.02 } : {}}
                                    whileTap={!plan.isDisabled ? { scale: 0.98 } : {}}
                                    transition={{ duration: 0.15 }}
                                >
                                    {plan.isDisabled ? (
                                        <div className="flex items-center justify-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>Próximamente</span>
                                        </div>
                                    ) : (
                                        plan.cta
                                    )}
                                </motion.button>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default PricingSection;
