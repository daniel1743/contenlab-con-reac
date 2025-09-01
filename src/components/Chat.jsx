import React, { useState, useEffect } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga inicial
  useEffect(() => {
    setTimeout(() => {
      setMessages([
        { id: 1, text: "¡Bienvenido a ContentLab Premium! 🚀", sender: "Sistema", time: "12:00" },
        { id: 2, text: "¿En qué puedo ayudarte hoy?", sender: "Asistente IA", time: "12:01" }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const msg = {
        id: Date.now(),
        text: newMessage,
        sender: "Tú",
        time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
      };
      setMessages([...messages, msg]);
      setNewMessage('');
      
      // Respuesta automática
      setTimeout(() => {
        const replies = [
          "¡Excelente pregunta! Te ayudo enseguida 💡",
          "Interesante... déjame procesar eso 🤔",
          "¡Perfecto! Esa es una gran idea para contenido 🎯",
          "Te voy a dar algunos tips profesionales sobre eso 👨‍💻"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const autoReply = {
          id: Date.now() + 1,
          text: randomReply,
          sender: "Asistente IA", 
          time: new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})
        };
        setMessages(prev => [...prev, autoReply]);
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Iniciando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h2 className="text-xl font-bold text-purple-400">💬 Chat de ContentLab</h2>
        <p className="text-sm text-gray-400">Asistente IA para creadores</p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.sender === 'Tú' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-white border border-gray-700'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-xs text-purple-300">{msg.sender}</span>
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Pregúntame sobre contenido, miniaturas, ideas..."
            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;