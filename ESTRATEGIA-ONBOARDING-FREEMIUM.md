# 🚀 ESTRATEGIA DE ONBOARDING Y FREEMIUM - CREOVISION

**Fecha:** 29 de Noviembre 2025  
**Versión:** 1.0  
**Objetivo:** Maximizar retención y conversión de visitantes a usuarios activos y pagantes

---

## 📊 RESUMEN EJECUTIVO

### **Problema Actual**
- Los visitantes llegan pero no se quedan
- No hay incentivo claro para probar las herramientas
- Fricción alta en el primer uso
- No hay diferenciación entre visitante y usuario registrado

### **Solución Propuesta**
Implementar un sistema de **onboarding progresivo** con:
1. **Créditos de bienvenida** (200 créditos gratis al registrarse)
2. **Primer uso gratuito** en herramientas premium
3. **Descuentos del 50%** en el primer uso de cada herramienta
4. **Onboarding interactivo** guiado
5. **Sistema de recompensas** por acciones

---

## 🎯 OBJETIVOS ESTRATÉGICOS

### **Métricas Clave (KPIs)**
- **Tasa de registro:** 15% → 35% (objetivo)
- **Tasa de activación:** 20% → 60% (objetivo)
- **Tiempo hasta primer uso:** < 2 minutos
- **Retención D1:** 40% → 70% (objetivo)
- **Retención D7:** 15% → 40% (objetivo)
- **Conversión Free → Paid:** 5% → 15% (objetivo)

---

## 💎 SISTEMA DE CRÉDITOS DE BIENVENIDA

### **Estructura Propuesta**

#### **1. Registro Inicial (Sin Email Verificado)**
- **50 créditos gratis** inmediatos
- Acceso a herramientas básicas (2 créditos)
- **Limitación:** Máximo 3 usos por herramienta

#### **2. Verificación de Email**
- **+150 créditos** adicionales (total: 200 créditos)
- Acceso completo a todas las herramientas
- **Bonus:** Primer uso GRATIS en cualquier herramienta premium

#### **3. Primer Uso de Herramienta Premium**
- **Descuento del 50%** en el primer uso
- Si el costo es 40 créditos → paga solo 20 créditos
- **Mensaje:** "🎉 ¡Primer uso! Ahorras 20 créditos"

#### **4. Completar Perfil de Creador**
- **+50 créditos** de bonificación
- Desbloquea personalización avanzada
- Acceso a análisis personalizados

#### **5. Primer Contenido Generado**
- **+25 créditos** de celebración
- Badge "Primer Forjado" 🏆
- Compartir en redes sociales (opcional)

---

## 🎁 SISTEMA DE PRIMER USO GRATIS

### **Herramientas Elegibles para Primer Uso Gratuito**

| Herramienta | Costo Normal | Costo Primer Uso | Ahorro |
|------------|--------------|------------------|--------|
| **Generador de Guiones** | 40 créditos | **GRATIS** | 40 créditos |
| **Análisis de Competencia** | 200 créditos | **100 créditos** | 100 créditos |
| **Growth Dashboard** | 400 créditos | **200 créditos** | 200 créditos |
| **Títulos Virales** | 8 créditos | **GRATIS** | 8 créditos |
| **Hashtags** | 25 créditos | **GRATIS** | 25 créditos |
| **SEO Coach** | 45 créditos | **GRATIS** | 45 créditos |

### **Lógica de Implementación**

```javascript
// Pseudocódigo
function calculateFirstUseDiscount(feature, userId) {
  const user = getUser(userId);
  const hasUsedFeature = checkFeatureUsage(userId, feature);
  const normalCost = getCreditCost(feature);
  
  if (!hasUsedFeature && user.isNewUser) {
    // Primer uso: 50% descuento o gratis si es < 50 créditos
    if (normalCost < 50) {
      return 0; // GRATIS
    } else {
      return Math.floor(normalCost * 0.5); // 50% descuento
    }
  }
  
  return normalCost;
}
```

---

## 🎯 FUNNEL DE CONVERSIÓN

### **Etapa 1: Visitante → Registro (Landing Page)**

**Estrategia:**
- Banner destacado: "🎁 200 créditos gratis al registrarte"
- CTA principal: "Comenzar Gratis" (no "Registrarse")
- Muestra de valor: "Prueba cualquier herramienta sin tarjeta"
- Social proof: "Ya usado por 10,000+ creadores"

**Incentivos:**
- ✅ 50 créditos inmediatos al registrarse
- ✅ Acceso instantáneo (sin verificación)
- ✅ Primer uso gratis en herramientas básicas

---

### **Etapa 2: Registro → Activación (Onboarding)**

**Flujo de Onboarding (3 pasos):**

#### **Paso 1: Bienvenida (30 segundos)**
```
🎉 ¡Bienvenido a CreoVision!
Has recibido 50 créditos gratis

[Botón: "Explorar Herramientas"]
```

#### **Paso 2: Selección de Primera Herramienta (1 minuto)**
```
¿Qué quieres crear primero?

[Card 1] 📝 Guión Viral (GRATIS en tu primer uso)
[Card 2] 🏷️ Hashtags Trending (GRATIS en tu primer uso)
[Card 3] 📊 Análisis de Tendencias (50% OFF primer uso)
[Card 4] 🎯 Títulos Optimizados (GRATIS en tu primer uso)

[Botón: "Continuar"]
```

#### **Paso 3: Verificación de Email (Opcional pero incentivado)**
```
Verifica tu email y recibe:
✅ +150 créditos adicionales (total: 200)
✅ Acceso completo a todas las herramientas
✅ Notificaciones de nuevas features

[Input: Email]
[Botón: "Verificar Email"]
[Skip: "Más tarde"]
```

---

### **Etapa 3: Activación → Primer Uso Exitoso**

**Estrategia:**
- **Tooltip contextual** en herramientas: "🎁 Tu primer uso es GRATIS"
- **Badge visual** en cards de herramientas: "GRATIS para ti"
- **Modal de confirmación** antes del primer uso:
  ```
  🎉 ¡Primer uso especial!
  
  Normalmente cuesta: 40 créditos
  Para ti hoy: GRATIS
  
  [Botón: "Usar Gratis"]
  ```

**Después del primer uso:**
```
✨ ¡Contenido creado exitosamente!

Has ahorrado: 40 créditos
Créditos restantes: 160

[Botón: "Crear Más Contenido"]
[Botón: "Ver Historial"]
```

---

### **Etapa 4: Primer Uso → Retención (Días 1-7)**

**Sistema de Recompensas Diarias:**

#### **Día 1: Primer Uso**
- ✅ Primer contenido creado
- 🎁 +25 créditos de celebración
- 🏆 Badge "Primer Forjado"

#### **Día 2: Segundo Uso**
- ✅ "¡Vuelve a crear!"
- 🎁 Descuento 30% en segunda herramienta
- 💡 Sugerencia: "Prueba [Herramienta X] - 30% OFF hoy"

#### **Día 3: Completar Perfil**
- ✅ Perfil completo
- 🎁 +50 créditos
- 🔓 Desbloquea personalización avanzada

#### **Día 7: Semana Completa**
- ✅ "¡Llevas 7 días creando!"
- 🎁 +100 créditos de aniversario
- 📊 Resumen de lo creado
- 🎯 CTA: "Upgrade a PRO para crear sin límites"

---

## 💰 ESTRUCTURA DE PRECIOS CON DESCUENTOS

### **Precios Normales vs Primer Uso**

| Herramienta | Precio Normal | Primer Uso | Ahorro | Estrategia |
|------------|---------------|------------|--------|-----------|
| **Guión Viral** | 40 créditos | **GRATIS** | 100% | Hook principal |
| **Títulos Virales** | 8 créditos | **GRATIS** | 100% | Bajo costo, alta frecuencia |
| **Hashtags** | 25 créditos | **GRATIS** | 100% | Popular, fácil de usar |
| **SEO Coach** | 45 créditos | **GRATIS** | 100% | Alto valor percibido |
| **Análisis Competencia** | 200 créditos | **100 créditos** | 50% | Premium, muestra valor |
| **Growth Dashboard** | 400 créditos | **200 créditos** | 50% | Feature estrella |
| **Tendencias Virales** | 20 créditos | **GRATIS** | 100% | Viral, fácil de compartir |

### **Sistema de Créditos de Bienvenida**

```
Registro básico:        50 créditos
Verificación email:    +150 créditos
Completar perfil:       +50 créditos
Primer contenido:       +25 créditos
─────────────────────────────────
TOTAL INICIAL:          275 créditos
```

**Equivalencia en herramientas:**
- 6-7 guiones virales (con descuentos)
- 11 packs de hashtags
- 13 análisis de títulos
- 1 análisis de competencia (con descuento)
- Combinación estratégica de múltiples herramientas

---

## 🎨 IMPLEMENTACIÓN TÉCNICA

### **1. Nuevas Tablas en Base de Datos**

```sql
-- Tabla de bonificaciones de usuario
CREATE TABLE user_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_type TEXT NOT NULL, -- 'welcome', 'email_verified', 'profile_complete', 'first_content'
  credits_granted INTEGER NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT false
);

-- Tabla de primer uso por herramienta
CREATE TABLE first_use_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_slug TEXT NOT NULL,
  used_at TIMESTAMP DEFAULT NOW(),
  original_cost INTEGER,
  discounted_cost INTEGER,
  savings INTEGER,
  UNIQUE(user_id, feature_slug)
);

-- Índices
CREATE INDEX idx_user_bonuses_user ON user_bonuses(user_id);
CREATE INDEX idx_first_use_user ON first_use_tracking(user_id);
```

### **2. Servicio de Bonificaciones**

```javascript
// src/services/bonusService.js

export async function grantWelcomeBonus(userId) {
  // 50 créditos al registrarse
  return await grantBonus(userId, 50, 'welcome', null);
}

export async function grantEmailVerificationBonus(userId) {
  // +150 créditos al verificar email
  return await grantBonus(userId, 150, 'email_verified', null);
}

export async function grantProfileCompleteBonus(userId) {
  // +50 créditos al completar perfil
  return await grantBonus(userId, 50, 'profile_complete', null);
}

export async function grantFirstContentBonus(userId) {
  // +25 créditos al crear primer contenido
  return await grantBonus(userId, 25, 'first_content', null);
}

export async function checkFirstUseDiscount(userId, featureSlug) {
  // Verificar si es primer uso y aplicar descuento
  const { data } = await supabase
    .from('first_use_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('feature_slug', featureSlug)
    .single();
  
  if (!data) {
    // Es primer uso
    const normalCost = getCreditCost(featureSlug);
    const discountedCost = normalCost < 50 ? 0 : Math.floor(normalCost * 0.5);
    
    return {
      isFirstUse: true,
      originalCost: normalCost,
      discountedCost: discountedCost,
      savings: normalCost - discountedCost
    };
  }
  
  return {
    isFirstUse: false,
    originalCost: getCreditCost(featureSlug),
    discountedCost: getCreditCost(featureSlug),
    savings: 0
  };
}
```

### **3. Componente de Onboarding**

```javascript
// src/components/OnboardingFlow.jsx

const OnboardingFlow = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [credits, setCredits] = useState(50); // Créditos iniciales
  
  // Paso 1: Bienvenida
  // Paso 2: Selección de herramienta
  // Paso 3: Verificación de email (opcional)
  
  return (
    <Dialog open={true}>
      {/* UI del onboarding */}
    </Dialog>
  );
};
```

### **4. Modificación en consumeCredits**

```javascript
// src/services/creditService.js

export async function consumeCredits(userId, featureSlug, description) {
  // 1. Verificar si es primer uso
  const firstUseDiscount = await checkFirstUseDiscount(userId, featureSlug);
  
  // 2. Calcular costo real
  const costToCharge = firstUseDiscount.discountedCost;
  
  // 3. Consumir créditos
  const result = await consumeCreditsInternal(userId, costToCharge, featureSlug, description);
  
  // 4. Si es primer uso, registrar
  if (firstUseDiscount.isFirstUse) {
    await recordFirstUse(userId, featureSlug, firstUseDiscount);
  }
  
  // 5. Retornar con información de descuento
  return {
    ...result,
    firstUse: firstUseDiscount.isFirstUse,
    savings: firstUseDiscount.savings
  };
}
```

---

## 📱 EXPERIENCIA DE USUARIO (UX)

### **1. Landing Page - Mejoras**

**Banner Principal:**
```
┌─────────────────────────────────────────────┐
│  🎁 200 CRÉDITOS GRATIS                     │
│  Prueba cualquier herramienta sin tarjeta  │
│  [Comenzar Gratis]                          │
└─────────────────────────────────────────────┘
```

**Sección de Herramientas:**
```
Cada herramienta muestra:
- Badge: "GRATIS en tu primer uso"
- Precio tachado: ~~40 créditos~~
- Precio destacado: GRATIS
- CTA: "Probar Gratis"
```

### **2. Dashboard Post-Registro**

**Banner de Bienvenida:**
```
┌─────────────────────────────────────────────┐
│  🎉 ¡Bienvenido!                            │
│  Tienes 50 créditos gratis                  │
│  [Explorar Herramientas] [Verificar Email]  │
└─────────────────────────────────────────────┘
```

**Cards de Herramientas:**
```
┌─────────────────────────────┐
│  📝 Generador de Guiones    │
│  Normal: 40 créditos         │
│  Para ti: GRATIS 🎁         │
│  [Usar Ahora]               │
└─────────────────────────────┘
```

### **3. Modal de Confirmación (Primer Uso)**

```
┌─────────────────────────────────────────────┐
│  🎉 ¡Primer Uso Especial!                    │
│                                              │
│  Normalmente cuesta: 40 créditos             │
│  Para ti hoy: GRATIS                         │
│  Ahorras: 40 créditos                        │
│                                              │
│  [Usar Gratis] [Cancelar]                    │
└─────────────────────────────────────────────┘
```

### **4. Notificación Post-Uso**

```
┌─────────────────────────────────────────────┐
│  ✨ ¡Contenido Creado!                       │
│                                              │
│  Has ahorrado: 40 créditos                   │
│  Créditos restantes: 160                     │
│                                              │
│  [Ver Contenido] [Crear Más]                 │
└─────────────────────────────────────────────┘
```

---

## 🎯 ESTRATEGIA DE RETENCIÓN

### **Sistema de Notificaciones Inteligentes**

#### **Día 1 (Post-Registro)**
- Email: "¡Bienvenido! Aquí tienes 200 créditos gratis"
- In-app: Tooltip en herramientas destacadas
- Push: "Prueba tu primera herramienta gratis"

#### **Día 2 (Si no ha usado)**
- Email: "Aún tienes 200 créditos esperándote"
- In-app: Banner: "Tu primer uso es GRATIS"
- Sugerencia: "Prueba [Herramienta X] - Es gratis para ti"

#### **Día 3 (Si ha usado 1 vez)**
- Email: "¡Sigue creando! Tienes 160 créditos restantes"
- In-app: "Prueba [Herramienta Y] con 30% OFF"
- Badge: "Creador Activo" 🏆

#### **Día 7 (Semana completa)**
- Email: "Resumen de tu primera semana"
- In-app: "🎁 +100 créditos de aniversario"
- CTA: "Upgrade a PRO para crear sin límites"

---

## 💡 SISTEMA DE RECOMENDACIONES

### **Algoritmo de Sugerencias**

```javascript
function getRecommendedTool(user) {
  const tools = [
    { slug: 'viral-script', priority: 10, reason: 'Más popular' },
    { slug: 'hashtags', priority: 8, reason: 'Fácil de usar' },
    { slug: 'viral-titles', priority: 7, reason: 'Bajo costo' },
    { slug: 'trend-analysis', priority: 6, reason: 'Alto valor' }
  ];
  
  // Filtrar herramientas ya usadas
  const unusedTools = tools.filter(t => !hasUsedTool(user.id, t.slug));
  
  // Ordenar por prioridad
  return unusedTools.sort((a, b) => b.priority - a.priority)[0];
}
```

### **Widget de Sugerencias**

```
┌─────────────────────────────────────────────┐
│  💡 Te Recomendamos                        │
│                                              │
│  📝 Generador de Guiones                    │
│  Es GRATIS en tu primer uso                 │
│  Usado por 85% de nuestros creadores        │
│                                              │
│  [Probar Ahora]                             │
└─────────────────────────────────────────────┘
```

---

## 📊 MÉTRICAS Y ANALYTICS

### **Eventos a Trackear**

1. **Registro**
   - `user_registered`
   - `welcome_bonus_granted` (50 créditos)

2. **Verificación Email**
   - `email_verified`
   - `email_verification_bonus_granted` (150 créditos)

3. **Primer Uso**
   - `first_tool_used` (con feature_slug)
   - `first_use_discount_applied` (con savings)
   - `first_content_created`

4. **Retención**
   - `day_1_active`
   - `day_7_active`
   - `tool_used_after_first`

5. **Conversión**
   - `upgrade_modal_shown`
   - `upgrade_clicked`
   - `subscription_purchased`

### **Dashboard de Métricas**

```
┌─────────────────────────────────────────────┐
│  MÉTRICAS DE ONBOARDING                     │
│                                              │
│  Registros hoy: 45                           │
│  Tasa de activación: 62%                     │
│  Primer uso promedio: 3.2 min                │
│  Retención D1: 68%                           │
│  Retención D7: 42%                           │
│  Conversión Free→Paid: 12%                   │
└─────────────────────────────────────────────┘
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **Fase 1: Fundación (Semana 1)**
- [ ] Crear tablas de base de datos
- [ ] Implementar `bonusService.js`
- [ ] Modificar `creditService.js` para primer uso
- [ ] Crear componente `OnboardingFlow.jsx`

### **Fase 2: Integración (Semana 2)**
- [ ] Integrar bonificaciones en registro
- [ ] Integrar descuentos en consumo de créditos
- [ ] Agregar badges visuales en herramientas
- [ ] Crear modales de confirmación

### **Fase 3: UX/UI (Semana 3)**
- [ ] Mejorar landing page con incentivos
- [ ] Crear dashboard de bienvenida
- [ ] Implementar sistema de notificaciones
- [ ] Agregar widget de sugerencias

### **Fase 4: Optimización (Semana 4)**
- [ ] A/B testing de mensajes
- [ ] Optimizar flujo de onboarding
- [ ] Implementar analytics
- [ ] Crear dashboard de métricas

---

## 💰 PROYECCIÓN FINANCIERA

### **Costo de Adquisición (CAC)**

**Antes:**
- Registros: 100/mes
- Costo marketing: $500/mes
- CAC: $5/usuario

**Después (Objetivo):**
- Registros: 350/mes (+250%)
- Costo marketing: $500/mes
- CAC: $1.43/usuario (-71%)

### **Valor de Vida del Cliente (LTV)**

**Usuario Free:**
- Créditos de bienvenida: 275 créditos
- Costo real: ~$0.055
- Conversión a Paid: 15%
- LTV Free: $0.055 (costo) + $0 (ingresos) = -$0.055

**Usuario Paid (15% conversión):**
- Plan PRO promedio: $15/mes
- Retención promedio: 6 meses
- LTV Paid: $90
- LTV Promedio: ($90 × 0.15) - ($0.055 × 0.85) = **$13.45**

**ROI:**
- CAC: $1.43
- LTV: $13.45
- **ROI: 840%** 🚀

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Backend**
- [ ] Tabla `user_bonuses`
- [ ] Tabla `first_use_tracking`
- [ ] Función `grantWelcomeBonus()`
- [ ] Función `grantEmailVerificationBonus()`
- [ ] Función `grantProfileCompleteBonus()`
- [ ] Función `grantFirstContentBonus()`
- [ ] Función `checkFirstUseDiscount()`
- [ ] Modificar `consumeCredits()` para aplicar descuentos

### **Frontend**
- [ ] Componente `OnboardingFlow.jsx`
- [ ] Banner de bienvenida en dashboard
- [ ] Badges "GRATIS" en herramientas
- [ ] Modal de confirmación primer uso
- [ ] Notificación post-uso con ahorros
- [ ] Widget de sugerencias
- [ ] Sistema de notificaciones in-app

### **Marketing**
- [ ] Actualizar landing page con incentivos
- [ ] Email de bienvenida
- [ ] Email de verificación con bonus
- [ ] Email de recordatorio (Día 2)
- [ ] Email de aniversario (Día 7)

### **Analytics**
- [ ] Evento `user_registered`
- [ ] Evento `welcome_bonus_granted`
- [ ] Evento `first_tool_used`
- [ ] Evento `first_use_discount_applied`
- [ ] Dashboard de métricas

---

## 🎯 CONCLUSIÓN

Esta estrategia transforma CreoVision de un SaaS con barrera de entrada alta a una plataforma **altamente accesible** donde:

1. ✅ **Cualquiera puede probar** sin fricción
2. ✅ **El valor se demuestra** en el primer uso
3. ✅ **Los incentivos están claros** en cada paso
4. ✅ **La conversión es natural** después de experimentar el valor

**Resultado esperado:**
- 📈 +250% en registros
- 📈 +200% en activación
- 📈 +180% en retención D7
- 📈 +200% en conversión Free→Paid

---

**Próximos Pasos:**
1. Revisar y aprobar estrategia
2. Priorizar fases de implementación
3. Asignar recursos de desarrollo
4. Iniciar Fase 1 (Fundación)

---

*Documento creado el 29 de Noviembre 2025*  
*Versión 1.0 - Estrategia Completa de Onboarding y Freemium*

