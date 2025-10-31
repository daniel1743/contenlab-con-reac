const { useState, useEffect, useRef } = React;

// Sample data
const SAMPLE_DATA = {
  creovision: {
    site: 'creovision.io',
    period: { from: '2025-09-01', to: '2025-09-30', compareFrom: '2025-08-01', compareTo: '2025-08-31' },
    totals: { sessions: 42310, users: 35210, conversions: 1210, revenue: 17450.25, pagesIndexed: 412, healthScore: 80.6 },
    kpis: [
      { id: 'traffic', label: 'Tráfico orgánico', value: 27650, prev: 25110 },
      { id: 'ctr', label: 'CTR', value: 4.8, prev: 4.2, unit: '%' },
      { id: 'avgPos', label: 'Posición media', value: 14.2, prev: 16.8, invert: true },
      { id: 'pagesSpeed', label: 'PageSpeed', value: 86, prev: 78, unit: '/100' },
      { id: 'coreWebVitals', label: 'CWV OK', value: 68, prev: 61, unit: '%' },
      { id: 'backlinks', label: 'Backlinks nuevos', value: 132, prev: 97 },
      { id: 'domainRating', label: 'Autoridad (DR)', value: 44, prev: 41, unit: '/100' },
      { id: 'bounce', label: 'Rebote', value: 38, prev: 41, unit: '%', invert: true }
    ],
    topicClusters: [
      { name: 'IA para Pymes', traffic: 9800, conversionRate: 3.2, contentScore: 72 },
      { name: 'Automatización SEO', traffic: 6400, conversionRate: 2.6, contentScore: 66 },
      { name: 'Diseño Web + Core Web V.', traffic: 5200, conversionRate: 4.1, contentScore: 79 },
      { name: 'Marketing local', traffic: 4270, conversionRate: 2.1, contentScore: 58 },
      { name: 'E-commerce', traffic: 3990, conversionRate: 1.8, contentScore: 55 },
      { name: 'Analítica', traffic: 3200, conversionRate: 3.6, contentScore: 70 },
      { name: 'Contenido largo', traffic: 2800, conversionRate: 2.9, contentScore: 63 },
      { name: 'Branding', traffic: 2100, conversionRate: 1.2, contentScore: 51 }
    ],
    pipeline: [
      { step: 1, name: 'Research', status: 0.9, notes: 'KWs priorizadas' },
      { step: 2, name: 'Clusterización', status: 0.7, notes: '8 clusters listos' },
      { step: 3, name: 'Auditoría técnica', status: 0.6, notes: 'CWV en progreso' },
      { step: 4, name: 'Contenido', status: 0.5, notes: '5 artículos en cola' },
      { step: 5, name: 'On-page', status: 0.4, notes: 'Meta + Schema' },
      { step: 6, name: 'Off-page', status: 0.3, notes: 'Prospección' },
      { step: 7, name: 'Monitoreo', status: 0.8, notes: 'Dashboards OK' },
      { step: 8, name: 'Iteración', status: 0.2, notes: 'Backlog priorizado' }
    ]
  },
  ecommerce: {
    site: 'tienda-online.cl',
    period: { from: '2025-09-01', to: '2025-09-30', compareFrom: '2025-08-01', compareTo: '2025-08-31' },
    totals: { sessions: 85600, users: 67300, conversions: 3420, revenue: 89240.50, pagesIndexed: 1850, healthScore: 76.4 },
    kpis: [
      { id: 'traffic', label: 'Tráfico orgánico', value: 56800, prev: 52100 },
      { id: 'ctr', label: 'CTR', value: 5.2, prev: 4.8, unit: '%' },
      { id: 'avgPos', label: 'Posición media', value: 12.8, prev: 14.2, invert: true },
      { id: 'pagesSpeed', label: 'PageSpeed', value: 78, prev: 72, unit: '/100' },
      { id: 'coreWebVitals', label: 'CWV OK', value: 64, prev: 58, unit: '%' },
      { id: 'backlinks', label: 'Backlinks nuevos', value: 248, prev: 215 },
      { id: 'domainRating', label: 'Autoridad (DR)', value: 52, prev: 49, unit: '/100' },
      { id: 'bounce', label: 'Rebote', value: 42, prev: 46, unit: '%', invert: true }
    ],
    topicClusters: [
      { name: 'Electrónica', traffic: 28400, conversionRate: 4.2, contentScore: 78 },
      { name: 'Ropa y Moda', traffic: 19800, conversionRate: 3.8, contentScore: 72 },
      { name: 'Hogar y Deco', traffic: 14200, conversionRate: 3.1, contentScore: 68 },
      { name: 'Deportes', traffic: 9870, conversionRate: 2.9, contentScore: 65 },
      { name: 'Juguetes', traffic: 6540, conversionRate: 4.5, contentScore: 71 },
      { name: 'Libros', traffic: 4230, conversionRate: 2.2, contentScore: 61 },
      { name: 'Salud y Belleza', traffic: 2890, conversionRate: 3.6, contentScore: 69 },
      { name: 'Accesorios', traffic: 1720, conversionRate: 2.1, contentScore: 58 }
    ],
    pipeline: [
      { step: 1, name: 'Research', status: 0.85, notes: 'Productos analizados' },
      { step: 2, name: 'Clusterización', status: 0.75, notes: 'Categorías optimizadas' },
      { step: 3, name: 'Auditoría técnica', status: 0.68, notes: 'CWV mejorando' },
      { step: 4, name: 'Contenido', status: 0.72, notes: 'Fichas completadas' },
      { step: 5, name: 'On-page', status: 0.55, notes: 'Schema productos' },
      { step: 6, name: 'Off-page', status: 0.42, notes: 'Links activos' },
      { step: 7, name: 'Monitoreo', status: 0.88, notes: 'Analytics OK' },
      { step: 8, name: 'Iteración', status: 0.35, notes: 'Tests A/B' }
    ]
  },
  news: {
    site: 'noticias.cl',
    period: { from: '2025-09-01', to: '2025-09-30', compareFrom: '2025-08-01', compareTo: '2025-08-31' },
    totals: { sessions: 234500, users: 189300, conversions: 5680, revenue: 45230.75, pagesIndexed: 8920, healthScore: 85.2 },
    kpis: [
      { id: 'traffic', label: 'Tráfico orgánico', value: 167600, prev: 152400 },
      { id: 'ctr', label: 'CTR', value: 6.4, prev: 5.9, unit: '%' },
      { id: 'avgPos', label: 'Posición media', value: 8.6, prev: 9.8, invert: true },
      { id: 'pagesSpeed', label: 'PageSpeed', value: 91, prev: 88, unit: '/100' },
      { id: 'coreWebVitals', label: 'CWV OK', value: 82, prev: 78, unit: '%' },
      { id: 'backlinks', label: 'Backlinks nuevos', value: 1840, prev: 1620 },
      { id: 'domainRating', label: 'Autoridad (DR)', value: 68, prev: 66, unit: '/100' },
      { id: 'bounce', label: 'Rebote', value: 28, prev: 32, unit: '%', invert: true }
    ],
    topicClusters: [
      { name: 'Política Nacional', traffic: 45200, conversionRate: 1.8, contentScore: 82 },
      { name: 'Economía', traffic: 32100, conversionRate: 2.1, contentScore: 78 },
      { name: 'Deportes', traffic: 28900, conversionRate: 1.5, contentScore: 75 },
      { name: 'Tecnología', traffic: 18400, conversionRate: 2.6, contentScore: 80 },
      { name: 'Espectáculos', traffic: 15600, conversionRate: 1.2, contentScore: 65 },
      { name: 'Internacional', traffic: 12300, conversionRate: 1.9, contentScore: 77 },
      { name: 'Salud', traffic: 8900, conversionRate: 2.4, contentScore: 73 },
      { name: 'Medio Ambiente', traffic: 6200, conversionRate: 2.8, contentScore: 71 }
    ],
    pipeline: [
      { step: 1, name: 'Research', status: 0.92, notes: 'Trending topics' },
      { step: 2, name: 'Clusterización', status: 0.88, notes: 'Secciones OK' },
      { step: 3, name: 'Auditoría técnica', status: 0.85, notes: 'CWV excelente' },
      { step: 4, name: 'Contenido', status: 0.95, notes: 'Publicación diaria' },
      { step: 5, name: 'On-page', status: 0.78, notes: 'Meta automático' },
      { step: 6, name: 'Off-page', status: 0.68, notes: 'Cobertura amplia' },
      { step: 7, name: 'Monitoreo', status: 0.92, notes: 'Real-time' },
      { step: 8, name: 'Iteración', status: 0.55, notes: 'Optimización continua' }
    ]
  }
};

const COLORS = {
  clusters: ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#F97316', '#FBBF24', '#10B981', '#06B6D4'],
  kpis: ['#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#64748B'],
  pipeline: ['#6366F1', '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#F97316', '#FBBF24']
};

// Utility functions
function formatNumber(num) {
  return new Intl.NumberFormat('es-CL').format(num);
}

function formatPercent(num, decimals = 1) {
  return num.toFixed(decimals);
}

function percentChange(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeKPI(kpi) {
  let percent = kpi.value;
  
  if (kpi.unit === '/100') {
    percent = kpi.value;
  } else if (kpi.unit === '%') {
    percent = kpi.value;
  } else if (kpi.id === 'avgPos') {
    percent = 100 * (1 - clamp((kpi.value - 1) / 59, 0, 1));
  } else if (kpi.id === 'traffic' || kpi.id === 'backlinks') {
    const max = kpi.value * 1.5;
    percent = clamp((kpi.value / max) * 100, 0, 100);
  }
  
  if (kpi.invert) {
    percent = 100 - percent;
  }
  
  return clamp(percent, 0, 100);
}

function adaptData(rawData) {
  const totalTraffic = rawData.topicClusters.reduce((sum, c) => sum + c.traffic, 0);
  
  let angleAccum = 0;
  const clusters = rawData.topicClusters.map((c, i) => {
    const share = totalTraffic ? (c.traffic / totalTraffic) * 100 : 0;
    const angleSize = (c.traffic / totalTraffic) * 2 * Math.PI;
    const startAngle = angleAccum;
    const endAngle = angleAccum + angleSize;
    angleAccum = endAngle;
    
    return {
      ...c,
      share,
      startAngle,
      endAngle
    };
  });
  
  const kpis = rawData.kpis.map(k => {
    const percent = normalizeKPI(k);
    const change = k.prev != null ? percentChange(k.value, k.prev) : null;
    return { ...k, percent, change };
  });
  
  return {
    site: rawData.site,
    period: rawData.period,
    health: rawData.totals.healthScore,
    clusters,
    kpis,
    pipeline: rawData.pipeline
  };
}

// Components
function InputForm({ onGenerate, loading }) {
  const [domain, setDomain] = useState('creovision.io');
  const [period, setPeriod] = useState('last-month');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(domain, period);
  };
  
  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="domain">Dominio</label>
          <input
            id="domain"
            type="text"
            className="form-input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="ejemplo.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="period">Período de análisis</label>
          <select
            id="period"
            className="form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="last-month">Último mes</option>
            <option value="last-3-months">Últimos 3 meses</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Generando...' : 'Generar Infografías'}
      </button>
    </form>
  );
}

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>Generando infografías...</p>
    </div>
  );
}

function DonutInfographic({ data }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  
  const width = 600;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const innerRadius = 100;
  const middleRadius = 180;
  const outerRadius = 240;
  
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };
  
  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + (radius * Math.cos(angleInRadians - Math.PI / 2)),
      y: centerY + (radius * Math.sin(angleInRadians - Math.PI / 2))
    };
  };
  
  const handleMouseEnter = (item, event, type) => {
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      item,
      type
    });
  };
  
  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const exportSVG = () => {
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donut-${data.site}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const exportPNG = () => {
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `donut-${data.site}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };
  
  return (
    <div className="infographic-card fade-in">
      <div className="infographic-header">
        <h3 className="infographic-title">Donut Multi-Anillo</h3>
        <div className="export-buttons">
          <button className="btn btn-secondary" onClick={exportSVG}>SVG</button>
          <button className="btn btn-secondary" onClick={exportPNG}>PNG</button>
        </div>
      </div>
      <p className="infographic-description">
        Participación de tráfico por tema y salud técnica en tiempo real. El número central resume la condición del sitio; los anillos muestran progreso de KPIs críticos.
      </p>
      <div className="svg-container">
        <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background */}
          <rect width={width} height={height} fill="var(--color-surface)" />
          
          {/* Inner donut - Topic Clusters */}
          {data.clusters.map((cluster, i) => {
            const startAngle = cluster.startAngle;
            const endAngle = cluster.endAngle;
            const midAngle = (startAngle + endAngle) / 2;
            
            return (
              <g key={i}>
                <path
                  d={`
                    M ${polarToCartesian(centerX, centerY, innerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, startAngle).y}
                    A ${innerRadius} ${innerRadius} 0 ${endAngle - startAngle > Math.PI ? 1 : 0} 1 ${polarToCartesian(centerX, centerY, innerRadius, endAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, endAngle).y}
                    L ${polarToCartesian(centerX, centerY, middleRadius, endAngle).x} ${polarToCartesian(centerX, centerY, middleRadius, endAngle).y}
                    A ${middleRadius} ${middleRadius} 0 ${endAngle - startAngle > Math.PI ? 1 : 0} 0 ${polarToCartesian(centerX, centerY, middleRadius, startAngle).x} ${polarToCartesian(centerX, centerY, middleRadius, startAngle).y}
                    Z
                  `}
                  fill={COLORS.clusters[i]}
                  opacity="0.8"
                  stroke="var(--color-surface)"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => handleMouseEnter(cluster, e, 'cluster')}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}
          
          {/* Outer ring - KPIs */}
          {data.kpis.map((kpi, i) => {
            const sectorAngle = (2 * Math.PI) / data.kpis.length;
            const startAngle = i * sectorAngle;
            const endAngle = startAngle + sectorAngle;
            const progressAngle = startAngle + (sectorAngle * kpi.percent / 100);
            
            return (
              <g key={i}>
                {/* Background arc */}
                <path
                  d={`
                    M ${polarToCartesian(centerX, centerY, middleRadius + 10, startAngle).x} ${polarToCartesian(centerX, centerY, middleRadius + 10, startAngle).y}
                    A ${middleRadius + 10} ${middleRadius + 10} 0 ${sectorAngle > Math.PI ? 1 : 0} 1 ${polarToCartesian(centerX, centerY, middleRadius + 10, endAngle).x} ${polarToCartesian(centerX, centerY, middleRadius + 10, endAngle).y}
                    L ${polarToCartesian(centerX, centerY, outerRadius, endAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, endAngle).y}
                    A ${outerRadius} ${outerRadius} 0 ${sectorAngle > Math.PI ? 1 : 0} 0 ${polarToCartesian(centerX, centerY, outerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, startAngle).y}
                    Z
                  `}
                  fill="var(--color-secondary)"
                  opacity="0.3"
                />
                {/* Progress arc */}
                <path
                  d={`
                    M ${polarToCartesian(centerX, centerY, middleRadius + 10, startAngle).x} ${polarToCartesian(centerX, centerY, middleRadius + 10, startAngle).y}
                    A ${middleRadius + 10} ${middleRadius + 10} 0 ${progressAngle - startAngle > Math.PI ? 1 : 0} 1 ${polarToCartesian(centerX, centerY, middleRadius + 10, progressAngle).x} ${polarToCartesian(centerX, centerY, middleRadius + 10, progressAngle).y}
                    L ${polarToCartesian(centerX, centerY, outerRadius, progressAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, progressAngle).y}
                    A ${outerRadius} ${outerRadius} 0 ${progressAngle - startAngle > Math.PI ? 1 : 0} 0 ${polarToCartesian(centerX, centerY, outerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, startAngle).y}
                    Z
                  `}
                  fill={COLORS.kpis[i]}
                  opacity="0.9"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handleMouseEnter(kpi, e, 'kpi')}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}
          
          {/* Center health score */}
          <text x={centerX} y={centerY - 10} textAnchor="middle" className="svg-health-score" fill="var(--color-primary)">
            {formatPercent(data.health, 1)}
          </text>
          <text x={centerX} y={centerY + 20} textAnchor="middle" className="svg-label" fill="var(--color-text-secondary)">
            Health Score
          </text>
          
          {/* Site title */}
          <text x={centerX} y={30} textAnchor="middle" className="svg-title" fill="var(--color-text)">
            {data.site}
          </text>
        </svg>
        
        {tooltip && (
          <div
            className="tooltip"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10
            }}
          >
            {tooltip.type === 'cluster' ? (
              <>
                <div className="tooltip-title">{tooltip.item.name}</div>
                <div className="tooltip-value">Tráfico: {formatNumber(tooltip.item.traffic)}</div>
                <div className="tooltip-value">Conversión: {formatPercent(tooltip.item.conversionRate)}%</div>
                <div className="tooltip-value">Score: {tooltip.item.contentScore}/100</div>
                <div className="tooltip-value">Participación: {formatPercent(tooltip.item.share)}%</div>
              </>
            ) : (
              <>
                <div className="tooltip-title">{tooltip.item.label}</div>
                <div className="tooltip-value">
                  Valor: {formatNumber(tooltip.item.value)}{tooltip.item.unit || ''}
                </div>
                {tooltip.item.change !== null && (
                  <div className={`tooltip-change ${tooltip.item.change >= 0 ? 'positive' : 'negative'}`}>
                    {tooltip.item.change >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(tooltip.item.change))}% vs anterior
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WheelInfographic({ data }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  
  const width = 600;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const innerRadius = 80;
  const outerRadius = 220;
  
  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + (radius * Math.cos(angleInRadians - Math.PI / 2)),
      y: centerY + (radius * Math.sin(angleInRadians - Math.PI / 2))
    };
  };
  
  const handleMouseEnter = (step, event) => {
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      step
    });
  };
  
  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const handleClick = (step) => {
    setSelectedStep(selectedStep === step.step ? null : step.step);
  };
  
  const exportSVG = () => {
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wheel-pipeline.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const exportPNG = () => {
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `wheel-pipeline.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };
  
  return (
    <div className="infographic-card fade-in">
      <div className="infographic-header">
        <h3 className="infographic-title">Rueda 8 Pasos</h3>
        <div className="export-buttons">
          <button className="btn btn-secondary" onClick={exportSVG}>SVG</button>
          <button className="btn btn-secondary" onClick={exportPNG}>PNG</button>
        </div>
      </div>
      <p className="infographic-description">
        Flujo de trabajo SEO programático. Cada pétalo marca el avance por etapa, de investigación a iteración.
      </p>
      <div className="svg-container">
        <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <rect width={width} height={height} fill="var(--color-surface)" />
          
          {/* Petals */}
          {data.pipeline.map((step, i) => {
            const sectorAngle = (2 * Math.PI) / 8;
            const startAngle = i * sectorAngle;
            const endAngle = startAngle + sectorAngle;
            const midAngle = (startAngle + endAngle) / 2;
            const progressRadius = innerRadius + (outerRadius - innerRadius) * step.status;
            const isSelected = selectedStep === step.step;
            
            return (
              <g key={i}>
                {/* Petal shape */}
                <path
                  d={`
                    M ${polarToCartesian(centerX, centerY, innerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, startAngle).y}
                    L ${polarToCartesian(centerX, centerY, outerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, startAngle).y}
                    A ${outerRadius} ${outerRadius} 0 0 1 ${polarToCartesian(centerX, centerY, outerRadius, endAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, endAngle).y}
                    L ${polarToCartesian(centerX, centerY, innerRadius, endAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, endAngle).y}
                    A ${innerRadius} ${innerRadius} 0 0 0 ${polarToCartesian(centerX, centerY, innerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, startAngle).y}
                    Z
                  `}
                  fill={COLORS.pipeline[i]}
                  opacity={isSelected ? "1" : "0.3"}
                  stroke="var(--color-surface)"
                  strokeWidth="3"
                  style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                  onClick={() => handleClick(step)}
                  onMouseEnter={(e) => handleMouseEnter(step, e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Progress indicator */}
                <path
                  d={`
                    M ${polarToCartesian(centerX, centerY, innerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, startAngle).y}
                    L ${polarToCartesian(centerX, centerY, progressRadius, startAngle).x} ${polarToCartesian(centerX, centerY, progressRadius, startAngle).y}
                    A ${progressRadius} ${progressRadius} 0 0 1 ${polarToCartesian(centerX, centerY, progressRadius, endAngle).x} ${polarToCartesian(centerX, centerY, progressRadius, endAngle).y}
                    L ${polarToCartesian(centerX, centerY, innerRadius, endAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, endAngle).y}
                    A ${innerRadius} ${innerRadius} 0 0 0 ${polarToCartesian(centerX, centerY, innerRadius, startAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, startAngle).y}
                    Z
                  `}
                  fill={COLORS.pipeline[i]}
                  opacity="0.9"
                  stroke="var(--color-surface)"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleClick(step)}
                />
                
                {/* Step number */}
                <text
                  x={polarToCartesian(centerX, centerY, outerRadius + 35, midAngle).x}
                  y={polarToCartesian(centerX, centerY, outerRadius + 35, midAngle).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="svg-label"
                  fill="var(--color-text)"
                  fontWeight="bold"
                  fontSize="18"
                >
                  {String(step.step).padStart(2, '0')}
                </text>
                
                {/* Step name */}
                <text
                  x={polarToCartesian(centerX, centerY, (innerRadius + outerRadius) / 2, midAngle).x}
                  y={polarToCartesian(centerX, centerY, (innerRadius + outerRadius) / 2, midAngle).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="svg-label"
                  fill="white"
                  fontWeight="600"
                  fontSize="11"
                >
                  {step.name}
                </text>
              </g>
            );
          })}
          
          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r={innerRadius - 10} fill="var(--color-primary)" opacity="0.2" />
          <text x={centerX} y={centerY - 5} textAnchor="middle" className="svg-title" fill="var(--color-text)" fontSize="16">
            Pipeline SEO
          </text>
          <text x={centerX} y={centerY + 15} textAnchor="middle" className="svg-label" fill="var(--color-text-secondary)" fontSize="12">
            Programático
          </text>
        </svg>
        
        {tooltip && (
          <div
            className="tooltip"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10
            }}
          >
            <div className="tooltip-title">{tooltip.step.name}</div>
            <div className="tooltip-value">Progreso: {formatPercent(tooltip.step.status * 100)}%</div>
            <div className="tooltip-value">Nota: {tooltip.step.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PuzzleInfographic({ data }) {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  
  const width = 600;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 200;
  
  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + (radius * Math.cos(angleInRadians - Math.PI / 2)),
      y: centerY + (radius * Math.sin(angleInRadians - Math.PI / 2))
    };
  };
  
  const handleMouseEnter = (cluster, event) => {
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cluster
    });
  };
  
  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  const exportSVG = () => {
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `puzzle-${data.site}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const exportPNG = () => {
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `puzzle-${data.site}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };
  
  return (
    <div className="infographic-card fade-in">
      <div className="infographic-header">
        <h3 className="infographic-title">Pastel Rompecabezas</h3>
        <div className="export-buttons">
          <button className="btn btn-secondary" onClick={exportSVG}>SVG</button>
          <button className="btn btn-secondary" onClick={exportPNG}>PNG</button>
        </div>
      </div>
      <p className="infographic-description">
        Los ocho pilares de rendimiento. Cada pieza detalla un factor y su impacto relativo.
      </p>
      <div className="svg-container">
        <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <rect width={width} height={height} fill="var(--color-surface)" />
          
          {/* Puzzle pieces */}
          {data.clusters.map((cluster, i) => {
            const startAngle = cluster.startAngle;
            const endAngle = cluster.endAngle;
            const midAngle = (startAngle + endAngle) / 2;
            
            return (
              <g key={i}>
                {/* Piece */}
                <path
                  d={`
                    M ${centerX} ${centerY}
                    L ${polarToCartesian(centerX, centerY, radius, startAngle).x} ${polarToCartesian(centerX, centerY, radius, startAngle).y}
                    A ${radius} ${radius} 0 ${endAngle - startAngle > Math.PI ? 1 : 0} 1 ${polarToCartesian(centerX, centerY, radius, endAngle).x} ${polarToCartesian(centerX, centerY, radius, endAngle).y}
                    Z
                  `}
                  fill={COLORS.clusters[i]}
                  opacity="0.85"
                  stroke="var(--color-surface)"
                  strokeWidth="4"
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => handleMouseEnter(cluster, e)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Number callout */}
                <g>
                  <circle
                    cx={polarToCartesian(centerX, centerY, radius + 40, midAngle).x}
                    cy={polarToCartesian(centerX, centerY, radius + 40, midAngle).y}
                    r="18"
                    fill={COLORS.clusters[i]}
                    stroke="var(--color-surface)"
                    strokeWidth="2"
                  />
                  <text
                    x={polarToCartesian(centerX, centerY, radius + 40, midAngle).x}
                    y={polarToCartesian(centerX, centerY, radius + 40, midAngle).y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontWeight="bold"
                    fontSize="14"
                  >
                    {i + 1}
                  </text>
                  
                  {/* Connecting line */}
                  <line
                    x1={polarToCartesian(centerX, centerY, radius * 0.6, midAngle).x}
                    y1={polarToCartesian(centerX, centerY, radius * 0.6, midAngle).y}
                    x2={polarToCartesian(centerX, centerY, radius + 22, midAngle).x}
                    y2={polarToCartesian(centerX, centerY, radius + 22, midAngle).y}
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                </g>
              </g>
            );
          })}
          
          {/* Center circle with title */}
          <circle cx={centerX} cy={centerY} r="50" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="2" />
          <text x={centerX} y={centerY - 5} textAnchor="middle" className="svg-title" fill="var(--color-text)" fontSize="14">
            Clusters
          </text>
          <text x={centerX} y={centerY + 15} textAnchor="middle" className="svg-label" fill="var(--color-text-secondary)" fontSize="12">
            Temáticos
          </text>
        </svg>
        
        {tooltip && (
          <div
            className="tooltip"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10
            }}
          >
            <div className="tooltip-title">{tooltip.cluster.name}</div>
            <div className="tooltip-value">Tráfico: {formatNumber(tooltip.cluster.traffic)}</div>
            <div className="tooltip-value">Participación: {formatPercent(tooltip.cluster.share)}%</div>
            <div className="tooltip-value">Conversión: {formatPercent(tooltip.cluster.conversionRate)}%</div>
            <div className="tooltip-value">Content Score: {tooltip.cluster.contentScore}/100</div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-bg-1)', borderRadius: '8px' }}>
        {data.clusters.map((cluster, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontSize: '12px' }}>
            <div style={{ width: '16px', height: '16px', background: COLORS.clusters[i], borderRadius: '3px' }}></div>
            <span style={{ fontWeight: '600' }}>{i + 1}.</span>
            <span style={{ flex: 1 }}>{cluster.name}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{formatNumber(cluster.traffic)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataTable({ data }) {
  const [showTable, setShowTable] = useState(false);
  
  if (!showTable) {
    return (
      <div className="export-controls">
        <button className="btn btn-secondary" onClick={() => setShowTable(true)}>
          Ver como tabla (accesibilidad)
        </button>
      </div>
    );
  }
  
  return (
    <div className="data-table">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>Datos tabulares</h3>
        <button className="btn btn-secondary" onClick={() => setShowTable(false)}>Ocultar tabla</button>
      </div>
      
      <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>KPIs</h4>
      <table>
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Valor Actual</th>
            <th>Valor Anterior</th>
            <th>Cambio</th>
          </tr>
        </thead>
        <tbody>
          {data.kpis.map((kpi, i) => (
            <tr key={i}>
              <td>{kpi.label}</td>
              <td>{formatNumber(kpi.value)}{kpi.unit || ''}</td>
              <td>{kpi.prev ? `${formatNumber(kpi.prev)}${kpi.unit || ''}` : '-'}</td>
              <td>{kpi.change !== null ? `${kpi.change >= 0 ? '+' : ''}${formatPercent(kpi.change)}%` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>Clusters Temáticos</h4>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tráfico</th>
            <th>Tasa de Conversión</th>
            <th>Content Score</th>
          </tr>
        </thead>
        <tbody>
          {data.clusters.map((cluster, i) => (
            <tr key={i}>
              <td>{cluster.name}</td>
              <td>{formatNumber(cluster.traffic)}</td>
              <td>{formatPercent(cluster.conversionRate)}%</td>
              <td>{cluster.contentScore}/100</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h4 style={{ marginTop: '24px', marginBottom: '8px' }}>Pipeline</h4>
      <table>
        <thead>
          <tr>
            <th>Paso</th>
            <th>Nombre</th>
            <th>Progreso</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          {data.pipeline.map((step, i) => (
            <tr key={i}>
              <td>{step.step}</td>
              <td>{step.name}</td>
              <td>{formatPercent(step.status * 100)}%</td>
              <td>{step.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  
  const handleGenerate = (domain, period) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let rawData;
      if (domain.includes('tienda') || domain.includes('ecommerce')) {
        rawData = SAMPLE_DATA.ecommerce;
      } else if (domain.includes('noticias') || domain.includes('news')) {
        rawData = SAMPLE_DATA.news;
      } else {
        rawData = SAMPLE_DATA.creovision;
      }
      
      const adaptedData = adaptData(rawData);
      setData(adaptedData);
      setLoading(false);
    }, 1500);
  };
  
  return (
    <div className="app-container">
      <div className="header">
        <h1>SEO Analytics - Infografías Automáticas</h1>
        <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>
      
      <InputForm onGenerate={handleGenerate} loading={loading} />
      
      {loading && <LoadingSpinner />}
      
      {data && !loading && (
        <>
          <div className="infographics-grid">
            <DonutInfographic data={data} />
            <WheelInfographic data={data} />
            <PuzzleInfographic data={data} />
          </div>
          
          <DataTable data={data} />
        </>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);