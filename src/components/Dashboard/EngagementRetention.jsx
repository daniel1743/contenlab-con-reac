import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, Clock, TrendingDown, Trophy } from 'lucide-react';

const EngagementRetention = ({ videos, metrics }) => {
  if (!videos || videos.length === 0) return null;

  // Simular datos de retención (en producción vendría de YouTube Analytics)
  const generateRetentionData = () => {
    const avgEngagement = parseFloat(metrics.avgEngagement);
    const baseRetention = Math.min(100, avgEngagement * 20);

    return Array.from({ length: 10 }, (_, i) => ({
      minute: i + 1,
      retention: Math.max(20, baseRetention - (i * 6) - Math.random() * 5),
    }));
  };

  const retentionData = generateRetentionData();

  // Calcular métricas
  const avgRetention = retentionData.reduce((sum, d) => sum + d.retention, 0) / retentionData.length;
  const dropoffPoint = retentionData.findIndex(d => d.retention < 50) + 1 || retentionData.length;
  const avgWatchTime = `${Math.floor(avgRetention / 60 * retentionData.length)}:${Math.floor((avgRetention / 60 * retentionData.length % 1) * 60).toString().padStart(2, '0')}`;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1333] border border-[#2A8CFF]/30 p-3 rounded-lg shadow-xl">
          <p className="text-[#F5F5F7] font-bold">
            Minuto {payload[0].payload.minute}
          </p>
          <p className="text-[#4ADE80] text-sm">
            Retención: {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <Card className="bg-[#2A1B3D]/50 border-[#4ADE80]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#F5F5F7]">
            <Activity className="w-6 h-6 text-[#4ADE80]" />
            Engagement y Retención de Audiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-[#1C1333] to-[#2A1B3D] p-4 rounded-lg border border-[#2A8CFF]/20"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-[#2A8CFF]" />
                <div>
                  <p className="text-[#A0A0A8] text-sm">Tiempo promedio visto</p>
                  <p className="text-[#F5F5F7] text-2xl font-bold">{avgWatchTime} min</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-[#1C1333] to-[#2A1B3D] p-4 rounded-lg border border-[#FBBF24]/20"
            >
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-[#FBBF24]" />
                <div>
                  <p className="text-[#A0A0A8] text-sm">Pico de abandono</p>
                  <p className="text-[#F5F5F7] text-2xl font-bold">Minuto {dropoffPoint}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-[#1C1333] to-[#2A1B3D] p-4 rounded-lg border border-[#4ADE80]/20"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-[#4ADE80]" />
                <div>
                  <p className="text-[#A0A0A8] text-sm">Mejor retención</p>
                  <p className="text-[#F5F5F7] text-2xl font-bold">{avgRetention.toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Gráfico de retención */}
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={retentionData}>
              <defs>
                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A1B3D" />
              <XAxis
                dataKey="minute"
                stroke="#A0A0A8"
                label={{ value: 'Minuto', position: 'insideBottom', offset: -5, fill: '#A0A0A8' }}
              />
              <YAxis
                stroke="#A0A0A8"
                label={{ value: 'Retención (%)', angle: -90, position: 'insideLeft', fill: '#A0A0A8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#4ADE80"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRetention)"
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="retention"
                stroke="#4ADE80"
                strokeWidth={3}
                dot={{ fill: '#4ADE80', r: 4 }}
                activeDot={{ r: 6, fill: '#C93CFC' }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-[#1C1333]/50 rounded-lg">
            <p className="text-[#A0A0A8] text-sm">
              <span className="text-[#4ADE80] font-bold">Insight:</span> Los primeros 2 minutos son críticos.
              Implementa un hook más fuerte al inicio para retener más audiencia.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EngagementRetention;
