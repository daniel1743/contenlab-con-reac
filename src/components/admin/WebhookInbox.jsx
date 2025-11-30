import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Webhook, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWebhooks, getWebhookById } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '@/components/SEOHead';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔔 WEBHOOK INBOX - Centro de Webhooks                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
const WebhookInbox = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [filters, setFilters] = useState({
    source: '',
    status: '',
    eventType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadWebhooks();
  }, [filters]);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const result = await getWebhooks({ ...filters, limit: 100 });
      if (result.success) {
        setWebhooks(result.webhooks);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudieron cargar los webhooks',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar webhooks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (webhookId) => {
    try {
      const result = await getWebhookById(webhookId);
      if (result.success) {
        setSelectedWebhook(result.webhook);
      }
    } catch (error) {
      console.error('Error loading webhook details:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSourceColor = (source) => {
    const colors = {
      mercadopago: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      stripe: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      paypal: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      system: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      openai: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[source] || colors.system;
  };

  return (
    <>
      <SEOHead 
        page="admin-webhooks"
        title="Webhook Inbox - Admin Panel"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Webhook className="w-10 h-10" />
                Webhook Inbox
              </h1>
              <p className="text-gray-400">
                Centro de monitoreo de todos los webhooks recibidos
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Volver al Dashboard
            </Button>
          </div>

          {/* Filters */}
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Fuente</label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Todas</option>
                    <option value="mercadopago">MercadoPago</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="system">System</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Estado</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Todos</option>
                    <option value="received">Recibido</option>
                    <option value="processed">Procesado</option>
                    <option value="error">Error</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Fecha Inicio</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Fecha Fin</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={loadWebhooks}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhooks Table */}
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">
                Webhooks ({webhooks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : webhooks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay webhooks que mostrar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {webhooks.map((webhook) => (
                    <motion.div
                      key={webhook.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition cursor-pointer"
                      onClick={() => handleViewDetails(webhook.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getStatusIcon(webhook.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSourceColor(webhook.source)}`}>
                            {webhook.source}
                          </span>
                          <div className="flex-1">
                            <p className="text-white font-semibold">{webhook.event_type}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(webhook.created_at).toLocaleString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Webhook Detail Modal */}
        {selectedWebhook && (
          <WebhookDetailModal
            webhook={selectedWebhook}
            onClose={() => setSelectedWebhook(null)}
          />
        )}
      </div>
    </>
  );
};

/**
 * Modal de detalles del webhook
 */
const WebhookDetailModal = ({ webhook, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-purple-500/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Detalles del Webhook</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">ID</label>
              <p className="text-white font-mono text-sm">{webhook.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Fuente</label>
                <p className="text-white">{webhook.source}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Tipo de Evento</label>
                <p className="text-white">{webhook.event_type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Estado</label>
                <p className="text-white">{webhook.status}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Fecha</label>
                <p className="text-white">{new Date(webhook.created_at).toLocaleString('es-ES')}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Payload (JSON)</label>
              <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                {JSON.stringify(webhook.payload, null, 2)}
              </pre>
            </div>
            {webhook.error_message && (
              <div>
                <label className="text-sm text-red-400 mb-2 block">Error</label>
                <p className="text-red-300">{webhook.error_message}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WebhookInbox;

