/**
 * 🤖 FLOATING ASSISTANT COMPONENT
 *
 * Asistente flotante con mascota de CreoVision que guía al usuario
 * mediante conversaciones contextuales con IA (DeepSeek).
 *
 * Features:
 * - Burbuja flotante con badge de notificación
 * - Chat expandible con historial de conversación
 * - Sugerencias rápidas interactivas
 * - Animaciones suaves con Framer Motion
 * - Contexto automático del usuario (nombre, tema, métricas)
 *
 * @author CreoVision
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import {
  generateWelcomeMessage,
  chat,
  getSuggestions,
  isDeepSeekConfigured
} from '@/services/deepseekAssistantService';

const FloatingAssistant = ({ userContext }) => {
  // Estados del componente
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Verificar si DeepSeek está configurado
  const deepseekEnabled = isDeepSeekConfigured();

  /**
   * Scroll automático al último mensaje
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Generar mensaje de bienvenida cuando hay nuevo contexto
   */
  useEffect(() => {
    if (!deepseekEnabled) return;

    // Solo generar bienvenida si hay un tema nuevo y el chat está cerrado
    if (userContext?.topic && !isOpen && isFirstLoad) {
      setIsFirstLoad(false);
      generateInitialMessage();
    }
  }, [userContext?.topic, deepseekEnabled]);

  /**
   * Genera mensaje inicial del asistente
   */
  const generateInitialMessage = async () => {
    try {
      const welcomeMsg = await generateWelcomeMessage(userContext);

      if (!welcomeMsg) {
        console.warn('[FloatingAssistant] No se generó mensaje de bienvenida');
        return;
      }

      setMessages([
        {
          id: Date.now(),
          role: 'assistant',
          content: welcomeMsg,
          timestamp: new Date()
        }
      ]);

      // Mostrar badge de notificación
      if (!isOpen) {
        setHasNewMessage(true);
      }

      // Generar sugerencias (no crashear si falla)
      try {
        const newSuggestions = await getSuggestions(userContext);
        setSuggestions(newSuggestions || []);
      } catch (sugError) {
        console.warn('[FloatingAssistant] Error generando sugerencias:', sugError);
        setSuggestions([]);
      }

    } catch (error) {
      console.error('[FloatingAssistant] Error generando mensaje inicial:', error);
      // NO crashear el componente, simplemente no mostrar el mensaje
    }
  };

  /**
   * Abrir/cerrar el chat
   */
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);

    // Focus en input cuando se abre
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  /**
   * Enviar mensaje del usuario
   */
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Agregar mensaje del usuario
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Convertir mensajes al formato requerido por DeepSeek
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Obtener respuesta del asistente
      const assistantResponse = await chat(
        userContext,
        conversationHistory,
        userMessage
      );

      // Validar que la respuesta no esté vacía
      if (!assistantResponse || assistantResponse.trim().length === 0) {
        throw new Error('Empty response from assistant');
      }

      // Agregar respuesta del asistente
      const newAssistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAssistantMessage]);

      // Actualizar sugerencias basadas en la conversación (no crashear si falla)
      try {
        const newSuggestions = await getSuggestions({
          ...userContext,
          hasGeneratedContent: true
        });
        setSuggestions(newSuggestions || []);
      } catch (sugError) {
        console.warn('[FloatingAssistant] Error actualizando sugerencias:', sugError);
      }

    } catch (error) {
      console.error('[FloatingAssistant] Error enviando mensaje:', error);

      // Mensaje de error amigable
      const errorMessage = error.message && error.message.includes('DeepSeek')
        ? 'El asistente está temporalmente no disponible. Por favor intenta de nuevo en un momento. 🔧'
        : 'Disculpa, tuve un problema procesando tu mensaje. Por favor intenta de nuevo. 🙏';

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manejar clic en sugerencia
   */
  const handleSuggestionClick = (suggestion) => {
    // Por ahora, enviar como mensaje de texto
    // En el futuro, puedes implementar acciones específicas
    setInputValue(suggestion.text);
    inputRef.current?.focus();
  };

  if (!deepseekEnabled) {
    return null; // No mostrar si DeepSeek no está configurado
  }

  return (
    <>
      {/* Burbuja flotante */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={toggleChat}
          className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center hover:shadow-purple-500/70 transition-shadow duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animación de brillo */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Icono de mascota/chat */}
          {isOpen ? (
            <XMarkIcon className="w-8 h-8 text-white relative z-10" />
          ) : (
            <SparklesSolid className="w-8 h-8 text-white relative z-10 animate-pulse" />
          )}

          {/* Badge de notificación */}
          {hasNewMessage && !isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              1
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Ventana de chat - Diseño OPACO y Claro */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-[420px] h-[650px] bg-gray-900 rounded-3xl shadow-2xl shadow-purple-500/40 border-2 border-purple-500/50 flex flex-col overflow-hidden z-50"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header con gradiente premium */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-5 flex items-center justify-between overflow-hidden">
              {/* Efecto de brillo animado en header */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  repeatDelay: 2
                }}
              />

              <div className="flex items-center gap-3 relative z-10">
                {/* Avatar con animación de pulso */}
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255,255,255,0.2)',
                      '0 0 30px rgba(255,255,255,0.4)',
                      '0 0 20px rgba(255,255,255,0.2)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <SparklesSolid className="w-7 h-7 text-white drop-shadow-lg" />
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight drop-shadow-lg">
                    Asistente CreoVision
                  </h3>
                  <p className="text-purple-100/90 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                    Tu guía de contenido viral
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white/90 hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110 active:scale-95 relative z-10"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes con fondo SÓLIDO */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-900">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <SparklesSolid className="w-16 h-16 text-purple-400/50 mb-4" />
                  </motion.div>
                  <h4 className="text-white font-semibold text-lg mb-2">¡Hola! Soy tu asistente</h4>
                  <p className="text-gray-400 text-sm">
                    Estoy aquí para guiarte en tu camino hacia el contenido viral. ¿En qué puedo ayudarte?
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white shadow-purple-500/30'
                        : 'bg-gray-800 text-white border-2 border-purple-500/30'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 flex items-center gap-1.5 ${
                      message.role === 'user' ? 'text-purple-200/70' : 'text-gray-400'
                    }`}>
                      <span className="w-1 h-1 bg-current rounded-full" />
                      {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator premium */}
              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gray-800 rounded-2xl px-6 py-4 border-2 border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <motion.div
                          className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-400/50"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-400/50"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-400/50"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">Pensando...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Botones de respuesta rápida - CONVERSACIONALES */}
            {!isLoading && messages.length > 0 && (
              <div className="px-5 pb-3 bg-gray-900 border-t-2 border-purple-500/30 pt-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-purple-400">Respuestas rápidas:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => {
                      setInputValue("Sí, quiero ver ejemplos");
                      setTimeout(() => handleSendMessage(new Event('submit')), 100);
                    }}
                    className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✨ Ver ejemplos
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setInputValue("Guíame paso a paso");
                      setTimeout(() => handleSendMessage(new Event('submit')), 100);
                    }}
                    className="text-sm bg-pink-600 hover:bg-pink-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎯 Guíame
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setInputValue("Quiero probar ahora");
                      setTimeout(() => handleSendMessage(new Event('submit')), 100);
                    }}
                    className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚀 Probar ahora
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setInputValue("¿Qué puedes hacer?");
                      setTimeout(() => handleSendMessage(new Event('submit')), 100);
                    }}
                    className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💡 ¿Qué haces?
                  </motion.button>
                </div>
              </div>
            )}

            {/* Input de mensaje OPACO */}
            <form onSubmit={handleSendMessage} className="p-5 bg-gray-900 border-t-2 border-purple-500/30">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe tu pregunta aquí..."
                    className="w-full bg-gray-800 text-white placeholder-gray-400 px-5 py-3.5 rounded-2xl border-2 border-purple-500/30 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/30 transition-all duration-200"
                    disabled={isLoading}
                  />
                  {/* Indicador de escritura */}
                  {inputValue && (
                    <motion.div
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <SparklesIcon className="w-5 h-5 text-purple-400 animate-pulse" />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all duration-200 shadow-xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 active:scale-95"
                  whileHover={{ scale: !inputValue.trim() || isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: !inputValue.trim() || isLoading ? 1 : 0.95 }}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </div>
              {/* Hint text */}
              <p className="text-xs text-gray-500 mt-3 text-center">
                Presiona Enter para enviar • Powered by DeepSeek AI
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant;
