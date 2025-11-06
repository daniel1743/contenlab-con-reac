/**
 * 🔔 COMPONENTE DE ALERTAS DE MICRO-TENDENCIAS
 * 
 * Muestra alertas cuando se detectan micro-tendencias emergentes
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { detectMicroTrends, monitorMicroTrends } from '@/services/microTrendsService';
import {
  Bell,
  TrendingUp,
  X,
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MicroTrendsAlert = ({ topics = [], onTrendDetected }) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (topics.length === 0) return;

    // Monitorear micro-tendencias cada 2 minutos
    setIsMonitoring(true);
    const interval = setInterval(async () => {
      const results = await monitorMicroTrends(topics, (emergingTrends) => {
        // Agregar nuevas alertas
        setAlerts(prev => {
          const newAlerts = emergingTrends.map(trend => ({
            id: `${trend.topic}-${Date.now()}`,
            ...trend,
            timestamp: new Date()
          }));
          
          // Notificar al callback
          if (onTrendDetected) {
            onTrendDetected(emergingTrends);
          }
          
          // Mostrar toast
          emergingTrends.forEach(trend => {
            toast({
              title: '🚨 Micro-tendencia detectada',
              description: trend.alert?.message || `${trend.topic} está creciendo`,
              duration: 5000
            });
          });
          
          return [...newAlerts, ...prev].slice(0, 5); // Máximo 5 alertas
        });
      });
    }, 2 * 60 * 1000); // Cada 2 minutos

    // Monitoreo inicial
    monitorMicroTrends(topics, (emergingTrends) => {
      if (emergingTrends.length > 0) {
        setAlerts(emergingTrends.map(trend => ({
          id: `${trend.topic}-${Date.now()}`,
          ...trend,
          timestamp: new Date()
        })));
      }
    });

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [topics, onTrendDetected, toast]);

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-3 mb-6"
        >
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`${
                alert.alert?.urgency === 'high'
                  ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/50'
                  : 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/50'
              } border-2`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {alert.alert?.urgency === 'high' ? (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-white text-sm font-semibold">
                        {alert.alert?.urgency === 'high' ? '🚨 Tendencia Emergente' : '📈 Micro-tendencia'}
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-xs mt-1">
                        {alert.topic} • {alert.platform}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-white"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-200 mb-3">
                  {alert.alert?.message}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-gray-500">Crecimiento: </span>
                      <span className="text-green-400 font-semibold">
                        +{alert.growth?.percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Pico estimado: {alert.alert?.estimatedPeak}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-300">
                    <strong>💡 Acción recomendada:</strong> {alert.alert?.action}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                  onClick={() => {
                    // Navegar a Tools con el tema pre-cargado
                    window.location.href = `/tools?topic=${encodeURIComponent(alert.topic)}`;
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Crear contenido sobre esto
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MicroTrendsAlert;

