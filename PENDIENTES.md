# 📋 PENDIENTES - CreoVision

**Última actualización**: 10 de Noviembre 2025
**Responsable**: Daniel

---

## 🔴 CRÍTICOS - Resolver ASAP

### 0. **Sistema de Créditos - Configuración Pendiente**
**Status**: 🔴 Código listo, falta ejecutar
**Prioridad**: CRÍTICA (bloquea monetización)

#### **0.1. Ejecutar Migraciones SQL en Supabase** (10 min)
**Archivos listos**:
- ✅ `supabase/migrations/022_create_subscription_packages.sql` (5 planes)
- ✅ `supabase/migrations/023_create_feature_costs.sql` (25 features)
- ✅ `supabase/migrations/024_create_credit_functions.sql` (6 funciones)

**Configuración**:
- Plan Pro: `is_popular = true` ⭐
- Otros planes: `is_popular = false`
- 22 features: `is_active = true`
- 3 features inactivos: TikTok Trend Analyzer, Audience Persona Builder, Monetization Advisor

**Pasos**:
- [ ] Abrir https://supabase.com/dashboard → Proyecto `bouqpierlyeukedpxugk`
- [ ] SQL Editor → New query
- [ ] Copiar y ejecutar 022_create_subscription_packages.sql
- [ ] Copiar y ejecutar 023_create_feature_costs.sql
- [ ] Copiar y ejecutar 024_create_credit_functions.sql
- [ ] Verificar: `SELECT * FROM subscription_packages ORDER BY sort_order;`
- [ ] Verificar: `SELECT get_feature_cost('growth_dashboard');` → debe retornar 380

**Guía**: Ver `GUIA-EJECUTAR-SQL-SUPABASE.md`

---

#### **0.2. Configurar Reddit API en Vercel** (5 min)
**Credenciales listas**:
```
REDDIT_CLIENT_ID=Po_BNW_hocVZ59rFc8eNog
REDDIT_CLIENT_SECRET=V17cFVUwjuWQpPcDZYm4vyd9xUxkg
REDDIT_USER_AGENT=creovision:v1.0 (by /u/Real-Juggernaut-1467)
REDDIT_REDIRECT_URI=https://creovision.io/api/reddit-auth
```

**Pasos**:
- [ ] Abrir https://vercel.com → Proyecto CreoVision
- [ ] Settings → Environment Variables
- [ ] Agregar las 4 variables (sin prefijo VITE_)
- [ ] Redeploy del proyecto
- [ ] Verificar que las variables estén disponibles en producción

**Guía**: Ver `CONFIGURAR-VERCEL-REDDIT.md`

---

#### **0.3. Actualizar Frontend para Sistema de Créditos** (2-3 horas)

**Archivos a modificar**:

**1. PricingSection.jsx** (30 min)
- [ ] Importar `SUBSCRIPTION_PLANS` de `src/config/creditCosts.js`
- [ ] Reemplazar planes hardcodeados por datos dinámicos
- [ ] Usar `is_popular` para mostrar badge "Más Popular" solo en Pro
- [ ] Actualizar features de cada plan desde el objeto
- [ ] Mantener diseño actual, solo cambiar fuente de datos

**2. Tools.jsx - Agregar consumo de créditos** (1.5 horas)
Features que faltan implementar consumo:
- [ ] Análisis de Competencia (200 créditos)
- [ ] Análisis de Tendencias (150 créditos)
- [ ] Análisis de Canal (120 créditos)
- [ ] Predictor de Viralidad (100 créditos)
- [ ] Personalización Plus (50 créditos)
- [ ] SEO Coach (45 créditos)
- [ ] Análisis de Video (30 créditos)
- [ ] Generación de Hashtags (25 créditos)
- [ ] Calendario Inteligente (25 créditos)
- [ ] Weekly Trends (15 créditos)
- [ ] Re-generar Guión (10 créditos)
- [ ] Análisis de Título (8 créditos)
- [ ] Búsqueda de Tendencias (5 créditos)
- [ ] Consultar Historial (2 créditos)

**Patrón a seguir** (igual que Growth Dashboard):
```javascript
import { CREDIT_COSTS } from '../config/creditCosts';

// Antes de llamar la API
const response = await fetch('/api/feature-name', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    featureSlug: 'feature_name',
    // ... otros parámetros
  })
});

// En el API endpoint, verificar créditos ANTES de ejecutar
const { data: creditCheck } = await supabase
  .rpc('check_user_credits', {
    p_user_id: userId,
    p_feature_slug: featureSlug
  });

if (!creditCheck.has_credits) {
  return res.status(402).json({
    error: 'Insufficient credits',
    required: creditCheck.required_credits,
    current: creditCheck.current_balance
  });
}

// Descontar créditos DESPUÉS de éxito
await supabase.rpc('deduct_credits', {
  p_user_id: userId,
  p_amount: CREDIT_COSTS.FEATURE_NAME
});
```

**3. api/reddit.js** (Crear endpoint nuevo) (30 min)
- [ ] Crear archivo `api/reddit.js`
- [ ] Implementar análisis de Reddit (60 créditos)
- [ ] Verificar y descontar créditos
- [ ] Usar `redditService.js` existente

**4. Crear componente CreditBadge** (30 min)
- [ ] Mostrar créditos actuales del usuario
- [ ] Animación cuando se consumen créditos
- [ ] Warning cuando quedan < 20%
- [ ] Link a "Comprar más créditos"

---

### 1. **Growth Dashboard API Error**
**Problema**: Error 404 "Usuario no inicializado en el sistema de créditos"
**Status**: 🔴 Bloqueado - Requiere debugging
**Archivos afectados**:
- `api/growthDashboard.js`
- `supabase/migrations/004_create_credit_system.sql`

**Detalles del error**:
```
Usuario: ef6c7524-181a-4cb1-8ec3-65e2f140b82f
Créditos en BD: 6090 (suficientes)
Error: Backend no encuentra el usuario a pesar de que existe
```

**Posibles causas**:
1. Vercel no está usando la última versión del código
2. SUPABASE_SERVICE_ROLE_KEY no está configurada correctamente
3. Problema de cache en Vercel Functions
4. RLS policies bloqueando el acceso

**Próximos pasos**:
- [ ] Verificar deployment en Vercel Dashboard
- [ ] Revisar logs de la función en Vercel
- [ ] Validar que service role key esté bien configurada
- [ ] Forzar redespliegue limpio: `vercel --prod --force`
- [ ] Probar endpoint con Postman/Thunder Client
- [ ] Revisar políticas RLS en Supabase

**Archivos con cambios recientes**:
```
a2408cd1 - debug: agregar logging detallado
4d8cde23 - fix: usar maybeSingle() para evitar error de RLS
60c3d151 - fix: crear automáticamente user_credits
863553ca - fix: corregir campo de créditos (balance -> total_credits)
```

---

## 🟡 IMPORTANTES - Testing Necesario

### 2. **Probar Web Share API en dispositivos móviles**
**Implementado**: ✅ Código deployado
**Status**: 🟡 Pendiente de testing
**Commit**: `3bfc57a0`

**Qué probar**:

#### **iOS Safari** (iPhone/iPad):
- [ ] Botón "Compartir" aparece correctamente
- [ ] Al hacer clic, abre iOS Share Sheet nativo
- [ ] Se puede compartir a WhatsApp
- [ ] Se puede compartir a Instagram Stories
- [ ] Se puede compartir a TikTok
- [ ] El texto incluye título + guión + URL
- [ ] Funciona en vertical y horizontal

#### **Android Chrome**:
- [ ] Botón "Compartir" aparece correctamente
- [ ] Al hacer clic, abre Android Share Sheet
- [ ] Se puede compartir a WhatsApp
- [ ] Se puede compartir a Instagram
- [ ] El texto está completo

#### **Desktop** (Chrome/Firefox/Edge):
- [ ] Botón muestra "Copiar" (no "Compartir")
- [ ] Al hacer clic, copia al portapapeles
- [ ] Toast notification aparece
- [ ] Botón cambia a "¡Copiado!" por 2 segundos

**Documentación**: Ver `TESTING-WEB-SHARE-API.md`

---

## 🟢 MEJORAS - Implementar cuando sea posible

### 3. **Integración YouTube API**
**Prioridad**: 🟢 Alta (impacto en conversión)
**Tiempo estimado**: 1-2 semanas

**Objetivo**: Publicar videos directamente a YouTube desde CreoVision

**Pasos**:
1. Configurar OAuth 2.0 con Google Cloud Console
2. Implementar flujo de autenticación
3. Crear endpoint `/api/youtube-upload`
4. Integrar YouTube Data API v3
5. UI para subir video + metadata
6. Programar publicaciones

**Beneficio estimado**: +40% conversión, diferenciador vs competencia

---

### 4. **Deep Links para TikTok/Instagram**
**Prioridad**: 🟢 Media
**Tiempo estimado**: 3-5 días

**Deep links a implementar**:
```javascript
// TikTok
tiktok://create?text=${encodeURIComponent(script)}

// YouTube Mobile
youtube://create?text=${encodeURIComponent(script)}

// Instagram (solo share sheet, no hay deep link directo)
```

**Implementación**:
- Detectar si la app está instalada
- Si sí: abrir deep link
- Si no: mostrar instrucciones o abrir web

---

### 5. **A/B Testing en Landing Page**
**Prioridad**: 🟢 Alta (fácil, alto impacto)
**Tiempo estimado**: 1 día

**Setup rápido con Vercel Edge Config**:
```javascript
import { get } from '@vercel/edge-config';

const variant = await get('hero_variant'); // 'a' o 'b'
```

**Tests sugeridos**:
1. **Hero Headline**:
   - A: "Crea Contenido que Funciona, Impulsado por Datos Reales"
   - B: "Multiplica tu Alcance con IA que Entiende tu Audiencia"

2. **CTA Button**:
   - A: "Empieza Gratis"
   - B: "Genera tu Primer Viral Ahora"

3. **Social Proof**:
   - A: Testimonios en carousel
   - B: Contador de "creadores activos"

**Métricas a trackear**:
- CTA clicks / Pageviews = CTR
- Sign-ups / CTA clicks = Conversion Rate

---

### 6. **Rate Limiting y Anti-Abuse**
**Prioridad**: 🟢 Media
**Tiempo estimado**: 2-3 días

**Implementar**:
- Rate limiting por IP (ejemplo: 100 requests/hora)
- Rate limiting por usuario (ejemplo: 50 generaciones/día para Free)
- Honeypot fields en formularios
- reCAPTCHA v3 en endpoints críticos

**Herramientas sugeridas**:
- Upstash Redis para rate limiting
- Vercel Edge Middleware

---

### 7. **Analytics y Monitoring**
**Prioridad**: 🟢 Media
**Tiempo estimado**: 1 día

**Agregar tracking de**:
- Web Share API usage (clicks, success rate)
- Modelos IA usados (QWEN vs DeepSeek vs Gemini)
- Errores de APIs (alertas cuando > 10% falla)
- Créditos consumidos por feature
- Conversión por variante A/B

**Herramientas**:
- Plausible (ya integrado)
- Sentry para error tracking
- Vercel Analytics

---

### 8. **Sistema de Créditos - Mejoras**
**Prioridad**: 🟢 Baja
**Tiempo estimado**: 1 semana

**Mejoras pendientes**:
- Dashboard de créditos para usuarios
- Historial de consumo por feature
- Paquetes de créditos (compra con MercadoPago/Stripe)
- Notificaciones cuando quedan pocos créditos
- Auto-recarga opcional

---

### 9. **Optimizaciones de Performance**
**Prioridad**: 🟢 Baja
**Tiempo estimado**: 2-3 días

**Optimizaciones**:
- Lazy load de componentes pesados (ya implementado parcialmente)
- Image optimization con Next.js Image
- Code splitting más agresivo
- Cache de responses IA (ya implementado)
- CDN para assets estáticos

---

### 10. **SEO y Structured Data**
**Prioridad**: 🟢 Baja
**Tiempo estimado**: 1 día

**Mejoras**:
- Sitemap XML dinámico
- Robots.txt optimizado
- Open Graph tags para cada página
- Twitter Cards
- Schema.org structured data (ya implementado parcialmente)

---

## 🔧 BUGS MENORES

### 11. **Historial de Growth Dashboard**
**Status**: ⚠️ Función de BD no existe
**Archivo**: `src/services/growthDashboardService.js:147`

**Error**:
```javascript
// Función get_growth_dashboard_history comentada porque no existe en Supabase
return []; // Temporal
```

**Solución**:
- Crear función SQL `get_growth_dashboard_history` en Supabase
- Descomentar código en growthDashboardService.js

---

### 12. **Validación de URLs en formularios**
**Prioridad**: Baja
**Ubicación**: Tools.jsx, varios inputs

**Agregar**:
- Validación de formato de URL
- Sanitización de inputs
- Mensajes de error claros

---

## 📚 DOCUMENTACIÓN

### 13. **API Documentation**
**Prioridad**: Media

**Crear documentación de**:
- Endpoints disponibles
- Parámetros requeridos/opcionales
- Respuestas esperadas
- Códigos de error
- Rate limits

**Herramienta sugerida**: Swagger/OpenAPI

---

### 14. **User Guide / Help Center**
**Prioridad**: Media

**Crear**:
- Guía de inicio rápido
- FAQs
- Video tutorials
- Tips para contenido viral
- Troubleshooting común

---

## 📊 RESUMEN DE PRIORIDADES

| Prioridad | Cantidad | % del total |
|-----------|----------|-------------|
| 🔴 Crítico | 1 | 7% |
| 🟡 Importante | 1 | 7% |
| 🟢 Mejora | 12 | 86% |

---

## 🎯 SPRINT SUGERIDO (Próximos 7 días)

### **Semana 1**:
1. 🔴 **Resolver Growth Dashboard error** (Día 1-2)
2. 🟡 **Testing Web Share API** (Día 2-3)
3. 🟢 **Setup A/B Testing básico** (Día 4)
4. 🟢 **Rate Limiting + Anti-abuse** (Día 5-7)

### **Semana 2-4**:
- YouTube API integration
- Deep links TikTok/Instagram
- Dashboard de créditos
- Analytics avanzado

---

## 📝 NOTAS

- Error de Growth Dashboard es bloqueante para usuarios Premium
- Web Share API tiene alto impacto en engagement
- A/B Testing es quick win (1 día, alto ROI)
- YouTube API es diferenciador clave vs competencia

---

**Mantener este documento actualizado**: Cada vez que se complete un pendiente, marcarlo como ✅ y moverlo a `COMPLETADOS.md`

**Última revisión**: 2025-11-10 por Claude Code
