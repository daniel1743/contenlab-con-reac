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

const MAX_MESSAGES = 6; // Máximo 6 mensajes (3 usuario + 3 asistente)
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
            '👋 Hola, soy tu asistente exclusivo del Growth Dashboard.\n\n' +
            '💡 Te explico EXACTAMENTE qué ganas con esta herramienta:\n\n' +
            '✅ Identifico $5,000-15,000/mes que estás perdiendo\n' +
            '✅ Te doy un plan priorizado de acciones\n' +
            '✅ Análisis que otros cobran $700+/mes\n' +
            '✅ ROI de 37.8x en 90 días comprobado\n\n' +
            '⏱️ Tengo 6 mensajes para resolver todas tus dudas.\n\n' +
            '¿Qué necesitas saber?',
        },
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Verificar límite de mensajes (sin posibilidad de reiniciar)
    if (messageCount >= MAX_MESSAGES) {
      toast({
        title: 'Límite alcanzado',
        description: 'Has alcanzado el máximo de 6 mensajes. Ya no podrás usar este asistente.',
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
      const systemPrompt = `Eres un asistente especializado del Growth Dashboard. Tu misión es CONVENCER al usuario del valor REAL de esta herramienta.

DATOS CLAVE (úsalos siempre):
💰 Costo: 380 créditos = $19 USD
📊 Lo que obtienes:
  - Análisis que Ahrefs ($99) + SEMrush ($119) + Consultor ($500/mes) = $718/mes cobran
  - Identificación de $5,000-15,000/mes en ingresos perdidos
  - Plan de acción priorizado con ICE Matrix científica
  - Radar de 6 dimensiones: contenido, audiencia, monetización, SEO, distribución, competencia
  - Keywords con oportunidad real de tráfico
  - Playbooks desbloqueables paso a paso

🎯 ROI REAL:
  - 37.8x retorno en 90 días (comprobado)
  - Pagas $19, recuperas $700+ en valor
  - Un solo insight puede generar $5K+ extra al mes

INSTRUCCIONES DE RESPUESTA:
1. SÉ DIRECTO: Sin rodeos, di el valor REAL en la primera oración
2. USA NÚMEROS: Siempre menciona cifras concretas ($, %, ROI)
3. EJEMPLOS CONCRETOS: "Por ejemplo, detecta si tu CTR es 30% menor al promedio"
4. MÁXIMO 4 ORACIONES: Conciso pero impactante
5. SIEMPRE menciona el AHORRO vs otras herramientas
6. Si preguntan algo no relacionado: "Este asistente solo explica el Growth Dashboard"

TONO: Seguro, basado en datos, sin exageraciones falsas.

Responde de forma clara y convincente:`;

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

  // Respuestas predefinidas si falla la API (más convincentes y claras)
  const getFallbackResponse = (question) => {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('qué es') || lowerQ.includes('que es') || lowerQ.includes('función')) {
      return '📊 Es el análisis MÁS COMPLETO de tu canal: combina YouTube, Twitter y noticias con IA para identificar EXACTAMENTE dónde pierdes $5K-15K/mes. Te da un plan priorizado de acciones con ROI comprobado de 37.8x en 90 días. Todo lo que Ahrefs + SEMrush + un consultor ($718/mes) hacen, en un solo análisis de $19.';
    }

    if (lowerQ.includes('cuesta') || lowerQ.includes('380') || lowerQ.includes('precio') || lowerQ.includes('caro')) {
      return '💰 $19 (380 créditos) vs $718/mes de otras herramientas. ¿Por qué tan barato? Porque automatizamos lo que consultores cobran $500/mes. En números: inviertes $19 → identificas mínimo $5,000/mes perdidos → ROI de 263x solo con implementar UN insight. Pagas una vez, no mensualmente.';
    }

    if (lowerQ.includes('beneficio') || lowerQ.includes('ventaja') || lowerQ.includes('gano') || lowerQ.includes('obtengo')) {
      return '🎯 GANAS EN CONCRETO:\n✅ Mapa exacto de $5K-15K/mes que dejas sobre la mesa\n✅ Lista priorizada: qué hacer primero para máximo resultado\n✅ Detecta si tu CTR, retención o SEO están 30-50% bajo el promedio\n✅ Keywords que traerán tráfico real (no vanity metrics)\n✅ Ahorras $700/mes vs pagar múltiples herramientas';
    }

    if (lowerQ.includes('usar') || lowerQ.includes('funciona') || lowerQ.includes('tabs') || lowerQ.includes('secciones')) {
      return '📋 7 secciones que consultor cobraría $500:\n1. Overview - Tu score vs competencia\n2. ICE Matrix - Qué hacer PRIMERO (matemáticamente)\n3. Radar - Dónde estás débil en 6 áreas críticas\n4. Oportunidades - Keywords sin explotar\n5. Insights - Hallazgos que cambiarán tu estrategia\n6. Playbooks - Guías para implementar (150 créditos c/u)\n7. ROI Proof - Cuánto $$ ganarás (casos reales)';
    }

    if (lowerQ.includes('playbook') || lowerQ.includes('desbloquear')) {
      return '📚 Playbooks = $7.50 cada uno (150 créditos). Son guías paso a paso para implementar estrategias específicas. Ejemplo: "Duplica tu CTR en 7 días" incluye: análisis de tus thumbnails actuales, framework de diseño comprobado, herramientas necesarias, 12 pasos detallados, timeframe realista. Un freelancer cobra $200+ por esto.';
    }

    if (lowerQ.includes('ice matrix') || lowerQ.includes('prioriz')) {
      return '🎯 ICE Matrix = la ciencia de priorizar. Calcula Impact × Confidence × Ease de cada tarea. Ejemplo: "Mejorar thumbnails" = 9 impacto × 8 certeza × 7 facilidad = 504 puntos. "Crear podcast" = 7 × 4 × 3 = 84 puntos. Resultado: haz thumbnails PRIMERO. Te evita perder 6 meses en lo que NO mueve la aguja.';
    }

    if (lowerQ.includes('roi') || lowerQ.includes('retorno') || lowerQ.includes('recuper')) {
      return '📈 ROI REAL: Pagas $19 → Identificas mínimo $5,000/mes perdidos → Si implementas solo 20% = $1,000/mes extra → En 90 días ganas $3,000 → ROI de 158x (no 37.8x, ese es promedio conservador). Usuarios reportan recuperar la inversión en las primeras 48 horas solo optimizando títulos.';
    }

    // Respuesta genérica más convincente
    return '💡 En resumen: $19 te muestra EXACTAMENTE dónde pierdes $5K-15K/mes y cómo recuperarlos. Es como contratar un consultor de $500/mes por 1 hora, pero con datos de IA más precisos que análisis humano. ROI comprobado: 37.8x en 90 días. ¿Qué aspecto específico quieres que te aclare?';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // NO resetear el contador - el límite es permanente
    // Solo cerrar el panel, mantener el conteo de mensajes
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
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
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
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50"
          >
            <Card className="w-full sm:w-[420px] h-[600px] max-h-[80vh] bg-slate-900 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    <img src="/robot.png" alt="Creo Bot" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Creo Dashboard Bot</h3>
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
                  <div className="text-center py-4 bg-slate-700/50 rounded-lg">
                    <p className="text-sm font-semibold text-white mb-1">
                      🚫 Límite alcanzado
                    </p>
                    <p className="text-xs text-slate-400 mb-3">
                      Has usado los 6 mensajes disponibles.<br />
                      Este límite es permanente.
                    </p>
                    <Button
                      onClick={handleClose}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Cerrar
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
                  🤖 Creo Bot - Asistente exclusivo del Growth Dashboard
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
