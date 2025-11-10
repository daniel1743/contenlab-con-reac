/**
 * 🍩 Opportunity Donut Chart
 * Multi-ring donut para keywords y potencial de tráfico
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OpportunityDonutChart({ data = {} }) {
  const { keywords = [], traffic_potential = {} } = data;

  // Calcular segmentos del donut
  const donutSegments = useMemo(() => {
    if (!keywords || keywords.length === 0) return [];

    const total = keywords.reduce((sum, kw) => sum + (kw.volume || 0), 0);

    let currentAngle = 0;
    const colors = [
      'rgb(168, 85, 247)', // purple
      'rgb(236, 72, 153)', // pink
      'rgb(59, 130, 246)', // blue
      'rgb(34, 197, 94)', // green
      'rgb(251, 146, 60)', // orange
      'rgb(234, 179, 8)', // yellow
      'rgb(239, 68, 68)', // red
      'rgb(99, 102, 241)', // indigo
    ];

    return keywords.slice(0, 8).map((kw, idx) => {
      const percentage = total > 0 ? (kw.volume || 0) / total : 1 / keywords.length;
      const angle = percentage * 360;

      const segment = {
        keyword: kw.keyword || kw.term || 'Unknown',
        volume: kw.volume || 0,
        difficulty: kw.difficulty || 'N/A',
        opportunity_score: kw.opportunity_score || 0,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: colors[idx % colors.length],
        percentage: (percentage * 100).toFixed(1),
      };

      currentAngle += angle;
      return segment;
    });
  }, [keywords]);

  // Calcular path del arco SVG
  const getArcPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 150 + outerRadius * Math.cos(startRad);
    const y1 = 150 + outerRadius * Math.sin(startRad);
    const x2 = 150 + outerRadius * Math.cos(endRad);
    const y2 = 150 + outerRadius * Math.sin(endRad);
    const x3 = 150 + innerRadius * Math.cos(endRad);
    const y3 = 150 + innerRadius * Math.sin(endRad);
    const x4 = 150 + innerRadius * Math.cos(startRad);
    const y4 = 150 + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  if (!keywords || keywords.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-16 text-center">
          <div className="text-4xl mb-4">🍩</div>
          <p className="text-slate-400">No hay datos de oportunidades disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Mapa de Oportunidades</CardTitle>
          <CardDescription>
            Análisis de keywords y potencial de tráfico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <svg width="300" height="300" className="drop-shadow-xl">
                {/* Background circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="130"
                  fill="rgb(15, 23, 42)"
                  opacity="0.5"
                />

                {/* Donut segments */}
                <g>
                  {donutSegments.map((segment, idx) => (
                    <motion.path
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      d={getArcPath(segment.startAngle, segment.endAngle, 60, 120)}
                      fill={segment.color}
                      opacity="0.8"
                      className="cursor-pointer hover:opacity-100 transition-opacity"
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
                      }}
                    >
                      <title>{`${segment.keyword}: ${segment.volume} vol (${segment.percentage}%)`}</title>
                    </motion.path>
                  ))}
                </g>

                {/* Center circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="55"
                  fill="rgb(30, 41, 59)"
                  className="drop-shadow-lg"
                />

                {/* Center text */}
                <text
                  x="150"
                  y="145"
                  textAnchor="middle"
                  className="text-xs fill-slate-400 font-semibold"
                >
                  Total
                </text>
                <text
                  x="150"
                  y="165"
                  textAnchor="middle"
                  className="text-2xl fill-white font-bold"
                >
                  {keywords.length}
                </text>
                <text
                  x="150"
                  y="180"
                  textAnchor="middle"
                  className="text-xs fill-slate-400"
                >
                  keywords
                </text>
              </svg>
            </div>

            {/* Legend & Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">
                    {keywords.reduce((sum, kw) => sum + (kw.volume || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-300">Volumen Total</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">
                    {traffic_potential.estimated_monthly || 'N/A'}
                  </div>
                  <div className="text-xs text-green-300">Potencial Mensual</div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="text-white font-semibold text-sm sticky top-0 bg-slate-800 py-1">
                  Top Keywords
                </h4>
                {donutSegments.map((segment, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="text-sm text-white font-medium truncate">
                        {segment.keyword}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {segment.percentage}%
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {segment.volume.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Details Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Detalles de Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-sm font-semibold text-slate-400 pb-3">Keyword</th>
                  <th className="text-left text-sm font-semibold text-slate-400 pb-3">Volumen</th>
                  <th className="text-left text-sm font-semibold text-slate-400 pb-3">Dificultad</th>
                  <th className="text-left text-sm font-semibold text-slate-400 pb-3">Score</th>
                  <th className="text-left text-sm font-semibold text-slate-400 pb-3">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30"
                  >
                    <td className="py-3 text-white font-medium">
                      {kw.keyword || kw.term}
                    </td>
                    <td className="py-3 text-slate-300">
                      {(kw.volume || 0).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          kw.difficulty === 'low' || kw.difficulty === 'easy'
                            ? 'bg-green-500/20 text-green-300'
                            : kw.difficulty === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {kw.difficulty || 'N/A'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, kw.opportunity_score || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">
                          {kw.opportunity_score || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {kw.trend === 'up' && <span className="text-green-400">📈 +{kw.trend_percent || 0}%</span>}
                      {kw.trend === 'down' && <span className="text-red-400">📉 -{kw.trend_percent || 0}%</span>}
                      {kw.trend === 'stable' && <span className="text-slate-400">➡️ Estable</span>}
                      {!kw.trend && <span className="text-slate-500">-</span>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Potential */}
      {traffic_potential && Object.keys(traffic_potential).length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">💰 Potencial de Tráfico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-slate-400 mb-1">Estimado Mensual</div>
                <div className="text-2xl font-bold text-white">
                  {traffic_potential.estimated_monthly || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Valor Estimado</div>
                <div className="text-2xl font-bold text-green-400">
                  {traffic_potential.estimated_value || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-1">Tiempo Estimado</div>
                <div className="text-2xl font-bold text-blue-400">
                  {traffic_potential.time_to_rank || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
