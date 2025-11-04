import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target
} from 'lucide-react';

const AIAnalysisPanel = ({ aiInsights }) => {
  if (!aiInsights) return null;

  const { score, strengths, improvements, recommendations, nextSteps } = aiInsights;

  // Determinar color del score
  const getScoreColor = (score) => {
    if (score >= 80) return '#4ADE80';
    if (score >= 60) return '#FBBF24';
    return '#EF4444';
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-[#2A1B3D] to-[#1E2A4A] border-[#2A8CFF]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#F5F5F7]">
            <Sparkles className="w-6 h-6 text-[#2A8CFF]" />
            Análisis IA de tu contenido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lo que estás haciendo bien */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />
                <h3 className="text-lg font-bold text-[#F5F5F7]">
                  Lo que estás haciendo bien
                </h3>
              </div>
              {strengths?.map((point, index) => (
                <motion.div
                  key={index}
                  variants={itemVariant}
                  className="flex items-start gap-2"
                >
                  <Badge className="bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30">
                    ✓
                  </Badge>
                  <p className="text-[#F5F5F7] text-sm flex-1">{point}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Lo que podrías mejorar */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#FBBF24]" />
                <h3 className="text-lg font-bold text-[#F5F5F7]">
                  Lo que podrías mejorar
                </h3>
              </div>
              {improvements?.map((point, index) => (
                <motion.div
                  key={index}
                  variants={itemVariant}
                  className="flex items-start gap-2"
                >
                  <Badge className="bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30">
                    !
                  </Badge>
                  <p className="text-[#F5F5F7] text-sm flex-1">{point}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Sugerencias de próximos pasos */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-[#C93CFC]" />
                <h3 className="text-lg font-bold text-[#F5F5F7]">
                  Próximos pasos
                </h3>
              </div>
              {nextSteps?.map((point, index) => (
                <motion.div
                  key={index}
                  variants={itemVariant}
                  className="flex items-start gap-2"
                >
                  <Badge className="bg-[#C93CFC]/20 text-[#C93CFC] border-[#C93CFC]/30">
                    {index + 1}
                  </Badge>
                  <p className="text-[#F5F5F7] text-sm flex-1">{point}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Recomendaciones detalladas */}
          {recommendations && recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-4">
                Recomendaciones Prioritarias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-[#1C1333]/50 p-4 rounded-lg border border-[#2A8CFF]/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-[#F5F5F7] font-bold text-sm">{rec.title}</h4>
                      <Badge className={
                        rec.priority === 'alta'
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
                          : rec.priority === 'media'
                          ? 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30'
                          : 'bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30'
                      }>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-[#A0A0A8] text-xs mb-2">{rec.description}</p>
                    <p className="text-[#2A8CFF] text-xs font-bold">
                      Impacto: {rec.impact}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Puntaje de impacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 p-6 bg-[#1C1333]/50 rounded-lg border border-[#2A8CFF]/20"
          >
            <Target className="w-8 h-8 text-[#2A8CFF]" />
            <div className="text-center">
              <p className="text-[#A0A0A8] text-sm mb-1">
                Puntaje de Impacto General
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-5xl font-bold"
                  style={{ color: getScoreColor(score) }}
                >
                  {score}
                </span>
                <span className="text-2xl text-[#A0A0A8]">/100</span>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AIAnalysisPanel;
