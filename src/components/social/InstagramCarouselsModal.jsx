/**
 * 📸 CARRUSELES INSTAGRAM
 * Modal para generar contenido de carruseles para Instagram
 * Usa Gemini 2.0 Flash para crear slides educativos y visuales
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Copy, Check, Image, ChevronRight, Sparkles } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/components/ui/use-toast';

const InstagramCarouselsModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form states
  const [topic, setTopic] = useState('');
  const [carouselType, setCarouselType] = useState('educativo');
  const [slideCount, setSlideCount] = useState('8');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCarousel, setGeneratedCarousel] = useState(null);

  // Preview state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Copy state
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTopic('');
      setCarouselType('educativo');
      setSlideCount('8');
      setGeneratedCarousel(null);
      setCurrentSlide(0);
    }
  }, [open]);

  const handleGenerate = async () => {
    // Validación
    if (!topic.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor ingresa el tema del carrusel',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `
Actúa como un DISEÑADOR GRÁFICO y EXPERTO EN CONTENIDO para INSTAGRAM.

📝 TEMA: "${topic}"
🎨 TIPO: ${carouselType}
📊 CANTIDAD DE SLIDES: ${slideCount}

🎯 TAREA: CREAR UN CARRUSEL PROFESIONAL Y ATRACTIVO

**ESTRUCTURA DEL CARRUSEL:**

1. **Slide 1 (Portada):**
   - Título impactante y corto (máx. 6 palabras)
   - Subtítulo opcional (máx. 8 palabras)
   - Sugerencia de diseño visual
   - Colores recomendados

2. **Slides intermedios (${slideCount - 2}):**
   - Cada slide debe tener un concepto único
   - Título/encabezado del slide (máx. 5 palabras)
   - Contenido principal (2-4 bullets o párrafo corto)
   - Sugerencias visuales (iconos, gráficos, fotos)
   - Esquema de colores

3. **Slide final (CTA):**
   - Mensaje de cierre
   - Llamado a la acción claro
   - Invitación a interactuar (likes, shares, guardar)

**TIPOS DE CARRUSEL:**
${carouselType === 'educativo' ? `
- EDUCATIVO: Enseña algo paso a paso
- Usa bullets, números, listas
- Foco en claridad y valor` : ''}
${carouselType === 'tips' ? `
- TIPS: Consejos accionables
- Un tip por slide
- Formato: "Tip #X: [título]"` : ''}
${carouselType === 'inspiracional' ? `
- INSPIRACIONAL: Frases motivadoras
- Quotes visuales
- Mensajes empoderadores` : ''}
${carouselType === 'storytelling' ? `
- STORYTELLING: Cuenta una historia
- Secuencia narrativa
- Emoción y conexión` : ''}

**REGLAS:**
- Textos concisos y visuales
- Máximo 30 palabras por slide
- Usa emojis estratégicamente
- Sugiere elementos visuales específicos
- Paleta de colores coherente

**FORMATO DE SALIDA:**
Devuelve SOLO un JSON con esta estructura:
\`\`\`json
{
  "title": "Título del carrusel",
  "description": "Descripción breve",
  "slides": [
    {
      "number": 1,
      "type": "cover",
      "title": "Título principal",
      "subtitle": "Subtítulo opcional",
      "content": "Contenido del slide",
      "visualSuggestion": "Descripción de qué imagen/gráfico usar",
      "colors": ["#HEX1", "#HEX2"],
      "designNotes": "Notas adicionales de diseño"
    },
    ...
  ],
  "hashtags": ["#Hashtag1", "#Hashtag2", ...],
  "captionSuggestion": "Sugerencia de caption para el post"
}
\`\`\`

NO incluyas ningún texto adicional fuera del JSON.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON
      let parsedCarousel;
      try {
        // Extraer JSON del markdown si está presente
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        parsedCarousel = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('No se pudo generar el carrusel correctamente');
      }

      setGeneratedCarousel(parsedCarousel);
      setCurrentSlide(0);

      toast({
        title: '✅ Carrusel generado',
        description: `${parsedCarousel.slides.length} slides listos para diseñar`
      });

      // TODO: Implementar consumo de créditos con sistema de la aplicación
    } catch (error) {
      console.error('Error generando carrusel:', error);
      toast({
        title: 'Error al generar',
        description: error.message || 'No se pudo generar el carrusel. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySlide = async (slide, index) => {
    try {
      const slideText = `
SLIDE ${slide.number}
Título: ${slide.title}
${slide.subtitle ? `Subtítulo: ${slide.subtitle}` : ''}
Contenido: ${slide.content}
Visual: ${slide.visualSuggestion}
Colores: ${slide.colors.join(', ')}
${slide.designNotes ? `Notas: ${slide.designNotes}` : ''}
`.trim();

      await navigator.clipboard.writeText(slideText);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);

      toast({
        title: 'Slide copiado',
        description: 'Contenido del slide copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el slide',
        variant: 'destructive'
      });
    }
  };

  const handleCopyAll = async () => {
    try {
      const allSlides = generatedCarousel.slides
        .map((slide) => `
SLIDE ${slide.number}
Título: ${slide.title}
${slide.subtitle ? `Subtítulo: ${slide.subtitle}` : ''}
Contenido: ${slide.content}
Visual: ${slide.visualSuggestion}
Colores: ${slide.colors.join(', ')}
${slide.designNotes ? `Notas: ${slide.designNotes}` : ''}
---
`.trim())
        .join('\n\n');

      const fullText = `
${generatedCarousel.title}
${generatedCarousel.description}

${allSlides}

CAPTION SUGERIDO:
${generatedCarousel.captionSuggestion}

HASHTAGS:
${generatedCarousel.hashtags.join(' ')}
`.trim();

      await navigator.clipboard.writeText(fullText);

      toast({
        title: 'Carrusel completo copiado',
        description: 'Todo el contenido ha sido copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el carrusel completo',
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
              <div className="p-2 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Carruseles Instagram</h2>
                <p className="text-sm text-gray-400">Genera contenido visual profesional</p>
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
            {!generatedCarousel ? (
              /* FORM */
              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tema del carrusel *
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: 10 consejos para mejorar tu productividad diaria..."
                    rows={3}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>

                {/* Tipo de carrusel */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tipo de carrusel *
                  </label>
                  <select
                    value={carouselType}
                    onChange={(e) => setCarouselType(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="educativo">Educativo / Tutorial</option>
                    <option value="tips">Tips / Consejos</option>
                    <option value="inspiracional">Inspiracional / Motivacional</option>
                    <option value="storytelling">Storytelling / Historia</option>
                  </select>
                </div>

                {/* Cantidad de slides */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Cantidad de slides *
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="5">5 slides</option>
                    <option value="6">6 slides</option>
                    <option value="7">7 slides</option>
                    <option value="8">8 slides</option>
                    <option value="10">10 slides</option>
                  </select>
                </div>

                {/* Info */}
                <div className="p-4 border border-pink-500/30 rounded-lg bg-pink-900/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-pink-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-pink-300">Qué generaremos:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Slide de portada atractiva</li>
                        <li>• Contenido estructurado por slide</li>
                        <li>• Sugerencias visuales y colores</li>
                        <li>• Caption optimizado</li>
                        <li>• Hashtags relevantes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando carrusel...
                    </>
                  ) : (
                    <>
                      <Instagram className="w-5 h-5" />
                      Generar Carrusel (25 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Header de resultados */}
                <div className="p-5 border border-purple-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {generatedCarousel.title}
                      </h3>
                      <p className="text-sm text-gray-400">{generatedCarousel.description}</p>
                    </div>
                    <button
                      onClick={handleCopyAll}
                      className="px-4 py-2 text-sm font-medium text-white transition-colors bg-pink-600 rounded-lg hover:bg-pink-700"
                    >
                      <Copy className="inline w-4 h-4 mr-2" />
                      Copiar Todo
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {generatedCarousel.slides.length} slides • Slide actual: {currentSlide + 1}
                  </div>
                </div>

                {/* Navegación de slides */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="p-2 text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 transform rotate-180" />
                  </button>
                  <div className="flex-1 flex gap-2 overflow-x-auto">
                    {generatedCarousel.slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                          currentSlide === index
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentSlide(Math.min(generatedCarousel.slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === generatedCarousel.slides.length - 1}
                    className="p-2 text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Slide actual */}
                {generatedCarousel.slides[currentSlide] && (
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-6 border rounded-xl ${
                      generatedCarousel.slides[currentSlide].type === 'cover'
                        ? 'border-pink-500/30 bg-pink-900/10'
                        : generatedCarousel.slides[currentSlide].type === 'cta'
                        ? 'border-green-500/30 bg-green-900/10'
                        : 'border-purple-500/30 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <Image className="w-4 h-4" />
                        Slide {generatedCarousel.slides[currentSlide].number}
                        {generatedCarousel.slides[currentSlide].type === 'cover' && ' • 📌 Portada'}
                        {generatedCarousel.slides[currentSlide].type === 'cta' && ' • ✨ CTA'}
                      </span>
                      <button
                        onClick={() => handleCopySlide(generatedCarousel.slides[currentSlide], currentSlide)}
                        className="p-1.5 text-gray-400 transition-colors rounded hover:bg-gray-700 hover:text-white"
                      >
                        {copiedIndex === currentSlide ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <h4 className="text-2xl font-bold text-white mb-2">
                      {generatedCarousel.slides[currentSlide].title}
                    </h4>
                    {generatedCarousel.slides[currentSlide].subtitle && (
                      <p className="text-lg text-gray-300 mb-4">
                        {generatedCarousel.slides[currentSlide].subtitle}
                      </p>
                    )}
                    <p className="text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
                      {generatedCarousel.slides[currentSlide].content}
                    </p>

                    <div className="space-y-3 mt-4">
                      <div className="p-3 rounded-lg bg-gray-900/50">
                        <p className="text-xs font-semibold text-purple-400 mb-1">Visual sugerido:</p>
                        <p className="text-sm text-gray-300">{generatedCarousel.slides[currentSlide].visualSuggestion}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-gray-900/50">
                        <p className="text-xs font-semibold text-purple-400 mb-2">Colores:</p>
                        <div className="flex gap-2">
                          {generatedCarousel.slides[currentSlide].colors.map((color, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="w-10 h-10 rounded border border-gray-700"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-xs text-gray-400">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {generatedCarousel.slides[currentSlide].designNotes && (
                        <div className="p-3 rounded-lg bg-gray-900/50">
                          <p className="text-xs font-semibold text-purple-400 mb-1">Notas de diseño:</p>
                          <p className="text-sm text-gray-300">{generatedCarousel.slides[currentSlide].designNotes}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Caption sugerido */}
                {generatedCarousel.captionSuggestion && (
                  <div className="p-5 border border-blue-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="text-lg font-bold text-white mb-3">Caption Sugerido</h3>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {generatedCarousel.captionSuggestion}
                    </p>
                  </div>
                )}

                {/* Hashtags */}
                {generatedCarousel.hashtags && generatedCarousel.hashtags.length > 0 && (
                  <div className="p-5 border border-indigo-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="text-lg font-bold text-white mb-3">Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedCarousel.hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm font-medium text-indigo-300 bg-indigo-600/20 rounded-full"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para nuevo carrusel */}
                <button
                  onClick={() => setGeneratedCarousel(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-pink-500 rounded-lg hover:bg-pink-500/10"
                >
                  Generar Nuevo Carrusel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstagramCarouselsModal;
