import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  Target,
  Users,
  Youtube,
  ArrowRight,
  Clock
} from 'lucide-react';
import { getChannelInfo } from '@/services/youtubeService';

/**
 * 🎯 ONBOARDING CONVERSACIONAL - EXPRESS MODE
 *
 * Filosofía: NO es un formulario, es una conversación
 * - 5 micro-preguntas (3 segundos cada una)
 * - Total: 40 segundos para completar
 * - Se siente como chat, no como extracción de datos
 * - Datos adicionales se recogen durante el uso natural de la app
 *
 * Basado en: Progressive Profiling + Conversational UX
 */

const OnboardingConversational = ({ onComplete, onSkip }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 📊 Datos mínimos necesarios (Express Mode)
  const [profile, setProfile] = useState({
    name: '',
    tone: '',
    niche: '',
    audience: '',
    youtubeChannel: '',
    youtubeConnected: false,
    youtubeData: null
  });

  // 🎨 Definición de tonos visuales
  const toneOptions = [
    { value: 'casual', emoji: '👋', label: 'Casual y Cercano', color: 'from-blue-500 to-cyan-500' },
    { value: 'professional', emoji: '🎓', label: 'Profesional', color: 'from-purple-500 to-indigo-500' },
    { value: 'ironic', emoji: '😏', label: 'Irónico', color: 'from-orange-500 to-red-500' },
    { value: 'motivational', emoji: '💪', label: 'Motivacional', color: 'from-green-500 to-emerald-500' },
    { value: 'educational', emoji: '🧠', label: 'Educativo', color: 'from-yellow-500 to-amber-500' },
    { value: 'entertaining', emoji: '⚡', label: 'Divertido', color: 'from-pink-500 to-rose-500' }
  ];

  // 🎯 Definición de las 5 micro-preguntas
  const questions = [
    {
      id: 'welcome',
      type: 'text',
      question: `Hola, quiero ayudarte a crecer 🚀\n\nPara poder hablarte como tú hablas...\n¿Cómo te llamas?`,
      placeholder: 'Tu nombre',
      field: 'name',
      icon: Sparkles,
      subtitle: 'Solo toma 40 segundos, lo prometo'
    },
    {
      id: 'tone',
      type: 'buttons',
      question: `Perfecto, {{name}}. ¿Y cómo te gustaría que hable contigo?`,
      subtitle: 'Escoge el tono que más te representa',
      field: 'tone',
      icon: MessageSquare,
      options: toneOptions
    },
    {
      id: 'niche',
      type: 'text',
      question: '¿En qué nicho creas contenido?',
      placeholder: 'Ej: tecnología, fitness, gaming, finanzas...',
      field: 'niche',
      icon: Target,
      subtitle: 'Esto me ayuda a darte ideas relevantes'
    },
    {
      id: 'audience',
      type: 'text',
      question: '¿Para quién creas contenido?',
      placeholder: 'Ej: jóvenes 18-25, emprendedores, gamers...',
      field: 'audience',
      icon: Users,
      subtitle: 'Conocer a tu audiencia = mejores recomendaciones'
    },
    {
      id: 'youtube',
      type: 'text-optional',
      question: '¿Tienes YouTube?',
      subtitle: 'Si quieres, conecto tu canal y preparo recomendaciones hechas justo para ti 🎯',
      placeholder: 'ID del canal o @usuario',
      field: 'youtubeChannel',
      icon: Youtube,
      skipText: 'Más tarde'
    }
  ];

  const currentQuestion = questions[currentStep];

  // ⏭️ Avanzar al siguiente paso
  const handleNext = useCallback(async () => {
    // Validación simple
    if (currentQuestion.type === 'text' && !profile[currentQuestion.field] && currentQuestion.id !== 'youtube') {
      toast({
        title: 'Espera un momento',
        description: 'Me falta ese dato para continuar 😊',
        variant: 'destructive'
      });
      return;
    }

    if (currentQuestion.type === 'buttons' && !profile[currentQuestion.field]) {
      toast({
        title: 'Elige una opción',
        description: 'Necesito saber cómo hablar contigo',
        variant: 'destructive'
      });
      return;
    }

    // Si es el paso de YouTube y hay un canal, intentar conectar
    if (currentQuestion.id === 'youtube' && profile.youtubeChannel && !profile.youtubeConnected) {
      await connectYouTube();
    }

    // Si es el último paso, completar
    if (currentStep === questions.length - 1) {
      handleComplete();
      return;
    }

    // Transición suave
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
  }, [currentStep, profile, currentQuestion]);

  // 🔗 Conectar YouTube
  const connectYouTube = async () => {
    const channelIdentifier = profile.youtubeChannel;

    if (!channelIdentifier) return;

    toast({
      title: '🔗 Conectando con YouTube...',
      description: 'Un momento...',
    });

    try {
      const channelData = await getChannelInfo(channelIdentifier);

      setProfile(prev => ({
        ...prev,
        youtubeConnected: true,
        youtubeData: channelData
      }));

      toast({
        title: `✅ ¡Conectado! ${channelData.title}`,
        description: `${channelData.subscriberCount.toLocaleString()} suscriptores`,
      });

    } catch (error) {
      console.error('Error conectando YouTube:', error);
      toast({
        title: '❌ No pude conectar',
        description: 'Verifica que el canal sea público. Pero no te preocupes, puedes hacerlo después.',
        variant: 'destructive'
      });
    }
  };

  // ✅ Completar onboarding
  const handleComplete = useCallback(() => {
    const completeProfile = {
      ...profile,
      createdAt: new Date().toISOString(),
      version: '2.0-conversational',
      expressMode: true
    };

    // Guardar en localStorage
    localStorage.setItem('creatorProfile', JSON.stringify(completeProfile));

    // TODO: Guardar en Supabase
    // await supabase.from('creator_profiles').upsert({
    //   user_id: user.id,
    //   profile_data: completeProfile
    // });

    toast({
      title: '🎉 ¡Listo! Ya nos conocemos mejor',
      description: 'Ahora puedo ayudarte a crear contenido increíble',
    });

    if (onComplete) {
      onComplete(completeProfile);
    }
  }, [profile, toast, onComplete]);

  // 🎨 Actualizar campo
  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // ⏎ Enter para continuar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isTransitioning) {
      handleNext();
    }
  };

  // 🎯 Reemplazar placeholder con nombre
  const parseQuestion = (text) => {
    return text.replace('{{name}}', profile.name || 'amigo');
  };

  const Icon = currentQuestion?.icon;
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg overflow-hidden">
      <div className="w-full max-w-2xl px-6">
        {/* 📊 Barra de progreso superior */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{currentStep + 1} de {questions.length}</span>
            </div>
            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-gray-400 hover:text-white text-sm"
              >
                Saltar por ahora
              </Button>
            )}
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 💬 Contenedor de la pregunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Ícono */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                {Icon && <Icon className="w-10 h-10 text-white" />}
              </div>
            </div>

            {/* Pregunta */}
            <div className="text-center space-y-3">
              <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight whitespace-pre-line">
                {parseQuestion(currentQuestion.question)}
              </h1>
              {currentQuestion.subtitle && (
                <p className="text-gray-400 text-lg">
                  {currentQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Input/Opciones */}
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                {currentQuestion.type === 'text' || currentQuestion.type === 'text-optional' ? (
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder={currentQuestion.placeholder}
                      value={profile[currentQuestion.field] || ''}
                      onChange={(e) => updateField(currentQuestion.field, e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      className="w-full h-14 text-lg bg-gray-900/50 border-2 border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                    />
                    <div className="flex gap-3">
                      {currentQuestion.type === 'text-optional' && (
                        <Button
                          onClick={() => {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setCurrentStep(prev => prev + 1);
                              setIsTransitioning(false);
                            }, 300);
                          }}
                          variant="outline"
                          className="flex-1 h-14 border-2 border-gray-700 hover:border-gray-600 text-gray-300"
                        >
                          {currentQuestion.skipText || 'Saltar'}
                        </Button>
                      )}
                      <Button
                        onClick={handleNext}
                        disabled={isTransitioning}
                        className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25"
                      >
                        {currentStep === questions.length - 1 ? '¡Listo! 🎉' : 'Siguiente'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : currentQuestion.type === 'buttons' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            updateField(currentQuestion.field, option.value);
                            // Auto-advance después de seleccionar
                            setTimeout(() => {
                              handleNext();
                            }, 400);
                          }}
                          className={`relative p-5 rounded-xl border-2 transition-all hover:scale-105 ${
                            profile[currentQuestion.field] === option.value
                              ? `border-transparent bg-gradient-to-br ${option.color} shadow-lg`
                              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-4xl mb-2">{option.emoji}</div>
                          <div className="text-white text-sm font-semibold">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Hint de Enter */}
            {(currentQuestion.type === 'text' || currentQuestion.type === 'text-optional') && (
              <div className="flex justify-center">
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs">Enter ↵</kbd>
                  para continuar
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 🎯 Mensaje de valor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-gray-400 text-xs">
              Después podemos afinar más detalles mientras usas la app
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingConversational;
