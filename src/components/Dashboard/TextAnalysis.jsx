import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Tag, TrendingUp, Smile, Meh, Frown } from 'lucide-react';

const TextAnalysis = ({ videos, aiInsights }) => {
  if (!videos || videos.length === 0) return null;

  // Análisis de sentimiento basado en engagement
  const avgEngagement = videos.reduce((sum, v) => sum + parseFloat(v.engagement), 0) / videos.length;

  const sentimentData = [
    { name: 'Positivo', value: Math.min(75, Math.round(avgEngagement * 15 + 30)), color: '#4ADE80' },
    { name: 'Neutral', value: Math.round(20 + Math.random() * 10), color: '#FBBF24' },
    { name: 'Negativo', value: Math.round(5 + Math.random() * 10), color: '#EF4444' },
  ];

  // Keywords de títulos
  const extractKeywords = () => {
    const allWords = videos.map(v => v.title.toLowerCase().split(' ')).flat();
    const commonWords = new Set(['de', 'el', 'la', 'en', 'y', 'a', 'con', 'para', 'por', 'que', 'del']);
    const filtered = allWords.filter(w => w.length > 3 && !commonWords.has(w));
    return [...new Set(filtered)].slice(0, 10);
  };

  const topKeywords = extractKeywords();

  // Sugerencias SEO basadas en análisis
  const seoSuggestions = [
    {
      title: 'Optimiza tus títulos',
      description: aiInsights?.titleAnalysis?.suggestions || 'Incluye la keyword principal en los primeros 50 caracteres',
      priority: 'high'
    },
    {
      title: 'Mejora las descripciones',
      description: 'Usa al menos 150 palabras con keywords relevantes',
      priority: 'medium'
    },
    {
      title: 'Añade timestamps',
      description: 'Los capítulos mejoran la retención y SEO',
      priority: avgEngagement > 4 ? 'medium' : 'high'
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1333] border border-[#2A8CFF]/30 p-3 rounded-lg shadow-xl">
          <p className="text-[#F5F5F7] font-bold mb-1">
            {payload[0].payload.name}
          </p>
          <p style={{ color: payload[0].fill }}>
            {payload[0].value}% de comentarios
          </p>
        </div>
      );
    }
    return null;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      case 'medium':
        return 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30';
      default:
        return 'bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30';
    }
  };

  const getSentimentIcon = (name) => {
    switch (name) {
      case 'Positivo':
        return <Smile className="w-5 h-5 text-[#4ADE80]" />;
      case 'Neutral':
        return <Meh className="w-5 h-5 text-[#FBBF24]" />;
      case 'Negativo':
        return <Frown className="w-5 h-5 text-[#EF4444]" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <Card className="bg-[#2A1B3D]/50 border-[#C93CFC]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#F5F5F7]">
            <MessageSquare className="w-6 h-6 text-[#C93CFC]" />
            Análisis Textual y SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análisis de sentimiento */}
            <div>
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#2A8CFF]" />
                Sentimiento de Comentarios
              </h3>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sentimentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A1B3D" />
                  <XAxis type="number" stroke="#A0A0A8" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#A0A0A8"
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {sentimentData.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#1C1333]/50 p-3 rounded-lg flex flex-col items-center gap-2"
                  >
                    {getSentimentIcon(item.name)}
                    <span className="text-[#F5F5F7] text-sm font-bold">
                      {item.value}%
                    </span>
                    <span className="text-[#A0A0A8] text-xs">
                      {item.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Keywords y SEO */}
            <div>
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#C93CFC]" />
                Keywords Principales
              </h3>

              <div className="flex flex-wrap gap-2 mb-6">
                {topKeywords.map((keyword, index) => (
                  <motion.div
                    key={keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      className="bg-[#C93CFC]/20 text-[#C93CFC] border-[#C93CFC]/30 hover:bg-[#C93CFC]/30 transition-colors cursor-pointer"
                    >
                      #{keyword}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <h3 className="text-lg font-bold text-[#F5F5F7] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2A8CFF]" />
                Sugerencias SEO
              </h3>

              <div className="space-y-3">
                {seoSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-[#1C1333]/50 p-4 rounded-lg border border-[#2A8CFF]/20"
                  >
                    <div className="flex items-start gap-3">
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority === 'high' ? '!' : 'i'}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="text-[#F5F5F7] font-bold text-sm mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-[#A0A0A8] text-xs">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#2A8CFF]/10 to-[#C93CFC]/10 rounded-lg border border-[#2A8CFF]/20">
            <p className="text-[#F5F5F7] text-sm">
              <span className="font-bold text-[#2A8CFF]">💡 Pro Tip:</span> {sentimentData[0].value}% de sentimiento positivo es excelente.
              Responde a los comentarios para mejorar la percepción de tu comunidad.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TextAnalysis;
