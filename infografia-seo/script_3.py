
# Crear documentación de prompts para la IA
prompts_doc = '''# Prompts para DeepSeek API - Generación de datos SEO

## 1. Prompt del Sistema (System)

```json
{
  "role": "system",
  "content": "Eres un motor de analítica SEO profesional. Tu función es generar datos realistas de rendimiento web basados en dominios reales. IMPORTANTE: Devuelve ÚNICAMENTE JSON válido siguiendo el esquema exacto proporcionado. No incluyas texto adicional, explicaciones ni markdown. El JSON debe ser directamente parseable."
}
```

## 2. Prompt del Usuario (User) - Template

```json
{
  "role": "user",
  "content": "Genera datos de analítica SEO para el siguiente dominio:\\n\\nDominio: {{site}}\\nPeriodo actual: {{from}} hasta {{to}}\\nPeriodo comparativo: {{compareFrom}} hasta {{compareTo}}\\n\\nInstrucciones:\\n1. Genera exactamente 8 KPIs del array [traffic, ctr, avgPos, pagesSpeed, coreWebVitals, backlinks, domainRating, bounce]\\n2. Si una métrica es 'menos es mejor' (avgPos, bounce), marca invert:true\\n3. Genera exactamente 8 topicClusters con nombres relevantes al dominio\\n4. Asegúrate de que la suma de traffic en topicClusters sea > 0\\n5. Genera los 8 pasos del pipeline con status entre 0.0 y 1.0\\n6. Los valores de 'prev' deben ser coherentes con la tendencia del sitio\\n7. healthScore debe estar entre 0 y 100\\n\\nResponde SOLO con el objeto JSON, sin formato markdown."
}
```

## 3. Ejemplos de uso con diferentes dominios

### Ejemplo 1: E-commerce
```javascript
const prompt = {
  site: "tienda-online.cl",
  from: "2025-10-01",
  to: "2025-10-31",
  compareFrom: "2025-09-01",
  compareTo: "2025-09-30"
};
```

Respuesta esperada:
```json
{
  "site": "tienda-online.cl",
  "period": {
    "from": "2025-10-01",
    "to": "2025-10-31",
    "compareFrom": "2025-09-01",
    "compareTo": "2025-09-30"
  },
  "totals": {
    "sessions": 125430,
    "users": 98210,
    "conversions": 3420,
    "revenue": 45780000,
    "pagesIndexed": 1240,
    "healthScore": 76.4
  },
  "kpis": [
    {"id": "traffic", "label": "Tráfico orgánico", "value": 87650, "prev": 82110},
    {"id": "ctr", "label": "CTR", "value": 5.2, "prev": 4.9, "unit": "%"},
    {"id": "avgPos", "label": "Posición media", "value": 12.8, "prev": 14.2, "invert": true},
    {"id": "pagesSpeed", "label": "PageSpeed", "value": 82, "prev": 79, "unit": "/100"},
    {"id": "coreWebVitals", "label": "CWV OK", "value": 71, "prev": 68, "unit": "%"},
    {"id": "backlinks", "label": "Backlinks nuevos", "value": 245, "prev": 198},
    {"id": "domainRating", "label": "Autoridad (DR)", "value": 52, "prev": 50, "unit": "/100"},
    {"id": "bounce", "label": "Rebote", "value": 42, "prev": 45, "unit": "%", "invert": true}
  ],
  "topicClusters": [
    {"name": "Electrónica", "traffic": 28400, "conversionRate": 4.2, "contentScore": 78},
    {"name": "Ropa y Moda", "traffic": 19800, "conversionRate": 3.8, "contentScore": 72},
    {"name": "Hogar y Deco", "traffic": 14200, "conversionRate": 3.1, "contentScore": 68},
    {"name": "Deportes", "traffic": 9870, "conversionRate": 2.9, "contentScore": 65},
    {"name": "Juguetes", "traffic": 6540, "conversionRate": 4.5, "contentScore": 71},
    {"name": "Libros", "traffic": 4230, "conversionRate": 2.2, "contentScore": 61},
    {"name": "Salud y Belleza", "traffic": 2890, "conversionRate": 3.6, "contentScore": 69},
    {"name": "Accesorios", "traffic": 1720, "conversionRate": 2.1, "contentScore": 58}
  ],
  "pipeline": [
    {"step": 1, "name": "Research", "status": 0.85, "notes": "Categorías priorizadas"},
    {"step": 2, "name": "Clusterización", "status": 0.75, "notes": "8 categorías activas"},
    {"step": 3, "name": "Auditoría técnica", "status": 0.65, "notes": "Optimizando imágenes"},
    {"step": 4, "name": "Contenido", "status": 0.55, "notes": "Fichas de producto"},
    {"step": 5, "name": "On-page", "status": 0.45, "notes": "Schema productos"},
    {"step": 6, "name": "Off-page", "status": 0.35, "notes": "Link building"},
    {"step": 7, "name": "Monitoreo", "status": 0.80, "notes": "Analytics OK"},
    {"step": 8, "name": "Iteración", "status": 0.25, "notes": "A/B testing checkout"}
  ]
}
```

## 4. Validaciones que debe pasar el JSON generado

```javascript
function validateAPIResponse(data) {
  const checks = {
    hasRequiredFields: !!(data.site && data.period && data.totals && data.kpis && data.topicClusters && data.pipeline),
    kpisCount: data.kpis?.length === 8,
    clustersCount: data.topicClusters?.length === 8,
    pipelineCount: data.pipeline?.length === 8,
    trafficSum: data.topicClusters?.reduce((s, c) => s + c.traffic, 0) > 0,
    allStatusValid: data.pipeline?.every(p => p.status >= 0 && p.status <= 1),
    healthScoreValid: data.totals?.healthScore >= 0 && data.totals?.healthScore <= 100,
    hasInvertFlags: data.kpis?.some(k => k.invert === true)
  };
  
  return Object.entries(checks).every(([key, val]) => val === true);
}
```

## 5. Integración en React/Vite

```javascript
// hooks/useSEOData.js
import { useState, useEffect } from 'react';
import { adaptSEOData } from '../utils/dataAdapter';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export function useSEOData(site, period) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const prompt = buildPrompt(site, period);
        const response = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'Eres un motor de analítica SEO. Devuelve SOLO JSON válido.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })
        });
        
        const result = await response.json();
        const rawData = JSON.parse(result.choices[0].message.content);
        
        // Adaptar datos para las infografías
        const adapted = adaptSEOData(rawData);
        setData(adapted);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (site && period) {
      fetchData();
    }
  }, [site, period]);
  
  return { data, loading, error };
}

function buildPrompt(site, period) {
  return `Genera datos de analítica SEO para:
Dominio: ${site}
Periodo: ${period.from} hasta ${period.to}
Comparar: ${period.compareFrom} hasta ${period.compareTo}

Requisitos:
- 8 KPIs exactos
- 8 topicClusters con traffic > 0
- 8 pasos de pipeline con status 0-1
- Marca invert:true en avgPos y bounce
- Solo JSON, sin markdown`;
}
```

## 6. Configuración de variables de entorno

```bash
# .env.local
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
```

## 7. Costos estimados (DeepSeek)

- Modelo: deepseek-chat
- Input: ~$0.14 por 1M tokens
- Output: ~$0.28 por 1M tokens
- Por solicitud: ~500 tokens input + ~1500 tokens output = ~$0.0005 USD
- 1000 consultas/día ≈ $0.50 USD/día ≈ $15 USD/mes

## 8. Alternativas de APIs

### OpenAI GPT-4o-mini
```javascript
{
  endpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  cost: '$0.15/1M input, $0.60/1M output',
  pros: 'Muy estable, JSON mode nativo',
  cons: 'Más caro que DeepSeek'
}
```

### Anthropic Claude 3 Haiku
```javascript
{
  endpoint: 'https://api.anthropic.com/v1/messages',
  model: 'claude-3-haiku-20240307',
  cost: '$0.25/1M input, $1.25/1M output',
  pros: 'Excelente seguimiento de instrucciones',
  cons: 'Requiere formato de mensajes diferente'
}
```

### Groq (Llama 3)
```javascript
{
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'llama-3.1-70b-versatile',
  cost: 'Gratis hasta cierto límite',
  pros: 'Ultra rápido, económico',
  cons: 'Rate limits más estrictos'
}
```
'''

with open('api_prompts_guide.md', 'w', encoding='utf-8') as f:
    f.write(prompts_doc)

print("✓ Guía de prompts generada: api_prompts_guide.md")
print("\nContenido incluido:")
print("  1. Prompts del sistema y usuario")
print("  2. Ejemplos con diferentes dominios")
print("  3. Validaciones del JSON")
print("  4. Hook React para integración")
print("  5. Variables de entorno")
print("  6. Estimación de costos")
print("  7. APIs alternativas")
