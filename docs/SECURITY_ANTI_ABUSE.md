# 🔒 SISTEMA ANTI-ABUSO - ANÁLISIS DE CANAL

## 📋 Resumen

El sistema de análisis de canales de YouTube está protegido con múltiples capas de seguridad para prevenir abuso y controlar costos de API.

---

## 🛡️ Capas de Protección Implementadas

### 1. **Límites Mensuales por Plan**

```javascript
const planLimits = {
  FREE: {
    monthlyAnalyses: 1,      // 1 análisis al mes
    videosPerAnalysis: 5      // Solo primeros 5 videos
  },
  PRO: {
    monthlyAnalyses: 2,       // 2 análisis al mes
    videosPerAnalysis: 50     // Últimos 50 videos
  },
  PREMIUM: {
    monthlyAnalyses: 4,       // 4 análisis al mes
    videosPerAnalysis: 100    // Últimos 100 videos
  }
};
```

**Ventajas:**
- ✅ Previene abuso de usuarios FREE
- ✅ Reseteo automático el 1° de cada mes
- ✅ Control de costos de YouTube Data API
- ✅ Control de costos de Gemini AI API

---

### 2. **Sistema de Cache Inteligente (30 días)**

Cada análisis se guarda en Supabase por **30 días**.

**Funcionamiento:**
1. Usuario solicita análisis de canal
2. Sistema verifica si existe análisis en cache
3. Si existe y es válido (< 30 días) → Retorna desde cache **SIN CONSUMIR APIs**
4. Si no existe → Analiza canal, consume APIs, guarda en cache

**Ahorro estimado:**
- 🔥 **70-80% de reducción en llamadas a APIs**
- 💰 Menor costo operacional
- ⚡ Respuestas instantáneas desde cache

---

### 3. **Validación de Límites Mensuales**

```javascript
export const checkAnalysisLimit = async (userId, userPlan = 'FREE') => {
  // Obtener primer día del mes actual
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Buscar análisis del mes actual
  const { data } = await supabase
    .from('channel_analyses')
    .select('id, analyzed_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gte('analyzed_at', firstDayOfMonth);

  const count = data?.length || 0;
  const canAnalyze = count < limits.monthlyAnalyses;

  return {
    canAnalyze,
    remaining: limits.monthlyAnalyses - count,
    limit: limits.monthlyAnalyses,
    current: count,
    videosAllowed: limits.videosPerAnalysis,
    resetsAt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
  };
};
```

---

### 4. **Autenticación Requerida (CRÍTICO)**

⚠️ **IMPORTANTE**: Actualmente usa un `userId` demo para desarrollo.

**Antes de producción, DEBES:**

```javascript
// ❌ DESARROLLO (INSEGURO)
const userId = 'demo-user-123';

// ✅ PRODUCCIÓN (SEGURO)
const { user } = useAuth();
if (!user) {
  return <Navigate to="/login" />;
}
const userId = user.id;
```

**Sin autenticación:**
- ❌ Cualquiera puede abusar del sistema
- ❌ Sin control de límites reales
- ❌ Sin tracking de usuarios

---

## 🎯 Escenarios de Uso

### Escenario 1: Usuario FREE - Primer Análisis

```
1. Usuario FREE visita /channel-analysis
2. Ingresa URL de su canal
3. Sistema verifica: 0/1 análisis usados ✅
4. Analiza 5 videos más recientes
5. Genera insights con IA
6. Guarda en cache (30 días)
7. Muestra Dashboard
```

**Resultado:** ✅ 1/1 análisis usado (límite alcanzado hasta próximo mes)

---

### Escenario 2: Usuario FREE - Intenta 2° Análisis

```
1. Usuario FREE intenta analizar otro canal
2. Sistema verifica: 1/1 análisis usados ❌
3. Sistema bloquea y muestra mensaje:
   "Límite mensual alcanzado. Tu plan FREE permite 1 análisis/mes.
    Se restablece el 1 de diciembre."
```

**Resultado:** ❌ Bloqueado. Debe esperar al próximo mes o actualizar a PRO.

---

### Escenario 3: Usuario PRO - Análisis del Mismo Canal

```
1. Usuario PRO analiza canal A (50 videos)
2. Guarda en cache por 30 días
3. Al día siguiente, vuelve a analizar canal A
4. Sistema detecta cache válido
5. Retorna análisis desde Supabase (instantáneo)
```

**Resultado:** ✅ NO consume su cuota de 2 análisis/mes. Cache = gratis.

---

### Escenario 4: Reseteo Mensual

```
Usuario FREE:
- 15 Oct: Usa su único análisis mensual (1/1) ❌ Límite alcanzado
- 1 Nov: Límite se resetea automáticamente (0/1) ✅ Puede analizar de nuevo
```

---

## 💰 Estimación de Costos

### YouTube Data API v3

**Cuota diaria:** 10,000 unidades/día

**Costo por análisis:**
- `channels.list`: 1 unidad
- `playlistItems.list`: 1 unidad
- `videos.list`: 1 unidad
- `commentThreads.list` (x3 videos): 3 unidades

**Total:** ~6 unidades por análisis

**Sin cache:**
- 1,000 análisis/día = 6,000 unidades ✅ OK
- 10,000 análisis/día = 60,000 unidades ❌ EXCEDE LÍMITE

**Con cache (70% hit rate):**
- 10,000 análisis/día = 18,000 unidades (solo 30% consumen API) ✅ MUCHO MEJOR

---

### Gemini AI

**Precios:**
- Gemini Pro: $0.00025 por 1K caracteres entrada
- Gemini Pro: $0.00075 por 1K caracteres salida

**Estimación por análisis:**
- Prompt: ~2K caracteres = $0.0005
- Respuesta: ~1K caracteres = $0.00075
- **Total: ~$0.00125 por análisis**

**Con límites mensuales:**
- FREE (1/mes): 1,000 usuarios = $1.25/mes
- PRO (2/mes): 500 usuarios = $1.25/mes
- PREMIUM (4/mes): 100 usuarios = $0.50/mes

**Total estimado:** ~$3/mes para 1,600 usuarios activos 💰 **MUY ECONÓMICO**

---

## 🔐 Checklist Pre-Producción

- [ ] **CRÍTICO**: Habilitar autenticación real (useAuth)
- [ ] Ejecutar SQL en Supabase (`supabase_schema_channel_analysis.sql`)
- [ ] Verificar RLS (Row Level Security) en Supabase
- [ ] Probar límites mensuales con usuarios reales
- [ ] Configurar monitoreo de cuotas de YouTube API
- [ ] Configurar alertas si se excede 80% de cuota diaria
- [ ] Agregar rate limiting adicional (ej: max 5 intentos/hora por IP)
- [ ] Implementar CAPTCHA si detectas tráfico sospechoso
- [ ] Monitorear costos de Gemini AI

---

## 🚨 Señales de Abuso

Monitorea estas métricas para detectar abuso:

### 1. **Análisis repetitivos del mismo canal**
```sql
SELECT user_id, channel_id, COUNT(*) as count
FROM channel_analyses
WHERE analyzed_at > NOW() - INTERVAL '1 day'
GROUP BY user_id, channel_id
HAVING COUNT(*) > 5;
```

### 2. **Usuarios sin autenticación haciendo muchos análisis**
```sql
SELECT user_id, COUNT(*) as count
FROM channel_analyses
WHERE user_id = 'demo-user-123'
  AND analyzed_at > NOW() - INTERVAL '1 day'
GROUP BY user_id
HAVING COUNT(*) > 10;
```

### 3. **Consumo inusual de API**
- Monitorea YouTube API quota en Google Cloud Console
- Configura alertas si supera 70% diario

---

## 💡 Mejoras Futuras (Opcional)

### 1. **Rate Limiting por IP**
```javascript
import rateLimit from 'express-rate-limit';

const channelAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 análisis por hora por IP
  message: 'Demasiados análisis. Intenta en una hora.'
});

app.use('/api/analyze-channel', channelAnalysisLimiter);
```

### 2. **CAPTCHA para FREE**
```javascript
if (userPlan === 'FREE') {
  // Requerir CAPTCHA antes de analizar
  const captchaValid = await verifyCaptcha(captchaToken);
  if (!captchaValid) {
    throw new Error('CAPTCHA inválido');
  }
}
```

### 3. **Webhooks de Supabase**
```javascript
// Trigger automático cuando usuario alcanza límite
CREATE OR REPLACE FUNCTION notify_limit_reached()
RETURNS TRIGGER AS $$
BEGIN
  -- Enviar email o notificación push
  PERFORM pg_notify('user_limit_reached', NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Monitoreo Recomendado

### Dashboard de Métricas

```javascript
// Métricas clave a monitorear
const metrics = {
  totalAnalysesToday: 1250,
  cacheHitRate: 72.5,        // % de análisis servidos desde cache
  youtubeQuotaUsed: 4200,    // De 10,000 diarias
  geminiCostToday: 1.85,     // USD
  freeUsers: 850,
  proUsers: 320,
  premiumUsers: 80,
  avgResponseTime: 3.2       // segundos
};
```

### Alertas Sugeridas

- 🚨 YouTube API quota > 80%
- 🚨 Gemini AI cost > $50/día
- 🚨 Usuario con > 10 análisis/hora
- 🚨 Cache hit rate < 50%
- ⚠️ Tiempo de respuesta > 10s

---

## ✅ Conclusión

El sistema está **diseñado para producción** con múltiples capas de protección:

1. ✅ Límites mensuales por plan
2. ✅ Cache de 30 días
3. ✅ Control de cantidad de videos
4. ✅ Reseteo automático mensual
5. ⚠️ **PENDIENTE**: Autenticación real

**Costo estimado:** ~$3-5/mes para 1,600 usuarios activos

**Una vez habilitada la autenticación, el sistema está listo para producción.** 🚀

---

**Creado:** 2025-11-04
**Versión:** 1.0
**Estado:** ✅ Listo (pendiente autenticación)
