/**
 * 💡 Insight Card
 * Tarjeta de insight ejecutivo con información accionable
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const impactIcons = {
  high: '🔥',
  medium: '⚡',
  low: '💡',
};

const impactColors = {
  high: 'from-red-500 to-orange-500',
  medium: 'from-yellow-500 to-orange-500',
  low: 'from-blue-500 to-cyan-500',
};

const impactBadgeColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

export default function InsightCard({ insight = {} }) {
  const {
    title = 'Sin título',
    description = 'Sin descripción',
    impact = 'medium',
    actionable = '',
    category = '',
    metrics = {},
    recommendation = '',
  } = insight;

  const icon = impactIcons[impact] || '💡';
  const gradientColor = impactColors[impact] || impactColors.medium;
  const badgeColor = impactBadgeColors[impact] || impactBadgeColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="premium-card-hover bg-slate-800/50 border-slate-700 h-full">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-3xl">{icon}</div>
              <div>
                <h3 className="text-white font-semibold leading-tight">{title}</h3>
                {category && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {category}
                  </Badge>
                )}
              </div>
            </div>
            <Badge className={`${badgeColor} text-white text-xs`}>
              {impact === 'high' ? 'Alto Impacto' : impact === 'medium' ? 'Impacto Medio' : 'Bajo Impacto'}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-sm mb-3 leading-relaxed">
            {description}
          </p>

          {/* Metrics (si existen) */}
          {metrics && Object.keys(metrics).length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {Object.entries(metrics).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-slate-700/50 rounded-lg p-2 border border-slate-600"
                >
                  <div className="text-xs text-slate-400 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actionable */}
          {actionable && (
            <div className={`bg-gradient-to-r ${gradientColor} bg-opacity-10 border border-opacity-30 rounded-lg p-3 mb-3`}>
              <div className="text-xs font-semibold text-white mb-1">
                🎯 Acción Recomendada
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {actionable}
              </p>
            </div>
          )}

          {/* Recommendation */}
          {recommendation && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="text-xs font-semibold text-purple-300 mb-1">
                💡 Consejo
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {recommendation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
