/**
 * 🎯 FEEDBACK WIDGET COMPONENTS
 *
 * Componentes reutilizables para recopilar feedback de usuarios sobre respuestas de IA.
 *
 * Componentes:
 * - QuickFeedback: Thumbs up/down para feedback rápido (Coach Creo)
 * - StarRating: Calificación 1-5 estrellas con comentario opcional (Generador de Guiones)
 *
 * @version 1.0.0
 * @author CreoVision Team
 */

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { saveInteraction, updateFeedback, saveQuickFeedback, saveStarRating } from '@/services/feedbackService';
import { useAuth } from '@/hooks/useAuth';

/**
 * QuickFeedback Component
 *
 * Muestra botones de thumbs up/down después de respuestas del asistente.
 * Ideal para Coach Creo donde queremos feedback no invasivo.
 *
 * @param {string} interactionId - ID de la interacción (si ya existe)
 * @param {string} prompt - Pregunta/prompt del usuario
 * @param {string} response - Respuesta de la IA
 * @param {string} provider - 'gemini', 'deepseek', 'qwen', 'openai'
 * @param {string} featureSlug - 'coach_creo', 'script_generator', etc.
 * @param {Function} onFeedbackSaved - Callback cuando se guarda feedback
 */
export const QuickFeedback = ({
  interactionId = null,
  prompt,
  response,
  provider,
  featureSlug,
  model = null,
  tokensUsed = null,
  responseTimeMs = null,
  onFeedbackSaved
}) => {
  const { user } = useAuth();
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (isPositive) => {
    if (isSubmitting || feedbackGiven) return;

    try {
      setIsSubmitting(true);
      console.log('👍👎 Guardando feedback rápido:', isPositive ? 'positive' : 'negative');

      let result;

      if (interactionId) {
        // Actualizar interacción existente
        result = await saveQuickFeedback(interactionId, isPositive);
      } else {
        // Crear nueva interacción con feedback
        result = await saveInteraction({
          userId: user?.id,
          prompt,
          response,
          provider,
          model,
          score: isPositive ? 5 : 1,
          feedbackType: isPositive ? 'positive' : 'negative',
          featureSlug,
          tokensUsed,
          responseTimeMs
        });
      }

      setFeedbackGiven(true);
      onFeedbackSaved?.(isPositive ? 'positive' : 'negative', result);

      // Desaparecer después de 2 segundos
      setTimeout(() => {
        setFeedbackGiven(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error guardando feedback rápido:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedbackGiven) {
    return (
      <div className="text-green-500 text-sm flex items-center gap-1 animate-fade-in">
        <span>¡Gracias por tu feedback!</span>
        <span className="text-lg">✓</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <span className="text-xs text-gray-500">¿Útil?</span>
      <button
        onClick={() => handleFeedback(true)}
        disabled={isSubmitting}
        className="p-1 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
        title="Útil"
      >
        <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-500 transition-colors" />
      </button>
      <button
        onClick={() => handleFeedback(false)}
        disabled={isSubmitting}
        className="p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
        title="No útil"
      >
        <ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
      </button>
    </div>
  );
};

/**
 * StarRating Component
 *
 * Sistema de calificación 1-5 estrellas con comentario opcional.
 * Ideal para Generador de Guiones y Análisis de Canal.
 *
 * @param {string} interactionId - ID de la interacción (si ya existe)
 * @param {string} prompt - Pregunta/prompt del usuario
 * @param {string} response - Respuesta de la IA
 * @param {string} provider - 'gemini', 'deepseek', 'qwen', 'openai'
 * @param {string} featureSlug - 'coach_creo', 'script_generator', etc.
 * @param {boolean} showCommentBox - Mostrar campo de comentario
 * @param {boolean} autoShow - Aparecer automáticamente o esperar interacción
 * @param {Function} onFeedbackSaved - Callback cuando se guarda feedback
 * @param {Function} onDismiss - Callback cuando se cierra sin evaluar
 */
export const StarRating = ({
  interactionId = null,
  prompt,
  response,
  provider,
  featureSlug,
  model = null,
  tokensUsed = null,
  responseTimeMs = null,
  showCommentBox = false,
  autoShow = true,
  onFeedbackSaved,
  onDismiss
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWidget, setShowWidget] = useState(autoShow);

  const handleSubmit = async () => {
    if (!rating || isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('⭐ Guardando calificación:', rating, 'estrellas');

      let result;

      if (interactionId) {
        // Actualizar interacción existente
        result = await saveStarRating(interactionId, rating, comment || null);
      } else {
        // Crear nueva interacción con feedback
        const feedbackType = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
        result = await saveInteraction({
          userId: user?.id,
          prompt,
          response,
          provider,
          model,
          score: rating,
          feedbackType,
          feedbackText: comment || null,
          featureSlug,
          tokensUsed,
          responseTimeMs
        });
      }

      setSubmitted(true);
      onFeedbackSaved?.(rating, comment, result);

      // Cerrar después de 2 segundos
      setTimeout(() => {
        setShowWidget(false);
      }, 2000);
    } catch (error) {
      console.error('❌ Error guardando calificación:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setShowWidget(false);
    onDismiss?.();
  };

  if (!showWidget) return null;

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
        <div className="flex items-center gap-2 text-green-700">
          <Star className="w-5 h-5 fill-green-500 text-green-500" />
          <span className="font-semibold">¡Gracias por tu calificación!</span>
        </div>
        <p className="text-sm text-green-600 mt-1">Tu feedback nos ayuda a mejorar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-800">¿Qué te pareció esta respuesta?</h4>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      {/* Estrellas */}
      <div className="flex gap-1 justify-center py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
            disabled={isSubmitting}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hover || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Texto descriptivo de la calificación */}
      {rating > 0 && (
        <div className="text-center text-sm text-gray-600">
          {rating === 5 && '⭐ Excelente'}
          {rating === 4 && '👍 Muy bueno'}
          {rating === 3 && '😊 Aceptable'}
          {rating === 2 && '😕 Mejorable'}
          {rating === 1 && '👎 Necesita mejoras'}
        </div>
      )}

      {/* Campo de comentario (opcional) */}
      {showCommentBox && rating > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Cómo podríamos mejorar? (opcional)"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Botones de acción */}
      {rating > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
          </button>
          {!showCommentBox && (
            <button
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              No ahora
            </button>
          )}
        </div>
      )}

      {/* Botón "No ahora" si no hay rating */}
      {rating === 0 && (
        <button
          onClick={handleDismiss}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          No ahora
        </button>
      )}
    </div>
  );
};

/**
 * FeedbackModal Component
 *
 * Modal flotante para feedback detallado con múltiples aspectos.
 * Ideal para Análisis de Canal.
 *
 * @param {boolean} isOpen - Control de visibilidad del modal
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {Object} props - Props de StarRating
 */
export const FeedbackModal = ({ isOpen, onClose, ...starRatingProps }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <StarRating
            {...starRatingProps}
            showCommentBox={true}
            autoShow={true}
            onFeedbackSaved={(rating, comment, result) => {
              starRatingProps.onFeedbackSaved?.(rating, comment, result);
              setTimeout(onClose, 2000);
            }}
            onDismiss={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default {
  QuickFeedback,
  StarRating,
  FeedbackModal
};
