import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal, Loader2, X, MessageSquare, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { CREO_SYSTEM_PROMPT, CREO_USER_GREETING } from '@/config/creoPersonality';
import { withCache, getCacheStats } from '@/services/aiCacheService';
import { QuickFeedback } from '@/components/FeedbackWidget';

const CHAT_STORAGE_KEY = 'creovision_creo_chat_history';
const PROFILE_STORAGE_KEY = 'creatorProfile';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
// Usar Gemini 2.0 Flash Experimental (gratis, rápido, 1M tokens input)
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const loadStoredProfile = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to load creator profile', error);
    return null;
  }
};

const loadHistory = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load Creo chat history', error);
    return [];
  }
};

const AIConciergeBubbleV2 = () => {
  const { user, session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionCost, setExtensionCost] = useState(2);
  const [showResetButton, setShowResetButton] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [cacheStats, setCacheStats] = useState(null);
  const chatContainerRef = useRef(null);
  const messageCountRef = useRef(0);

  const profileData = useMemo(() => loadStoredProfile(), []);

  const displayName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name?.trim();
    if (fullName) return fullName.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'creador';
  }, [user]);

  const storageKey = useMemo(() => {
    const suffix = user?.id ? `_${user.id}` : '';
    return `${CHAT_STORAGE_KEY}${suffix}`;
  }, [user?.id]);

  const [messages, setMessages] = useState(() => loadHistory(storageKey));

  // Inicializar sesión de Supabase
  useEffect(() => {
    const initSession = async () => {
      if (!user?.id) {
        console.log('⏳ Esperando autenticación de usuario...');
        setSessionLoading(false);
        return;
      }

      try {
        setSessionLoading(true);
        console.log('🔄 Inicializando sesión para usuario:', user.id);

        // Buscar sesión activa existente
        const { data: existingSession, error: sessionError } = await supabase
          .from('creo_chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionError) {
          console.error('❌ Error buscando sesión:', sessionError);
          throw sessionError;
        }

        if (existingSession) {
          console.log('✅ Sesión activa recuperada:', existingSession.id);
          setCurrentSession(existingSession);
          updateSessionStats(existingSession);
        } else {
          console.log('🆕 Creando nueva sesión...');
          // Crear nueva sesión
          const { data: newSession, error: createError } = await supabase
            .from('creo_chat_sessions')
            .insert({
              user_id: user.id,
              message_count: 0,
              free_messages_used: 0,
              paid_messages_used: 0,
              paid_messages_available: 0,
              conversation_stage: 'intro',
              status: 'active'
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creando sesión:', createError);
            throw createError;
          }

          console.log('✅ Nueva sesión creada:', newSession.id);
          setCurrentSession(newSession);
          updateSessionStats(newSession);
        }

        setSessionLoading(false);
      } catch (error) {
        console.error('❌ Error inicializando sesión:', error);
        setError('Error al inicializar sesión. Por favor recarga la página.');
        setSessionLoading(false);
      }
    };

    initSession();
  }, [user?.id]);

  const updateSessionStats = (session) => {
    const stats = {
      freeMessagesUsed: session.free_messages_used || 0,
      paidMessagesUsed: session.paid_messages_used || 0,
      freeMessagesRemaining: Math.max(0, 8 - (session.free_messages_used || 0)),
      messageCount: session.message_count || 0,
      stage: session.conversation_stage || 'intro',
      creditsSpent: session.credits_spent || 0
    };
    setSessionStats(stats);

    // Calcular costo progresivo: 2, 3, 4, 5... créditos
    const extensionsCount = Math.floor((session.paid_messages_used || 0) / 2);
    setExtensionCost(2 + extensionsCount);
  };

  useEffect(() => {
    setMessages(loadHistory(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(messages.slice(-30)));
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (!messages.length) {
      const warmIntro = CREO_USER_GREETING(displayName);
      setMessages([{ role: 'assistant', content: warmIntro, timestamp: Date.now() }]);
    }
  }, [messages.length, displayName]);

  useEffect(() => {
    setShowResetButton(messages.length > 1);
  }, [messages.length]);

  // Cargar estadísticas del caché cuando se abre el chat
  useEffect(() => {
    if (isOpen && user?.id) {
      getCacheStats().then(stats => {
        if (stats) {
          setCacheStats(stats);
          console.log('📊 Estadísticas de caché AI:', stats);
        }
      });
    }
  }, [isOpen, user?.id]);

  const personaPrompt = useMemo(() => {
    let contextInfo = '';
    if (profileData) {
      const { niche, platform, goals, experience } = profileData;
      if (niche) contextInfo += `\n- Nicho: ${niche}`;
      if (platform) contextInfo += `\n- Plataforma principal: ${platform}`;
      if (goals) contextInfo += `\n- Objetivos: ${goals}`;
      if (experience) contextInfo += `\n- Experiencia: ${experience}`;
    }

    const messagesUsed = sessionStats?.freeMessagesUsed || 0;
    const messagesLeft = 8 - messagesUsed;

    return `${CREO_SYSTEM_PROMPT}

📋 INFORMACIÓN DEL USUARIO:
- Nombre: ${displayName}${contextInfo}
- Mensajes usados: ${messagesUsed}/8 gratis
- Mensajes restantes: ${messagesLeft}

🎯 TU MISIÓN COMO COACH CREO:
1. Tienes SOLO 8 mensajes para lograr tu objetivo
2. OBJETIVO: Llevar al usuario a usar las HERRAMIENTAS de CreoVision
3. Ser ultra amigable, cercano y motivador
4. Explorar rápido (máximo 2-3 mensajes) qué quiere crear
5. DESPUÉS DEL MENSAJE 3-4: SIEMPRE llevar al CTA de herramientas

🛠️ HERRAMIENTAS DISPONIBLES EN CREOVISION:
- "Genera tu Guion" 🎬 (crear guiones virales)
- "Analiza tu Canal" 📊 (métricas y tendencias)
- "Biblioteca de Contenido" 📚 (guardar y organizar)
- "Calendario Editorial" 📅 (planificar publicaciones)

📝 REGLAS ESTRICTAS:
- Máximo 35 palabras por respuesta
- NO usar markdown (**negritas**, *cursivas*, etc)
- Usar 1-2 emojis relevantes
- Ser directo, entusiasta y persuasivo
- Si el usuario es FREE y está cerca del límite (mensaje 6-8), sugerir: "Podés extender con 2 créditos por 2 mensajes más 🚀"

🎯 ESTRATEGIA POR MENSAJE:
- Mensaje 1-2: Saludo + explorar tema
- Mensaje 3-4: Entender detalles + LLEVAR AL CTA
- Mensaje 5-6: Insistir en herramienta específica
- Mensaje 7-8: Urgencia + beneficio claro + CTA final

IMPORTANTE: Tu trabajo NO es dar asesoramiento largo, sino LLEVAR AL USUARIO A USAR LAS HERRAMIENTAS. Sé breve, directo y persuasivo.
`;
  }, [displayName, profileData, sessionStats]);

  const handleResetConversation = async () => {
    try {
      const warmIntro = CREO_USER_GREETING(displayName);
      setMessages([{ role: 'assistant', content: warmIntro, timestamp: Date.now() }]);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
      }

      if (currentSession?.id) {
        await supabase
          .from('creo_chat_sessions')
          .update({
            message_count: 0,
            free_messages_used: 0,
            paid_messages_used: 0,
            conversation_stage: 'intro'
          })
          .eq('id', currentSession.id);

        setSessionStats((prev) =>
          prev
            ? {
                ...prev,
                freeMessagesUsed: 0,
                messageCount: 0,
                freeMessagesRemaining: 8
              }
            : prev
        );
      }
    } catch (error) {
      console.error('Error reseteando conversación:', error);
    }
  };

  const callDeepSeekAPI = async (conversationHistory) => {
    try {
      console.log('🧠 Generando respuesta con CreoVision IA...');

      if (!DEEPSEEK_API_KEY) {
        throw new Error('CreoVision IA no configurada');
      }

      // Construir mensajes para IA (formato OpenAI)
      const messages = [
        { role: 'system', content: personaPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.85,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `CreoVision IA error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('Respuesta vacía de CreoVision IA');
      }

      console.log('✅ Respuesta generada:', content.substring(0, 100) + '...');
      return content;
    } catch (error) {
      console.error('❌ Error en CreoVision IA:', error);
      throw error;
    }
  };

  const callGeminiAPI = async (conversationHistory) => {
    try {
      console.log('🤖 Llamando a Gemini API...');

      // Verificar que tenemos API key
      if (!GEMINI_API_KEY) {
        console.warn('⚠️ GEMINI_API_KEY no está configurada, usando motor alternativo');
        return await callDeepSeekAPI(conversationHistory);
      }

      const contents = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Agregar el system prompt como primer mensaje del user
      contents.unshift({
        role: 'user',
        parts: [{ text: personaPrompt }]
      });
      contents.splice(1, 0, {
        role: 'model',
        parts: [{ text: '¡Entendido! Seré tu Coach Creo amigable y motivador. 🚀' }]
      });

      console.log('📤 Enviando request a Gemini con', contents.length, 'mensajes');

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.85,
            maxOutputTokens: 150,
            topP: 0.95,
            topK: 40
          }
        })
      });

      console.log('📥 Respuesta de Gemini:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error de Gemini API:', errorData);
        console.log('🔄 Intentando con motor alternativo...');
        return await callDeepSeekAPI(conversationHistory);
      }

      const data = await response.json();
      console.log('📦 Respuesta recibida de IA');

      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!content) {
        console.error('❌ Respuesta vacía');
        console.log('🔄 Intentando con motor alternativo...');
        return await callDeepSeekAPI(conversationHistory);
      }

      console.log('✅ Respuesta generada exitosamente');
      return content;
    } catch (error) {
      console.error('❌ Error en IA principal:', error);
      console.log('🔄 Intentando con motor alternativo...');
      return await callDeepSeekAPI(conversationHistory);
    }
  };

  const handleExtendSession = async () => {
    if (!currentSession || !user?.id) {
      setError('No se pudo identificar la sesión o usuario.');
      return;
    }

    try {
      setIsThinking(true);
      setShowExtensionModal(false);
      setError('');

      // TODO: Aquí deberías verificar/descontar créditos del usuario
      // Por ahora solo actualizamos la sesión
      console.log(`💳 Extendiendo sesión por ${extensionCost} créditos`);

      // Validar que el usuario tenga créditos suficientes (implementar cuando tengas sistema de créditos)
      // if (userCredits < extensionCost) {
      //   throw new Error('Créditos insuficientes');
      // }

      // Calcular nuevos límites
      const currentPaidUsed = currentSession.paid_messages_used || 0;
      const currentPaidAvailable = currentSession.paid_messages_available || 0;
      const newPaidAvailable = currentPaidAvailable + 2; // Agregar 2 mensajes más
      const newCreditsSpent = (currentSession.credits_spent || 0) + extensionCost;

      const { data: updatedSession, error } = await supabase
        .from('creo_chat_sessions')
        .update({
          paid_messages_available: newPaidAvailable,
          credits_spent: newCreditsSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id)
        .select()
        .single();

      if (error) {
        console.error('Error en Supabase:', error);
        throw new Error('Error al actualizar la sesión en la base de datos');
      }

      console.log('✅ Sesión extendida exitosamente:', {
        session_id: updatedSession.id,
        paid_messages_available: newPaidAvailable,
        paid_messages_used: currentPaidUsed,
        messages_remaining: newPaidAvailable - currentPaidUsed,
        credits_spent: newCreditsSpent
      });

      setCurrentSession(updatedSession);
      updateSessionStats(updatedSession);

      // Agregar mensaje del sistema confirmando la extensión
      const systemMessage = {
        role: 'assistant',
        content: `¡Genial, ${displayName}! 🎉 Extendiste la sesión por 2 mensajes más. Sigamos creando contenido increíble juntos.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, systemMessage]);

      setIsThinking(false);
    } catch (error) {
      console.error('❌ Error extendiendo sesión:', error);
      setError(`Error: ${error.message || 'No se pudo extender la sesión'}. Intentá de nuevo.`);
      setIsThinking(false);
      setShowExtensionModal(true); // Volver a mostrar el modal si hubo error
    }
  };

  const saveMessageToSupabase = async (role, content, isFree = true) => {
    if (!currentSession) return;

    try {
      const messageNumber = (currentSession.message_count || 0) + 1;

      // Guardar el mensaje en el log
      await supabase.from('creo_message_log').insert({
        session_id: currentSession.id,
        role,
        content,
        message_number: messageNumber,
        is_free: isFree,
        ai_provider: role === 'assistant' ? 'gemini' : null,
        created_at: new Date().toISOString()
      });

      // Actualizar contadores en la sesión solo para mensajes del usuario
      if (role === 'user') {
        const freeUsed = currentSession.free_messages_used || 0;
        const paidUsed = currentSession.paid_messages_used || 0;

        // Determinar si este mensaje es gratuito o pago
        const isUsingFreeMessage = freeUsed < 8;

        const updateData = {
          message_count: messageNumber,
          updated_at: new Date().toISOString()
        };

        if (isUsingFreeMessage) {
          // Incrementar mensajes gratis usados
          updateData.free_messages_used = freeUsed + 1;
        } else {
          // Incrementar mensajes pagos usados
          updateData.paid_messages_used = paidUsed + 1;
        }

        const { data: updatedSession, error } = await supabase
          .from('creo_chat_sessions')
          .update(updateData)
          .eq('id', currentSession.id)
          .select()
          .single();

        if (error) {
          console.error('Error actualizando sesión:', error);
        } else if (updatedSession) {
          console.log('📊 Sesión actualizada:', {
            message_count: updatedSession.message_count,
            free_messages_used: updatedSession.free_messages_used,
            paid_messages_used: updatedSession.paid_messages_used,
            paid_messages_available: updatedSession.paid_messages_available
          });
          setCurrentSession(updatedSession);
          updateSessionStats(updatedSession);
        }
      }
    } catch (error) {
      console.error('❌ Error guardando mensaje:', error);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    // Validar que hay sesión
    if (!currentSession) {
      if (!user?.id) {
        setError('Debes iniciar sesión para usar el Coach Creo.');
      } else if (sessionLoading) {
        setError('Cargando sesión, espera un momento...');
      } else {
        setError('Error al cargar la sesión. Por favor recarga la página.');
      }
      return;
    }

    // ✅ LÓGICA SIMPLE: Mensajes disponibles vs usados
    const freeUsed = currentSession.free_messages_used || 0;
    const paidUsed = currentSession.paid_messages_used || 0;
    const paidAvailable = currentSession.paid_messages_available || 0;

    const freeLimit = 8;
    const totalAvailable = freeLimit + paidAvailable;
    const totalUsed = freeUsed + paidUsed;

    console.log('🔍 DEBUG Límites:', {
      freeUsed,
      freeLimit,
      paidUsed,
      paidAvailable,
      totalUsed,
      totalAvailable,
      creditsSpent: currentSession.credits_spent || 0,
      shouldBlock: totalUsed >= totalAvailable
    });

    // Bloquear si ya usó todos los mensajes disponibles
    if (totalUsed >= totalAvailable) {
      console.log('🚫 Todos los mensajes usados, mostrando modal');
      setShowExtensionModal(true);
      return;
    }

    const optimisticMessages = [
      ...messages,
      { role: 'user', content: trimmed, timestamp: Date.now() }
    ];
    setMessages(optimisticMessages);
    setInput('');
    setIsThinking(true);
    setError('');

    // Guardar mensaje del usuario
    await saveMessageToSupabase('user', trimmed, true);

    try {
      const recentMessages = optimisticMessages.slice(-8).map(({ role, content }) => ({
        role,
        content
      }));

      // Crear un string único del historial de conversación para caché
      const conversationText = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');

      // Usar caché automático
      const assistantReply = await withCache(
        () => callGeminiAPI(recentMessages),
        conversationText,
        personaPrompt,
        'gemini'
      );

      const finalMessages = [
        ...optimisticMessages,
        { role: 'assistant', content: assistantReply, timestamp: Date.now() }
      ];

      setMessages(finalMessages);
      messageCountRef.current += 1;

      // Guardar respuesta del asistente
      await saveMessageToSupabase('assistant', assistantReply, true);

    } catch (err) {
      console.error('[Creo Chat] Error:', err);
      setError('⚠️ No pude responder. Intentá de nuevo.');

      const fallbackReply = '¡Ups! 😅 Tuve un problemita técnico. ¿Podés repetir lo que me dijiste?';
      setMessages([
        ...optimisticMessages,
        { role: 'assistant', content: fallbackReply, timestamp: Date.now() }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-50 overflow-hidden group md:bottom-8 md:right-10"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease infinite'
            }}
          >
            <img
              src="/robot.png"
              alt="Coach Creo"
              className="w-10 h-10 relative z-10 rounded-full object-cover"
            />
            <motion.div
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 sm:bottom-24 sm:left-auto sm:right-6 w-auto sm:w-[420px] max-w-full h-[70vh] sm:h-[650px] max-h-[calc(100vh-120px)] bg-gray-900 rounded-3xl shadow-2xl shadow-purple-500/40 border-2 border-purple-500/50 flex flex-col overflow-hidden z-50"
            style={{
              left: '1rem',
              right: '1rem'
            }}
          >
            {/* Header con animación gradient */}
            <div className="relative p-6 overflow-hidden">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  backgroundSize: '200% 200%'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src="/robot.png" alt="Creo" className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
                    <span
                      className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full bg-green-400 border-2 border-purple-700 animate-pulse"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Coach Creo</h3>
                    <p className="text-white/80 text-xs flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                      En línea ahora
                    </p>
                  </div>
                </div>

                {sessionStats && (
                  <div className="flex flex-col items-end relative z-10 gap-1">
                    <div className="text-white/90 text-xs font-semibold">
                      {sessionStats.freeMessagesUsed}/8 gratis
                    </div>
                    <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-yellow-400"
                        initial={{ width: '100%' }}
                        animate={{
                          width: `${((8 - sessionStats.freeMessagesUsed) / 8) * 100}%`
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    {currentSession?.paid_messages_available > 0 && (
                      <div className="text-yellow-300 text-xs font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{currentSession.paid_messages_available - (currentSession.paid_messages_used || 0)} pagos
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {showResetButton && (
                    <button
                      onClick={handleResetConversation}
                      className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Reiniciar conversación"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors relative z-10"
                    aria-label="Cerrar Coach Creo"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/50"
            >
              {sessionLoading && user?.id ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Cargando sesión...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    // Obtener el mensaje anterior del usuario para el feedback
                    const previousUserMsg = msg.role === 'assistant' && idx > 0
                      ? messages[idx - 1]
                      : null;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Agregar QuickFeedback solo para mensajes del asistente */}
                        {msg.role === 'assistant' && previousUserMsg && (
                          <div className="ml-2">
                            <QuickFeedback
                              prompt={previousUserMsg.content}
                              response={msg.content}
                              provider="gemini"
                              model={GEMINI_MODEL}
                              featureSlug="coach_creo"
                              onFeedbackSaved={(feedbackType) => {
                                console.log('✅ Feedback guardado:', feedbackType);
                              }}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Creo está pensando...</span>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <div className="text-center text-red-400 text-sm py-2 bg-red-900/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-gray-900 border-t border-purple-500/30">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribí tu mensaje..."
                  className="flex-1 min-h-[50px] max-h-[100px] bg-gray-800 border-purple-500/30 text-white placeholder:text-gray-500 resize-none"
                  disabled={isThinking}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="h-[50px] px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <SendHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de extensión */}
      <AnimatePresence>
        {showExtensionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] px-4"
            onClick={() => setShowExtensionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/50 shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white">
                  ¡Oye, {displayName}! 👋
                </h3>

                <p className="text-gray-300 text-base leading-relaxed">
                  Hoy el límite eran <span className="text-purple-400 font-semibold">8 mensajes gratis</span>.
                  {' '}Podés volver <span className="text-green-400 font-semibold">mañana</span> para una nueva conversación,
                  o extender ahora mismo por <span className="text-yellow-400 font-semibold">{extensionCost} créditos</span>
                  {' '}y seguimos hablando con <span className="text-pink-400 font-semibold">2 mensajes más</span>. 🚀
                </p>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={handleExtendSession}
                    disabled={isThinking}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isThinking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        ✨ Continuar por {extensionCost} créditos
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => setShowExtensionModal(false)}
                    className="w-full h-10 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Vuelvo mañana
                  </button>
                </div>

                <p className="text-xs text-gray-500 pt-2">
                  💡 Cada extensión suma créditos: 2, 3, 4, 5... progresivamente
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
};

export default AIConciergeBubbleV2;
