/**
 * 🚀 Growth Dashboard Assistant
 * Asistente IA exclusivo del Growth Dashboard para explicar funcionalidad y beneficios
 * Usa Qwen como modelo, máximo 3-4 mensajes por conversación
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const MAX_MESSAGES = 4; // Máximo 4 mensajes (2 usuario + 2 asistente)
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || '';

export default function GrowthDashboardAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje de bienvenida al abrir
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            '¡Hola! 👋 Soy tu asistente del Growth Dashboard. Puedo ayudarte a entender:\n\n' +
            '• ¿Qué es el Growth Dashboard?\n' +
            '• ¿Por qué cuesta 380 créditos?\n' +
            '• ¿Qué beneficios y ROI obtienes?\n' +
            '• ¿Cómo usar cada sección?\n\n' +
            'Tengo máximo 4 mensajes para resolver tus dudas. ¿En qué puedo ayudarte?',
        },
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Verificar límite de mensajes
    if (messageCount >= MAX_MESSAGES) {
      toast({
        title: 'Límite alcanzado',
        description: 'Has alcanzado el máximo de 4 mensajes. Cierra y vuelve a abrir para reiniciar.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Agregar mensaje del usuario
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setMessageCount((prev) => prev + 1);

    try {
      // Construir contexto especializado para Growth Dashboard
      const systemPrompt = `Eres un asistente especializado del Growth Dashboard de CreoVision. Tu ÚNICA función es explicar este panel premium.

INFORMACIÓN CLAVE:
- Costo: 380 créditos (~$19 USD)
- Función: Análisis completo de crecimiento para creadores de contenido
- Incluye: ICE Matrix, Radar de Alertas, Análisis de Oportunidades, Insights ejecutivos, Playbooks desbloqueables, ROI Proof

BENEFICIOS:
- Identifica $5,000-15,000/mes en ingresos potenciales perdidos
- Reemplaza: Ahrefs ($99) + SEMrush ($119) + Consultor ($500) = $718/mes
- ROI estimado: 37.8x en 90 días
- Análisis con IA de YouTube, Twitter y tendencias de noticias
- Priorización científica con ICE Matrix (Impact × Confidence × Ease)
- Playbooks paso a paso desbloqueables (150 créditos c/u)

INSTRUCCIONES:
- Responde SOLO sobre el Growth Dashboard
- Máximo 3-4 oraciones por respuesta
- Sé específico y enfocado en valor/ROI
- Si preguntan algo no relacionado al dashboard, redirige amablemente
- NUNCA menciones otros productos de CreoVision

Responde la siguiente pregunta de forma directa y concisa:`;

      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la API de Qwen');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setMessages([
        ...newMessages,
        { role: 'assistant', content: assistantMessage },
      ]);
      setMessageCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error al consultar Qwen:', error);

      // Fallback con respuestas predefinidas
      const fallbackResponse = getFallbackResponse(userMessage);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: fallbackResponse },
      ]);
      setMessageCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // Respuestas predefinidas si falla la API
  const getFallbackResponse = (question) => {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('qué es') || lowerQ.includes('que es') || lowerQ.includes('función')) {
      return '📊 El Growth Dashboard es un análisis completo de crecimiento que combina datos de YouTube, Twitter y noticias con IA avanzada. Te muestra exactamente dónde estás perdiendo ingresos y qué hacer para crecer, todo en un solo lugar.';
    }

    if (lowerQ.includes('cuesta') || lowerQ.includes('380') || lowerQ.includes('precio') || lowerQ.includes('caro')) {
      return '💰 Cuesta 380 créditos (~$19) porque reemplaza herramientas que cuestan $718/mes (Ahrefs, SEMrush, consultor). Un solo análisis puede identificar $5K-15K/mes en ingresos perdidos. El ROI promedio es 37.8x en 90 días.';
    }

    if (lowerQ.includes('beneficio') || lowerQ.includes('ventaja') || lowerQ.includes('por qué') || lowerQ.includes('porque')) {
      return '🚀 Beneficios principales:\n• Identifica oportunidades de $5K-15K/mes\n• ICE Matrix: prioriza tareas por impacto real\n• Radar de riesgos: detecta problemas antes que afecten\n• Playbooks: guías paso a paso para crecer\n• Ahorra $700/mes vs otras herramientas';
    }

    if (lowerQ.includes('usar') || lowerQ.includes('funciona') || lowerQ.includes('tabs') || lowerQ.includes('secciones')) {
      return '📋 Tienes 7 tabs:\n1. Overview - Resumen general\n2. ICE Matrix - Tareas priorizadas\n3. Radar - Análisis de 6 dimensiones\n4. Oportunidades - Keywords y nichos\n5. Insights - Hallazgos ejecutivos\n6. Playbooks - Guías desbloqueables\n7. ROI Proof - Casos de éxito y proyecciones';
    }

    if (lowerQ.includes('playbook') || lowerQ.includes('desbloquear')) {
      return '📚 Los Playbooks son guías paso a paso para implementar estrategias específicas (ej: "Cómo duplicar tu CTR"). Cuestan 150 créditos cada uno e incluyen: pasos detallados, herramientas necesarias, tips profesionales y timeframes realistas.';
    }

    if (lowerQ.includes('ice matrix')) {
      return '🎯 ICE Matrix es una metodología de priorización que calcula: Impact (impacto en resultados) × Confidence (certeza de éxito) × Ease (facilidad de implementación). Te dice exactamente QUÉ hacer primero para crecer más rápido con menos esfuerzo.';
    }

    // Respuesta genérica
    return 'El Growth Dashboard analiza tu canal con IA, identifica oportunidades de $5K-15K/mes en ingresos perdidos, y te da un plan de acción priorizado. Por 380 créditos (~$19) obtienes lo que otras herramientas cobran $700+/mes. ¿Tienes alguna duda específica sobre alguna sección?';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset después de cerrar
    setTimeout(() => {
      setMessages([]);
      setMessageCount(0);
    }, 300);
  };

  return (
    <>
      {/* Botón flotante para abrir asistente */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 flex items-center justify-center group"
              title="¿Qué es esto?"
            >
              <QuestionMarkCircleIcon className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel del asistente */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="w-[420px] h-[600px] bg-slate-900 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Asistente Dashboard</h3>
                    <p className="text-purple-100 text-xs">
                      {messageCount}/{MAX_MESSAGES} mensajes usados
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-slate-400">Pensando...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-800 border-t border-slate-700">
                {messageCount >= MAX_MESSAGES ? (
                  <div className="text-center py-3">
                    <p className="text-sm text-slate-400 mb-2">
                      Has alcanzado el límite de mensajes
                    </p>
                    <Button
                      onClick={handleClose}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Cerrar y reiniciar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Pregunta sobre el Growth Dashboard..."
                      disabled={isLoading || messageCount >= MAX_MESSAGES}
                      className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-500"
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || messageCount >= MAX_MESSAGES}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 w-11 p-0 flex items-center justify-center"
                    >
                      <PaperAirplaneIcon className="h-5 w-5 text-white" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-2 text-center">
                  Asistente exclusivo del Growth Dashboard
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
