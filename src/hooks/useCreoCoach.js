/**
 * 🎯 HOOK DE CREO COACH
 * Detecta patrones de comportamiento del usuario y activa CREO proactivamente
 * @version 1.0.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Configuración de parámetros de detección
 */
const COACH_CONFIG = {
  inactivityThreshold: 30000, // 30 segundos
  repetitionCount: 3, // 3 intentos antes de sugerir
  messageDismissTime: 10000, // 10 segundos antes de auto-ocultar
  cooldownPeriod: 60000, // 1 minuto entre sugerencias proactivas
};

/**
 * Hook principal de CREO Coach
 * @param {Object} options
 * @param {boolean} options.enabled - Si el coach está habilitado
 * @param {Object} options.userProfile - Perfil del usuario
 * @returns {Object} Estado y funciones del coach
 */
export function useCreoCoach({ enabled = true, userProfile = {} } = {}) {
  const location = useLocation();

  // Estado
  const [isCoachVisible, setIsCoachVisible] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  const [coachContext, setCoachContext] = useState({});
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  // Refs para tracking
  const inactivityTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const clickCountRef = useRef({});
  const lastSuggestionTimeRef = useRef(0);
  const pageEntryTimeRef = useRef(Date.now());

  /**
   * Resetea el timer de inactividad
   */
  const resetInactivityTimer = useCallback(() => {
    setLastInteractionTime(Date.now());

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (!enabled) return;

    inactivityTimerRef.current = setTimeout(() => {
      const now = Date.now();
      const timeSinceLastSuggestion = now - lastSuggestionTimeRef.current;

      // Solo sugerir si ha pasado el cooldown
      if (timeSinceLastSuggestion > COACH_CONFIG.cooldownPeriod) {
        console.log('🎯 CREO detectó inactividad');
        triggerCoach('inactivity', {
          currentPage: location.pathname,
          timeInactive: COACH_CONFIG.inactivityThreshold / 1000
        });
        lastSuggestionTimeRef.current = now;
      }
    }, COACH_CONFIG.inactivityThreshold);
  }, [enabled, location.pathname]);

  /**
   * Detecta clics repetitivos en el mismo elemento
   */
  const trackRepetitiveClick = useCallback((elementId) => {
    if (!enabled) return;

    if (!clickCountRef.current[elementId]) {
      clickCountRef.current[elementId] = {
        count: 1,
        lastClick: Date.now()
      };
      return;
    }

    const clickData = clickCountRef.current[elementId];
    const timeSinceLastClick = Date.now() - clickData.lastClick;

    // Si el clic fue dentro de 5 segundos, incrementar contador
    if (timeSinceLastClick < 5000) {
      clickData.count++;
      clickData.lastClick = Date.now();

      // Si llegó al límite, activar coach
      if (clickData.count >= COACH_CONFIG.repetitionCount) {
        console.log('🎯 CREO detectó clics repetitivos en:', elementId);
        triggerCoach('repetition', {
          element: elementId,
          count: clickData.count,
          currentPage: location.pathname
        });

        // Resetear contador
        clickCountRef.current[elementId] = { count: 0, lastClick: Date.now() };
      }
    } else {
      // Si pasó mucho tiempo, resetear contador
      clickCountRef.current[elementId] = { count: 1, lastClick: Date.now() };
    }
  }, [enabled, location.pathname]);

  /**
   * Activa CREO con un contexto específico
   */
  const triggerCoach = useCallback((eventType, context = {}) => {
    if (!enabled) return;

    setCoachContext({
      eventType,
      ...context,
      userName: userProfile?.displayName,
      userProfile
    });

    setIsCoachVisible(true);

    // Auto-ocultar después del tiempo configurado
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }

    dismissTimerRef.current = setTimeout(() => {
      dismissCoach();
    }, COACH_CONFIG.messageDismissTime);
  }, [enabled, userProfile]);

  /**
   * Oculta CREO
   */
  const dismissCoach = useCallback(() => {
    setIsCoachVisible(false);
    setCoachMessage('');

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
  }, []);

  /**
   * Acepta la sugerencia de CREO (usuario hace clic en "Sí" o similar)
   */
  const acceptSuggestion = useCallback(() => {
    console.log('✅ Usuario aceptó sugerencia de CREO');
    dismissCoach();
    // Aquí podrías navegar a la herramienta sugerida si es necesario
  }, [dismissCoach]);

  /**
   * Envía mensaje manual a CREO
   */
  const askCreo = useCallback((message) => {
    if (!enabled) return;

    triggerCoach('user_question', {
      userMessage: message,
      currentPage: location.pathname
    });
  }, [enabled, location.pathname, triggerCoach]);

  // Detectar cambio de página
  useEffect(() => {
    if (!enabled) return;

    const now = Date.now();
    const timeOnPreviousPage = now - pageEntryTimeRef.current;
    pageEntryTimeRef.current = now;

    // Solo sugerir en cambio de página si pasó el cooldown
    const timeSinceLastSuggestion = now - lastSuggestionTimeRef.current;
    if (timeSinceLastSuggestion > COACH_CONFIG.cooldownPeriod && timeOnPreviousPage > 5000) {
      console.log('🎯 CREO detectó cambio de página a:', location.pathname);

      // Pequeño delay para que la página cargue
      setTimeout(() => {
        triggerCoach('page_change', {
          currentPage: location.pathname
        });
        lastSuggestionTimeRef.current = now;
      }, 2000);
    }

    // Resetear click counters al cambiar de página
    clickCountRef.current = {};

    // Iniciar timer de inactividad
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [location.pathname, enabled, resetInactivityTimer, triggerCoach]);

  // Detectar interacciones del usuario (movimiento de mouse, clicks, scroll)
  useEffect(() => {
    if (!enabled) return;

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Eventos a escuchar
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [enabled, resetInactivityTimer]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return {
    // Estado
    isCoachVisible,
    coachMessage,
    coachContext,
    lastInteractionTime,

    // Funciones
    triggerCoach,
    dismissCoach,
    acceptSuggestion,
    askCreo,
    trackRepetitiveClick,

    // Config
    config: COACH_CONFIG
  };
}

export default useCreoCoach;
