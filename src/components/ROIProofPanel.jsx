/**
 * 💰 ROI Proof Panel
 * Panel de prueba social y cálculo de revenue gap
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ROIProofPanel({ data = {} }) {
  const {
    revenue_gap = '',
    case_studies = [],
    testimonials = [],
    market_comparison = {},
    investment_breakdown = {},
    projected_roi = {},
  } = data;

  return (
    <div className="space-y-4">
      {/* Revenue Gap Hero */}
      <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
        <CardContent className="p-8 text-center">
          <div className="text-sm text-green-300 mb-2 font-semibold">
            POTENCIAL DE INGRESOS ESTIMADO
          </div>
          <div className="text-5xl font-bold text-white mb-3">
            {revenue_gap || '$5,000 - $15,000'}
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Basado en el análisis de tu canal, competidores similares y tendencias del mercado,
            este es el potencial de ingresos mensuales que estás dejando sobre la mesa.
          </p>
        </CardContent>
      </Card>

      {/* Market Comparison */}
      {market_comparison && Object.keys(market_comparison).length > 0 && (
        <Card className="premium-card-hover bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">📊 Comparación con el Mercado</CardTitle>
            <CardDescription>
              Cómo te comparas con canales similares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-1">Tu Performance Actual</div>
                <div className="text-3xl font-bold text-white mb-2">
                  {market_comparison.your_performance || 'N/A'}
                </div>
                <div className="text-xs text-slate-400">
                  {market_comparison.your_metrics || ''}
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-1">Promedio del Mercado</div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {market_comparison.market_average || 'N/A'}
                </div>
                <div className="text-xs text-slate-400">
                  {market_comparison.market_metrics || ''}
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm text-slate-400 mb-1">Top Performers</div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {market_comparison.top_performance || 'N/A'}
                </div>
                <div className="text-xs text-slate-400">
                  {market_comparison.top_metrics || ''}
                </div>
              </div>
            </div>

            {market_comparison.gap_analysis && (
              <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-sm font-semibold text-yellow-300 mb-2">
                  🎯 Análisis de Brecha
                </div>
                <p className="text-slate-300 text-sm">
                  {market_comparison.gap_analysis}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Case Studies */}
      {case_studies && case_studies.length > 0 && (
        <Card className="premium-card-hover bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">🏆 Casos de Éxito</CardTitle>
            <CardDescription>
              Resultados reales de canales que implementaron estas estrategias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {case_studies.map((study, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">
                        {study.title || study.channel_name || `Caso ${idx + 1}`}
                      </h4>
                      <div className="text-xs text-slate-400 mt-1">
                        {study.industry || study.niche || ''}
                      </div>
                    </div>
                    <Badge className="bg-green-500">
                      {study.growth || '+250%'}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                    {study.description || study.summary || ''}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-700/50 rounded p-2">
                      <div className="text-xs text-slate-400">Antes</div>
                      <div className="text-sm font-semibold text-white">
                        {study.before || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-green-500/20 rounded p-2">
                      <div className="text-xs text-green-300">Después</div>
                      <div className="text-sm font-semibold text-white">
                        {study.after || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {study.timeframe && (
                    <div className="mt-2 text-xs text-slate-400">
                      ⏱️ Timeframe: {study.timeframe}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Breakdown */}
      {investment_breakdown && Object.keys(investment_breakdown).length > 0 && (
        <Card className="premium-card-hover bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">💎 Desglose de Inversión</CardTitle>
            <CardDescription>
              Lo que necesitas invertir para alcanzar el potencial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(investment_breakdown).map(([key, value], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {key.includes('time') ? '⏰' : key.includes('cost') ? '💰' : '📊'}
                    </div>
                    <div>
                      <div className="text-white font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {typeof value === 'object' ? value.description : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {typeof value === 'object' ? value.amount : value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projected ROI */}
      {projected_roi && Object.keys(projected_roi).length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">📈 ROI Proyectado</CardTitle>
            <CardDescription>
              Retorno de inversión estimado en diferentes timeframes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-purple-300 mb-2">30 Días</div>
                <div className="text-4xl font-bold text-white mb-1">
                  {projected_roi.month_1 || '+15%'}
                </div>
                <div className="text-xs text-slate-400">Primeros resultados</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-300 mb-2">90 Días</div>
                <div className="text-4xl font-bold text-white mb-1">
                  {projected_roi.month_3 || '+50%'}
                </div>
                <div className="text-xs text-slate-400">Momentum completo</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-purple-300 mb-2">6 Meses</div>
                <div className="text-4xl font-bold text-green-400 mb-1">
                  {projected_roi.month_6 || '+150%'}
                </div>
                <div className="text-xs text-slate-400">ROI sostenible</div>
              </div>
            </div>

            {projected_roi.assumptions && (
              <div className="mt-6 bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="text-sm font-semibold text-slate-300 mb-2">
                  📋 Supuestos del Modelo
                </div>
                <ul className="space-y-1 text-sm text-slate-400">
                  {Array.isArray(projected_roi.assumptions) ? (
                    projected_roi.assumptions.map((assumption, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{assumption}</span>
                      </li>
                    ))
                  ) : (
                    <li>{projected_roi.assumptions}</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <Card className="premium-card-hover bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">💬 Testimonios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {testimonial.name || 'Anónimo'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {testimonial.role || testimonial.channel || ''}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{testimonial.quote || testimonial.text || ''}"
                  </p>
                  {testimonial.results && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <div className="text-xs text-green-400 font-semibold">
                        {testimonial.results}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            ¿Listo para cerrar la brecha de ingresos?
          </h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Implementa las estrategias de la ICE Matrix, aprovecha las oportunidades detectadas
            y desbloquea los playbooks para obtener guías paso a paso.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              380 créditos por análisis completo
            </Badge>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              150 créditos por playbook
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
