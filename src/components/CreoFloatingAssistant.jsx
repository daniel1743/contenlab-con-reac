/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🤖 CREO FLOATING ASSISTANT - Coach Conversacional Mejorado     ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Asistente flotante con control de mensajes, créditos y         ║
 * ║  redirección inteligente según la ficha técnica del Coach        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @version 2.0.0
 * @author CreoVision Team
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowRightIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid';
import creoChatService, { CREO_CONFIG } from '@/services/CreoChatService';
import { useAuth } from '@/context/AuthContext';

const CreoFloatingAssistant = ({ userContext = {} }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del componente
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Inicializar sesión cuando se abre el chat
   */
  useEffect(() => {
    if (isOpen && user && !sessionStats) {
      initializeSession();
    }
  }, [isOpen, user]);

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
   * Inicializar sesión de chat
   */
  const initializeSession = async () => {
    try {
      await creoChatService.initSession(user.id);
      const stats = creoChatService.getSessionStats();
      setSessionStats(stats);

      // Mensaje de bienvenida
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: `¡Hola ${user.displayName || 'Creador'}! 👋 ¿Qué tipo de contenido querés crear hoy?`,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
      setHasNewMessage(true);

    } catch (error) {
      console.error('❌ Error inicializando sesión:', error);
    }
  };

  /**
   * Abrir/cerrar el chat
   */
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);

    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  /**
   * Enviar mensaje del usuario
   */
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading || !user) return;

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
      // Enviar a Creo Chat Service
      const response = await creoChatService.sendMessage(user.id, userMessage, {
        userContext
      });

      // Actualizar stats
      const stats = creoChatService.getSessionStats();
      setSessionStats(stats);

      // Verificar si alcanzó el límite
      if (response.isLimitReached) {
        handleLimitReached(response);
        return;
      }

      // Agregar respuesta del asistente
      const newAssistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        stage: response.stage
      };

      setMessages(prev => [...prev, newAssistantMessage]);

      // Verificar si debe mostrar advertencia
      if (response.freeMessagesRemaining <= 2 && response.freeMessagesRemaining > 0) {
        showWarningMessage(response.freeMessagesRemaining);
      }

      // Verificar si debe redirigir
      if (response.shouldRedirect && response.redirectUrl) {
        setTimeout(() => {
          showRedirectPrompt(response.redirectUrl);
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Disculpa, tuve un problema procesando tu mensaje. Por favor intenta de nuevo.',
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manejar cuando se alcanza el límite
   */
  const handleLimitReached = (response) => {
    setIsLoading(false);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        isLimit: true,
        canExtend: response.canExtend,
        redirectUrl: response.redirectUrl
      }
    ]);

    if (response.canExtend) {
      setShowExtendModal(true);
    }
  };

  /**
   * Mostrar mensaje de advertencia
   */
  const showWarningMessage = (remaining) => {
    const warningText = remaining === 2
      ? "Te quedan 2 mensajes gratis. Luego podés extender por 2 créditos o usar el generador de guiones."
      : "Último mensaje gratis. ¿Querés que sigamos en el generador de guiones?";

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 2,
        role: 'system',
        content: warningText,
        timestamp: new Date(),
        isWarning: true
      }
    ]);
  };

  /**
   * Mostrar prompt de redirección
   */
  const showRedirectPrompt = (url) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 3,
        role: 'system',
        content: "Para seguir desarrollando tus ideas, te invito a usar 'Genera tu Guion'.",
        timestamp: new Date(),
        isRedirect: true,
        redirectUrl: url
      }
    ]);
  };

  /**
   * Extender sesión con créditos
   */
  const handleExtendSession = async () => {
    try {
      setIsLoading(true);
      const result = await creoChatService.extendSession(user.id);

      if (result.success) {
        setShowExtendModal(false);

        // Actualizar stats
        const stats = creoChatService.getSessionStats();
        setSessionStats(stats);

        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            content: result.message,
            timestamp: new Date()
          }
        ]);
      } else {
        alert(result.message);
      }

    } catch (error) {
      console.error('❌ Error extendiendo sesión:', error);
      alert('No se pudo extender la sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Redirigir al generador
   */
  const handleRedirect = (url) => {
    navigate(url);
    setIsOpen(false);
  };

  /**
   * Cerrar sesión manualmente
   */
  const handleCloseSession = () => {
    creoChatService.closeSession('completed');
    setMessages([]);
    setSessionStats(null);
    setIsOpen(false);
  };

  if (!user) return null;

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

          {isOpen ? (
            <XMarkIcon className="w-8 h-8 text-white relative z-10" />
          ) : (
            <SparklesSolid className="w-8 h-8 text-white relative z-10 animate-pulse" />
          )}

          {hasNewMessage && !isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              !
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-[420px] h-[650px] bg-gray-900 rounded-3xl shadow-2xl shadow-purple-500/40 border-2 border-purple-500/50 flex flex-col overflow-hidden z-50"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 p-5 flex items-center justify-between overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />

              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255,255,255,0.2)',
                      '0 0 30px rgba(255,255,255,0.4)',
                      '0 0 20px rgba(255,255,255,0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <SparklesSolid className="w-7 h-7 text-white drop-shadow-lg" />
                </motion.div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight drop-shadow-lg">
                    Coach Creo
                  </h3>
                  <p className="text-purple-100/90 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                    Tu guía creativa
                  </p>
                </div>
              </div>

              {/* Contador de mensajes */}
              {sessionStats && (
                <div className="flex flex-col items-end relative z-10">
                  <div className="text-white/90 text-xs font-semibold">
                    {sessionStats.freeMessagesRemaining}/8 gratis
                  </div>
                  <div className="w-16 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-yellow-400"
                      initial={{ width: '100%' }}
                      animate={{
                        width: `${(sessionStats.freeMessagesRemaining / CREO_CONFIG.FREE_MESSAGES_LIMIT) * 100}%`
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={toggleChat}
                className="text-white/90 hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110 active:scale-95 relative z-10"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
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
                  <h4 className="text-white font-semibold text-lg mb-2">¡Hola! Soy Creo</h4>
                  <p className="text-gray-400 text-sm">
                    Tu coach creativo. ¿En qué quieres trabajar hoy?
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
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white shadow-purple-500/30'
                      : message.isWarning
                      ? 'bg-yellow-600 text-white shadow-yellow-500/30'
                      : message.isError
                      ? 'bg-red-600 text-white shadow-red-500/30'
                      : 'bg-gray-800 text-white border-2 border-purple-500/30'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {/* Botón de redirección si es necesario */}
                    {message.isRedirect && message.redirectUrl && (
                      <button
                        onClick={() => handleRedirect(message.redirectUrl)}
                        className="mt-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
                      >
                        <SparklesIcon className="w-5 h-5" />
                        Abrir Genera tu Guion
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Botón de extender si alcanzó el límite */}
                    {message.isLimit && message.canExtend && (
                      <button
                        onClick={() => setShowExtendModal(true)}
                        className="mt-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <CreditCardIcon className="w-5 h-5" />
                        Extender Sesión (2 créditos)
                      </button>
                    )}

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

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gray-800 rounded-2xl px-6 py-4 border-2 border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-400/50"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 0.8, repeat: Infinity, delay }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">Pensando...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
              <p className="text-xs text-gray-500 mt-3 text-center">
                Presiona Enter para enviar • Powered by CreoVision IA
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Extender Sesión */}
      <AnimatePresence>
        {showExtendModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExtendModal(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-4 border-2 border-purple-500/50 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CreditCardIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">
                  Extender Sesión
                </h3>
                <p className="text-gray-400 mb-6">
                  Podés continuar la conversación por 2 créditos. Obtendrás 2 mensajes adicionales.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExtendModal(false)}
                    className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExtendSession}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Procesando...' : 'Extender'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreoFloatingAssistant;
