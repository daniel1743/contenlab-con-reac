// ============================================
// 🚀 UTILIDADES DE OPTIMIZACIÓN DE RENDIMIENTO
// ============================================

/**
 * Debounce function - retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - limita la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function}
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy load de imágenes
 * @param {string} src - URL de la imagen
 * @returns {Promise<string>}
 */
export const lazyLoadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Intersection Observer para lazy loading
 * @param {Function} callback - Función a ejecutar cuando el elemento es visible
 * @param {Object} options - Opciones del observer
 * @returns {IntersectionObserver}
 */
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Memoización simple para funciones
 * @param {Function} fn - Función a memoizar
 * @returns {Function}
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Limpieza de cache con límite de tamaño
 */
export class LRUCache {
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Mover al final (más reciente)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Eliminar el más antiguo (primero en el Map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

/**
 * Preload de recursos críticos
 * @param {Array<string>} urls - URLs de recursos a precargar
 * @param {string} as - Tipo de recurso (script, style, image, font)
 */
export const preloadResources = (urls, as = 'script') => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

/**
 * Compresión de datos para localStorage
 * @param {any} data - Datos a comprimir
 * @returns {string}
 */
export const compressData = (data) => {
  return JSON.stringify(data);
};

/**
 * Descompresión de datos desde localStorage
 * @param {string} compressed - Datos comprimidos
 * @returns {any}
 */
export const decompressData = (compressed) => {
  try {
    return JSON.parse(compressed);
  } catch {
    return null;
  }
};

/**
 * Medición de performance
 */
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
  }

  start(label) {
    this.marks.set(label, performance.now());
  }

  end(label) {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No se encontró marca de inicio para: ${label}`);
      return 0;
    }
    const duration = performance.now() - startTime;
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    this.marks.delete(label);
    return duration;
  }

  clear() {
    this.marks.clear();
  }
}

/**
 * Optimización de re-renders con comparación profunda
 * @param {Object} prevProps - Props anteriores
 * @param {Object} nextProps - Props nuevas
 * @returns {boolean}
 */
export const arePropsEqual = (prevProps, nextProps) => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Batch de actualizaciones de estado
 */
export const batchUpdates = (updates) => {
  // React 18+ automáticamente hace batch, pero esto sirve para versiones anteriores
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      updates.forEach(update => update());
    });
  } else {
    setTimeout(() => {
      updates.forEach(update => update());
    }, 0);
  }
};

/**
 * Detección de dispositivo móvil
 * @returns {boolean}
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detección de conexión lenta
 * @returns {boolean}
 */
export const isSlowConnection = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  }
  return false;
};

/**
 * Prefetch de datos
 * @param {string} url - URL a prefetchear
 * @returns {Promise}
 */
export const prefetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error en prefetch:', error);
    return null;
  }
};

export default {
  debounce,
  throttle,
  lazyLoadImage,
  createIntersectionObserver,
  memoize,
  LRUCache,
  preloadResources,
  compressData,
  decompressData,
  PerformanceMonitor,
  arePropsEqual,
  batchUpdates,
  isMobile,
  isSlowConnection,
  prefetchData
};
