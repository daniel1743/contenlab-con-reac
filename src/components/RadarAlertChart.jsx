/**
 * 🎯 Radar Alert Chart
 * Visualización de riesgos y oportunidades en 5 categorías
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RadarAlertChart({ data = {} }) {
  const { categories = [], risks = [], opportunities = [] } = data;

  // Calcular puntos del polígono radar
  const radarPoints = useMemo(() => {
    if (!categories || categories.length === 0) return '';

    const numCategories = categories.length;
    const angleStep = (Math.PI * 2) / numCategories;
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 120;

    // Simular valores para cada categoría (en producción vendrían de data)
    const values = categories.map((cat, idx) => {
      const relatedRisks = risks.filter(r => r.category === cat);
      const relatedOpps = opportunities.filter(o => o.category === cat);

      // Score = (oportunidades * 10) - (riesgos * 5)
      const score = (relatedOpps.length * 10) - (relatedRisks.length * 5);
      return Math.max(0, Math.min(100, 50 + score)); // Normalizar 0-100
    });

    const points = values.map((value, idx) => {
      const angle = angleStep * idx - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    });

    return points.join(' ');
  }, [categories, risks, opportunities]);

  // Puntos para las categorías (labels)
  const categoryPositions = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const numCategories = categories.length;
    const angleStep = (Math.PI * 2) / numCategories;
    const centerX = 150;
    const centerY = 150;
    const labelRadius = 140;

    return categories.map((cat, idx) => {
      const angle = angleStep * idx - Math.PI / 2;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      return { category: cat, x, y };
    });
  }, [categories]);

  if (!categories || categories.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-16 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-slate-400">No hay datos de Radar disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Radar de Alertas</CardTitle>
          <CardDescription>
            Análisis de riesgos y oportunidades en 5 dimensiones clave
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="flex items-center justify-center">
              <svg width="300" height="300" className="drop-shadow-xl">
                {/* Background circles */}
                {[20, 40, 60, 80, 100].map((percent) => (
                  <circle
                    key={percent}
                    cx="150"
                    cy="150"
                    r={(percent / 100) * 120}
                    fill="none"
                    stroke="rgb(71, 85, 105)"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}

                {/* Category lines */}
                {categoryPositions.map((pos, idx) => (
                  <line
                    key={idx}
                    x1="150"
                    y1="150"
                    x2={pos.x}
                    y2={pos.y}
                    stroke="rgb(71, 85, 105)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}

                {/* Data polygon */}
                <motion.polygon
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.6 }}
                  transition={{ duration: 0.8 }}
                  points={radarPoints}
                  fill="url(#radarGradient)"
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="2"
                />

                {/* Data points */}
                {radarPoints.split(' ').map((point, idx) => {
                  const [x, y] = point.split(',').map(Number);
                  return (
                    <motion.circle
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="rgb(168, 85, 247)"
                      className="drop-shadow-lg cursor-pointer hover:r-7 transition-all"
                    />
                  );
                })}

                {/* Category labels */}
                {categoryPositions.map((pos, idx) => (
                  <text
                    key={idx}
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-semibold fill-white"
                  >
                    {pos.category}
                  </text>
                ))}

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(236, 72, 153)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="text-3xl font-bold text-red-400">{risks.length}</div>
                  <div className="text-sm text-red-300">Riesgos Detectados</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-3xl font-bold text-green-400">{opportunities.length}</div>
                  <div className="text-sm text-green-300">Oportunidades</div>
                </div>
              </div>

              {/* Categories breakdown */}
              <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">Por Categoría</h4>
                {categories.map((cat) => {
                  const catRisks = risks.filter(r => r.category === cat).length;
                  const catOpps = opportunities.filter(o => o.category === cat).length;

                  return (
                    <div key={cat} className="bg-slate-700/50 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-medium">{cat}</span>
                        <div className="flex gap-2">
                          {catRisks > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {catRisks} riesgos
                            </Badge>
                          )}
                          {catOpps > 0 && (
                            <Badge className="bg-green-500 text-xs">
                              {catOpps} opps
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risks List */}
      {risks.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Riesgos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map((risk, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {risk.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {risk.severity || 'medium'}
                        </Badge>
                      </div>
                      <h4 className="text-white font-medium mb-1">{risk.title}</h4>
                      <p className="text-sm text-slate-300">{risk.description}</p>
                      {risk.recommendation && (
                        <div className="mt-2 text-sm text-red-300">
                          💡 {risk.recommendation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      {opportunities.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Oportunidades Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-green-500 text-xs">
                          {opp.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {opp.potential || 'high'}
                        </Badge>
                      </div>
                      <h4 className="text-white font-medium mb-1">{opp.title}</h4>
                      <p className="text-sm text-slate-300">{opp.description}</p>
                      {opp.action && (
                        <div className="mt-2 text-sm text-green-300">
                          🎯 {opp.action}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
