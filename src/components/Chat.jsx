import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, Smile, MoreVertical, Check, CheckCheck, Bot, User, Star } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import EmojiPicker from 'emoji-picker-react';

// ==========================================================================
// --- REDISEÑO: Interfaz Profesional de 3 Columnas ---
// ==========================================================================

// --- Componente Avatar ---
const Avatar = ({ user, size = 'md' }) => {
  if (!user) return <div className="w-10 h-10 rounded-full bg-gray-200" />;
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center font-bold text-white overflow-hidden`}>
        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || '?').toUpperCase()}
      </div>
      {user.presence === 'online' && <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
    </div>
  );
};

// --- Componente Lista de Chats (Panel Izquierdo) ---
const ChatList = ({ conversations, activeConversationId, onSelect }) => {
  return (
    <div className="w-80 bg-white h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Conversaciones</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => {
          const otherUser = conv.participants.find(p => p.id !== 'current-user');
          const isActive = conv.id === activeConversationId;
          return (
            <div key={conv.id} onClick={() => onSelect(conv.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer border-l-4 ${isActive ? 'bg-indigo-50 border-indigo-500' : 'border-transparent hover:bg-gray-50'}`}>
              <Avatar user={otherUser} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className={`font-semibold truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{otherUser?.name}</h4>
                  <span className="text-xs text-gray-500 flex-shrink-0">{new Date(conv.lastMessage.timestamp).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Componente Mensajes (Panel Central) ---
const MessageFeed = ({ messages, users }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages]);

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      {messages.map(msg => {
        const sender = users[msg.senderId];
        const isOwn = msg.senderId === 'current-user';
        return (
          <div key={msg.id} className={`flex items-start gap-3 my-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {!isOwn && <Avatar user={sender} />}
            <div className={`max-w-lg p-3 rounded-lg ${isOwn ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800 border'}`}>
              {!isOwn && <p className="text-sm font-semibold text-gray-800 mb-1">{sender?.name}</p>}
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

// --- Componente Panel de Escritura y Asistencia (Panel Derecho) ---
const WriteAndAssistPanel = ({ onSendMessage }) => {
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
  
  return (
    <div className="w-96 bg-white h-full flex flex-col border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Panel de Escritura</h3>
      </div>
      <div className="p-4 relative flex-1 flex flex-col">
        {showPicker && (
          <div className="absolute bottom-full right-4 mb-2 z-10">
            <EmojiPicker onEmojiClick={(e) => setMessage(prev => prev + e.emoji)} theme="light" />
          </div>
        )}
        <TextareaAutosize
          ref={inputRef} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Escribe tu respuesta aquí..."
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
          minRows={8}
        />
        <div className="flex justify-between items-center mt-3">
          <div className="flex gap-2">
            <button onClick={() => setShowPicker(p => !p)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Smile /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Paperclip /></button>
          </div>
          <button onClick={handleSend} disabled={!message.trim()}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            Enviar
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 mt-auto">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Bot /> Asistente IA</h3>
        <div className="space-y-2 text-sm">
            <p className="p-3 bg-indigo-50 text-indigo-800 rounded-lg cursor-pointer hover:bg-indigo-100">Sugerir un título viral</p>
            <p className="p-3 bg-indigo-50 text-indigo-800 rounded-lg cursor-pointer hover:bg-indigo-100">Mejorar el tono del texto</p>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal del Chat ---
const Chat = () => {
  // Datos de prueba (Mock Data)
  const mockUsers = {
    'current-user': { id: 'current-user', name: 'Tú' },
    'user-1': { id: 'user-1', name: 'Ana García', presence: 'online', avatarUrl: `https://i.pravatar.cc/150?u=user1` },
    'user-2': { id: 'user-2', name: 'Carlos Ruiz', presence: 'offline', avatarUrl: `https://i.pravatar.cc/150?u=user2` },
  };

  const [conversations, setConversations] = useState([
    { id: 'conv-1', type: 'direct', participants: [mockUsers['current-user'], mockUsers['user-1']], lastMessage: { id: 'msg-1', text: '¡Hola! ¿Podrías ayudarme con una consulta?', timestamp: new Date(Date.now() - 300000).toISOString()}},
    { id: 'conv-2', type: 'direct', participants: [mockUsers['current-user'], mockUsers['user-2']], lastMessage: { id: 'msg-2', text: 'Perfecto, quedo a la espera. Gracias.', timestamp: new Date(Date.now() - 3600000).toISOString()}},
  ]);
  const [messages, setMessages] = useState({
    'conv-1': [ { id: 'msg-1-1', senderId: 'user-1', text: '¡Hola! ¿Podrías ayudarme con una consulta sobre mi plan?', timestamp: new Date(Date.now() - 300000).toISOString() } ],
    'conv-2': [
      { id: 'msg-2-1', senderId: 'user-2', text: 'Claro, lo reviso y te comento.', timestamp: new Date(Date.now() - 3660000).toISOString()},
      { id: 'msg-2-2', senderId: 'current-user', text: 'Perfecto, quedo a la espera. Gracias.', timestamp: new Date(Date.now() - 3600000).toISOString()},
    ],
  });

  const [activeConversationId, setActiveConversationId] = useState('conv-1');

  const handleSendMessage = (text) => {
    const newMessage = { id: `msg-${Date.now()}`, senderId: 'current-user', text, timestamp: new Date().toISOString() };
    setMessages(prev => ({...prev, [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]}));
    setConversations(prev => prev.map(conv => conv.id === activeConversationId ? {...conv, lastMessage: newMessage} : conv));
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  return (
    <div className="h-[calc(100vh-4rem)] flex font-sans bg-white">
      <ChatList 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between h-20">
            {/* Contenido del Header si lo necesitas */}
            <h2 className="text-lg font-bold">Conversación</h2>
        </header>
        <MessageFeed 
          messages={messages[activeConversationId] || []}
          users={mockUsers}
        />
      </div>

      <WriteAndAssistPanel onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;