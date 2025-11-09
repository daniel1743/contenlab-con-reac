# 🛡️ GUÍA DE INTEGRACIÓN - SISTEMA ANTI-ABUSO Y MONITOREO DE COSTOS

**Fecha:** 2025-01-08
**Versión:** 1.0.0
**Contacto:** impulsa@creovision.io

---

## 📋 **ÍNDICE**

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Ejecución de Migración SQL](#ejecución-de-migración-sql)
4. [Integración en Servicios Existentes](#integración-en-servicios-existentes)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Configuración de Límites](#configuración-de-límites)
7. [Monitoreo y Alertas](#monitoreo-y-alertas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 **INTRODUCCIÓN**

El **Sistema Anti-Abuso y Monitoreo de Costos** protege tu aplicación de:

✅ **Uso excesivo de recursos** (rate limiting)
✅ **Costos descontrolados de IA** (budget alerts)
✅ **Usuarios malintencionados** (abuse detection)
✅ **Bots y automatización** (bot detection)
✅ **Cuentas fraudulentas** (IP abuse detection)

### **Características Principales:**

- **Límites por Plan**: FREE, PRO, PREMIUM con límites configurables
- **Tracking en Tiempo Real**: Cada llamada a IA se registra automáticamente
- **Cálculo Automático de Costos**: Basado en tokens input/output y proveedor
- **5 Reglas de Abuso Pre-configuradas**: Listas para usar
- **Sistema de Bloqueos**: Bloqueo automático de usuarios abusivos
- **Analytics**: Estadísticas de uso y costos por periodo

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Componentes:**

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN                       │
│  CreoChatService | ScriptGenerator | Otros Servicios AI     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVICIO DE DETECCIÓN DE ABUSO                 │
│                 abuseDetectionService.js                    │
│  • checkUsageLimit()    • trackUsage()                      │
│  • detectAbusePatterns()    • getCostStats()                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS SUPABASE                   │
│  usage_limits | usage_tracking | abuse_detection_rules     │
│  abuse_incidents | cost_tracking | user_blocks             │
└─────────────────────────────────────────────────────────────┘
```

### **Flujo de Control:**

```
1. Usuario solicita generar contenido
   ↓
2. Servicio verifica: checkUsageLimit(userId, plan, feature)
   ↓
3. Si OK → Procesa → trackUsage(datos)
   ↓
4. trackUsage() llama automáticamente a detectAbusePatterns()
   ↓
5. Si se detecta abuso → Registra incidente + Bloquea usuario
```

---

## 🚀 **EJECUCIÓN DE MIGRACIÓN SQL**

### **Paso 1: Abrir Dashboard de Supabase**

1. Ir a https://supabase.com/dashboard
2. Seleccionar proyecto: `bouqpierlyeukedpxugk`
3. Click en **"SQL Editor"** (menú lateral izquierdo)

### **Paso 2: Ejecutar Migración**

1. Click en **"+ New query"**
2. Copiar TODO el contenido de:
   ```
   C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB\supabase\migrations\012_anti_abuse_and_cost_control.sql
   ```
3. Pegar en el editor SQL
4. Click en **"Run"** (esquina inferior derecha)

### **Paso 3: Verificar Creación de Tablas**

Ejecutar esta query de verificación:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'usage_limits',
    'usage_tracking',
    'abuse_detection_rules',
    'abuse_incidents',
    'cost_tracking',
    'user_blocks'
  )
ORDER BY table_name;
```

**Resultado esperado:** 6 tablas listadas.

### **Paso 4: Verificar Datos Iniciales**

```sql
-- Verificar límites por plan
SELECT plan_type, feature_slug, daily_limit, monthly_limit
FROM usage_limits
ORDER BY plan_type, feature_slug;

-- Verificar reglas de abuso
SELECT rule_name, severity, is_active
FROM abuse_detection_rules
ORDER BY severity DESC;
```

**Resultado esperado:**
- 9 límites (3 planes × 3 features)
- 5 reglas de abuso activas

---

## 🔌 **INTEGRACIÓN EN SERVICIOS EXISTENTES**

### **1. Integración en CreoChatService**

Actualizar `src/services/CreoChatService.js`:

```javascript
import {
  checkUsageLimit,
  trackUsage,
  checkUserBlock
} from '@/services/abuseDetectionService';

class CreoChatService {
  // ... código existente ...

  async sendMessage(userId, userMessage, options = {}) {
    try {
      // ✅ NUEVO: Verificar si usuario está bloqueado
      const blockCheck = await checkUserBlock(userId, 'creo_chat');
      if (blockCheck.isBlocked) {
        throw new Error(`Tu cuenta está bloqueada: ${blockCheck.reason}`);
      }

      // ✅ NUEVO: Verificar límites de uso
      const userPlan = await this.getUserPlan(userId); // Obtener plan del usuario
      const limitCheck = await checkUsageLimit(userId, userPlan, 'creo_chat');

      if (!limitCheck.allowed) {
        throw new Error(limitCheck.reason);
      }

      // ... código existente para generar respuesta ...

      const aiResponse = await this.generateAIResponse(conversationHistory);

      // ✅ NUEVO: Registrar uso y calcular costos
      await trackUsage({
        userId: userId,
        featureSlug: 'creo_chat',
        actionType: 'chat_message',
        aiProvider: 'deepseek',
        modelUsed: 'deepseek-chat',
        tokensInput: aiResponse.usage?.prompt_tokens || 0,
        tokensOutput: aiResponse.usage?.completion_tokens || 0,
        status: 'success',
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        metadata: {
          sessionId: this.sessionId,
          conversationStage: this.conversationStage,
          messageCount: this.messageCount
        }
      });

      // ... resto del código ...

    } catch (error) {
      // ✅ NUEVO: Registrar fallos también
      await trackUsage({
        userId: userId,
        featureSlug: 'creo_chat',
        actionType: 'chat_message',
        aiProvider: 'deepseek',
        modelUsed: 'deepseek-chat',
        tokensInput: 0,
        tokensOutput: 0,
        status: 'error',
        metadata: { error: error.message }
      });

      throw error;
    }
  }

  // ✅ NUEVO: Método auxiliar para obtener plan del usuario
  async getUserPlan(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    return data?.plan || 'FREE';
  }
}
```

### **2. Integración en Generador de Scripts**

Ejemplo para `src/services/scriptGeneratorService.js`:

```javascript
import {
  checkUsageLimit,
  trackUsage,
  checkUserBlock
} from '@/services/abuseDetectionService';

export async function generateScript(userId, topic, options = {}) {
  try {
    // 1. Verificar bloqueo
    const blockCheck = await checkUserBlock(userId, 'script_generator');
    if (blockCheck.isBlocked) {
      return {
        success: false,
        error: `Cuenta bloqueada: ${blockCheck.reason}`,
        blockedUntil: blockCheck.blockedUntil
      };
    }

    // 2. Obtener plan del usuario
    const userPlan = await getUserPlan(userId);

    // 3. Verificar límites
    const limitCheck = await checkUsageLimit(userId, userPlan, 'script_generator');
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.reason,
        current: limitCheck.current,
        limit: limitCheck.limit
      };
    }

    // 4. Generar script con IA
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [/* ... */],
      // ...
    });

    // 5. Registrar uso exitoso
    await trackUsage({
      userId: userId,
      featureSlug: 'script_generator',
      actionType: 'generate_script',
      aiProvider: 'openai',
      modelUsed: 'gpt-4',
      tokensInput: response.usage.prompt_tokens,
      tokensOutput: response.usage.completion_tokens,
      status: 'success',
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: {
        topic: topic,
        scriptLength: response.choices[0].message.content.length
      }
    });

    return {
      success: true,
      script: response.choices[0].message.content
    };

  } catch (error) {
    // Registrar error
    await trackUsage({
      userId: userId,
      featureSlug: 'script_generator',
      actionType: 'generate_script',
      aiProvider: 'openai',
      modelUsed: 'gpt-4',
      tokensInput: 0,
      tokensOutput: 0,
      status: 'error',
      metadata: { error: error.message }
    });

    throw error;
  }
}
```

### **3. Integración en Componentes React**

Ejemplo en `src/components/CreoFloatingAssistant.jsx`:

```javascript
import { checkUsageLimit } from '@/services/abuseDetectionService';

const CreoFloatingAssistant = ({ userContext }) => {
  const [usageStatus, setUsageStatus] = useState(null);

  // Verificar límites al montar componente
  useEffect(() => {
    const checkLimits = async () => {
      const status = await checkUsageLimit(
        userContext.userId,
        userContext.plan,
        'creo_chat'
      );
      setUsageStatus(status);
    };

    checkLimits();
  }, [userContext]);

  // Mostrar advertencia si está cerca del límite
  {usageStatus && !usageStatus.allowed && (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
      <p className="text-sm text-yellow-700">
        {usageStatus.reason}
      </p>
      <p className="text-xs text-yellow-600 mt-1">
        Usado: {usageStatus.current} / {usageStatus.limit}
      </p>
    </div>
  )}

  // ... resto del componente ...
};
```

---

## 💡 **EJEMPLOS DE USO**

### **Ejemplo 1: Verificar Límite Antes de Acción**

```javascript
import { checkUsageLimit } from '@/services/abuseDetectionService';

async function handleGenerateContent(userId) {
  const userPlan = 'FREE'; // Obtener del perfil del usuario

  const check = await checkUsageLimit(userId, userPlan, 'script_generator');

  if (!check.allowed) {
    alert(`Límite alcanzado: ${check.reason}`);
    return;
  }

  // Proceder con generación
  await generateContent();
}
```

### **Ejemplo 2: Registrar Uso con Costos**

```javascript
import { trackUsage } from '@/services/abuseDetectionService';

async function callOpenAI(userId, prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });

  // Registrar uso automáticamente
  await trackUsage({
    userId: userId,
    featureSlug: 'script_generator',
    actionType: 'generate_script',
    aiProvider: 'openai',
    modelUsed: 'gpt-4',
    tokensInput: response.usage.prompt_tokens,
    tokensOutput: response.usage.completion_tokens,
    status: 'success'
  });

  return response.choices[0].message.content;
}
```

### **Ejemplo 3: Obtener Estadísticas de Costos**

```javascript
import { getCostStats } from '@/services/abuseDetectionService';

async function showCostDashboard() {
  const today = await getCostStats('today');
  const thisWeek = await getCostStats('week');
  const thisMonth = await getCostStats('month');

  console.log('Costos de Hoy:', today);
  console.log('Costos de la Semana:', thisWeek);
  console.log('Costos del Mes:', thisMonth);

  // Ejemplo de salida:
  // {
  //   totalRequests: 1250,
  //   totalTokens: 458923,
  //   totalCostUsd: 12.45,
  //   costByProvider: {
  //     deepseek: 2.30,
  //     openai: 8.15,
  //     gemini: 2.00
  //   }
  // }
}
```

### **Ejemplo 4: Verificar Presupuesto**

```javascript
import { checkBudget } from '@/services/abuseDetectionService';

async function verifyBudget() {
  const monthlyBudget = 500; // $500 USD/mes

  const budgetStatus = await checkBudget(monthlyBudget, 'month');

  if (!budgetStatus.withinBudget) {
    // Enviar alerta al admin
    sendAlert({
      message: `Presupuesto excedido: $${budgetStatus.totalCost} / $${monthlyBudget}`,
      severity: 'critical'
    });
  }

  console.log(budgetStatus);
  // {
  //   withinBudget: false,
  //   totalCost: 523.45,
  //   budgetLimit: 500,
  //   percentUsed: 104.69
  // }
}
```

---

## ⚙️ **CONFIGURACIÓN DE LÍMITES**

### **Modificar Límites por Plan**

```sql
-- Actualizar límite diario de mensajes para plan FREE
UPDATE usage_limits
SET daily_limit = 20  -- Cambiar de 10 a 20
WHERE plan_type = 'FREE'
  AND feature_slug = 'creo_chat';

-- Agregar límite de costo mensual para plan PRO
UPDATE usage_limits
SET monthly_cost_limit_usd = 50.00
WHERE plan_type = 'PRO';
```

### **Crear Nuevo Límite para Feature**

```sql
INSERT INTO usage_limits (
  plan_type,
  feature_slug,
  daily_limit,
  monthly_limit,
  max_requests_per_minute,
  max_tokens_per_request,
  max_total_tokens_daily,
  daily_cost_limit_usd,
  monthly_cost_limit_usd
) VALUES (
  'FREE',
  'new_feature_ai',
  5,          -- 5 usos diarios
  100,        -- 100 usos mensuales
  2,          -- Máx 2 requests por minuto
  1000,       -- Máx 1000 tokens por request
  10000,      -- Máx 10k tokens diarios
  0.50,       -- Máx $0.50 diarios
  10.00       -- Máx $10 mensuales
);
```

### **Desactivar/Activar Regla de Abuso**

```sql
-- Desactivar detección de bots temporalmente
UPDATE abuse_detection_rules
SET is_active = false
WHERE rule_name = 'bot_behavior';

-- Cambiar severidad de cost_spike a CRITICAL
UPDATE abuse_detection_rules
SET severity = 'CRITICAL'
WHERE rule_name = 'cost_spike';
```

---

## 📊 **MONITOREO Y ALERTAS**

### **Dashboard Recomendado (Queries SQL)**

#### **Usuarios Cerca del Límite Diario:**

```sql
SELECT
  u.email,
  ut.feature_slug,
  COUNT(*) as requests_today,
  ul.daily_limit,
  ROUND((COUNT(*) * 100.0 / ul.daily_limit), 2) as percent_used
FROM usage_tracking ut
JOIN auth.users u ON ut.user_id = u.id
JOIN user_profiles up ON u.id = up.id
JOIN usage_limits ul ON up.plan = ul.plan_type AND ut.feature_slug = ul.feature_slug
WHERE ut.created_at >= CURRENT_DATE
GROUP BY u.email, ut.feature_slug, ul.daily_limit
HAVING COUNT(*) >= (ul.daily_limit * 0.8)  -- 80% o más usado
ORDER BY percent_used DESC;
```

#### **Incidentes de Abuso Recientes:**

```sql
SELECT
  u.email,
  ai.rule_triggered,
  ai.severity,
  ai.details,
  ai.created_at
FROM abuse_incidents ai
JOIN auth.users u ON ai.user_id = u.id
WHERE ai.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY ai.created_at DESC
LIMIT 20;
```

#### **Costos por Proveedor (Hoy):**

```sql
SELECT
  ai_provider,
  COUNT(*) as total_requests,
  SUM(tokens_total) as total_tokens,
  SUM(cost_usd) as total_cost_usd
FROM usage_tracking
WHERE created_at >= CURRENT_DATE
  AND status = 'success'
GROUP BY ai_provider
ORDER BY total_cost_usd DESC;
```

#### **Top 10 Usuarios por Costo (Este Mes):**

```sql
SELECT
  u.email,
  up.plan,
  COUNT(*) as total_requests,
  SUM(ut.cost_usd) as total_cost_usd
FROM usage_tracking ut
JOIN auth.users u ON ut.user_id = u.id
JOIN user_profiles up ON u.id = up.id
WHERE ut.created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND ut.status = 'success'
GROUP BY u.email, up.plan
ORDER BY total_cost_usd DESC
LIMIT 10;
```

### **Configurar Alertas Automáticas**

Crear función en Supabase Edge Functions para enviar emails cuando:

1. **Usuario alcanza 90% de su límite diario**
2. **Incidente de abuso detectado con severidad CRITICAL**
3. **Costo diario supera $X**
4. **Presupuesto mensual excedido**

---

## 🐛 **TROUBLESHOOTING**

### **Error: "No se encontró límite para este plan"**

**Causa:** No hay registro en `usage_limits` para la combinación plan + feature.

**Solución:**
```sql
INSERT INTO usage_limits (plan_type, feature_slug, daily_limit, monthly_limit)
VALUES ('FREE', 'nombre_feature', 10, 100);
```

### **Error: "calculate_token_cost() no existe"**

**Causa:** La migración SQL no se ejecutó correctamente.

**Solución:**
1. Verificar que la función exista:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'calculate_token_cost';
```

2. Si no existe, re-ejecutar la migración `012_anti_abuse_and_cost_control.sql`.

### **Los costos no se calculan automáticamente**

**Causa:** El trigger `update_cost_on_insert` no está activo.

**Solución:**
```sql
-- Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'usage_tracking';

-- Re-crear trigger si no existe
-- (Copiar código del archivo 012_anti_abuse_and_cost_control.sql)
```

### **Detección de abuso no funciona**

**Causa:** Las reglas están desactivadas o no hay suficiente historial.

**Solución:**
```sql
-- Verificar reglas activas
SELECT rule_name, is_active
FROM abuse_detection_rules;

-- Activar todas las reglas
UPDATE abuse_detection_rules SET is_active = true;
```

---

## 📧 **SOPORTE**

**Email:** impulsa@creovision.io
**Empresa:** CreoVision
**Website:** https://creovision.io

---

## ✅ **CHECKLIST DE INTEGRACIÓN**

- [ ] Migración SQL ejecutada y verificada
- [ ] `abuseDetectionService.js` copiado a `src/services/`
- [ ] Integrado en `CreoChatService.js`
- [ ] Integrado en `scriptGeneratorService.js` (u otros servicios AI)
- [ ] Agregados checks de límites en componentes React
- [ ] Configurados límites para todos los planes (FREE, PRO, PREMIUM)
- [ ] Verificada creación de registros en `usage_tracking`
- [ ] Probada detección de abuso con caso de prueba
- [ ] Dashboard de monitoreo configurado (opcional)
- [ ] Alertas por email configuradas (opcional)

---

**Estado:** ✅ **LISTO PARA PRODUCCIÓN**

**Última actualización:** 2025-01-08
**Versión:** 1.0.0
