// dataAdapter.js - Adaptador de datos SEO para infografías circulares
// Transforma el payload de la API al formato optimizado para visualización

/**
 * Utilidades matemáticas
 */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const percentChange = (current, previous) => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const scaleTo100 = (value, min, max) => {
  if (max === min) return 50;
  return clamp((value - min) / (max - min) * 100, 0, 100);
};

/**
 * Escalado inteligente según tipo de métrica
 */
export const scaleSmart = (kpi) => {
  const { id, value } = kpi;

  switch (id) {
    case 'ctr':
      // CTR: máximo razonable 20%
      return Math.min(value * 5, 100);

    case 'avgPos':
      // Posición: 1-60, menos es mejor
      return 100 * (1 - clamp((value - 1) / 59, 0, 1));

    case 'pagesSpeed':
    case 'domainRating':
      // Ya está en escala 0-100
      return value;

    case 'coreWebVitals':
    case 'bounce':
      // Porcentajes directos
      return value;

    case 'backlinks':
      // Normalizar con techo en 200
      return clamp(value / 200 * 100, 0, 100);

    case 'traffic':
      // Normalizar tráfico (escala móvil, techo 50k)
      return clamp(value / 50000 * 100, 0, 100);

    default:
      return clamp(value, 0, 100);
  }
};

/**
 * Validación del payload de entrada
 */
export const validatePayload = (data) => {
  const errors = [];

  if (!data.kpis || data.kpis.length < 6 || data.kpis.length > 10) {
    errors.push('kpis debe tener entre 6 y 10 elementos');
  }

  if (!data.topicClusters || data.topicClusters.length < 4) {
    errors.push('topicClusters debe tener al menos 4 elementos (ideal: 8)');
  }

  const totalTraffic = data.topicClusters?.reduce((s, c) => s + c.traffic, 0) || 0;
  if (totalTraffic <= 0) {
    errors.push('La suma de traffic en topicClusters debe ser > 0');
  }

  if (data.pipeline) {
    data.pipeline.forEach((step, i) => {
      if (step.status < 0 || step.status > 1) {
        errors.push(`pipeline[${i}].status debe estar entre 0 y 1`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Adaptador principal - Transforma datos de API a formato de infografías
 */
export const adaptSEOData = (data) => {
  // Validar entrada
  const validation = validatePayload(data);
  if (!validation.valid) {
    console.error('Errores de validación:', validation.errors);
    throw new Error('Datos inválidos: ' + validation.errors.join(', '));
  }

  // Calcular total de tráfico
  const totalTraffic = data.topicClusters.reduce((s, c) => s + c.traffic, 0);

  // Procesar clusters (para Infografía A y C)
  let accumulatedAngle = 0;
  const clusters = data.topicClusters.map((cluster) => {
    const share = totalTraffic > 0 ? (cluster.traffic / totalTraffic * 100) : 0;
    const angleSize = totalTraffic > 0 ? (cluster.traffic / totalTraffic * 2 * Math.PI) : 0;

    const result = {
      ...cluster,
      share: parseFloat(share.toFixed(1)),
      angleStart: accumulatedAngle,
      angleEnd: accumulatedAngle + angleSize,
      angleDegrees: parseFloat((angleSize * 180 / Math.PI).toFixed(1)),
      // Coordenadas polares para etiquetas
      labelAngle: accumulatedAngle + angleSize / 2,
    };

    accumulatedAngle += angleSize;
    return result;
  });

  // Procesar KPIs (para Infografía A)
  const kpis = data.kpis.map((kpi) => {
    // Calcular porcentaje normalizado
    let percent;
    if (kpi.unit === '/100' || kpi.unit === '%') {
      percent = kpi.value;
    } else {
      percent = scaleSmart(kpi);
    }

    // Invertir si es necesario
    if (kpi.invert) {
      percent = 100 - percent;
    }

    // Calcular cambio vs periodo anterior
    const change = kpi.prev != null ? percentChange(kpi.value, kpi.prev) : null;

    return {
      ...kpi,
      percent: parseFloat(clamp(percent, 0, 100).toFixed(1)),
      change: change != null ? parseFloat(change.toFixed(1)) : null,
      changeAbs: parseFloat((kpi.value - (kpi.prev || kpi.value)).toFixed(1)),
      changeDirection: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      // Para visualización, invertir determina si verde es bueno o malo
      isPositive: kpi.invert ? change < 0 : change > 0
    };
  });

  // Procesar pipeline (para Infografía B)
  const pipeline = data.pipeline.map((step) => ({
    ...step,
    statusPercent: parseFloat((clamp(step.status * 100, 0, 100)).toFixed(1)),
    // Ángulo para layout circular (8 pasos = 45° cada uno)
    angle: ((step.step - 1) / data.pipeline.length) * 2 * Math.PI,
    // Color según progreso
    statusLevel: step.status >= 0.7 ? 'high' : step.status >= 0.4 ? 'medium' : 'low'
  }));

  return {
    site: data.site,
    period: data.period,
    health: data.totals.healthScore,
    totals: data.totals,
    clusters,
    kpis,
    pipeline,
    // Metadata para el componente
    meta: {
      totalTraffic,
      clusterCount: clusters.length,
      kpiCount: kpis.length,
      pipelineSteps: pipeline.length,
      dateRange: `${data.period.from} → ${data.period.to}`,
      compareRange: `${data.period.compareFrom} → ${data.period.compareTo}`
    }
  };
};

/**
 * Formateo de números para visualización
 */
export const formatNumber = (value, locale = 'es-CL') => {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercent = (value, decimals = 1, locale = 'es-CL') => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value) + '%';
};

export const formatCurrency = (value, currency = 'CLP', locale = 'es-CL') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Generador de coordenadas polares a cartesianas
 */
export const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
  return {
    x: centerX + radius * Math.cos(angleInRadians - Math.PI / 2),
    y: centerY + radius * Math.sin(angleInRadians - Math.PI / 2)
  };
};

/**
 * Generador de path SVG para arcos
 */
export const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
};

/**
 * Generador de path SVG para donut
 */
export const describeDonutSegment = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
  const startOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const startInner = polarToCartesian(x, y, innerRadius, startAngle);
  const endInner = polarToCartesian(x, y, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle > Math.PI ? '1' : '0';

  return [
    'M', startOuter.x, startOuter.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, startInner.x, startInner.y,
    'Z'
  ].join(' ');
};

export default adaptSEOData;
