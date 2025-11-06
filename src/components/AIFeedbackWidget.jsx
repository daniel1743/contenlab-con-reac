/**
 * 🧠 Widget de Feedback para Interacciones de IA
 * Permite a usuarios calificar respuestas de IA (1-5 estrellas)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function AIFeedbackWidget({ 
  interactionId, 
  sessionId,
  onFeedbackSubmitted 
}) {
  const [score, setScore] = useState(null);
  const [hoveredScore, setHoveredScore] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!interactionId) {
      toast({
        title: 'Error',
        description: 'ID de interacción no disponible',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken = session?.access_token || null;
      
      const response = await fetch('/api/ai/interactions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          interaction_id: interactionId,
          session_id: sessionId,
          score: score,
          feedback_text: feedbackText.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar feedback');
      }

      toast({
        title: '✅ Feedback enviado',
        description: 'Gracias por ayudarnos a mejorar',
      });

      setIsExpanded(false);
      setScore(null);
      setFeedbackText('');

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(data.interaction);
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el feedback',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoreClick = (value) => {
    setScore(value);
    setIsExpanded(true);
  };

  if (!isExpanded && score === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
      >
        <p className="text-sm text-gray-300 mb-3">
          ¿Te ayudó esta respuesta?
        </p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleScoreClick(value)}
              onMouseEnter={() => setHoveredScore(value)}
              onMouseLeave={() => setHoveredScore(null)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  (hoveredScore !== null && value <= hoveredScore) || 
                  (hoveredScore === null && score !== null && value <= score)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-500 hover:text-yellow-400'
                }`}
              />
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white mb-2">
              {score >= 4 
                ? '¡Genial! ¿Qué te gustó?' 
                : score <= 2 
                ? 'Lo sentimos. ¿Qué podemos mejorar?'
                : 'Gracias. ¿Algún comentario?'}
            </p>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setScore(value)}
                  onMouseEnter={() => setHoveredScore(value)}
                  onMouseLeave={() => setHoveredScore(null)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      (hoveredScore !== null && value <= hoveredScore) || 
                      (hoveredScore === null && value <= score)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-500 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setIsExpanded(false);
              setScore(null);
              setFeedbackText('');
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <Textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder={
            score >= 4
              ? '¿Qué te gustó más de esta respuesta? (opcional)'
              : '¿Qué podemos mejorar? (opcional)'
          }
          className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-500 mb-3"
          rows={3}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              setScore(null);
              setFeedbackText('');
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !score}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              'Enviando...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

