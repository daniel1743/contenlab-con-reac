import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal, Loader2, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { CREO_SYSTEM_PROMPT, CREO_USER_GREETING, CREO_CONTEXT_BUILDER } from '@/config/creoPersonality';
import {
  getMemories,
  saveMemory,
  buildMemoryContext,
  extractMemoriesFromConversation
} from '@/services/memoryService';

const CHAT_STORAGE_KEY = 'creovision_creo_chat_history';
const PROFILE_STORAGE_KEY = 'creatorProfile';
const MEMORY_AUTO_SAVE_THRESHOLD = 5; // Guardar memoria cada 5 mensajes

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

const AIConciergeBubble = () => {
  const { user, session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState('');
  const [persistentMemories, setPersistentMemories] = useState([]);
  const [memoryLoaded, setMemoryLoaded] = useState(false);
  const chatContainerRef = useRef(null);
  const sessionIdRef = useRef(`creochat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
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

  useEffect(() => {
    setMessages(loadHistory(storageKey));
  }, [storageKey]);

  const apiBaseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    // Si VITE_API_BASE_URL está definida, úsala; si no, usa URL relativa
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    }
    // Para Vercel, usar URL relativa (vacío)
    return '';
  }, []);

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

  // 🧠 Cargar memorias persistentes al abrir el chat
  useEffect(() => {
    if (isOpen && user && session?.access_token && !memoryLoaded) {
      loadPersistentMemories();
    }
  }, [isOpen, user, session?.access_token, memoryLoaded]);

  // Cargar memorias de la base de datos
  const loadPersistentMemories = async () => {
    try {
      const memories = await getMemories({
        limit: 10,
        authToken: session?.access_token
      });
      setPersistentMemories(memories);
      setMemoryLoaded(true);
      console.log(`[Creo] 🧠 Cargadas ${memories.length} memorias persistentes`);
    } catch (error) {
      console.warn('[Creo] No se pudieron cargar memorias:', error);
      setMemoryLoaded(true); // Marcar como cargado incluso si falla
    }
  };

  // 💾 Auto-guardar memorias importantes cada N mensajes
  useEffect(() => {
    if (!user || !session?.access_token) return;

    const userMessages = messages.filter(m => m.role === 'user');
    messageCountRef.current = userMessages.length;

    // Guardar memoria cada X mensajes del usuario
    if (userMessages.length > 0 && userMessages.length % MEMORY_AUTO_SAVE_THRESHOLD === 0) {
      autoSaveMemories();
    }
  }, [messages, user, session?.access_token]);

  const autoSaveMemories = async () => {
    try {
      const recentMessages = messages.slice(-10); // Últimos 10 mensajes
      const extractedMemories = extractMemoriesFromConversation(recentMessages);

      if (extractedMemories.length === 0) return;

      console.log(`[Creo] 💾 Auto-guardando ${extractedMemories.length} memorias...`);

      for (const memory of extractedMemories) {
        await saveMemory({
          type: memory.type,
          content: memory.content,
          metadata: memory.metadata,
          authToken: session?.access_token
        });
      }

      // Recargar memorias después de guardar
      await loadPersistentMemories();
    } catch (error) {
      console.warn('[Creo] Error al auto-guardar memorias:', error);
    }
  };

  const personaPrompt = useMemo(() => {
    const contextInfo = CREO_CONTEXT_BUILDER(profileData);
    const memoryContext = buildMemoryContext(persistentMemories, 1200);

    return `${CREO_SYSTEM_PROMPT}

📋 INFORMACIÓN DEL USUARIO:
- Nombre preferido: ${displayName}${contextInfo}${memoryContext}

🔧 APIs Y HERRAMIENTAS DISPONIBLES:
Puedes consultar tendencias en tiempo real usando: YouTube Trends, Google Trends, NewsAPI, Twitter/X Trends.
`;
  }, [displayName, profileData, persistentMemories]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const optimisticMessages = [
      ...messages,
      { role: 'user', content: trimmed, timestamp: Date.now() }
    ];
    setMessages(optimisticMessages);
    setInput('');
    setIsThinking(true);
    setError('');

    const authToken = session?.access_token;

    const providersChain = [
      { provider: 'deepseek', model: 'deepseek-chat', label: 'DeepSeek' },
      { provider: 'qwen', model: 'qwen-plus', label: 'Qwen' },
      { provider: 'gemini', model: 'gemini-pro', label: 'Gemini' }
    ];

    let assistantReply = null;
    let interactionId = null;

    try {
      const recentMessages = optimisticMessages.slice(-12).map(({ role, content }) => ({
        role,
        content
      }));

      for (const engine of providersChain) {
        try {
          const response = await fetch(
            apiBaseUrl ? `${apiBaseUrl}/api/ai/chat` : '/api/ai/chat',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(authToken && { Authorization: `Bearer ${authToken}` })
              },
              body: JSON.stringify({
                provider: engine.provider,
                model: engine.model,
                systemPrompt: personaPrompt,
                messages: recentMessages,
                temperature: 0.65,
                maxTokens: 900,
                feature_slug: 'creovision_landing_conversational_chat',
                session_id: sessionIdRef.current,
                capture_interaction: true
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error || response.statusText);
          }

          const data = await response.json();
          const content = data?.content?.trim();

          if (!content) {
            throw new Error('Respuesta vacía del asistente');
          }

          assistantReply = content;
          interactionId = data?.interaction_id || null;
          break;
        } catch (engineError) {
          console.warn(`[Creo Chat] ${engine.label} falló:`, engineError.message);
        }
      }

      if (!assistantReply) {
        throw new Error('Todos los motores externos fallaron');
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: assistantReply,
          timestamp: Date.now(),
          interactionId
        }
      ]);
    } catch (err) {
      console.error('Creo chat error:', err);
      setError('');

      const reassuranceMessage = [
        'Estoy tomando nota de lo que necesitas, aunque mis motores creativos están en mantenimiento.',
        'Mientras retomo conexión con los servidores, aquí van dos ideas accionables que puedo darte offline:',
        '1. Anota exactamente qué quieres lograr hoy y define un micro-paso para avanzar.',
        '2. Revisa tu mejor publicación reciente e identifica qué elemento conectó más; repliquémoslo en la siguiente pieza.',
        'Vuelve a intentarlo en unos segundos y seguiré afinando la estrategia contigo. 💜'
      ].join('\n');

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reassuranceMessage,
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="creo-chat-trigger"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-blue-500 shadow-lg shadow-purple-900/40 focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Abrir chat con Creo"
          >
            <img
              src="/robot.png"
              alt="CreoVision AI"
              className="h-9 w-9 object-contain drop-shadow-md"
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="creo-chat-panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[85] w-auto max-w-full sm:max-w-sm overflow-hidden rounded-3xl border border-purple-500/30 bg-[#0f0a1f]/95 shadow-2xl shadow-purple-900/40 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-purple-500/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-purple-500/10">
                  <img src="/robot.png" alt="Creo" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-emerald-400 shadow shadow-emerald-500/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Creo · Tu coach creativo</p>
                  <p className="text-xs text-purple-200/80">
                    Hola {displayName}, construyamos algo inolvidable
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="text-purple-200/70 hover:bg-purple-500/10 hover:text-purple-50"
                  aria-label="Limpiar conversación"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-purple-200/70 hover:bg-purple-500/10 hover:text-purple-50"
                  aria-label="Cerrar chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex h-[360px] flex-col bg-gradient-to-br from-[#120d28] via-[#160f33] to-[#0b081a]">
              <div
                ref={chatContainerRef}
                className="flex-1 space-y-3 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-purple-700/40"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={`${msg.timestamp}-${idx}`}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg shadow-black/20 ${
                        msg.role === 'user'
                          ? 'max-w-[80%] bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white'
                          : 'max-w-[85%] bg-white/5 text-slate-100 backdrop-blur'
                      }`}
                    >
                      {msg.content.split('\n').map((line, lineIdx) => (
                        <p key={lineIdx} className="whitespace-pre-wrap">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-center gap-2 text-xs text-purple-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creo está pensando...
                  </div>
                )}
                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    {error}
                  </div>
                )}
              </div>

              <div className="border-t border-purple-500/20 bg-[#0f0a1f]/80 px-5 py-4">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escríbeme qué idea quieres trabajar, qué reto tienes o qué te gustaría lograr..."
                    className="min-h-[60px] flex-1 resize-none rounded-2xl border-purple-500/20 bg-white/5 text-sm text-slate-100 placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-blue-500 p-0 text-white hover:opacity-90 disabled:opacity-50"
                    aria-label="Enviar mensaje a Creo"
                  >
                    {isThinking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-[10px] text-purple-200/50">
                  Creo memoriza esta conversación localmente para continuar donde lo dejaste. Puedes reiniciar el chat cuando quieras.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIConciergeBubble;

