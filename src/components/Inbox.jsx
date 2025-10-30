import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  Heart,
  Reply,
  Trash2,
  Star,
  CheckCheck,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  MoreVertical,
  Archive,
  Flag,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Inbox = () => {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Datos de ejemplo de mensajes
  const [messages, setMessages] = useState([
    {
      id: 1,
      platform: 'instagram',
      sender: 'María González',
      avatar: 'https://i.pravatar.cc/150?img=1',
      message: '¡Increíble tutorial! ¿Podrías hacer uno sobre edición de videos?',
      timestamp: 'Hace 5 min',
      unread: true,
      starred: false,
      type: 'comment',
      postTitle: 'Tutorial de IA para Principiantes'
    },
    {
      id: 2,
      platform: 'youtube',
      sender: 'Carlos Ruiz',
      avatar: 'https://i.pravatar.cc/150?img=3',
      message: 'Excelente contenido, me suscribí. ¿Cuándo subes el siguiente video?',
      timestamp: 'Hace 15 min',
      unread: true,
      starred: true,
      type: 'comment',
      postTitle: '10 Tips para Crecer en YouTube'
    },
    {
      id: 3,
      platform: 'twitter',
      sender: 'Ana Martínez',
      avatar: 'https://i.pravatar.cc/150?img=5',
      message: '@CreoVision Este thread está 🔥 ¿Hacen consultoría personalizada?',
      timestamp: 'Hace 1 hora',
      unread: false,
      starred: false,
      type: 'mention',
      postTitle: 'Tendencias de Marketing Digital 2025'
    },
    {
      id: 4,
      platform: 'facebook',
      sender: 'Luis Fernández',
      avatar: 'https://i.pravatar.cc/150?img=8',
      message: 'Hola, me interesa tu curso. ¿Tienes descuento para este mes?',
      timestamp: 'Hace 2 horas',
      unread: false,
      starred: false,
      type: 'dm',
      postTitle: null
    },
    {
      id: 5,
      platform: 'instagram',
      sender: 'Sofia López',
      avatar: 'https://i.pravatar.cc/150?img=9',
      message: '¿Podrías colaborar conmigo? Tengo 50K seguidores en mi canal',
      timestamp: 'Hace 3 horas',
      unread: false,
      starred: true,
      type: 'dm',
      postTitle: null
    },
    {
      id: 6,
      platform: 'youtube',
      sender: 'Jorge Pérez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      message: 'Me ayudó mucho este video, gracias por compartir tu conocimiento ❤️',
      timestamp: 'Hace 5 horas',
      unread: false,
      starred: false,
      type: 'comment',
      postTitle: 'Cómo Monetizar tu Canal desde Cero'
    },
  ]);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'comment': return 'bg-blue-500/20 text-blue-300';
      case 'mention': return 'bg-purple-500/20 text-purple-300';
      case 'dm': return 'bg-pink-500/20 text-pink-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unread') return matchesSearch && msg.unread;
    if (activeTab === 'starred') return matchesSearch && msg.starred;
    if (activeTab === 'dm') return matchesSearch && msg.type === 'dm';

    return matchesSearch;
  });

  const handleSendReply = useCallback(() => {
    if (!replyText.trim()) {
      toast({
        title: '⚠️ Campo vacío',
        description: 'Escribe un mensaje antes de enviar',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: '✅ Respuesta enviada',
      description: `Tu mensaje fue enviado a ${selectedMessage.sender}`,
    });
    setReplyText('');
  }, [replyText, selectedMessage, toast]);

  const handleMarkAsRead = useCallback((id) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, unread: false } : msg
    ));
  }, []);

  const handleToggleStar = useCallback((id) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, starred: !msg.starred } : msg
    ));
  }, []);

  const handleDelete = useCallback((id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    setSelectedMessage(null);
    toast({
      title: '🗑️ Mensaje eliminado',
      description: 'El mensaje ha sido eliminado',
    });
  }, [toast]);

  const unreadCount = messages.filter(m => m.unread).length;
  const starredCount = messages.filter(m => m.starred).length;
  const dmCount = messages.filter(m => m.type === 'dm').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Bandeja de Entrada Unificada</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Gestiona todos tus mensajes, comentarios y menciones desde un solo lugar
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{messages.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Sin leer</p>
              <p className="text-2xl font-bold text-blue-400">{unreadCount}</p>
            </div>
            <Badge className="bg-blue-500">{unreadCount}</Badge>
          </CardContent>
        </Card>

        <Card className="glass-effect border-yellow-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Destacados</p>
              <p className="text-2xl font-bold text-yellow-400">{starredCount}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </CardContent>
        </Card>

        <Card className="glass-effect border-pink-500/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Mensajes directos</p>
              <p className="text-2xl font-bold text-pink-400">{dmCount}</p>
            </div>
            <Send className="w-8 h-8 text-pink-400" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Mensajes</CardTitle>
                    <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar mensajes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-purple-500/20 text-white"
                    />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                      <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                      <TabsTrigger value="unread" className="text-xs">
                        Sin leer {unreadCount > 0 && `(${unreadCount})`}
                      </TabsTrigger>
                      <TabsTrigger value="starred" className="text-xs">★</TabsTrigger>
                      <TabsTrigger value="dm" className="text-xs">DMs</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`p-4 border-b border-purple-500/10 cursor-pointer transition-all hover:bg-purple-500/5 ${
                          selectedMessage?.id === msg.id ? 'bg-purple-500/10' : ''
                        } ${msg.unread ? 'bg-blue-500/5' : ''}`}
                        onClick={() => {
                          setSelectedMessage(msg);
                          handleMarkAsRead(msg.id);
                        }}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src={msg.avatar} alt={msg.sender} />
                            <AvatarFallback className="bg-purple-600">{msg.sender[0]}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                {getPlatformIcon(msg.platform)}
                                <p className="font-semibold text-white text-sm truncate">{msg.sender}</p>
                              </div>
                              {msg.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                            </div>

                            <p className="text-sm text-gray-300 line-clamp-2 mb-1">{msg.message}</p>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`text-xs ${getTypeColor(msg.type)}`}>
                                {msg.type === 'comment' ? 'Comentario' : msg.type === 'mention' ? 'Mención' : 'DM'}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No se encontraron mensajes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Message Detail & Reply */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {selectedMessage ? (
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedMessage.avatar} alt={selectedMessage.sender} />
                        <AvatarFallback className="bg-purple-600">{selectedMessage.sender[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(selectedMessage.platform)}
                          <CardTitle className="text-white text-lg">{selectedMessage.sender}</CardTitle>
                        </div>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {selectedMessage.timestamp}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStar(selectedMessage.id)}
                        className="hover:bg-purple-500/20"
                      >
                        <Star className={`w-4 h-4 ${selectedMessage.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:bg-purple-500/20">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Original Message */}
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-purple-500/10">
                    {selectedMessage.postTitle && (
                      <div className="mb-3 pb-3 border-b border-purple-500/10">
                        <p className="text-xs text-gray-400 mb-1">En respuesta a:</p>
                        <p className="text-sm font-medium text-purple-300">{selectedMessage.postTitle}</p>
                      </div>
                    )}
                    <p className="text-gray-200 leading-relaxed">{selectedMessage.message}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                      <Heart className="w-4 h-4 mr-2" />
                      Me gusta
                    </Button>
                    <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                      <Archive className="w-4 h-4 mr-2" />
                      Archivar
                    </Button>
                    <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                      <Flag className="w-4 h-4 mr-2" />
                      Marcar
                    </Button>
                  </div>

                  {/* Reply Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Reply className="w-4 h-4" />
                      <h3 className="font-semibold">Responder</h3>
                    </div>

                    <Textarea
                      placeholder="Escribe tu respuesta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[120px] bg-gray-800/50 border-purple-500/20 text-white resize-none"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                          💡 Respuesta IA
                        </Button>
                        <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                          📋 Plantilla
                        </Button>
                      </div>

                      <Button
                        onClick={handleSendReply}
                        className="gradient-primary hover:opacity-90"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Respuesta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-effect border-purple-500/20 h-full flex items-center justify-center min-h-[600px]">
                <CardContent className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-30" />
                  <h3 className="text-xl font-semibold text-white mb-2">Selecciona un mensaje</h3>
                  <p className="text-gray-400">Elige un mensaje de la lista para ver los detalles y responder</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
