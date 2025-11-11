/**
 * ✍️ CAPTIONS OPTIMIZADOS
 * Modal para generar captions optimizados para redes sociales
 * Usa Gemini 2.0 Flash para crear textos persuasivos y atractivos
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Copy, Check, Sparkles, Hash, TrendingUp } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/components/ui/use-toast';

const CaptionsOptimizerModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form states
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [goal, setGoal] = useState('engagement');
  const [tone, setTone] = useState('amigable');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState(null);

  // Copy state
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setContent('');
      setPlatform('instagram');
      setGoal('engagement');
      setTone('amigable');
      setGeneratedCaptions(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    // Validación
    if (!content.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor describe el contenido de tu post',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const platformSpecs = {
        instagram: {
          maxLength: 2200,
          features: 'hashtags, emojis, line breaks, CTAs visuales',
          bestPractices: 'Primeras 2 líneas son cruciales (se ven sin "ver más"), usa emojis estratégicamente'
        },
        facebook: {
          maxLength: 63206,
          features: 'links visibles, preguntas para comentarios',
          bestPractices: 'Fomenta conversación, haz preguntas, usa storytelling'
        },
        twitter: {
          maxLength: 280,
          features: 'brevedad, hashtags (máx 2), threads',
          bestPractices: 'Impacto en primeras palabras, usa threads para más contexto'
        },
        linkedin: {
          maxLength: 3000,
          features: 'profesionalismo, insights de industria',
          bestPractices: 'Primeras 2 líneas visibles, comparte valor profesional, usa storytelling profesional'
        },
        tiktok: {
          maxLength: 2200,
          features: 'hashtags, trends, CTAs a video',
          bestPractices: 'Corto y directo, usa trending sounds/hashtags, invita a ver el video'
        }
      };

      const goalSpecs = {
        engagement: 'Maximizar likes, comentarios y shares. Usa preguntas, CTAs, contenido relatable',
        conversion: 'Dirigir a acción específica (link, compra, registro). Usa urgencia, beneficios claros',
        awareness: 'Aumentar alcance y visibilidad. Contenido shareable, educativo, inspirador',
        community: 'Fomentar conversación y conexión. Preguntas abiertas, experiencias compartidas'
      };

      const prompt = `
Actúa como un COPYWRITER EXPERTO EN REDES SOCIALES especializado en ${platform.toUpperCase()}.

📝 CONTENIDO: "${content}"
📱 PLATAFORMA: ${platform}
🎯 OBJETIVO: ${goal}
🎭 TONO: ${tone}

**ESPECIFICACIONES DE ${platform.toUpperCase()}:**
- Máximo ${platformSpecs[platform].maxLength} caracteres
- Features: ${platformSpecs[platform].features}
- Best practices: ${platformSpecs[platform].bestPractices}

**OBJETIVO (${goal}):**
${goalSpecs[goal]}

🎯 TAREA: CREAR 3 VARIANTES DE CAPTION OPTIMIZADAS

Genera 3 versiones diferentes del caption, cada una con un enfoque distinto:

**VARIANTE 1: DIRECTA**
- Entra directo al punto
- CTA claro al inicio o final
- Estructura simple y efectiva

**VARIANTE 2: STORYTELLING**
- Comienza con una historia o contexto
- Conecta emocionalmente
- Revela valor gradualmente

**VARIANTE 3: PREGUNTA/ENGAGEMENT**
- Comienza con pregunta provocativa
- Invita a la participación activa
- Fomenta comentarios y shares

**REGLAS PARA TODOS:**
1. PRIMERAS 2 LÍNEAS DEBEN SER IMPACTANTES (se ven sin expandir)
2. Usa emojis estratégicamente (no abuses)
3. Incluye espacios en blanco para legibilidad
4. ${goal === 'conversion' ? 'CTA claro y directo' : goal === 'engagement' ? 'Termina con pregunta o invitación' : 'Contenido shareable'}
5. Tono: ${tone}
6. Hashtags relevantes (cantidad apropiada para ${platform})

**FORMATO DE SALIDA:**
Devuelve SOLO un JSON con esta estructura:
\`\`\`json
{
  "captions": [
    {
      "variant": "Directa",
      "text": "Caption aquí con\n\nsaltos de línea apropiados...",
      "hashtags": ["#Hashtag1", "#Hashtag2"],
      "characterCount": 150,
      "strengths": ["Punto fuerte 1", "Punto fuerte 2"],
      "bestFor": "Cuándo usar esta variante"
    },
    {
      "variant": "Storytelling",
      "text": "Caption aquí...",
      "hashtags": ["#Hashtag1", "#Hashtag2"],
      "characterCount": 200,
      "strengths": ["Punto fuerte 1", "Punto fuerte 2"],
      "bestFor": "Cuándo usar esta variante"
    },
    {
      "variant": "Pregunta/Engagement",
      "text": "Caption aquí...",
      "hashtags": ["#Hashtag1", "#Hashtag2"],
      "characterCount": 180,
      "strengths": ["Punto fuerte 1", "Punto fuerte 2"],
      "bestFor": "Cuándo usar esta variante"
    }
  ],
  "platformTips": [
    "Tip específico 1 para ${platform}",
    "Tip específico 2 para ${platform}",
    "Tip específico 3 para ${platform}"
  ],
  "bestTimeToPost": "Horario recomendado según plataforma y audiencia"
}
\`\`\`

NO incluyas ningún texto adicional fuera del JSON.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON
      let parsedCaptions;
      try {
        // Extraer JSON del markdown si está presente
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        parsedCaptions = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('No se pudieron generar los captions correctamente');
      }

      setGeneratedCaptions(parsedCaptions);

      toast({
        title: '✅ Captions generados',
        description: `${parsedCaptions.captions.length} variantes listas para usar`
      });

      // TODO: Implementar consumo de créditos con sistema de la aplicación
    } catch (error) {
      console.error('Error generando captions:', error);
      toast({
        title: 'Error al generar',
        description: error.message || 'No se pudieron generar los captions. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = async (caption, index) => {
    try {
      const fullText = `${caption.text}\n\n${caption.hashtags.join(' ')}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);

      toast({
        title: 'Caption copiado',
        description: 'Caption con hashtags copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el caption',
        variant: 'destructive'
      });
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Captions Optimizados</h2>
                <p className="text-sm text-gray-400">Textos perfectos para cada red social</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
            {!generatedCaptions ? (
              /* FORM */
              <div className="space-y-6">
                {/* Contenido */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Describe tu contenido *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ej: Anuncio de nuevo producto, tips de productividad, foto de viaje, resultado de cliente..."
                    rows={4}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plataforma */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Plataforma *
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>

                  {/* Objetivo */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Objetivo *
                    </label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="engagement">Engagement / Interacción</option>
                      <option value="conversion">Conversión / Ventas</option>
                      <option value="awareness">Awareness / Alcance</option>
                      <option value="community">Community / Comunidad</option>
                    </select>
                  </div>
                </div>

                {/* Tono */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tono del mensaje *
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="amigable">Amigable / Cercano</option>
                    <option value="profesional">Profesional</option>
                    <option value="motivacional">Motivacional / Inspirador</option>
                    <option value="casual">Casual / Relajado</option>
                    <option value="urgente">Urgente / Directo</option>
                    <option value="educativo">Educativo / Informativo</option>
                  </select>
                </div>

                {/* Info */}
                <div className="p-4 border border-indigo-500/30 rounded-lg bg-indigo-900/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-indigo-300">Qué generaremos:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• 3 variantes optimizadas del caption</li>
                        <li>• Hashtags estratégicos por variante</li>
                        <li>• Análisis de fortalezas de cada versión</li>
                        <li>• Tips específicos para la plataforma</li>
                        <li>• Mejor horario para publicar</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !content.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando captions...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      Generar Captions (15 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Header de resultados */}
                <div className="p-4 border border-purple-500/30 rounded-lg bg-gray-800/50">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {generatedCaptions.captions.length} Captions para {platform}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Objetivo: {goal} • Tono: {tone}
                  </p>
                </div>

                {/* Lista de captions */}
                <div className="space-y-5">
                  {generatedCaptions.captions.map((caption, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 border border-purple-500/30 rounded-xl bg-gray-800/50"
                    >
                      {/* Header del caption */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">
                            {caption.variant}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {caption.characterCount} caracteres
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyCaption(caption, index)}
                          className="p-2 text-gray-400 transition-colors rounded hover:bg-gray-700 hover:text-white"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Texto del caption */}
                      <div className="p-4 mb-4 rounded-lg bg-gray-900/50">
                        <p className="text-white whitespace-pre-wrap leading-relaxed">
                          {caption.text}
                        </p>
                      </div>

                      {/* Hashtags */}
                      {caption.hashtags && caption.hashtags.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-400 mb-2">Hashtags:</p>
                          <div className="flex flex-wrap gap-2">
                            {caption.hashtags.map((hashtag, hIndex) => (
                              <span
                                key={hIndex}
                                className="px-2 py-1 text-xs font-medium text-purple-300 bg-purple-600/20 rounded"
                              >
                                {hashtag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fortalezas */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-green-400 mb-2">✓ Fortalezas:</p>
                        <ul className="space-y-1">
                          {caption.strengths.map((strength, sIndex) => (
                            <li key={sIndex} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Best for */}
                      <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
                        <p className="text-xs font-semibold text-blue-400 mb-1">Cuándo usar:</p>
                        <p className="text-sm text-gray-300">{caption.bestFor}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Tips de plataforma */}
                {generatedCaptions.platformTips && generatedCaptions.platformTips.length > 0 && (
                  <div className="p-5 border border-yellow-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-white">
                      <TrendingUp className="w-5 h-5 text-yellow-400" />
                      Tips para {platform}
                    </h3>
                    <ul className="space-y-2">
                      {generatedCaptions.platformTips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mejor hora */}
                {generatedCaptions.bestTimeToPost && (
                  <div className="p-4 border border-indigo-500/30 rounded-lg bg-indigo-900/10">
                    <p className="text-sm">
                      <span className="font-semibold text-indigo-400">⏰ Mejor hora para publicar: </span>
                      <span className="text-gray-300">{generatedCaptions.bestTimeToPost}</span>
                    </p>
                  </div>
                )}

                {/* Botón para nuevos captions */}
                <button
                  onClick={() => setGeneratedCaptions(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Generar Nuevos Captions
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CaptionsOptimizerModal;
