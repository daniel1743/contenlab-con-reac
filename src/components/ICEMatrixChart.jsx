/**
 * 📊 ICE Matrix Chart
 * Visualización de tareas priorizadas por Impact-Confidence-Ease
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ICEMatrixChart({ data = [] }) {
  // Calcular rangos para normalización
  const ranges = useMemo(() => {
    if (!data || data.length === 0) return { maxImpact: 10, maxConfidence: 10, maxEase: 10 };

    return {
      maxImpact: Math.max(...data.map(d => d.impact), 10),
      maxConfidence: Math.max(...data.map(d => d.confidence), 10),
      maxEase: Math.max(...data.map(d => d.ease), 10),
    };
  }, [data]);

  // Ordenar por ICE score
  const sortedData = useMemo(() => {
    return [...(data || [])].sort((a, b) => b.ice_score - a.ice_score);
  }, [data]);

  // Obtener color según score
  const getScoreColor = (score) => {
    if (score >= 500) return 'from-green-500 to-emerald-600';
    if (score >= 300) return 'from-blue-500 to-cyan-600';
    if (score >= 150) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getPriorityBadge = (score) => {
    if (score >= 500) return { label: 'Alta Prioridad', variant: 'default', className: 'bg-green-500' };
    if (score >= 300) return { label: 'Media Alta', variant: 'default', className: 'bg-blue-500' };
    if (score >= 150) return { label: 'Media', variant: 'default', className: 'bg-yellow-500' };
    return { label: 'Baja', variant: 'default', className: 'bg-red-500' };
  };

  if (!data || data.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-16 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-slate-400">No hay datos de ICE Matrix disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">ICE Matrix - Priorización de Tareas</CardTitle>
          <CardDescription>
            Impact × Confidence × Ease = ICE Score | Mayor score = Mayor prioridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Scatter Plot Visual */}
          <div className="relative h-96 bg-slate-900/50 rounded-lg p-4 mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Grid background */}
              <div className="absolute inset-4">
                {/* Vertical lines */}
                {[0, 25, 50, 75, 100].map((x) => (
                  <div
                    key={`v-${x}`}
                    className="absolute h-full border-l border-slate-700/50"
                    style={{ left: `${x}%` }}
                  />
                ))}
                {/* Horizontal lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <div
                    key={`h-${y}`}
                    className="absolute w-full border-t border-slate-700/50"
                    style={{ top: `${y}%` }}
                  />
                ))}
              </div>

              {/* Axis labels */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-slate-400 text-xs">
                Ease (Facilidad) →
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-slate-400 text-xs">
                Impact (Impacto) →
              </div>

              {/* Data points */}
              <div className="absolute inset-4">
                {sortedData.slice(0, 15).map((task, idx) => {
                  const x = (task.ease / ranges.maxEase) * 100;
                  const y = 100 - (task.impact / ranges.maxImpact) * 100;
                  const size = Math.max(8, Math.min(40, task.confidence * 3));

                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${getScoreColor(task.ice_score)} cursor-pointer hover:opacity-100 hover:scale-110 transition-all group`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                      }}
                      title={task.task}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
                          <div className="font-semibold text-white">{task.task}</div>
                          <div className="text-slate-400 mt-1">
                            ICE Score: {task.ice_score}
                          </div>
                          <div className="text-slate-400">
                            I:{task.impact} C:{task.confidence} E:{task.ease}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600" />
              <span>Alta (500+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600" />
              <span>Media Alta (300-499)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600" />
              <span>Media (150-299)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-pink-600" />
              <span>Baja (&lt;150)</span>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {sortedData.map((task, idx) => {
              const priority = getPriorityBadge(task.ice_score);

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-white">
                          #{idx + 1}
                        </span>
                        <h3 className="text-white font-medium">{task.task}</h3>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{task.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge className={priority.className}>
                        {priority.label}
                      </Badge>
                      <div className="text-2xl font-bold text-white">
                        {task.ice_score}
                      </div>
                    </div>
                  </div>

                  {/* Metrics bars */}
                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Impact: {task.impact}</div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(task.impact / 10) * 100}%` }}
                          transition={{ delay: idx * 0.05 + 0.2 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Confidence: {task.confidence}</div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(task.confidence / 10) * 100}%` }}
                          transition={{ delay: idx * 0.05 + 0.3 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Ease: {task.ease}</div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(task.ease / 10) * 100}%` }}
                          transition={{ delay: idx * 0.05 + 0.4 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ROI estimate */}
                  {task.estimated_roi && (
                    <div className="text-sm text-emerald-400 font-medium">
                      💰 ROI Estimado: {task.estimated_roi}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
