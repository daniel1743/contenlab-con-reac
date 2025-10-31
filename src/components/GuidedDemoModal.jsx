import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  SparklesIcon as SparklesOutline,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import {
  chat,
  generateWelcomeMessage,
  isDeepSeekConfigured
} from '@/services/deepseekAssistantService';

const CONVERSATION_GOAL =
  'Guiar al usuario para que abra el Centro Creativo y genere su primer contenido.';

const STAGE_FLOW = [
  {
    id: 'intro',
    stepLabel: 'Paso 1 de 3',
    title: 'Hablemos de tu objetivo',
    helper: 'Cuenta en una frase que quieres lograr con tu contenido hoy.',
    suggestions: [
      {
        id: 'ideas',
        label: 'Quiero ideas virales',
        message: 'Quiero ideas virales frescas para mis videos de TikTok.',
        nextStage: 'explore',
        context: { topic: 'Ideas virales para TikTok' }
      },
      {
        id: 'script',
        label: 'Necesito un guion rapido',
        message: 'Necesito un guion corto para un video de YouTube.',
        nextStage: 'explore',
        context: { topic: 'Guion corto para YouTube' }
      },
      {
        id: 'calendar',
        label: 'Plan de contenido semanal',
        message: 'Quiero un plan de contenido semanal para Instagram.',
        nextStage: 'explore',
        context: { topic: 'Plan de contenido semanal para Instagram' }
      }
    ]
  },
  {
    id: 'explore',
    stepLabel: 'Paso 2 de 3',
    title: 'Descubre el Centro Creativo',
    helper: 'Elegimos tema, tono y formato juntos. Que parte quieres probar primero?',
    suggestions: [
      {
        id: 'tour',
        label: 'Guiame paso a paso',
        message: 'Muestrame como usar el Centro Creativo paso a paso.',
        nextStage: 'cta'
      },
      {
        id: 'titles',
        label: 'Optimizar titulos y ganchos',
        message: 'Quiero optimizar ganchos y titulos virales.',
        nextStage: 'cta'
      },
      {
        id: 'metrics',
        label: 'Quiero ver metricas',
        message: 'Ensename las metricas y sugerencias que recibo.',
        nextStage: 'cta'
      }
    ]
  },
  {
    id: 'cta',
    stepLabel: 'Paso 3 de 3',
    title: 'Hora de crear algo viral',
    helper: 'Abrimos el Centro Creativo y generamos tu primer recurso.',
    suggestions: [
      {
        id: 'open-now',
        label: 'Abrir Centro Creativo ahora',
        action: 'complete'
      },
      {
        id: 'examples',
        label: 'Ver un ejemplo antes',
        message: 'Puedes mostrarme un ejemplo rapido del contenido que generamos?',
        nextStage: 'cta'
      }
    ]
  }
];

const STAGE_DEVELOPER_HINT = {
  intro:
    'Estas iniciando la demo. Formula una pregunta abierta y menciona que el Centro Creativo puede acompanarte paso a paso.',
  explore:
    'Relaciona la meta del usuario con el Centro Creativo y propone una secuencia de 3 pasos muy concreta.',
  cta:
    'Invita con energia a pulsar el boton "Abrir Centro Creativo". Recuerda que puede probar gratis y que las descargas completas requieren plan premium.'
};

const FALLBACK_STAGE_RESPONSE = {
  intro: (name) =>
    `Genial ${name || 'creador'}! Puedo ayudarte con ideas, guiones o calendarios. Que quieres trabajar primero? 🚀`,
  explore: () =>
    'Perfecto, en el Centro Creativo configuramos tema, tono y formato en segundos. Listo para que te guie paso a paso? ✨',
  cta: () =>
    'Lo tenemos! Abre el Centro Creativo y genera tu primer recurso. Recuerda: puedes probar sin costo y desbloquear descargas completas con el plan premium. 💜'
};

const getStageConfig = (stageId) =>
  STAGE_FLOW.find((stage) => stage.id === stageId) || STAGE_FLOW[0];

const GuidedDemoModal = ({
  open,
  onClose,
  onComplete,
  visitorName = 'Creador Visionario'
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [stage, setStage] = useState(STAGE_FLOW[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const messagesEndRef = useRef(null);
  const historyRef = useRef([]);
  const userContextRef = useRef({
    name: visitorName,
    topic: '',
    plan: 'DEMO',
    conversationGoal: CONVERSATION_GOAL
  });

  const deepseekEnabled = useMemo(() => isDeepSeekConfigured(), []);
  const stageConfig = useMemo(() => getStageConfig(stage), [stage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const resetConversationState = useCallback(() => {
    setMessages([]);
    setInputValue('');
    setStage(STAGE_FLOW[0].id);
    setIsLoading(false);
    setIsInitializing(false);
    historyRef.current = [];
    userContextRef.current = {
      name: visitorName,
      topic: '',
      plan: 'DEMO',
      conversationGoal: CONVERSATION_GOAL
    };
  }, [visitorName]);

  const bootstrapConversation = useCallback(async () => {
    setIsInitializing(true);
    const currentStage = STAGE_FLOW[0].id;
    const context = {
      ...userContextRef.current,
      stage: currentStage
    };

    try {
      const welcome = deepseekEnabled
        ? await generateWelcomeMessage(context)
        : FALLBACK_STAGE_RESPONSE.intro(visitorName);

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: welcome,
        timestamp: new Date()
      };

      historyRef.current = [{ role: 'assistant', content: welcome }];
      setMessages([assistantMessage]);
    } catch (error) {
      console.error('[GuidedDemoModal] Error generando bienvenida:', error);
      const fallback = FALLBACK_STAGE_RESPONSE.intro(visitorName);
      historyRef.current = [{ role: 'assistant', content: fallback }];
      setMessages([
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fallback,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsInitializing(false);
    }
  }, [deepseekEnabled, visitorName]);

  useEffect(() => {
    if (!open) {
      resetConversationState();
      return;
    }

    resetConversationState();
    bootstrapConversation();

    return () => {
      historyRef.current = [];
    };
  }, [open, resetConversationState, bootstrapConversation]);

  const determineNextStage = useCallback(
    (preferredStage) => {
      if (preferredStage) return preferredStage;
      const currentIndex = STAGE_FLOW.findIndex((item) => item.id === stage);
      if (currentIndex === -1 || currentIndex === STAGE_FLOW.length - 1) {
        return stage;
      }
      return STAGE_FLOW[currentIndex + 1].id;
    },
    [stage]
  );

  const handleSendMessage = useCallback(
    async (rawText, options = {}) => {
      const text = rawText?.trim();
      if (!text || isLoading || isInitializing) return;

      const targetStage = determineNextStage(options.nextStage);
      setStage(targetStage);
      setInputValue('');

      const timestamp = new Date();
      const userMessage = {
        id: `user-${timestamp.getTime()}`,
        role: 'user',
        content: text,
        timestamp
      };

      setMessages((prev) => [...prev, userMessage]);

      const previousHistory = historyRef.current;
      historyRef.current = [...historyRef.current, { role: 'user', content: text }];

      if (options.contextPatch) {
        userContextRef.current = {
          ...userContextRef.current,
          ...options.contextPatch
        };
      }

      setIsLoading(true);

      try {
        const developerMessage = STAGE_DEVELOPER_HINT[targetStage];
        const assistantResponse = deepseekEnabled
          ? await chat(
              {
                ...userContextRef.current,
                stage: targetStage
              },
              previousHistory,
              text,
              {
                stage: targetStage,
                developerMessages: developerMessage
                  ? [developerMessage, 'Manten la respuesta en max 2 oraciones con un emoji.']
                  : ['Manten la respuesta en max 2 oraciones con un emoji.']
              }
            )
          : FALLBACK_STAGE_RESPONSE[targetStage]
          ? FALLBACK_STAGE_RESPONSE[targetStage](visitorName)
          : FALLBACK_STAGE_RESPONSE.cta();

        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantResponse,
          timestamp: new Date()
        };

        historyRef.current = [
          ...historyRef.current,
          { role: 'assistant', content: assistantResponse }
        ];

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('[GuidedDemoModal] Error en la conversacion:', error);
        const fallback = FALLBACK_STAGE_RESPONSE[targetStage]
          ? FALLBACK_STAGE_RESPONSE[targetStage](visitorName)
          : FALLBACK_STAGE_RESPONSE.cta();

        historyRef.current = [
          ...historyRef.current,
          { role: 'assistant', content: fallback }
        ];

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: fallback,
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      deepseekEnabled,
      determineNextStage,
      isInitializing,
      isLoading,
      visitorName
    ]
  );

  const handleSubmit = useCallback(
    (event) => {
      event?.preventDefault();
      handleSendMessage(inputValue);
    },
    [handleSendMessage, inputValue]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage(inputValue);
      }
    },
    [handleSendMessage, inputValue]
  );

  const handleSuggestionClick = useCallback(
    (suggestion) => {
      if (suggestion.action === 'complete') {
        onComplete?.();
        return;
      }

      handleSendMessage(suggestion.message, {
        nextStage: suggestion.nextStage,
        contextPatch: suggestion.context
      });
    },
    [handleSendMessage, onComplete]
  );

  const renderMessageBubble = (message) => {
    const isUser = message.role === 'user';
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, type: 'spring' }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-500/30'
              : 'bg-slate-900/80 border border-purple-500/30 text-slate-100'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          {message.timestamp && (
            <p
              className={`mt-2 text-[11px] uppercase tracking-wide ${
                isUser ? 'text-purple-200/80' : 'text-slate-400'
              }`}
            >
              {message.timestamp.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full bg-slate-950/95 border border-purple-500/40 text-white p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] min-h-[540px]">
          <div className="relative bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-900 px-6 py-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
                  <SparklesOutline className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-purple-200/80">
                    Demo guiada
                  </p>
                  <h3 className="text-xl font-semibold text-white">
                    Asistente CreoVision
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={onClose}
              >
                Saltar
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-purple-200/70">
                {stageConfig.stepLabel}
              </span>
              <h4 className="text-2xl font-semibold text-white">{stageConfig.title}</h4>
              <p className="text-sm text-slate-300/80 leading-relaxed">
                {stageConfig.helper}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-purple-200/70">
                Sugerencias rapidas
              </p>
              <div className="flex flex-wrap gap-2">
                {stageConfig.suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm px-4 py-2 rounded-full border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200 text-purple-100 backdrop-blur-sm"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-purple-500/20 pt-6 space-y-3">
              <p className="text-xs text-slate-400">
                El asistente adaptara la demo a tus respuestas para que pruebes la generacion de contenido.
              </p>
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:opacity-90 shadow-lg shadow-purple-600/40"
              >
                Abrir Centro Creativo
              </Button>
            </div>
          </div>

          <div className="bg-slate-950/80 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => renderMessageBubble(message))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <SparklesSolid className="w-5 h-5 text-purple-400 animate-pulse" />
                  <span>Creando respuesta...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-purple-500/20 px-6 py-4 bg-slate-950/90"
            >
              <div className="flex items-end gap-3 bg-slate-900/80 border border-purple-500/30 rounded-2xl px-4 py-3 focus-within:border-purple-400/60 transition-all duration-200">
                <textarea
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-transparent text-sm text-white resize-none focus:outline-none placeholder:text-slate-500"
                  disabled={isLoading || isInitializing}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full h-11 w-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40"
                  disabled={isLoading || isInitializing || !inputValue.trim()}
                >
                  {isLoading ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Consejos personalizados en menos de 20 segundos. Respuestas breves y enfocadas.
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuidedDemoModal;
