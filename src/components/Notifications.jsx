import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, TrendingUp, Award, MessageSquare, DollarSign, Clock, Star, Settings } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'achievement',
      icon: Award,
      title: '¡Nueva insignia desbloqueada!',
      message: 'Has obtenido la insignia "Creador Constante" por 30 días seguidos de publicaciones',
      time: 'Hace 5 minutos',
      read: false,
      color: 'text-yellow-400'
    },
    {
      id: 2,
      type: 'viral',
      icon: TrendingUp,
      title: '¡Tu contenido es tendencia!',
      message: 'Tu video "Tutorial de IA para Principiantes" ha alcanzado 100K vistas',
      time: 'Hace 1 hora',
      read: false,
      color: 'text-pink-400'
    },
    {
      id: 3,
      type: 'comment',
      icon: MessageSquare,
      title: 'Nuevos comentarios',
      message: 'Tienes 15 nuevos comentarios en tu último video',
      time: 'Hace 2 horas',
      read: false,
      color: 'text-blue-400'
    },
    {
      id: 4,
      type: 'revenue',
      icon: DollarSign,
      title: 'Nuevo pago procesado',
      message: 'Has recibido $245.00 por monetización de YouTube',
      time: 'Hace 3 horas',
      read: true,
      color: 'text-green-400'
    },
    {
      id: 5,
      type: 'reminder',
      icon: Clock,
      title: 'Recordatorio de publicación',
      message: 'No olvides publicar tu contenido programado para hoy a las 8 PM',
      time: 'Hace 5 horas',
      read: true,
      color: 'text-purple-400'
    },
    {
      id: 6,
      type: 'milestone',
      icon: Star,
      title: '¡Hito alcanzado!',
      message: 'Has superado los 50K seguidores en Instagram',
      time: 'Hace 1 día',
      read: true,
      color: 'text-pink-400'
    },
    {
      id: 7,
      type: 'system',
      icon: Settings,
      title: 'Nueva función disponible',
      message: 'Ahora puedes usar el generador de thumbnails con IA',
      time: 'Hace 2 días',
      read: true,
      color: 'text-gray-400'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Notificaciones</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Mantente al día con todas tus actualizaciones y logros
        </p>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todo al día'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {notifications.length} notificaciones en total
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="border-purple-500/20 hover:bg-purple-500/10"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar todas como leídas
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar todo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {notifications.length === 0 ? (
          <Card className="glass-effect border-purple-500/20">
            <CardContent className="py-12 text-center">
              <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No hay notificaciones</h3>
              <p className="text-gray-400">
                Cuando tengas nuevas notificaciones, aparecerán aquí
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className={`glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300 ${!notification.read && 'border-purple-500/40 bg-purple-500/5'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${!notification.read ? 'bg-purple-500/20' : 'bg-gray-700/50'} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${notification.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-white">
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 text-xs hover:bg-purple-500/10"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Marcar como leída
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 text-xs hover:bg-red-500/10 text-red-400"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;
