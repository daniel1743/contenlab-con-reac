/**
 * 🧵 THREAD COMPOSER
 * Modal para generar threads virales de Twitter/X
 * Usa Gemini 2.0 Flash para crear hilos atractivos y estructurados
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, Copy, Check, Sparkles, Hash } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/components/ui/use-toast';

const ThreadComposerModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form states
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('general');
  const [tone, setTone] = useState('profesional');
  const [threadLength, setThreadLength] = useState('5-7');

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedThread, setGeneratedThread] = useState(null);

  // Copy state
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTopic('');
      setAudience('general');
      setTone('profesional');
      setThreadLength('5-7');
      setGeneratedThread(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    // Validación
    if (!topic.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor ingresa el tema del thread',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `
Actúa como un ESPECIALISTA EN TWITTER/X y CREADOR DE CONTENIDO VIRAL.

📝 TEMA DEL THREAD: "${topic}"
👥 AUDIENCIA: ${audience}
🎭 TONO: ${tone}
📊 LONGITUD: ${threadLength} tweets

🎯 TAREA: CREAR UN THREAD VIRAL Y ATRACTIVO

**ESTRUCTURA DEL THREAD:**

1. **Tweet 1 (Hook):**
   - Debe capturar atención inmediatamente
   - Usa números, preguntas retóricas o statements polémicos
   - Máximo 280 caracteres
   - Incluye emoji relevante al inicio

2. **Tweets intermedios (${threadLength}):**
   - Cada tweet debe ser independiente pero conectado al siguiente
   - Usa bullets, emojis y espaciado para mejorar legibilidad
   - Incluye datos, estadísticas o insights valiosos
   - Máximo 280 caracteres cada uno

3. **Tweet final (CTA):**
   - Resume el valor del thread
   - Incluye llamado a la acción (RT, Like, Follow)
   - Máximo 280 caracteres

**REGLAS:**
- Cada tweet debe tener máximo 280 caracteres
- Usa emojis estratégicamente (1-2 por tweet)
- Incluye espacios en blanco para mejorar legibilidad
- Evita jerga innecesaria
- Tono: ${tone}
- Enfoque en valor para la audiencia: ${audience}

**FORMATO DE SALIDA:**
Devuelve SOLO un JSON con esta estructura:
\`\`\`json
{
  "tweets": [
    {
      "number": 1,
      "content": "🔥 Tweet de apertura aquí...",
      "type": "hook"
    },
    {
      "number": 2,
      "content": "📌 Segundo tweet...",
      "type": "content"
    },
    ...
    {
      "number": X,
      "content": "✨ Tweet de cierre con CTA...",
      "type": "cta"
    }
  ],
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3"],
  "estimatedEngagement": "Alto/Medio/Bajo"
}
\`\`\`

NO incluyas ningún texto adicional fuera del JSON.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON
      let parsedThread;
      try {
        // Extraer JSON del markdown si está presente
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;
        parsedThread = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        throw new Error('No se pudo generar el thread correctamente');
      }

      setGeneratedThread(parsedThread);

      toast({
        title: '✅ Thread generado',
        description: `${parsedThread.tweets.length} tweets listos para publicar`
      });

      // TODO: Implementar consumo de créditos con sistema de la aplicación
    } catch (error) {
      console.error('Error generando thread:', error);
      toast({
        title: 'Error al generar',
        description: error.message || 'No se pudo generar el thread. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyTweet = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);

      toast({
        title: 'Copiado',
        description: 'Tweet copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el tweet',
        variant: 'destructive'
      });
    }
  };

  const handleCopyAll = async () => {
    try {
      const allTweets = generatedThread.tweets
        .map((tweet) => tweet.content)
        .join('\n\n');

      const fullText = `${allTweets}\n\n${generatedThread.hashtags.join(' ')}`;

      await navigator.clipboard.writeText(fullText);

      toast({
        title: 'Thread completo copiado',
        description: 'Todos los tweets han sido copiados al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el thread completo',
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
              <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
                <Twitter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Thread Composer</h2>
                <p className="text-sm text-gray-400">Crea threads virales para Twitter/X</p>
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
            {!generatedThread ? (
              /* FORM */
              <div className="space-y-6">
                {/* Tema */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tema del thread *
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Cómo aumentar tu productividad usando IA en 2025..."
                    rows={3}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>

                {/* Audiencia */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Audiencia objetivo *
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="general">General / Amplia</option>
                    <option value="emprendedores">Emprendedores</option>
                    <option value="creadores">Creadores de contenido</option>
                    <option value="marketers">Marketers / Publicistas</option>
                    <option value="desarrolladores">Desarrolladores / Tech</option>
                    <option value="estudiantes">Estudiantes / Aprendices</option>
                  </select>
                </div>

                {/* Tono */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tono del thread *
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="profesional">Profesional</option>
                    <option value="casual">Casual / Amigable</option>
                    <option value="motivacional">Motivacional / Inspirador</option>
                    <option value="educativo">Educativo / Tutorial</option>
                    <option value="controversial">Controversial / Provocador</option>
                  </select>
                </div>

                {/* Longitud */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Longitud del thread *
                  </label>
                  <select
                    value={threadLength}
                    onChange={(e) => setThreadLength(e.target.value)}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="3-5">Corto (3-5 tweets)</option>
                    <option value="5-7">Medio (5-7 tweets)</option>
                    <option value="8-10">Largo (8-10 tweets)</option>
                    <option value="10-15">Muy Largo (10-15 tweets)</option>
                  </select>
                </div>

                {/* Info */}
                <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-900/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-blue-300">Qué generaremos:</h4>
                      <ul className="space-y-1 text-sm text-gray-400">
                        <li>• Hook inicial poderoso</li>
                        <li>• Tweets conectados con valor</li>
                        <li>• CTA efectivo al final</li>
                        <li>• Hashtags relevantes</li>
                        <li>• Optimizado para engagement</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando thread...
                    </>
                  ) : (
                    <>
                      <Twitter className="w-5 h-5" />
                      Generar Thread (20 créditos)
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                {/* Header de resultados */}
                <div className="flex items-center justify-between p-4 border border-purple-500/30 rounded-lg bg-gray-800/50">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Thread de {generatedThread.tweets.length} tweets
                    </h3>
                    <p className="text-sm text-gray-400">
                      Engagement estimado: <span className="text-blue-400">{generatedThread.estimatedEngagement}</span>
                    </p>
                  </div>
                  <button
                    onClick={handleCopyAll}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Copy className="inline w-4 h-4 mr-2" />
                    Copiar Todo
                  </button>
                </div>

                {/* Lista de tweets */}
                <div className="space-y-4">
                  {generatedThread.tweets.map((tweet, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-5 border rounded-xl transition-colors ${
                        tweet.type === 'hook'
                          ? 'border-yellow-500/30 bg-yellow-900/10'
                          : tweet.type === 'cta'
                          ? 'border-green-500/30 bg-green-900/10'
                          : 'border-gray-700 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                          <Twitter className="w-4 h-4" />
                          Tweet {tweet.number}
                          {tweet.type === 'hook' && ' • 🎣 Hook'}
                          {tweet.type === 'cta' && ' • ✨ CTA'}
                        </span>
                        <button
                          onClick={() => handleCopyTweet(tweet.content, index)}
                          className="p-1.5 text-gray-400 transition-colors rounded hover:bg-gray-700 hover:text-white"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-white whitespace-pre-wrap leading-relaxed">
                        {tweet.content}
                      </p>
                      <div className="mt-3 text-xs text-gray-500">
                        {tweet.content.length} / 280 caracteres
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Hashtags */}
                {generatedThread.hashtags && generatedThread.hashtags.length > 0 && (
                  <div className="p-5 border border-indigo-500/30 rounded-xl bg-gray-800/50">
                    <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-white">
                      <Hash className="w-5 h-5 text-indigo-400" />
                      Hashtags Recomendados
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedThread.hashtags.map((hashtag, index) => (
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

                {/* Botón para nuevo thread */}
                <button
                  onClick={() => setGeneratedThread(null)}
                  className="w-full px-6 py-3 text-white transition-all border border-blue-500 rounded-lg hover:bg-blue-500/10"
                >
                  Generar Nuevo Thread
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ThreadComposerModal;
