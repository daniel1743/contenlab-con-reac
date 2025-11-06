/**
 * 🚀 Utilidades de Optimización de Rendimiento
 * Funciones para mejorar la velocidad de la aplicación
 */

/**
 * Preload de componentes pesados
 */
export const preloadComponent = (componentImport) => {
  if (typeof window !== 'undefined') {
    componentImport();
  }
};

/**
 * Preload de rutas comunes
 */
export const preloadCommonRoutes = () => {
  if (typeof window !== 'undefined') {
    // Preload de componentes más usados
    Promise.all([
      import('@/components/DashboardDynamic'),
      import('@/components/Tools'),
      import('@/components/Calendar'),
      import('@/components/ContentLibrary')
    ]).catch(() => {
      // Ignorar errores de preload
    });
  }
};

/**
 * Debounce mejorado con cancelación
 */
export const debounce = (func, wait) => {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
};

/**
 * Throttle mejorado
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy load de imágenes con Intersection Observer
 */
export const lazyLoadImages = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

/**
 * Prefetch de recursos críticos
 */
export const prefetchResources = (urls) => {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Medir tiempo de ejecución
 */
export const measurePerformance = (name, fn) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return fn();
};

/**
 * Batch de actualizaciones de estado
 */
export const batchStateUpdates = (updates) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
      resolve();
    });
  });
};

/**
 * Memoización de funciones costosas
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
 * Verificar si la conexión es lenta
 */
export const isSlowConnection = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) {
    return false;
  }
  const connection = navigator.connection;
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    (connection.downlink && connection.downlink < 1.5)
  );
};

/**
 * Cargar recursos críticos primero
 */
export const loadCriticalResources = async () => {
  if (typeof window === 'undefined') return;

  // Preload de fuentes críticas
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  // Agregar URLs de fuentes si es necesario
  // document.head.appendChild(fontLink);
};

/**
 * Optimizar scroll performance
 */
export const optimizeScroll = () => {
  if (typeof window === 'undefined') return;

  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // Lógica de scroll optimizada
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
};

export default {
  preloadComponent,
  preloadCommonRoutes,
  debounce,
  throttle,
  lazyLoadImages,
  prefetchResources,
  measurePerformance,
  batchStateUpdates,
  memoize,
  isSlowConnection,
  loadCriticalResources,
  optimizeScroll
};

