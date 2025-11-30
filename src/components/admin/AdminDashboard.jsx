import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  DollarSign, 
  AlertCircle, 
  Ticket, 
  Bell,
  TrendingUp,
  Webhook,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getWebhooksChartData, isUserAdmin } from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';
import SEOHead from '@/components/SEOHead';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  📊 ADMIN DASHBOARD - Panel Principal de Administración          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalWebhooks: 0,
    successfulPayments: 0,
    errorWebhooks: 0,
    openTickets: 0,
    unreadNotifications: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      // Refrescar cada 30 segundos
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    const adminStatus = await isUserAdmin();
    if (!adminStatus) {
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permisos de administrador',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResult, chartResult] = await Promise.all([
        getDashboardStats(7),
        getWebhooksChartData(7)
      ]);

      if (statsResult.success) {
        setStats(statsResult.stats);
      }

      if (chartResult.success) {
        setChartData(chartResult.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Webhooks Recibidos',
      value: stats.totalWebhooks,
      icon: Webhook,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      description: 'Últimos 7 días'
    },
    {
      title: 'Pagos Exitosos',
      value: stats.successfulPayments,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      change: '+8%',
      description: 'MercadoPago'
    },
    {
      title: 'Errores',
      value: stats.errorWebhooks,
      icon: AlertCircle,
      color: 'from-red-500 to-rose-500',
      change: '-5%',
      description: 'Webhooks fallidos'
    },
    {
      title: 'Tickets Abiertos',
      value: stats.openTickets,
      icon: Ticket,
      color: 'from-orange-500 to-amber-500',
      change: stats.openTickets > 0 ? 'Requiere atención' : 'Todo resuelto',
      description: 'Soporte'
    },
    {
      title: 'Notificaciones',
      value: stats.unreadNotifications,
      icon: Bell,
      color: 'from-purple-500 to-pink-500',
      change: stats.unreadNotifications > 0 ? 'Nuevas' : 'Al día',
      description: 'Sin leer'
    }
  ];

  return (
    <>
      <SEOHead 
        page="admin-dashboard"
        title="Admin Dashboard - CreoVision"
        description="Panel de administración de CreoVision"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🛡️ Admin Control Center
              </h1>
              <p className="text-gray-400">
                Panel de administración y monitoreo del sistema
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/webhooks')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
              >
                Ver Webhooks
              </button>
              <button
                onClick={() => navigate('/admin/tickets')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-semibold transition"
              >
                Ver Tickets
              </button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="glass-effect border-purple-500/20 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-purple-500/20 hover:border-purple-500/40 transition">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-xs font-semibold ${
                          stat.change.includes('+') ? 'text-green-400' :
                          stat.change.includes('-') ? 'text-red-400' :
                          stat.change.includes('Requiere') ? 'text-orange-400' :
                          'text-gray-400'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white mb-1">
                          {stat.value.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">{stat.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Actividad de Webhooks (Últimos 7 días)
                </CardTitle>
                <CardDescription>
                  Gráfico de webhooks recibidos por día
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 bg-gray-800 rounded animate-pulse"></div>
                ) : chartData.length > 0 ? (
                  <div className="space-y-4">
                    {chartData.map((day, index) => (
                      <div key={day.date} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{day.date}</span>
                          <span className="text-white font-semibold">{day.total} webhooks</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(day.total / Math.max(...chartData.map(d => d.total))) * 100}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          />
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          {Object.entries(day.bySource).map(([source, count]) => (
                            <span key={source}>
                              {source}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay datos de webhooks aún</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card 
              className="glass-effect border-blue-500/20 hover:border-blue-500/40 transition cursor-pointer"
              onClick={() => navigate('/admin/webhooks')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                    <Webhook className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Webhook Inbox</p>
                    <p className="text-sm text-gray-400">Ver todos los webhooks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="glass-effect border-orange-500/20 hover:border-orange-500/40 transition cursor-pointer"
              onClick={() => navigate('/admin/tickets')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Tickets de Soporte</p>
                    <p className="text-sm text-gray-400">Gestionar tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="glass-effect border-purple-500/20 hover:border-purple-500/40 transition cursor-pointer"
              onClick={() => navigate('/admin/notifications')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Notificaciones</p>
                    <p className="text-sm text-gray-400">
                      {stats.unreadNotifications} sin leer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

