import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, Smile, MoreVertical, Check, CheckCheck, Bot, User, Star, Sparkles, TrendingUp, Zap, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker from 'emoji-picker-react';

// ==========================================================================
// --- CHAT PREMIUM: Interfaz Profesional para Creadores de Contenido ---
// ==========================================================================

// --- Componente Avatar Mejorado con Glow Effect ---
const Avatar = ({ user, size = 'md', showGlow = false }) => {
  if (!user) return <div className="w-10 h-10 rounded-full bg-gray-700/30 backdrop-blur-sm" />;
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };

  return (
    <div className="relative flex-shrink-0">
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-60 animate-pulse" />
      )}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center font-bold text-white overflow-hidden relative shadow-lg`}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="relative z-10">{(user?.name?.charAt(0) || '?').toUpperCase()}</span>
        )}
      </div>
      {user.presence === 'online' && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-gray-900 shadow-sm" />
      )}
    </div>
  );
};

// --- Indicador de Escritura (Typing Indicator) ---
const TypingIndicator = ({ userName }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center gap-3 my-4"
  >
    <Avatar user={{ name: userName }} size="sm" />
    <div className="bg-gray-800/60 backdrop-blur-sm px-5 py-3 rounded-2xl flex items-center gap-1.5 border border-purple-500/20">
      <motion.div
        className="w-2 h-2 bg-purple-400 rounded-full"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-purple-400 rounded-full"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-purple-400 rounded-full"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
      />
    </div>
  </motion.div>
);

// --- Componente Lista de Chats (Panel Izquierdo) ---
const ChatList = ({ conversations, activeConversationId, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p.id !== 'current-user');
    return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-80 bg-gray-900 h-full flex flex-col border-r border-purple-500/20">
      <div className="p-5 border-b border-purple-500/20 flex-shrink-0">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Conversaciones
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 backdrop-blur-sm border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200 text-sm placeholder-gray-500 transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {filteredConversations.map(conv => {
            const otherUser = conv.participants.find(p => p.id !== 'current-user');
            const isActive = conv.id === activeConversationId;
            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => onSelect(conv.id)}
                className={`p-4 flex items-center gap-3 cursor-pointer border-l-4 transition-all ${
                  isActive
                    ? 'bg-purple-500/20 border-purple-500 backdrop-blur-sm'
                    : 'border-transparent hover:bg-gray-800/60 hover:backdrop-blur-sm'
                }`}
              >
                <Avatar user={otherUser} showGlow={isActive} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-semibold truncate ${isActive ? 'text-purple-300' : 'text-gray-300'}`}>
                      {otherUser?.name}
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {new Date(conv.lastMessage.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage.text}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  >
                    {conv.unreadCount}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Componente de Mensaje Individual con Markdown y Acciones ---
const MessageBubble = ({ message, sender, isOwn, onCopy, onReact }) => {
  const [showActions, setShowActions] = useState(false);
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex items-start gap-3 my-6 group ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && <Avatar user={sender} size="sm" />}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-2xl`}>
        {!isOwn && (
          <span className="text-xs font-semibold text-gray-400 mb-1 ml-1">{sender?.name}</span>
        )}

        <div className="relative">
          <div
            className={`px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg transition-all ${
              isOwn
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                : 'bg-gray-800/80 text-gray-100 border border-purple-500/20'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>

            {message.type === 'ai' && (
              <div className="mt-2 pt-2 border-t border-purple-400/20 flex items-center gap-2 text-xs text-purple-300">
                <Sparkles className="w-3 h-3" />
                <span>Generado por IA</span>
              </div>
            )}
          </div>

          {/* Acciones del mensaje */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-0 flex items-center gap-1 ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}`}
              >
                <button
                  onClick={() => onCopy(message.text)}
                  className="p-1.5 bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors border border-purple-500/20"
                  title="Copiar"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-300" />
                </button>
                <button
                  onClick={() => onReact(message.id, 'like')}
                  className="p-1.5 bg-gray-800/90 backdrop-blur-sm rounded-lg hover:bg-gray-700 transition-colors border border-purple-500/20"
                  title="Me gusta"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-gray-300" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-xs text-gray-500 mt-1 ml-1">{formattedTime}</span>
      </div>

      {isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">

        </div>
      )}
    </motion.div>
  );
};

// --- Componente Mensajes (Panel Central) ---
const MessageFeed = ({ messages, users, isTyping }) => {
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReact = (messageId, reaction) => {
    console.log('React to message:', messageId, reaction);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 custom-scrollbar">
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-200 mb-3">
            Comienza una conversación
          </h3>
          <p className="text-gray-400 max-w-md">
            Usa el asistente IA para generar contenido viral, títulos optimizados y mucho más.
          </p>
        </motion.div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              sender={users[msg.senderId]}
              isOwn={msg.senderId === 'current-user'}
              onCopy={handleCopy}
              onReact={handleReact}
            />
          ))}

          {isTyping && <TypingIndicator userName="Asistente IA" />}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

// --- Sugerencias Inteligentes del Asistente ---
const AISuggestion = ({ icon: Icon, title, description, gradient, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full p-4 rounded-xl bg-gradient-to-br ${gradient} border border-purple-500/30 text-left transition-all hover:shadow-lg hover:shadow-purple-500/20`}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
        <p className="text-xs text-white/70 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.button>
);

// --- Componente Panel de Escritura y Asistencia (Panel Derecho) ---
const WriteAndAssistPanel = ({ onSendMessage, onAIAssist }) => {
  const [message, setMessage] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setShowPicker(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const aiSuggestions = [
    {
      icon: Sparkles,
      title: 'Generar Título Viral',
      description: 'Crea títulos optimizados con alto CTR para YouTube',
      gradient: 'from-purple-600 to-pink-600',
      prompt: 'Genera 5 títulos virales para YouTube sobre [tema]. Usa técnicas de copywriting y SEO.'
    },
    {
      icon: TrendingUp,
      title: 'Analizar Tendencias',
      description: 'Descubre qué está funcionando en tu nicho',
      gradient: 'from-blue-600 to-cyan-600',
      prompt: 'Analiza las tendencias actuales en [nicho] y sugiere 3 ideas de contenido viral.'
    },
    {
      icon: Zap,
      title: 'Mejorar Texto',
      description: 'Optimiza el tono y engagement de tu mensaje',
      gradient: 'from-orange-600 to-red-600',
      prompt: 'Mejora este texto para hacerlo más atractivo y profesional: [tu texto]'
    },
    {
      icon: Bot,
      title: 'Script de Video',
      description: 'Genera guiones completos para tus videos',
      gradient: 'from-green-600 to-emerald-600',
      prompt: 'Crea un script de video de 5 minutos sobre [tema] con hook, desarrollo y CTA.'
    }
  ];

  const handleAISuggestion = (prompt) => {
    setMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="w-96 bg-gray-900 h-full flex flex-col border-l border-purple-500/20">
      {/* Header */}
      <div className="p-5 border-b border-purple-500/20 flex-shrink-0">
        <h3 className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Asistente IA Premium
        </h3>
      </div>

      {/* Sugerencias IA */}
      <div className="p-4 overflow-y-auto custom-scrollbar flex-shrink-0" style={{ maxHeight: '50%' }}>
        <div className="space-y-3">
          {aiSuggestions.map((suggestion, index) => (
            <AISuggestion
              key={index}
              {...suggestion}
              onClick={() => handleAISuggestion(suggestion.prompt)}
            />
          ))}
        </div>
      </div>

      {/* Área de escritura */}
      <div className="p-4 relative flex-1 flex flex-col border-t border-purple-500/20">
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-300 mb-2 block">Escribe tu mensaje</label>
        </div>

        {showPicker && (
          <div className="absolute bottom-full right-4 mb-2 z-10">
            <EmojiPicker onEmojiClick={(e) => setMessage(prev => prev + e.emoji)} theme="dark" />
          </div>
        )}

        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe aquí o usa una sugerencia de IA arriba..."
          className="w-full p-4 bg-gray-800/60 backdrop-blur-sm border border-purple-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm text-gray-200 placeholder-gray-500 transition-all"
          minRows={6}
        />

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPicker(p => !p)}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800/60 rounded-lg transition-colors"
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800/60 rounded-lg transition-colors"
              title="Adjuntar archivo"
            >
              <Paperclip className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
          >
            <span>Enviar</span>
            <Send className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Contador de caracteres */}
        <div className="mt-3 text-xs text-gray-500 text-right">
          {message.length} caracteres
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal del Chat ---
const Chat = () => {
  // Datos de prueba mejorados (Mock Data)
  const mockUsers = {
    'current-user': { id: 'current-user', name: 'Tú' },
    'ai-assistant': { id: 'ai-assistant', name: 'Asistente IA', presence: 'online', avatarUrl: null },
    'user-1': { id: 'user-1', name: 'Ana García', presence: 'online', avatarUrl: `https://i.pravatar.cc/150?u=user1` },
    'user-2': { id: 'user-2', name: 'Carlos Ruiz', presence: 'offline', avatarUrl: `https://i.pravatar.cc/150?u=user2` },
  };

  const [conversations, setConversations] = useState([
    {
      id: 'conv-ai',
      type: 'ai',
      participants: [mockUsers['current-user'], mockUsers['ai-assistant']],
      lastMessage: { id: 'msg-ai-1', text: '¡Listo! He generado 5 títulos virales para tu video.', timestamp: new Date(Date.now() - 120000).toISOString() },
      unreadCount: 0
    },
    {
      id: 'conv-1',
      type: 'direct',
      participants: [mockUsers['current-user'], mockUsers['user-1']],
      lastMessage: { id: 'msg-1', text: '¡Hola! ¿Podrías ayudarme con una consulta?', timestamp: new Date(Date.now() - 300000).toISOString() },
      unreadCount: 2
    },
    {
      id: 'conv-2',
      type: 'direct',
      participants: [mockUsers['current-user'], mockUsers['user-2']],
      lastMessage: { id: 'msg-2', text: 'Perfecto, quedo a la espera. Gracias.', timestamp: new Date(Date.now() - 3600000).toISOString() },
      unreadCount: 0
    },
  ]);

  const [messages, setMessages] = useState({
    'conv-ai': [
      { id: 'msg-ai-1', senderId: 'current-user', text: 'Genera 5 títulos virales para YouTube sobre tecnología IA', timestamp: new Date(Date.now() - 180000).toISOString() },
      { id: 'msg-ai-2', senderId: 'ai-assistant', type: 'ai', text: '¡Listo! Aquí tienes 5 títulos virales optimizados para YouTube:\n\n1. "La IA que CAMBIÓ mi forma de crear contenido" 🤯\n2. "Secretos de IA que los creadores NO quieren que sepas"\n3. "Generé $10,000 en un mes gracias a ESTA IA"\n4. "IA vs Humano: El resultado te SORPRENDERÁ"\n5. "La herramienta de IA que TODO creator necesita en 2025"', timestamp: new Date(Date.now() - 120000).toISOString() }
    ],
    'conv-1': [
      { id: 'msg-1-1', senderId: 'user-1', text: '¡Hola! ¿Podrías ayudarme con una consulta sobre mi plan?', timestamp: new Date(Date.now() - 300000).toISOString() }
    ],
    'conv-2': [
      { id: 'msg-2-1', senderId: 'user-2', text: 'Claro, lo reviso y te comento.', timestamp: new Date(Date.now() - 3660000).toISOString() },
      { id: 'msg-2-2', senderId: 'current-user', text: 'Perfecto, quedo a la espera. Gracias.', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
  });

  const [activeConversationId, setActiveConversationId] = useState('conv-ai');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (text) => {
    const newMessage = { id: `msg-${Date.now()}`, senderId: 'current-user', text, timestamp: new Date().toISOString() };
    setMessages(prev => ({ ...prev, [activeConversationId]: [...(prev[activeConversationId] || []), newMessage] }));
    setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, lastMessage: newMessage } : conv));

    // Simular respuesta de IA
    if (activeConversationId === 'conv-ai') {
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse = {
          id: `msg-ai-${Date.now()}`,
          senderId: 'ai-assistant',
          type: 'ai',
          text: 'Entendido. Estoy procesando tu solicitud con tecnología de última generación. En un momento tendrás tu respuesta optimizada. 🚀',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => ({ ...prev, [activeConversationId]: [...prev[activeConversationId], aiResponse] }));
        setConversations(prev => prev.map(conv => conv.id === activeConversationId ? { ...conv, lastMessage: aiResponse } : conv));
        setIsTyping(false);
      }, 2000);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherUser = activeConversation?.participants.find(p => p.id !== 'current-user');

  return (
    <div className="h-[calc(100vh-4rem)] flex font-sans bg-gray-900">
      {/* Panel Izquierdo: Lista de Conversaciones */}
      <ChatList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
      />

      {/* Panel Central: Mensajes */}
      <div className="flex-1 flex flex-col">
        {/* Header Elegante */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/60 backdrop-blur-sm border-b border-purple-500/20 px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Avatar user={otherUser} size="md" showGlow={otherUser?.presence === 'online'} />
            <div>
              <h2 className="text-lg font-bold text-gray-200">{otherUser?.name}</h2>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                {otherUser?.presence === 'online' ? (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    En línea
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    Desconectado
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700/60 rounded-lg transition-colors"
              title="Actualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700/60 rounded-lg transition-colors"
              title="Más opciones"
            >
              <MoreVertical className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.header>

        {/* Feed de Mensajes */}
        <MessageFeed
          messages={messages[activeConversationId] || []}
          users={mockUsers}
          isTyping={isTyping}
        />
      </div>

      {/* Panel Derecho: Asistente IA */}
      <WriteAndAssistPanel onSendMessage={handleSendMessage} />

      {/* Estilos personalizados para scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </div>
  );
};

export default Chat;