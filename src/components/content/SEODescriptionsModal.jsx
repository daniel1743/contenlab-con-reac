/**
 * 🔍 GENERADOR DE DESCRIPCIONES SEO
 * Modal para generar descripciones optimizadas para distintas plataformas
 * Usa geminiService para generar contenido optimizado
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Copy, Check, Youtube, Instagram, Hash } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/components/ui/use-toast';

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const SEODescriptionsModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form states
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [platform, setPlatform] = useState('youtube');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle('');
      setKeywords('');
      setPlatform('youtube');
      setGeneratedDescription(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    // Validación
    if (!title.trim() || !keywords.trim()) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa el título y las palabras clave',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generar descripción SEO con Gemini (15 créditos según feature_costs)
      const prompt = `
Actúa como un ESPECIALISTA EN SEO para ${platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : 'TikTok'}.

TÍTULO DEL VIDEO/POST: "${title}"
PALABRAS CLAVE: ${keywords}
PLATAFORMA: ${platform}

═══════════════════════════════════════════════════════════════
🎯 TAREA: GENERAR DESCRIPCIÓN SEO OPTIMIZADA
═══════════════════════════════════════════════════════════════

Genera una descripción profesional que incluya:

${platform === 'youtube' ? `
**PARA YOUTUBE:**
1. **Párrafo inicial (primeras 2-3 líneas):**
   - Hook que capture atención
   - Incluye palabra clave principal naturalmente
   - Máximo 150 caracteres (se muestra sin expandir)

2. **Desarrollo (4-6 líneas):**
   - Qué aprenderá el espectador
   - Beneficios específicos
   - Incluye palabras clave secundarias naturalmente

3. **Timestamps (si aplica):**
   - 00:00 Intro
   - [Genera 4-5 timestamps relevantes]

4. **Links y recursos:**
   - Sección de enlaces útiles
   - Redes sociales (placeholders)

5. **Hashtags (3-5):**
   - Mezcla de alto volumen y nicho
` : platform === 'instagram' ? `
**PARA INSTAGRAM:**
1. **Hook inicial (1-2 líneas):**
   - Pregunta o afirmación impactante
   - Emoji relevante al inicio

2. **Contenido principal (3-4 líneas):**
   - Valor del post
   - Call-to-action suave

3. **Separador visual:**
   - Línea de puntos o guiones

4. **Hashtags (15-20):**
   - Mezcla estratégica:
     * 3-5 de alto volumen (100K+ posts)
     * 5-7 de volumen medio (10K-100K)
     * 5-7 de nicho específico (1K-10K)

5. **Saltos de línea:**
   - Formato legible con espacios
` : `
**PARA TIKTOK:**
1. **Hook ultra-corto (1 línea):**
   - Máximo 100 caracteres
   - Incluye emoji relevante

2. **Descripción breve (1-2 líneas):**
   - Valor directo
   - CTA claro

3. **Hashtags (5-8):**
   - Trending + nicho específico
   - Incluye #FYP #ParaTi si aplica
`}

**REGLAS OBLIGATORIAS:**
- Incluye TODAS las palabras clave naturalmente
- NO fuerces keywords de forma artificial
- Usa tono ${platform === 'youtube' ? 'profesional pero accesible' : platform === 'instagram' ? 'casual y visual' : 'energético y directo'}
- Optimiza para SEO sin perder legibilidad humana
- Incluye emojis estratégicos (${platform === 'youtube' ? '2-3' : platform === 'instagram' ? '5-8' : '3-5'})

FORMATO: Responde con la descripción completa lista para copiar y pegar.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setGeneratedDescription(text);

      toast({
        title: '¡Descripción generada!',
        description: 'Tu descripción SEO está lista'
      });
    } catch (error) {
      console.error('Error generando descripción:', error);
      toast({
        title: 'Error al generar',
        description: 'No se pudo generar la descripción. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: 'Copiado',
        description: 'Descripción copiada al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar la descripción',
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
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Descripciones SEO Optimizadas</h2>
                <p className="text-sm text-gray-400">Genera descripciones para YouTube, Instagram y TikTok</p>
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
            {!generatedDescription ? (
              /* FORM */
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Título de tu contenido *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Cómo crear contenido viral en 2025 con IA"
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Palabras clave */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Palabras clave (separadas por comas) *
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Ej: contenido viral, inteligencia artificial, redes sociales, marketing digital"
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Plataforma */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Plataforma destino *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
                      { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
                      { value: 'tiktok', label: 'TikTok', icon: Hash, color: 'cyan' }
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPlatform(opt.value)}
                          className={`p-4 text-center border rounded-lg transition-all ${
                            platform === opt.value
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{opt.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !title.trim() || !keywords.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando descripción...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Generar Descripción SEO (15 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Descripción generada */}
                <div className="p-6 border border-purple-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Descripción Optimizada para {platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : 'TikTok'}</h3>
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
                          Copiar
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 overflow-auto text-sm text-gray-300 bg-gray-900 rounded-lg max-h-96">
                    <pre className="whitespace-pre-wrap font-sans">{generatedDescription}</pre>
                  </div>
                </div>

                {/* Tips de uso */}
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <h4 className="mb-2 font-semibold text-blue-300">💡 Tips de uso:</h4>
                  <ul className="space-y-1 text-sm text-gray-400">
                    {platform === 'youtube' && (
                      <>
                        <li>• Las primeras 150 caracteres son cruciales (se muestran sin expandir)</li>
                        <li>• Usa los timestamps para mejorar la navegación y el SEO</li>
                        <li>• Actualiza los links con tus propios enlaces</li>
                      </>
                    )}
                    {platform === 'instagram' && (
                      <>
                        <li>• Los primeros 125 caracteres se muestran antes del "...ver más"</li>
                        <li>• Usa saltos de línea para mejorar la legibilidad</li>
                        <li>• Los hashtags también funcionan en los comentarios</li>
                      </>
                    )}
                    {platform === 'tiktok' && (
                      <>
                        <li>• Máximo 150 caracteres para la descripción</li>
                        <li>• Los hashtags cuentan dentro del límite de caracteres</li>
                        <li>• Usa #FYP y #ParaTi para aumentar alcance</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Botón para generar otra */}
                <button
                  onClick={() => setGeneratedDescription(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Generar otra descripción
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SEODescriptionsModal;
