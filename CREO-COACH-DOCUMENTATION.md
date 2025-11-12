# 🎯 CREO COACH - Documentación Completa

## 📋 Resumen

**CREO Coach** es un asistente IA proactivo que guía a los usuarios de CreoVision para que usen las herramientas de forma efectiva. Usa **DeepSeek** como motor de IA y conoce perfectamente todas las funcionalidades de la plataforma.

**Fecha de implementación:** 12 de Noviembre 2025
**Estado:** ✅ PRODUCCIÓN - FUNCIONAL
**Motor IA:** DeepSeek (deepseek-chat)

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### 1. **Proactividad Inteligente**
- Detecta inactividad (30 segundos)
- Identifica acciones repetitivas (3 intentos)
- Responde a cambios de página
- Responde preguntas directas

### 2. **Conocimiento Completo**
- Conoce todas las herramientas disponibles
- Sabe rutas, costos y cómo usar cada función
- Identifica herramientas en desarrollo
- Ofrece alternativas cuando algo no está disponible

### 3. **No Intrusivo**
- Se oculta automáticamente después de 10 segundos
- Cooldown de 1 minuto entre sugerencias proactivas
- Se puede cerrar manualmente en cualquier momento

### 4. **Personalizado**
- Usa el nombre del usuario
- Adapta sugerencias según perfil (plataforma, nicho, estilo)
- Recuerda contexto de la sesión

---

## 🏗️ ARQUITECTURA

### **Archivos Creados:**

```
src/
├── config/
│   └── creoKnowledgeBase.js          # Base de conocimiento de CreoVision
├── services/
│   └── creoCoachService.js            # Servicio con DeepSeek API
├── hooks/
│   └── useCreoCoach.js                # Hook de detección de patrones
└── components/
    └── CreoCoachBubble.jsx            # Componente visual
```

---

## 🔧 CONFIGURACIÓN

### **Parámetros Ajustables** (en `useCreoCoach.js`):

```javascript
const COACH_CONFIG = {
  inactivityThreshold: 30000,      // 30 segundos de inactividad
  repetitionCount: 3,              // 3 intentos antes de sugerir
  messageDismissTime: 10000,       // 10 segundos antes de auto-ocultar
  cooldownPeriod: 60000,           // 1 minuto entre sugerencias
};
```

### **Variables de Entorno Necesarias:**

```env
VITE_DEEPSEEK_API_KEY=tu_key_aqui
```

---

## 📚 BASE DE CONOCIMIENTO

CREO Coach conoce:

### **Herramientas Disponibles:**
1. **Tendencias Virales** (`/tendencias`) - 20 créditos
2. **Genera tu Guión** (`/generar-guion`) - 15 créditos
3. **Generador de Hashtags** (`/hashtags`) - 10 créditos
4. **Optimizador SEO** (`/seo`) - 12 créditos
5. **Calendario de Contenido** (`/calendario`) - Gratis
6. **Dashboard de Crecimiento** (`/dashboard`) - Gratis
7. **Mi Perfil** (`/mi-perfil`) - Gratis

### **Herramientas en Desarrollo:**
1. **Miniaturas AI** - En desarrollo → Alternativa: Genera tu Guión
2. **Editor de Videos** - En roadmap
3. **Análisis de Competencia** - Beta cerrada

---

## 🎨 EJEMPLOS DE COMPORTAMIENTO

### **Escenario 1: Inactividad**
```
Usuario: [30 segundos sin interactuar en Dashboard]
CREO: "Veo que estás en Dashboard 📊 ¿Listo para descubrir tendencias virales?
       Ve a 'Tendencias Virales' para crear contenido que tu audiencia quiere ver"
```

### **Escenario 2: Pregunta Directa**
```
Usuario: "¿Puedo analizar tendencias?"
CREO: "¡Sí! 🎯 Ve a 'Tendencias Virales' → Desbloquea una tendencia (20 créditos)
       → Recibirás análisis SEO completo con keywords y plan de 72h"
```

### **Escenario 3: Herramienta No Disponible**
```
Usuario: "¿Cómo hago miniaturas?"
CREO: "Las miniaturas AI están en desarrollo 🎨 Mientras tanto, usa 'Genera tu Guión'
       (15 créditos) para crear scripts que hagan brillar tu contenido"
```

### **Escenario 4: Clics Repetitivos**
```
Usuario: [Hace clic 3 veces en el mismo botón sin avanzar]
CREO: "Parece que estás explorando esta función 🤔 Te muestro:
       Paso 1 → Selecciona opción → Paso 2 → Resultado. ¿Vamos?"
```

---

## 🚨 REGLAS DE CREO

### ❌ **NUNCA HACE:**
1. Preguntar "¿Qué quieres hacer?"
2. Dar respuestas vagas o genéricas
3. Decir solo "no está disponible" sin alternativa
4. Explicaciones largas (máximo 2-3 líneas)

### ✅ **SIEMPRE HACE:**
1. Da rutas exactas: "Ve a X → Haz Y → Obtendrás Z"
2. Menciona el costo de funciones pagadas
3. Ofrece alternativas cuando algo no existe
4. Usa el nombre del usuario
5. Incentiva el uso de herramientas

---

## 🔄 FLUJO DE FUNCIONAMIENTO

```
1. Hook detecta patrón (inactividad, repetición, etc.)
   ↓
2. Hook activa `triggerCoach()` con contexto
   ↓
3. Componente se hace visible
   ↓
4. Servicio llama a DeepSeek con:
   - Prompt base de CREO
   - Base de conocimiento completa
   - Contexto del usuario
   - Perfil del usuario
   ↓
5. DeepSeek genera respuesta contextual
   ↓
6. Componente muestra mensaje
   ↓
7. Usuario acepta/rechaza o ignora
   ↓
8. Auto-ocultar después de 10 segundos
```

---

## 🧪 CÓMO PROBAR

### **Test 1: Inactividad**
1. Inicia sesión
2. Ve a cualquier página (ej: Dashboard)
3. No hagas nada por 30 segundos
4. ✅ CREO debería aparecer con sugerencia

### **Test 2: Pregunta Directa**
1. Usa AIConciergeBubble (el otro chat)
2. Pregunta: "¿Puedo analizar tendencias?"
3. ✅ Debería responder con ruta exacta

### **Test 3: Cambio de Página**
1. Navega de una página a otra
2. Espera 2 segundos
3. ✅ CREO debería aparecer con bienvenida breve

### **Test 4: Clics Repetitivos**
1. Haz clic 3 veces en el mismo botón
2. ✅ CREO debería ofrecer guía

---

## 🛠️ PERSONALIZACIÓN

### **Cambiar Timing:**

Edita `src/hooks/useCreoCoach.js`:
```javascript
const COACH_CONFIG = {
  inactivityThreshold: 45000,  // Cambiar a 45 segundos
  repetitionCount: 5,          // Cambiar a 5 intentos
  messageDismissTime: 15000,   // Cambiar a 15 segundos
  cooldownPeriod: 90000,       // Cambiar a 1.5 minutos
};
```

### **Agregar Nueva Herramienta:**

Edita `src/config/creoKnowledgeBase.js`:
```javascript
{
  id: 'nueva-herramienta',
  name: 'Nueva Herramienta',
  path: '/nueva-herramienta',
  category: 'Categoría',
  description: 'Descripción breve',
  features: ['Feature 1', 'Feature 2'],
  howToUse: ['Paso 1', 'Paso 2'],
  cost: '10 créditos',
  benefits: 'Beneficio principal'
}
```

### **Modificar Personalidad:**

Edita `src/services/creoCoachService.js`:
```javascript
const CREO_COACH_SYSTEM_PROMPT = `
Eres CREO, el coach experto de CreoVision.
[... modifica el prompt según necesites ...]
`;
```

---

## 📊 MÉTRICAS Y MONITOREO

### **Logs en Consola:**

- `🎯 CREO detectó inactividad`
- `🎯 CREO detectó clics repetitivos en: [elemento]`
- `🎯 CREO detectó cambio de página a: [ruta]`
- `🤖 Llamando a DeepSeek para CREO Coach...`
- `✅ Respuesta de CREO generada: [preview]`
- `❌ Error en creoCoachService: [error]`
- `✅ Usuario aceptó sugerencia de CREO`

### **Eventos a Monitorear:**

1. Frecuencia de activación
2. Tasa de aceptación vs rechazo
3. Tipo de eventos más comunes
4. Tiempo promedio antes de dismissal
5. Errores de API de DeepSeek

---

## 🐛 TROUBLESHOOTING

### **CREO no aparece:**
- ✅ Verifica que `VITE_DEEPSEEK_API_KEY` esté configurada
- ✅ Verifica que el usuario esté autenticado
- ✅ Revisa consola para errores
- ✅ Verifica que no estés en landing page

### **CREO aparece demasiado:**
- Aumenta `cooldownPeriod` en config
- Aumenta `inactivityThreshold`

### **Respuestas genéricas:**
- Verifica que el perfil del usuario esté completo
- Revisa que la base de conocimiento esté actualizada
- Verifica logs de DeepSeek API

### **Error de DeepSeek API:**
- Verifica API key
- Verifica límites de rate limit
- Verifica créditos disponibles
- Usa respuestas de fallback

---

## 💡 MEJORAS FUTURAS

### **Prioridad Alta:**
1. Sistema de feedback (👍/👎) para aprendizaje
2. Guardar interacciones en Supabase
3. Análisis de patrones de uso
4. A/B testing de mensajes

### **Prioridad Media:**
1. Integración con sistema de memoria persistente
2. Personalización basada en historial
3. Sugerencias predictivas
4. Navegación automática a herramientas

### **Prioridad Baja:**
1. Avatares animados
2. Efectos de sonido
3. Modo tutorial guiado
4. Gamificación

---

## 📝 CHANGELOG

### v1.0.0 (12 Nov 2025)
- ✅ Implementación inicial
- ✅ Base de conocimiento completa
- ✅ Integración con DeepSeek
- ✅ Detección de 4 patrones (inactividad, repetición, cambio de página, preguntas)
- ✅ Sistema de fallback
- ✅ Integración en App.jsx

---

## 👨‍💻 MANTENIMIENTO

### **Actualizar Base de Conocimiento:**
Cuando agregues/quites herramientas, actualiza:
- `src/config/creoKnowledgeBase.js`

### **Ajustar Comportamiento:**
Cuando quieras cambiar cuándo aparece:
- `src/hooks/useCreoCoach.js`

### **Cambiar Personalidad:**
Cuando quieras modificar el tono:
- `src/services/creoCoachService.js`

---

## 🔒 SEGURIDAD

- ✅ API key en `.env` (no en código)
- ✅ Solo usuarios autenticados ven CREO
- ✅ No expone información sensible
- ✅ Límite de tokens en respuestas (200 max)
- ✅ Fallback si DeepSeek falla

---

## 📞 SOPORTE

**Desarrollador:** Claude Code
**Fecha:** 12 de Noviembre 2025
**Versión:** 1.0.0
**Motor IA:** DeepSeek (deepseek-chat)

---

**🎯 CREO Coach está listo para guiar a tus usuarios hacia el éxito en CreoVision!**
