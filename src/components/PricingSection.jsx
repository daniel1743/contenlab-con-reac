import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PricingSection = ({ onAuthClick }) => {
    const { toast } = useToast();

    const [selectedPlan, setSelectedPlan] = useState('PRO'); // Plan seleccionado inicialmente
    const [hoveredPlan, setHoveredPlan] = useState(null); // Plan con hover activo

    const plans = [
        {
            id: 'FREE',
            name: 'FREE',
            price: '$0',
            period: '/mes',
            description: 'Para probar sin miedo, sin tarjeta y sin compromisos.',
            credits: '150 créditos útiles / mes',
            features: [
                '1 análisis rápido de canal',
                '1 guion mejorado por IA',
                'Tendencias básicas (YouTube y TikTok)',
                'Lector de últimos 5 videos con insights',
                'Exportación de datos sin límites',
                'Cancelación en 1 clic',
                'Multi-IA propietaria con 6 enfoques complementarios'
            ],
            cta: 'Probar sin costo',
            isFeatured: false,
        },
        {
            id: 'BASIC',
            name: 'BASIC',
            price: '$5',
            period: '/mes',
            description: 'Para creadores pequeños que necesitan constancia real.',
            credits: '600 créditos / mes',
            features: [
                'Todos los generadores de contenido',
                'Growth Dashboard básico',
                'Tendencias + nichos sugeridos',
                'Planner semanal',
                'Multi-IA completa (motores CreoVision)',
                'Exportación libre',
                'Soporte estándar'
            ],
            cta: 'Elegir BASIC',
            isFeatured: false,
        },
        {
            id: 'PRO',
            name: 'PRO',
            price: '$12',
            period: '/mes',
            description: 'Plan estrella: precio justo + funcionalidades premium.',
            credits: '1,500 créditos / mes',
            features: [
                'Growth Dashboard completo',
                'A/B testing de títulos y miniaturas',
                'SEO Keyword Research',
                'Competencia YouTube (análisis avanzado)',
                'Tendencias multi-plataforma + Reddit',
                'Recomendaciones estratégicas por IA',
                'Calendario de contenido',
                'Multi-IA optimizada por costo (CreoVision)',
                'Exportación ilimitada',
                'Soporte con prioridad'
            ],
            cta: 'Elegir PRO',
            isFeatured: true,
        },
        {
            id: 'PREMIUM',
            name: 'PREMIUM',
            price: '$25',
            period: '/mes',
            description: 'Para creadores serios, agencias pequeñas y power users.',
            credits: '4,000 créditos / mes',
            features: [
                'Predictor de viralidad',
                'Análisis de audiencia avanzado',
                'Command Center completo',
                'Competencia multi-plataforma (YouTube, TikTok, Instagram)',
                'Automatizaciones IA',
                'Reportes detallados mensuales',
                'Acceso prioritario a nuevas funciones',
                'Soporte premium 24h'
            ],
            cta: 'Elegir PREMIUM',
            isFeatured: false,
        }
    ];

    const handlePlanClick = (plan) => {
        if (plan.isDisabled) {
            toast({
                title: '🚀 ¡Próximamente disponible!',
                description: 'Estamos trabajando en ello. Mantente atento a las novedades.',
            });
            return;
        }

        setSelectedPlan(plan.id);

        if (plan.id === 'FREE') {
            onAuthClick();
            return;
        }

        toast({
            title: 'Pasarela de pago en construcción',
            description: `Pronto podrás suscribirte al plan ${plan.name}. Gracias por tu interés.`,
        });
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
                                    <div className="mb-4">
                                        <span className={`font-bold ${shouldHighlight ? 'text-gradient' : 'text-white'} ${plan.price === 'Personalizado' ? 'text-2xl' : plan.price === 'Próximamente' ? 'text-3xl' : 'text-4xl'}`}>
                                            {plan.price}
                                        </span>
                                        {plan.period && <span className="text-gray-400">{plan.period}</span>}
                                    </div>
                                    {plan.credits && (
                                        <div className="mb-8 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                            <p className="text-purple-300 font-semibold text-center">{plan.credits}</p>
                                        </div>
                                    )}
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

                <div className="mt-16 grid gap-6 lg:grid-cols-2">
                    <div className="glass-effect rounded-3xl border border-purple-500/30 p-8">
                        <h3 className="text-2xl font-semibold text-white mb-4">Packs extra de créditos</h3>
                        <p className="text-gray-300 mb-4">Para quienes producen más sin cambiar de plan.</p>
                        <ul className="space-y-3 text-gray-200">
                            <li>- Mini Pack: 500 + 50 bonus → <span className="font-semibold">$4 USD</span></li>
                            <li>- Medium Pack: 1,500 + 200 bonus → <span className="font-semibold">$10 USD</span></li>
                            <li>- Pro Pack: 4,000 + 600 bonus → <span className="font-semibold">$22 USD</span></li>
                        </ul>
                    </div>
                    <div className="glass-effect rounded-3xl border border-purple-500/30 p-8">
                        <h3 className="text-2xl font-semibold text-white mb-4">¿Por qué estos planes funcionan?</h3>
                        <ul className="space-y-3 text-gray-200">
                            <li>- Están alineados al costo real de las APIs y modelos.</li>
                            <li>- Son imposibles de comparar negativamente con la competencia.</li>
                            <li>- Comunican precio justo y trato adulto: sin contratos ni letra chica.</li>
                            <li>- El plan PRO concentra el 80% del valor por una fracción del precio.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
