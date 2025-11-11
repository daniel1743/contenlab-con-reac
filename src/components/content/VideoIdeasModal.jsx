/**
 * 💡 GENERADOR DE IDEAS DE VIDEOS
 * Modal para generar ideas de contenido viral basadas en tendencias
 * Usa trendService + geminiService para combinar trends actuales con creatividad IA
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Copy, Check, TrendingUp, Users, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/components/ui/use-toast';

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const VideoIdeasModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form states
  const [niche, setNiche] = useState('');
  const [audience, setAudience] = useState('');
  const [considerTrends, setConsiderTrends] = useState(true);

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setNiche('');
      setAudience('');
      setConsiderTrends(true);
      setGeneratedIdeas(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    // Validación
    if (!niche.trim() || !audience.trim()) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa el nicho y la audiencia',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generar ideas con Gemini (30 créditos según feature_costs)
      const prompt = `
Actúa como un EXPERTO EN CONTENIDO VIRAL y ESTRATEGA DE REDES SOCIALES.

NICHO: ${niche}
AUDIENCIA: ${audience}
CONSIDERAR TENDENCIAS ACTUALES: ${considerTrends ? 'Sí - Integra trends virales de 2025' : 'No - Ideas evergreen'}

═══════════════════════════════════════════════════════════════
🎯 TAREA: GENERAR 20 IDEAS DE VIDEOS CON POTENCIAL VIRAL
═══════════════════════════════════════════════════════════════

Para cada idea, proporciona:

**FORMATO DE CADA IDEA:**
---
**#[NÚMERO] - [TÍTULO GANCHO]**

📝 **Concepto**: [Explicación breve de qué trata el video]

🎯 **Por qué funciona**: [Razón psicológica/viral del concepto]

⚡ **Potencial Viral**: [Alto/Medio/Evergreen] - [Justificación corta]

🎬 **Hook sugerido**: "[Primera frase exacta para captar atención]"

📊 **Formato recomendado**: [Tipo de video: Tutorial/Storytelling/Reacción/Lista/Comparación/etc.]

⏱️ **Duración ideal**: [Corto (1-3min) / Medio (5-10min) / Largo (15+min)]

${considerTrends ? '🔥 **Trend aplicado**: [Si usa algún trend viral actual]' : ''}

---

**REGLAS OBLIGATORIAS:**
1. **Diversidad**: Mezcla formatos (tutoriales, listas, storytelling, comparaciones, reacciones)
2. **Viabilidad**: Ideas ejecutables sin presupuesto alto
3. **Originalidad**: Evita ideas genéricas, busca ángulos únicos
4. **Engagement**: Cada idea debe provocar comentarios/shares
5. **SEO**: Títulos optimizados para búsquedas
${considerTrends ? '6. **Tendencias 2025**: Integra al menos 8 ideas con trends actuales (IA, sostenibilidad, minimalismo, etc.)' : '6. **Evergreen**: Ideas atemporales con búsqueda constante'}

**DISTRIBUCIÓN SUGERIDA:**
- 5 ideas de **Alto Potencial Viral** (trends, polémicas suaves, hooks emocionales)
- 10 ideas de **Potencial Medio** (útiles, educativas, entretenidas)
- 5 ideas **Evergreen** (búsquedas constantes, siempre relevantes)

═══════════════════════════════════════════════════════════════

**IMPORTANTE**:
- Adapta todo al nicho: "${niche}"
- Piensa en la audiencia: "${audience}"
- Usa lenguaje natural y creativo
- Prioriza ideas que generen debate/compartidos

Genera las 20 ideas ahora:
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setGeneratedIdeas(text);

      toast({
        title: '¡Ideas generadas!',
        description: '20 ideas de videos listas para crear contenido viral'
      });
    } catch (error) {
      console.error('Error generando ideas:', error);
      toast({
        title: 'Error al generar',
        description: 'No se pudieron generar las ideas. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedIdeas);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: 'Copiado',
        description: 'Ideas copiadas al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudieron copiar las ideas',
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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador de Ideas de Videos</h2>
                <p className="text-sm text-gray-400">20 ideas virales personalizadas para tu nicho</p>
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
            {!generatedIdeas ? (
              /* FORM */
              <div className="space-y-6">
                {/* Nicho */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Nicho o temática *
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ej: Tecnología e inteligencia artificial, Cocina vegana, Fitness en casa"
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Sé específico sobre tu nicho para obtener ideas más relevantes
                  </p>
                </div>

                {/* Audiencia */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Audiencia objetivo *
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Ej: Millennials interesados en tecnología, Madres emprendedoras, Jóvenes 18-25 años"
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Define quién es tu público para generar ideas que conecten
                  </p>
                </div>

                {/* Considerar tendencias */}
                <div className="p-4 border border-purple-500/30 rounded-lg bg-gray-800/30">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={considerTrends}
                      onChange={(e) => setConsiderTrends(e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-white">Considerar tendencias actuales 2025</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        Incluye ideas basadas en trends virales actuales (IA, sostenibilidad, etc.)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Info adicional */}
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-blue-300">Qué recibirás:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• 20 ideas de videos únicas y personalizadas</li>
                        <li>• Análisis de potencial viral para cada idea</li>
                        <li>• Hooks sugeridos para captar atención</li>
                        <li>• Formato y duración recomendada</li>
                        <li>• Mezcla de ideas virales y evergreen</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !niche.trim() || !audience.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando ideas...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="w-5 h-5" />
                      Generar 20 Ideas de Videos (30 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Ideas generadas */}
                <div className="p-6 border border-purple-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">💡 20 Ideas de Videos</h3>
                      <span className="px-3 py-1 text-xs font-medium text-purple-300 bg-purple-600/20 rounded-full">
                        Personalizadas para {niche}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Todo
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 overflow-auto text-sm text-gray-300 bg-gray-900 rounded-lg max-h-96">
                    <pre className="whitespace-pre-wrap font-sans">{generatedIdeas}</pre>
                  </div>
                </div>

                {/* Tips de implementación */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-green-500/30 rounded-lg bg-green-900/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <h4 className="font-semibold text-green-300">Prioriza las virales</h4>
                    </div>
                    <p className="text-xs text-gray-400">Comienza por las ideas marcadas como "Alto Potencial Viral" para ganar tracción rápido</p>
                  </div>

                  <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <h4 className="font-semibold text-blue-300">Mezcla formatos</h4>
                    </div>
                    <p className="text-xs text-gray-400">Alterna entre tutoriales, listas, storytelling y reacciones para mantener variedad</p>
                  </div>
                </div>

                {/* Botón para generar otras */}
                <button
                  onClick={() => setGeneratedIdeas(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Generar otras ideas
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoIdeasModal;
