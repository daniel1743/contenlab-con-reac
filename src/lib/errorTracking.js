/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🐛 ERROR TRACKING SERVICE - CREOVISION                         ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Sistema de tracking de errores sin dependencias externas       ║
 * ║  Puede integrarse fácilmente con Sentry después                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Configuración
const ERROR_TRACKING_CONFIG = {
  enabled: true, // Cambiar a false en desarrollo si no quieres logs
  logToConsole: true,
  sendToBackend: false, // Cambiar a true cuando tengas backend
  backendEndpoint: '/api/errors', // URL de tu backend
  maxQueueSize: 100, // Máximo de errores en cola antes de enviar
};

// Cola de errores (en memoria)
let errorQueue = [];

/**
 * 🎯 Capturar error con contexto
 */
export const captureError = (error, context = {}) => {
  if (!ERROR_TRACKING_CONFIG.enabled) return;

  const errorData = {
    // Error info
    message: error.message || String(error),
    stack: error.stack || 'No stack trace available',
    name: error.name || 'Error',

    // Contexto
    context: {
      ...context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    },

    // Usuario (si está autenticado)
    user: getUserInfo(),

    // Environment
    environment: import.meta.env.MODE || 'production',
  };

  // Log a consola
  if (ERROR_TRACKING_CONFIG.logToConsole) {
    console.error('🐛 [Error Captured]:', errorData);
  }

  // Agregar a cola
  errorQueue.push(errorData);

  // Guardar en localStorage para persistencia
  saveErrorToLocalStorage(errorData);

  // Enviar a backend si está configurado
  if (ERROR_TRACKING_CONFIG.sendToBackend) {
    sendErrorToBackend(errorData);
  }

  // Si la cola está llena, limpiar las más antiguas
  if (errorQueue.length > ERROR_TRACKING_CONFIG.maxQueueSize) {
    errorQueue = errorQueue.slice(-ERROR_TRACKING_CONFIG.maxQueueSize);
  }
};

/**
 * 📊 Capturar excepción con mensaje personalizado
 */
export const captureException = (error, message, extra = {}) => {
  captureError(error, {
    customMessage: message,
    ...extra,
  });
};

/**
 * 📝 Capturar mensaje (no es error, pero es importante)
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!ERROR_TRACKING_CONFIG.enabled) return;

  const messageData = {
    message,
    level, // 'info', 'warning', 'error'
    context: {
      ...context,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
    user: getUserInfo(),
  };

  if (ERROR_TRACKING_CONFIG.logToConsole) {
    const emoji = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} [${level.toUpperCase()}]:`, messageData);
  }
};

/**
 * 👤 Obtener información del usuario actual
 */
const getUserInfo = () => {
  try {
    // Intentar obtener del localStorage (donde Supabase guarda la sesión)
    const supabaseAuth = localStorage.getItem('supabase.auth.token');
    if (supabaseAuth) {
      const parsed = JSON.parse(supabaseAuth);
      const user = parsed?.currentSession?.user;
      if (user) {
        return {
          id: user.id,
          email: user.email,
        };
      }
    }
  } catch (error) {
    // Falló silenciosamente
  }
  return null;
};

/**
 * 💾 Guardar error en localStorage para análisis posterior
 */
const saveErrorToLocalStorage = (errorData) => {
  try {
    const key = 'creovision_error_logs';
    let logs = JSON.parse(localStorage.getItem(key) || '[]');

    // Mantener solo últimos 50 errores
    logs.push(errorData);
    if (logs.length > 50) {
      logs = logs.slice(-50);
    }

    localStorage.setItem(key, JSON.stringify(logs));
  } catch (error) {
    // Si falla, no hacer nada (probablemente localStorage lleno)
  }
};

/**
 * 🌐 Enviar error al backend
 */
const sendErrorToBackend = async (errorData) => {
  try {
    await fetch(ERROR_TRACKING_CONFIG.backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    });
  } catch (error) {
    // Si falla el envío, no hacer nada (no queremos crear loop de errores)
  }
};

/**
 * 📊 Obtener todos los errores capturados en localStorage
 */
export const getErrorLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('creovision_error_logs') || '[]');
  } catch {
    return [];
  }
};

/**
 * 🗑️ Limpiar logs de errores
 */
export const clearErrorLogs = () => {
  localStorage.removeItem('creovision_error_logs');
  errorQueue = [];
};

/**
 * 🎬 Inicializar error tracking global
 */
export const initErrorTracking = () => {
  // Capturar errores no manejados
  window.addEventListener('error', (event) => {
    captureError(event.error || new Error(event.message), {
      type: 'unhandled_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Capturar promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', (event) => {
    captureError(new Error(event.reason), {
      type: 'unhandled_promise_rejection',
      reason: event.reason,
    });
  });

  console.log('✅ Error tracking initialized');
};

/**
 * 🔗 INTEGRACIÓN CON SENTRY (opcional)
 *
 * Para integrar con Sentry:
 * 1. npm install @sentry/react
 * 2. Agregar en .env: VITE_SENTRY_DSN=tu_dsn_aqui
 * 3. Descomentar el código abajo
 */

/*
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.warn('⚠️ Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0, // 100% en dev, bajar a 0.1 en prod
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });

  console.log('✅ Sentry initialized');
};

// Reemplazar las funciones por Sentry
export const captureError = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
*/

export default {
  captureError,
  captureException,
  captureMessage,
  getErrorLogs,
  clearErrorLogs,
  initErrorTracking,
};
