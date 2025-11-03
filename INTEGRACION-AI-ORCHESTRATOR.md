# 🔄 GUÍA DE INTEGRACIÓN: AI ORCHESTRATOR CON FALLBACK AUTOMÁTICO
**Sistema inteligente de redundancia entre Gemini, QWEN y DeepSeek**
**Tiempo de implementación:** 15-20 minutos
**Prioridad:** ALTA - Mejora significativa en confiabilidad

---

## 🎯 ¿QUÉ SE HA IMPLEMENTADO?

### ✅ **Archivo Creado: `src/lib/aiOrchestrator.js`**

Este archivo contiene un sistema inteligente que:

1. **Gestiona 3 proveedores de IA** (Gemini, QWEN, DeepSeek)
2. **Fallback automático**: Si uno falla, prueba con el siguiente
3. **Retry con exponential backoff**: Reintenta hasta 3 veces por proveedor
4. **Configuración por tipo de tarea**: Diferentes prioridades según el uso
5. **Estadísticas de uso**: Rastrea qué proveedor funciona mejor

---

## 📊 CONFIGURACIÓN DE PROVEEDORES POR TAREA

El orquestador tiene 3 configuraciones según el tipo de tarea:

### **1. LONG_CONTENT (Guiones largos y creativos)**
```
Prioridad 1: Gemini (gemini-2.0-flash-exp) - 8192 tokens
Prioridad 2: QWEN (qwen-turbo) - 6000 tokens
Prioridad 3: DeepSeek (deepseek-chat) - 4096 tokens
```

### **2. PREMIUM_ANALYSIS (Análisis estratégico profesional)**
```
Prioridad 1: QWEN (qwen-max) - 6000 tokens
Prioridad 2: DeepSeek (deepseek-chat) - 4096 tokens
Prioridad 3: Gemini (gemini-2.0-flash-exp) - 8192 tokens
```

### **3. CHAT (Conversaciones rápidas)**
```
Prioridad 1: DeepSeek (deepseek-chat) - 4096 tokens
Prioridad 2: QWEN (qwen-turbo) - 6000 tokens
Prioridad 3: Gemini (gemini-2.0-flash-exp) - 8192 tokens
```

---

## 🔧 CÓMO INTEGRAR EN TUS SERVICIOS EXISTENTES

### **OPCIÓN 1: Integración Completa (Recomendada)**

Actualizar `geminiService.js` y `chatgptService.js` para usar el orquestador.

#### **Paso 1: Modificar `geminiService.js`**

**Antes (líneas 1-21):**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const generateContent = async (prompt) => {
  try {
    console.log('🤖 CreoVision AI GP-5 está procesando tu solicitud...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ CreoVision AI GP-5 completó el análisis');
    return text;
  } catch (error) {
    console.error('❌ Error en CreoVision AI GP-5:', error);
    throw error;
  }
};
```

**Después (con fallback):**
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateWithFallback } from '@/lib/aiOrchestrator';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const generateContent = async (prompt) => {
  try {
    console.log('🤖 CreoVision AI GP-5 está procesando tu solicitud...');

    // ✅ Usar orquestador con fallback automático
    const result = await generateWithFallback({
      prompt,
      taskType: 'LONG_CONTENT', // Para contenido creativo largo
      temperature: 0.8,
      onProviderSwitch: (providerName) => {
        console.log(`🔄 Cambiando a proveedor: ${providerName}`);
      }
    });

    console.log(`✅ CreoVision AI GP-5 completó el análisis (usando ${result.provider})`);
    return result.content;

  } catch (error) {
    console.error('❌ Error en CreoVision AI GP-5:', error);

    // 🔴 FALLBACK FINAL: Si TODOS los proveedores fallan, usar Gemini directo como última opción
    console.log('⚠️ Intentando método directo como último recurso...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
};
```

---

#### **Paso 2: Modificar `chatgptService.js`**

**Antes (líneas 32-45):**
```javascript
export const analyzePremiumContent = async (contentData) => {
  if (!QWEN_API_KEY && !DEEPSEEK_API_KEY) {
    throw new Error('No hay API keys de análisis premium configuradas');
  }

  const { title, script, topic, platform, personality, keywords } = contentData;

  // ... (código del prompt)

  // Intentar con QWEN primero
  if (QWEN_API_KEY) {
    try {
      // ... fetch QWEN
    } catch (error) {
      // ... intentar DeepSeek
    }
  }
}
```

**Después (con orquestador):**
```javascript
import { analyzePremiumContent as analyzeWithOrchestrator } from '@/lib/aiOrchestrator';

export const analyzePremiumContent = async (contentData) => {
  const { title, script, topic, platform, personality, keywords } = contentData;

  // Construir prompt (mantener tu prompt actual)
  const prompt = `
╔══════════════════════════════════════════════════════════════════════════════════╗
║  🎯 CREOVISION - ANÁLISIS ESTRATÉGICO PREMIUM DE CONTENIDO VIRAL                ║
║  (Experto en Viralidad + SEO Avanzado + Estrategia Multiplataforma)             ║
╚══════════════════════════════════════════════════════════════════════════════════╝

📋 CONTEXTO DEL USUARIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Título del Video: "${title}"
• Tema/Nicho: "${topic}"
• Plataforma: "${platform}"
${personality.role ? `• Rol del Creador: "${personality.role}"` : ''}
${keywords ? `• Keywords: ${keywords}` : ''}
${script ? `\n📝 GUION:\n${script.substring(0, 500)}...` : ''}

... (resto de tu prompt)
`;

  try {
    // ✅ Usar orquestador con prioridad QWEN → DeepSeek → Gemini
    const result = await analyzeWithOrchestrator({
      prompt,
      taskType: 'PREMIUM_ANALYSIS', // Prioriza QWEN para análisis
      temperature: 0.8,
      onProviderSwitch: (providerName) => {
        console.log(`💎 Análisis Premium cambiando a: ${providerName}`);
      }
    });

    console.log(`✅ Análisis premium completado con ${result.provider}`);
    return result.content;

  } catch (error) {
    console.error('❌ Error en análisis premium:', error);
    throw new Error('Todos los servicios de IA fallaron. Por favor intenta más tarde.');
  }
};
```

---

### **OPCIÓN 2: Uso Directo del Orquestador (Más Simple)**

Si prefieres usar el orquestador directamente sin modificar los servicios existentes:

```javascript
// En cualquier componente o servicio
import {
  generateViralScript,
  analyzePremiumContent,
  chatWithAI
} from '@/lib/aiOrchestrator';

// Ejemplo: Generar guión viral
const script = await generateViralScript(
  prompt,
  (provider) => console.log(`Usando ${provider}`)
);

// Ejemplo: Análisis premium
const analysis = await analyzePremiumContent(
  prompt,
  (provider) => console.log(`Analizando con ${provider}`)
);

// Ejemplo: Chat conversacional
const response = await chatWithAI(
  prompt,
  (provider) => console.log(`Respondiendo con ${provider}`)
);
```

---

## 🎯 EJEMPLO COMPLETO DE INTEGRACIÓN

### **Actualizar función `generateViralScript` en `geminiService.js`**

```javascript
// src/services/geminiService.js (línea 24)
import { generateWithFallback } from '@/lib/aiOrchestrator';

export const generateViralScript = async (
  theme,
  style,
  duration,
  topic,
  creatorPersonality = null
) => {
  // ... (tu código de construcción de prompt actual - líneas 26-376)

  const prompt = `
═══════════════════════════════════════════════════════════════
🎯 SYSTEM PROMPT (Regla de Oro de la IA)
═══════════════════════════════════════════════════════════════

Eres un ${systemRole.role}.
... (mantén todo tu prompt actual)
`;

  // ✅ REEMPLAZAR ESTA LÍNEA:
  // return await generateContent(prompt);

  // ✅ CON ESTO:
  try {
    const result = await generateWithFallback({
      prompt,
      taskType: 'LONG_CONTENT',
      temperature: 0.9, // Más creativo para guiones virales
      maxRetries: 3,
      onProviderSwitch: (providerName) => {
        console.log(`🔄 Generando guión con ${providerName}...`);
      }
    });

    console.log(`✅ Guión generado exitosamente con ${result.provider}`);
    return result.content;

  } catch (error) {
    console.error('❌ Error generando guión viral:', error);
    throw new Error('No se pudo generar el guión. Todos los servicios fallaron.');
  }
};
```

---

## 📊 MONITOREO Y ESTADÍSTICAS

El orquestador incluye un sistema de estadísticas integrado:

```javascript
import { getOrchestratorStats } from '@/lib/aiOrchestrator';

// Obtener estadísticas de uso
const stats = getOrchestratorStats();

console.log('📊 Estadísticas del Orquestador:');
console.log(`Total de intentos: ${stats.totalAttempts}`);
console.log(`Exitosos: ${stats.successfulAttempts}`);
console.log(`Fallidos: ${stats.failedAttempts}`);

// Estadísticas por proveedor
Object.keys(stats.providerStats).forEach(provider => {
  const providerData = stats.providerStats[provider];
  console.log(`\n${provider}:`);
  console.log(`  - Total: ${providerData.total}`);
  console.log(`  - Exitosos: ${providerData.successful}`);
  console.log(`  - Success Rate: ${providerData.successRate}%`);
});
```

**Ejemplo de salida:**
```
📊 Estadísticas del Orquestador:
Total de intentos: 47
Exitosos: 45
Fallidos: 2

gemini:
  - Total: 30
  - Exitosos: 29
  - Success Rate: 96.67%

qwen:
  - Total: 12
  - Exitosos: 11
  - Success Rate: 91.67%

deepseek:
  - Total: 5
  - Exitosos: 5
  - Success Rate: 100.00%
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **1. Variables de Entorno Necesarias**

El orquestador lee las API keys de `.env`:

```env
# Gemini (Google)
VITE_GEMINI_API_KEY=AIzaSyCztlhKh33ffQdvFiYIFhfR1IIXSBpbj0g

# QWEN (Alibaba)
VITE_QWEN_API_KEY=sk-e6343f5b0abc42d294d2ad7f977e48a8

# DeepSeek
VITE_DEEPSEEK_API_KEY=sk-a70d24ffed264fbaafd22209c5571116
```

**⚠️ IMPORTANTE:** Si alguna key no está configurada, ese proveedor se saltará automáticamente.

---

### **2. Costos de APIs**

El orquestador **NO aumenta costos** si todo funciona bien:
- Si Gemini (prioridad 1) funciona → solo usas Gemini
- Solo si Gemini falla → prueba con QWEN
- Solo si QWEN también falla → prueba con DeepSeek

**Escenario de fallo completo:**
- Gemini falla (3 intentos) → 3 llamadas
- QWEN falla (3 intentos) → 3 llamadas
- DeepSeek funciona (1 intento) → 1 llamada
- **Total:** 7 llamadas vs 1 llamada normal

**Recomendación:** Monitorea las estadísticas para detectar si un proveedor está fallando frecuentemente.

---

### **3. Timeout y Rate Limiting**

```javascript
// Configuración actual en aiOrchestrator.js (línea 237-238)
const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
await new Promise(resolve => setTimeout(resolve, waitTime));
```

**Tiempos de espera por intento:**
- Intento 1: 0ms (inmediato)
- Intento 2: 2000ms (2 segundos)
- Intento 3: 4000ms (4 segundos)
- Intento 4+: 10000ms (10 segundos - máximo)

**Tiempo máximo total (peor caso):**
- 3 proveedores × 3 intentos × 10 seg = ~90 segundos máximo

---

## 🚀 VENTAJAS DE ESTA IMPLEMENTACIÓN

### **Antes (sin orquestador):**
```
Usuario genera contenido
   ↓
Gemini API falla
   ↓
❌ ERROR: App se rompe
   ↓
Usuario frustrado, pierde su trabajo
```

### **Después (con orquestador):**
```
Usuario genera contenido
   ↓
Gemini API falla
   ↓
🔄 Automáticamente prueba con QWEN
   ↓
QWEN funciona
   ↓
✅ Usuario recibe su contenido sin interrupción
   ↓
Apenas nota que Gemini falló
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Opción Rápida (5 minutos):**
- [ ] Verificar que `aiOrchestrator.js` existe en `src/lib/`
- [ ] Verificar las 3 API keys en `.env`
- [ ] Probar el orquestador directamente:
  ```javascript
  import { generateViralScript } from '@/lib/aiOrchestrator';
  const result = await generateViralScript('Prueba de fallback');
  console.log(result);
  ```

### **Opción Completa (15-20 minutos):**
- [ ] Actualizar `geminiService.js` → función `generateContent()`
- [ ] Actualizar `chatgptService.js` → función `analyzePremiumContent()`
- [ ] Actualizar otras funciones que usen IA directa
- [ ] Probar generación de guión viral
- [ ] Probar análisis premium
- [ ] Verificar estadísticas con `getOrchestratorStats()`
- [ ] Monitorear logs en consola para ver cambios de proveedor

---

## 🧪 PRUEBAS RECOMENDADAS

### **Prueba 1: Fallback Manual**

Temporalmente desactiva Gemini para ver el fallback en acción:

```javascript
// En aiOrchestrator.js (línea 20), temporalmente cambia:
keyEnv: import.meta.env.VITE_GEMINI_API_KEY,

// A:
keyEnv: null, // Forzar fallo de Gemini
```

Genera contenido → debería usar QWEN automáticamente.

---

### **Prueba 2: Estadísticas en Tiempo Real**

```javascript
// En Tools.jsx, después de generar contenido:
import { getOrchestratorStats } from '@/lib/aiOrchestrator';

const handleGenerateContent = async () => {
  // ... tu código actual

  // Al final:
  const stats = getOrchestratorStats();
  console.log('📊 Estadísticas actuales:', stats);
};
```

---

### **Prueba 3: Callback de Cambio de Proveedor**

```javascript
const result = await generateWithFallback({
  prompt: 'Test',
  taskType: 'LONG_CONTENT',
  onProviderSwitch: (provider) => {
    toast({
      title: `🔄 Cambiando a ${provider}`,
      description: 'El proveedor anterior no respondió',
    });
  }
});
```

---

## 💡 MEJORAS FUTURAS OPCIONALES

### **1. UI para Selección Manual de Proveedor**

Permitir al usuario elegir qué IA usar:

```javascript
const [preferredProvider, setPreferredProvider] = useState('auto');

// En el formulario:
<Select value={preferredProvider} onValueChange={setPreferredProvider}>
  <SelectTrigger>
    <SelectValue placeholder="Proveedor de IA" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="auto">🔄 Automático (Recomendado)</SelectItem>
    <SelectItem value="gemini">✨ Gemini (Creativo)</SelectItem>
    <SelectItem value="qwen">🧠 QWEN (Analítico)</SelectItem>
    <SelectItem value="deepseek">⚡ DeepSeek (Rápido)</SelectItem>
  </SelectContent>
</Select>
```

---

### **2. Dashboard de Estadísticas**

Mostrar qué proveedor se usa más:

```javascript
const ProviderStatsCard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getOrchestratorStats());
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Estadísticas de IA</CardTitle>
      </CardHeader>
      <CardContent>
        {stats && (
          <div className="space-y-2">
            <p>Total: {stats.totalAttempts}</p>
            <p>Exitosos: {stats.successfulAttempts}</p>
            {/* ... más estadísticas */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## 🎯 RESULTADO FINAL

### **Estado Actual:**
✅ **AI Orchestrator implementado** (`src/lib/aiOrchestrator.js`)
✅ **3 proveedores configurados** (Gemini, QWEN, DeepSeek)
✅ **Fallback automático funcional**
✅ **Retry con exponential backoff**
✅ **Sistema de estadísticas integrado**

### **Siguiente Paso:**
🔧 **Integrar en servicios existentes** (opcional pero recomendado)

---

## 📞 SOPORTE

Si encuentras problemas durante la integración:

1. **Verificar logs de consola** para ver qué proveedor está fallando
2. **Revisar `.env`** para confirmar las API keys
3. **Probar con `getOrchestratorStats()`** para ver el historial
4. **Revisar el código de error** en la excepción lanzada

---

**Elaborado por:** Claude Code
**Fecha:** 2025-11-03
**Versión:** 1.0
**Estado:** Listo para integración

¡Éxito con la implementación! 🚀
