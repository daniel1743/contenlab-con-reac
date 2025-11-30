import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  XCircle,
  CheckCheck,
  Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getAdminNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '@/components/SEOHead';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🔔 ADMIN NOTIFICATIONS - Notificaciones Internas               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
const AdminNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    loadNotifications();
    // Refrescar cada 10 segundos
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter === 'unread') filters.isRead = false;
      if (filter === 'read') filters.isRead = true;

      const result = await getAdminNotifications(filters);
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      loadNotifications();
      toast({
        title: 'Notificación marcada como leída',
        duration: 2000
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      loadNotifications();
      toast({
        title: 'Todas las notificaciones marcadas como leídas',
        duration: 2000
      });
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <SEOHead 
        page="admin-notifications"
        title="Notificaciones - Admin Panel"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Bell className="w-10 h-10" />
                Notificaciones Internas
              </h1>
              <p className="text-gray-400">
                {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todas las notificaciones leídas'}
              </p>
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Volver
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="glass-effect border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <div className="flex gap-2">
                  {['all', 'unread', 'read'].map((f) => (
                    <Button
                      key={f}
                      onClick={() => setFilter(f)}
                      variant={filter === f ? 'default' : 'outline'}
                      className={filter === f ? 'bg-purple-600' : 'border-gray-700'}
                    >
                      {f === 'all' ? 'Todas' : f === 'unread' ? 'Sin leer' : 'Leídas'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">
                Notificaciones ({notifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border rounded-lg p-4 transition ${
                        notification.is_read 
                          ? 'bg-gray-800/50 border-gray-700' 
                          : `${getSeverityColor(notification.severity)} border-2`
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getSeverityIcon(notification.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-white font-semibold mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-gray-300 text-sm">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{notification.source}</span>
                                <span>•</span>
                                <span>{new Date(notification.created_at).toLocaleString('es-ES')}</span>
                              </div>
                            </div>
                            {!notification.is_read && (
                              <Button
                                onClick={() => handleMarkAsRead(notification.id)}
                                size="sm"
                                variant="ghost"
                                className="text-gray-400 hover:text-white"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminNotifications;

