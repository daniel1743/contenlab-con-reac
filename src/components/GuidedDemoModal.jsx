import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/solid';
import {
  chat,
  isDeepSeekConfigured
} from '@/services/deepseekAssistantService';

const STEP_PROMPTS = [
  'Da la bienvenida cálidamente a la persona que acaba de entrar a CreoVision, en primera persona plural. Resume en dos frases qué es el Centro Creativo y pregunta qué objetivo quiere lograr hoy.',
  'Explica de forma muy concreta (3 bullets cortos) qué tipo de contenido puede crear con el Centro Creativo, resaltando que todo se adapta a su voz y nicho.',
  'Describe cómo la IA narrativa de CreoVision escucha el estilo del creador y propone scripts, ideas y títulos listos para usar. Termina con un emoji inspirador.',
  'Guía al visitante sobre los próximos pasos: elegir tema, seleccionar tono, generar contenido. Destaca que recibirá métricas y sugerencias accionables.',
  'Cierra con un mensaje motivador invitando a abrir el Centro Creativo ahora. Indica que podrá explorar libremente y que para copiar o descargar deberá suscribirse. Usa un emoji final.'
];

const fallbackMessages = [
  '¡Hola! Soy el asistente de CreoVision. Aquí te ayudamos a transformar tus ideas en contenido viral. ¿Qué objetivo creativo te gustaría conquistar hoy?',
  'En el Centro Creativo puedes generar scripts listos para grabar, calendarios de contenido y estrategias para YouTube, TikTok o Instagram en minutos.',
  'Nuestra IA escucha tu estilo y lo traduce en guiones con ganchos poderosos, llamados a la acción y títulos irresistibles ✨',
  'Solo debes elegir tu tema, el tono que prefieres y pulsar “Generar”. También verás métricas, hashtags y recomendaciones personalizadas.',
  'Listo, abre el Centro Creativo y explora. Cuando quieras copiar o descargar tus recursos, podrás hacerlo al suscribirte 🎯'
];

const GuidedDemoModal = ({
  open,
  onClose,
  onComplete,
  visitorName = 'Creador Visionario'
}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutsRef = useRef([]);
  const historyRef = useRef([]);

  const deepseekEnabled = useMemo(() => isDeepSeekConfigured(), []);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setCurrentStep(0);
      historyRef.current = [];
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      return;
    }

    const start = async () => {
      await runStep(0);
    };

    start();

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const scheduleNext = (nextStep) => {
    if (nextStep >= STEP_PROMPTS.length) {
      const timeoutId = setTimeout(() => {
        onComplete?.();
      }, 2200);
      timeoutsRef.current.push(timeoutId);
      return;
    }

    const timeoutId = setTimeout(() => {
      runStep(nextStep);
    }, 2600);
    timeoutsRef.current.push(timeoutId);
  };

  const runStep = async (step) => {
    setCurrentStep(step);
    setIsLoading(true);

    try {
      const conversationHistory = historyRef.current.map((msg) => ({
        role: 'assistant',
        content: msg.content
      }));

      let assistantResponse = fallbackMessages[step];

      if (deepseekEnabled) {
        const userContext = {
          name: visitorName,
          topic: 'creación de contenido',
          plan: 'DEMO'
        };

        const response = await chat(
          userContext,
          conversationHistory,
          STEP_PROMPTS[step]
        );

        if (response && response.trim().length > 0) {
          assistantResponse = response;
        }
      }

      const newMessage = {
        id: `${Date.now()}-${step}`,
        role: 'assistant',
        content: assistantResponse
      };

      historyRef.current = [...historyRef.current, newMessage];
      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(false);
      scheduleNext(step + 1);
    } catch (error) {
      console.error('[GuidedDemoModal] Error generando mensaje demo:', error);
      setIsLoading(false);
      const fallback = fallbackMessages[step] || 'Gracias por explorar CreoVision. ¡Vamos al Centro Creativo!';
      historyRef.current = [
        ...historyRef.current,
        { id: `${Date.now()}-${step}`, role: 'assistant', content: fallback }
      ];
      setMessages([...historyRef.current]);
      scheduleNext(step + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-900 border border-purple-500/30 text-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-purple-200/80">
                Demo Guiada
              </p>
              <h3 className="text-xl font-semibold text-white">
                Asistente CreoVision
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
            onClick={onClose}
          >
            Saltar
          </Button>
        </div>

        <div className="mt-4 space-y-4 max-h-[440px] overflow-y-auto pr-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-purple-500/20 rounded-2xl px-4 py-3 shadow-lg shadow-purple-900/40">
                  <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-line">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-purple-200"
            >
              <span className="inline-flex w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Creando respuesta…
            </motion.div>
          )}
        </div>

        <div className="pt-4 border-t border-purple-500/20 flex flex-col gap-3">
          <p className="text-xs text-gray-400">
            Paso {Math.min(currentStep + 1, STEP_PROMPTS.length)} de {STEP_PROMPTS.length}
          </p>
          <Button
            onClick={onComplete}
            disabled={currentStep < STEP_PROMPTS.length - 1}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Abrir Centro Creativo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuidedDemoModal;
