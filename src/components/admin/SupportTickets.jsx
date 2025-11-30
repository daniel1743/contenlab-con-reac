import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Ticket, 
  User, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  X,
  Send,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSupportTickets, getTicketById, updateTicket } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '@/components/SEOHead';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🎫 SUPPORT TICKETS - Sistema de Tickets de Soporte             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
const SupportTickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState('all'); // all, open, in_progress, closed

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter !== 'all') {
        filters.status = filter;
      }

      const result = await getSupportTickets(filters);
      if (result.success) {
        setTickets(result.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const result = await getTicketById(ticketId);
      if (result.success) {
        setSelectedTicket(result.ticket);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
  };

  const handleRespond = async () => {
    if (!selectedTicket || !response.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una respuesta',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await updateTicket(selectedTicket.id, {
        response,
        status: 'in_progress'
      });

      if (result.success) {
        toast({
          title: 'Respuesta enviada',
          description: 'La respuesta se ha guardado correctamente'
        });
        setResponse('');
        loadTickets();
        handleViewTicket(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error responding to ticket:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la respuesta',
        variant: 'destructive'
      });
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      const result = await updateTicket(ticketId, {
        status: 'closed'
      });

      if (result.success) {
        toast({
          title: 'Ticket cerrado',
          description: 'El ticket se ha cerrado correctamente'
        });
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'normal':
        return 'text-yellow-400';
      case 'low':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <>
      <SEOHead 
        page="admin-tickets"
        title="Tickets de Soporte - Admin Panel"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Ticket className="w-10 h-10" />
                    Tickets de Soporte
                  </h1>
                  <p className="text-gray-400">
                    Gestiona las solicitudes de soporte de los usuarios
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Volver
                </Button>
              </div>

              {/* Filters */}
              <Card className="glass-effect border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    {['all', 'open', 'in_progress', 'closed'].map((f) => (
                      <Button
                        key={f}
                        onClick={() => setFilter(f)}
                        variant={filter === f ? 'default' : 'outline'}
                        className={filter === f ? 'bg-purple-600' : 'border-gray-700'}
                        size="sm"
                      >
                        {f === 'all' ? 'Todos' : 
                         f === 'open' ? 'Abiertos' :
                         f === 'in_progress' ? 'En Proceso' : 'Cerrados'}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tickets List */}
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">
                    Tickets ({tickets.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-800 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No hay tickets que mostrar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <motion.div
                          key={ticket.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`bg-gray-800/50 border rounded-lg p-4 hover:border-purple-500/50 transition cursor-pointer ${
                            selectedTicket?.id === ticket.id ? 'border-purple-500' : 'border-gray-700'
                          }`}
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                                  {ticket.status}
                                </span>
                                <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority.toUpperCase()}
                                </span>
                              </div>
                              <h3 className="text-white font-semibold mb-1">
                                {ticket.title}
                              </h3>
                              <p className="text-sm text-gray-400 line-clamp-2">
                                {ticket.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {ticket.user?.email || 'Usuario desconocido'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(ticket.created_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ticket Detail Sidebar */}
            {selectedTicket && (
              <div className="lg:col-span-1">
                <TicketDetailSidebar
                  ticket={selectedTicket}
                  response={response}
                  setResponse={setResponse}
                  onRespond={handleRespond}
                  onClose={() => setSelectedTicket(null)}
                  onCloseTicket={handleCloseTicket}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Sidebar de detalles del ticket
 */
const TicketDetailSidebar = ({ ticket, response, setResponse, onRespond, onClose, onCloseTicket }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-6"
    >
      <Card className="glass-effect border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Detalles del Ticket</CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ticket Info */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">Título</label>
              <p className="text-white font-semibold">{ticket.title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Descripción</label>
              <p className="text-white text-sm whitespace-pre-wrap">{ticket.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400">Estado</label>
                <p className="text-white">{ticket.status}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Prioridad</label>
                <p className="text-white">{ticket.priority}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Usuario</label>
              <p className="text-white">{ticket.user?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Response Section */}
          {ticket.status !== 'closed' && (
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <label className="text-sm text-gray-400">Responder</label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={onRespond}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Respuesta
                </Button>
                <Button
                  onClick={() => onCloseTicket(ticket.id)}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Cerrar
                </Button>
              </div>
            </div>
          )}

          {/* Existing Response */}
          {ticket.response && (
            <div className="pt-4 border-t border-gray-700">
              <label className="text-sm text-gray-400 mb-2 block">Respuesta</label>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-white text-sm whitespace-pre-wrap">{ticket.response}</p>
                {ticket.responded_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Respondido: {new Date(ticket.responded_at).toLocaleString('es-ES')}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SupportTickets;

