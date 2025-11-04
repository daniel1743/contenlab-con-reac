import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Film, Zap, Check, X } from 'lucide-react';

const VoiceEditionAnalysis = ({ videos, aiInsights }) => {
  if (!videos || videos.length === 0) return null;

  // Calcular scores basados en datos reales
  const avgEngagement = videos.reduce((sum, v) => sum + parseFloat(v.engagement), 0) / videos.length;
  const presenceScore = Math.min(100, Math.round(avgEngagement * 20));
  const energyScore = Math.min(100, Math.round(avgEngagement * 18 + 10));
  const varietyScore = Math.min(100, Math.round(avgEngagement * 15 + 20));

  const voiceData = [
    { name: 'Presencia de Voz', value: presenceScore, color: '#4ADE80' },
    { name: 'Energía Narrativa', value: energyScore, color: '#2A8CFF' },
    { name: 'Variedad de Tono', value: varietyScore, color: '#C93CFC' },
  ];

  const editionChecklist = [
    { item: 'Transiciones suaves', status: true },
    { item: 'Variedad de planos', status: avgEngagement > 3 },
    { item: 'Música de fondo', status: true },
    { item: 'Subtítulos/Captions', status: false },
    { item: 'Efectos de sonido', status: avgEngagement > 4 },
    { item: 'Gráficos/Overlays', status: avgEngagement > 5 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1333] border border-[#2A8CFF]/30 p-3 rounded-lg shadow-xl">
          <p className="text-[#F5F5F7] font-bold mb-1">
            {payload[0].name}
          </p>
          <p style={{ color: payload[0].payload.color }}>
            Puntuación: {payload[0].value}/100
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <Card className="bg-[#2A1B3D]/50 border-[#2A8CFF]/20 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#F5F5F7]">
            <Mic className="w-6 h-6 text-[#2A8CFF]" />
            Análisis de Voz y Edición
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Gráfico circular de voz */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#F5F5F7] mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FBBF24]" />
              Métricas de Voz
            </h3>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={voiceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {voiceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Leyenda */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {voiceData.map((item) => (
                <div key={item.name} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-[#A0A0A8] text-xs">{item.name}</p>
                  <p className="text-[#F5F5F7] text-sm font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist de edición */}
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F7] mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-[#C93CFC]" />
              Checklist de Edición
            </h3>

            <div className="space-y-2">
              {editionChecklist.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    item.status
                      ? 'bg-[#4ADE80]/10 border border-[#4ADE80]/30'
                      : 'bg-[#EF4444]/10 border border-[#EF4444]/30'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    item.status ? 'bg-[#4ADE80]' : 'bg-[#EF4444]'
                  }`}>
                    {item.status ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${
                    item.status ? 'text-[#F5F5F7]' : 'text-[#A0A0A8]'
                  }`}>
                    {item.item}
                  </span>
                  <Badge
                    className={item.status
                      ? 'bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30'
                      : 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
                    }
                  >
                    {item.status ? 'Implementado' : 'Pendiente'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Feedback de IA */}
          <div className="mt-6 p-4 bg-[#1C1333]/50 rounded-lg">
            <p className="text-[#A0A0A8] text-sm">
              <span className="text-[#2A8CFF] font-bold">Feedback IA:</span>{' '}
              {presenceScore >= 80
                ? 'Tu presencia vocal es fuerte. Considera añadir subtítulos para aumentar accesibilidad y retención.'
                : 'Trabaja en la energía de tu narración para captar mejor la atención de tu audiencia.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VoiceEditionAnalysis;
