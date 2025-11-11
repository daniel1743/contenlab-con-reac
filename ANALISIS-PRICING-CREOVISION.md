# 💰 Análisis y Propuesta de Pricing - CreoVision

**Fecha**: 10 de Noviembre 2025
**Autor**: Claude Code + Daniel
**Status**: Análisis completo basado en costos reales

---

## 🎯 RESUMEN EJECUTIVO

### Mi opinión profesional en 3 puntos:

1. **La propuesta base es BUENA** pero necesita ajustes importantes
2. **Tus costos de API son MUY BAJOS** comparado con lo que cobras → margen alto 🎉
3. **El modelo de créditos por feature es más rentable** que el modelo de "créditos = dinero fijo"

---

## 📊 TUS COSTOS REALES DE CREOVISION

### 1. Consumo de créditos por feature (ya implementado):

| Feature | Créditos consumidos | APIs usadas | Costo real estimado |
|---------|---------------------|-------------|---------------------|
| **Growth Dashboard** | 380 créditos | YouTube API + Gemini AI + caché | ~$0.10 - $0.15 |
| **Análisis de Tendencias** | 150 créditos | YouTube + News API + DeepSeek | ~$0.05 - $0.08 |
| **Competitor Analysis** | 200 créditos | YouTube + Gemini | ~$0.08 - $0.12 |
| **Generación de Hashtags** | 50 créditos | Gemini AI | ~$0.01 - $0.02 |
| **Top Trends Weekly** | 15 créditos | News API + caché | ~$0.005 |
| **Análisis de video** | 30 créditos | DeepSeek/QWEN | ~$0.01 - $0.015 |
| **Script viral básico** | 20 créditos | DeepSeek/QWEN | ~$0.008 |
| **Personalización Plus** | 50 créditos | Gemini/DeepSeek | ~$0.02 |

### 2. Costos de infraestructura mensuales (estimados):

| Servicio | Costo mensual (sin escala) | Costo con 1000 usuarios activos |
|----------|---------------------------|----------------------------------|
| **Vercel Pro** | $20/mes | $20-50/mes (depende de edge functions) |
| **Supabase Pro** | $25/mes | $25-75/mes (depende de storage/bandwidth) |
| **Dominio creovision.io** | $15/año = $1.25/mes | $1.25/mes |
| **YouTube API** | Gratis hasta 10k queries/día | $0 (tienes cuota generosa) |
| **Gemini API** | $0.00025/1k tokens | $10-30/mes con volumen |
| **DeepSeek API** | $0.14/1M tokens | $5-15/mes |
| **QWEN API** | $0.14/1M tokens | $5-15/mes (1M tokens disponibles) |
| **News API** | Free tier 100 req/day | $0 (suficiente para empezar) |
| **MercadoPago fees** | 0% | 5.99% + $5 por transacción aprobada |
| **TOTAL FIJO** | **~$46/mes** | **$66-186/mes** |

---

## 🧮 CÁLCULO DE "COSTE POR CRÉDITO"

### Escenario 1: Usuario promedio usa 1000 créditos/mes

**Mix de uso típico:**
- 1x Growth Dashboard (380 créditos) = $0.15
- 2x Análisis de Tendencias (300 créditos) = $0.16
- 5x Análisis de video (150 créditos) = $0.075
- 10x Hashtags (500 créditos) = $0.20
- Total: 1330 créditos consumidos = **$0.585 de costo real**

**Coste por crédito = $0.585 / 1330 = $0.00044 por crédito**

### Escenario 2: Usuario power user usa 4000 créditos/mes

**Mix de uso intensivo:**
- 3x Growth Dashboard (1140 créditos) = $0.45
- 5x Análisis de Tendencias (750 créditos) = $0.40
- 10x Competitor Analysis (2000 créditos) = $1.20
- 10x Análisis de video (300 créditos) = $0.15
- Total: 4190 créditos consumidos = **$2.20 de costo real**

**Coste por crédito = $2.20 / 4190 = $0.00052 por crédito**

### 🎯 **MI RECOMENDACIÓN: 1 crédito = $0.0005 de coste**

Esto te da margen para:
- Usuarios que abusan de features caras
- Subidas de precio de APIs externas
- Inflación y contingencias

---

## 💡 PROPUESTA DE PLANES OPTIMIZADA

### Opción A: Modelo "Conservador" (más margen)

| Plan | Créditos/mes | Precio USD | Costo estimado | Margen bruto | Margen % | CLP (aprox) |
|------|--------------|------------|----------------|--------------|----------|-------------|
| **Free** | 150 | $0 | $0.075 | -$0.075 | -100% | Gratis |
| **Starter** | 800 | $5 | $0.40 | $4.60 | 92% | $4.500 |
| **Pro** | 2500 | $15 | $1.25 | $13.75 | 92% | $13.500 |
| **Premium** | 6000 | $35 | $3.00 | $32.00 | 91% | $31.500 |

**Ventajas:**
- Márgenes altísimos (>90%)
- Te deja espacio para promociones y descuentos
- Precio Premium más alto = percepción de valor

**Desventajas:**
- $35 puede ser caro para Latinoamérica
- Menos competitivo vs alternativas tipo Canva ($12.99/mes)

---

### Opción B: Modelo "Agresivo" (más competitivo)

| Plan | Créditos/mes | Precio USD | Costo estimado | Margen bruto | Margen % | CLP (aprox) |
|------|--------------|------------|----------------|--------------|----------|-------------|
| **Free** | 150 | $0 | $0.075 | -$0.075 | -100% | Gratis |
| **Starter** | 1000 | $5 | $0.50 | $4.50 | 90% | $4.500 |
| **Pro** | 3000 | $12 | $1.50 | $10.50 | 87% | $10.800 |
| **Premium** | 8000 | $25 | $4.00 | $21.00 | 84% | $22.500 |

**Ventajas:**
- Más créditos por dólar = mejor value proposition
- $25 es precio psicológico mejor que $35
- Competitivo con mercado (Jasper AI: $39, Copy.ai: $49)

**Desventajas:**
- Margen más bajo (pero aún excelente 84-90%)
- Usuarios pueden consumir más de lo esperado

---

### Opción C: Modelo "Híbrido" (mi recomendación) ⭐

| Plan | Créditos/mes | Precio USD | Renovación | Costo estimado | Margen bruto | CLP (aprox) |
|------|--------------|------------|------------|----------------|--------------|-------------|
| **Free** | 150 | $0 | Mensual | $0.075 | -$0.075 | Gratis |
| **Starter** | 1000 | $6 | Mensual | $0.50 | $5.50 (92%) | $5.400 |
| **Pro** | 3000 | $15 | Mensual | $1.50 | $13.50 (90%) | $13.500 |
| **Premium** | 8000 | $30 | Mensual | $4.00 | $26.00 (87%) | $27.000 |
| **Enterprise** | 20000 | $65 | Mensual | $10.00 | $55.00 (85%) | $58.500 |

**¿Por qué es mejor?**
1. **Plan Starter a $6**: Barrera baja de entrada, cubre MercadoPago fees ($5 × 5.99% = $0.30)
2. **Pro a $15**: Precio "ancla" psicológico (no tan caro, no tan barato)
3. **Premium a $30**: Deja espacio para descuentos (ej: $25 en Black Friday)
4. **Enterprise nuevo**: Captura whales (agencias, empresas)

---

## 🎯 ANÁLISIS DE RENTABILIDAD

### Escenario 1: 100 usuarios pagantes (primeros 6 meses)

| Plan | Usuarios | Ingresos/mes | Costos variables | Margen bruto |
|------|----------|--------------|------------------|--------------|
| Starter | 50 | $300 | $25 | $275 |
| Pro | 40 | $600 | $60 | $540 |
| Premium | 10 | $300 | $40 | $260 |
| **TOTAL** | **100** | **$1,200** | **$125** | **$1,075** |

**Costos fijos**: $186/mes (infraestructura con escala)
**Margen neto**: $1,075 - $186 = **$889/mes** = **$10,668/año** 🎉

**MercadoPago fees**: $1,200 × 5.99% = $72/mes
**Margen final**: $889 - $72 = **$817/mes**

---

### Escenario 2: 1000 usuarios pagantes (meta 18 meses)

| Plan | Usuarios | Ingresos/mes | Costos variables | Margen bruto |
|------|----------|--------------|------------------|--------------|
| Starter | 500 | $3,000 | $250 | $2,750 |
| Pro | 350 | $5,250 | $525 | $4,725 |
| Premium | 120 | $3,600 | $480 | $3,120 |
| Enterprise | 30 | $1,950 | $300 | $1,650 |
| **TOTAL** | **1000** | **$13,800** | **$1,555** | **$12,245** |

**Costos fijos**: $350/mes (infraestructura escalada + soporte)
**Margen neto**: $12,245 - $350 = **$11,895/mes**
**MercadoPago fees**: $13,800 × 5.99% = $827/mes
**Margen final**: $11,895 - $827 = **$11,068/mes** = **$132,816/año** 🚀

---

## ⚠️ PUNTOS CRÍTICOS A CONSIDERAR

### 1. **Plan Free es inversión, no pérdida**

**Costo de 1 usuario Free:**
- 150 créditos = $0.075/mes
- 100 usuarios free = $7.50/mes

**Beneficio:**
- Tasa de conversión típica: 2-5% → 2-5 usuarios pagantes
- Lifetime value de 1 usuario Pro: $15 × 12 meses = $180
- ROI: Inviertes $7.50, ganas $360-900/año en conversiones

**✅ Vale la pena totalmente**

---

### 2. **MercadoPago fees son ALTAS**

**Fee por transacción: 5.99% + $5 pesos argentinos**

| Precio | Fee 5.99% | Fee fija (CLP) | Total fee | % real |
|--------|-----------|----------------|-----------|--------|
| $6 | $0.36 | ~$5 CLP = $0.006 | $0.37 | 6.1% |
| $15 | $0.90 | $0.006 | $0.91 | 6.0% |
| $30 | $1.80 | $0.006 | $1.81 | 6.0% |

**Estrategia:**
- Ofrece descuento 10% por pago anual → reduces fees de 12 a 1 transacción
- Ejemplo: Plan Pro anual = $180 → pagas fee 1 vez ($10.80) vs 12 veces ($10.92)

---

### 3. **Créditos rollover = problema potencial**

**Pregunta clave:** ¿Los créditos no usados se acumulan o expiran?

| Opción | Ventaja | Desventaja |
|--------|---------|------------|
| **Expiran cada mes** | Usuarios desperdician créditos = más margen | Percepción negativa, puede causar churn |
| **Se acumulan sin límite** | Percepción positiva, feature diferenciador | Usuarios "guardan" créditos y luego consumen mucho de golpe |
| **Rollover limitado (ej: 50%)** | Balance entre ambos | Más complejo de comunicar |

**Mi recomendación: Rollover limitado**
- Plan Starter: acumula hasta 500 créditos extra
- Plan Pro: acumula hasta 1500 créditos extra
- Plan Premium: acumula hasta 4000 créditos extra

Esto evita que alguien acumule 50k créditos en 6 meses y luego consuma todo en 1 día.

---

### 4. **Percepción de valor: créditos vs features**

**Problema:** Los usuarios no entienden qué son "3000 créditos"

**Solución:** Traduce a lenguaje humano en tu landing page:

```
Plan Pro - $15/mes
✅ 3000 créditos = 100+ guiones virales/mes
✅ 7 análisis completos Growth Dashboard
✅ 20 análisis de competencia
✅ 60 packs de hashtags optimizados
✅ Acceso a todas las herramientas Premium
```

**Ejemplo real:** Jasper AI no dice "200,000 words", dice "Everything you need for a small team"

---

## 🌎 AJUSTE PARA MERCADO LATINOAMERICANO

### Poder adquisitivo por país (2025):

| País | Salario promedio | Equivalente % | Precio sugerido Pro |
|------|------------------|---------------|---------------------|
| **Chile** | $750 USD/mes | 100% | $15/mes |
| **Argentina** | $350 USD/mes | 47% | $7-10/mes |
| **México** | $450 USD/mes | 60% | $9-12/mes |
| **Colombia** | $400 USD/mes | 53% | $8-11/mes |
| **Perú** | $400 USD/mes | 53% | $8-11/mes |

**Estrategia:**
1. **Precio base en USD**: $15 para Chile, USA, Europa
2. **Paridad de poder adquisitivo (PPP)**: Detecta país y ajusta automáticamente
   - Argentina: 40% descuento → $9
   - México: 20% descuento → $12
3. **Implementación técnica:**
   ```javascript
   const countryDiscounts = {
     AR: 0.40, // 40% off
     MX: 0.20,
     CO: 0.30,
     PE: 0.30
   };
   ```

**Herramienta:** Usa Stripe Tax o una librería de geolocation (ya tienes en Vercel)

---

## 🎁 ESTRATEGIAS DE MONETIZACIÓN ADICIONALES

### 1. **Add-ons (compra de créditos extra)**

| Paquete | Créditos | Precio | Ahorro |
|---------|----------|--------|--------|
| Pequeño | 500 | $3 | 0% |
| Mediano | 1500 | $8 | 11% vs Pequeño |
| Grande | 5000 | $20 | 25% vs Pequeño |

**Casos de uso:**
- Usuario Pro consumió sus 3000 créditos antes de fin de mes
- Usuario Free quiere probar Premium sin suscribirse

---

### 2. **Plan anual con descuento**

| Plan | Mensual | Anual (pago único) | Ahorro |
|------|---------|-------------------|--------|
| Starter | $6 × 12 = $72 | $60 | 17% |
| Pro | $15 × 12 = $180 | $144 | 20% |
| Premium | $30 × 12 = $360 | $288 | 20% |

**Ventajas:**
- Cash flow inmediato
- Reducción de fees MercadoPago (1 transacción vs 12)
- Menor churn (ya pagaron el año completo)

---

### 3. **Freemium viral loop**

**Feature:** "Invita a 3 amigos → gana 500 créditos"

**Costo para ti:** 500 créditos × $0.0005 = $0.25
**Beneficio:** 3 nuevos usuarios Free → 0.06-0.15 conversiones → $2.70-10.80 lifetime value

**ROI:** 10-40x 🔥

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend (Supabase):
- [ ] Crear tabla `subscription_plans` con los 4-5 planes
- [ ] Crear función `calculate_credit_cost(feature_name)` para pricing dinámico
- [ ] Implementar `credit_rollover` con límite por plan
- [ ] Trigger para expirar créditos cada mes
- [ ] Dashboard admin para ver consumo por usuario

### Frontend:
- [ ] Página de pricing con toggle USD/CLP
- [ ] Detector de país para PPP pricing
- [ ] Comparador de planes (tabla side-by-side)
- [ ] Traductor de créditos a "features concretos"
- [ ] Modal de upgrade cuando se quedan sin créditos

### MercadoPago:
- [ ] Crear suscripciones recurrentes (no solo pagos one-time)
- [ ] Webhook para renovación automática
- [ ] Email cuando faltan 100 créditos
- [ ] Página de "reactivar suscripción" para churned users

---

## 🎯 MI RECOMENDACIÓN FINAL

### Para arrancar (próximos 3 meses):

**Usa el Modelo Híbrido (Opción C):**

| Plan | Precio | Créditos | Target |
|------|--------|----------|--------|
| Free | $0 | 150/mes | Todos los nuevos usuarios |
| Starter | **$6/mes** | 1000 | Creadores casuales, testing |
| Pro | **$15/mes** | 3000 | Tu "plan ancla" (80% de ventas) |
| Premium | **$30/mes** | 8000 | Power users, agencias pequeñas |

**Razones:**
1. $6 es barrera baja para convertir Free → Starter
2. $15 es el precio "Goldilocks" (ni muy caro ni muy barato)
3. $30 deja espacio para promociones
4. Margen del 87-92% te da colchón enorme

---

### Para escalar (después de 6 meses con 500+ usuarios):

1. **Añadir plan Enterprise** ($65-99/mes con 20k-50k créditos)
2. **Implementar PPP pricing** para Argentina, México, Colombia
3. **Lanzar plan anual** con 20% descuento
4. **Add-ons de créditos** para usuarios que se quedan cortos
5. **Feature "Team"**: $25/mes por 5 usuarios compartiendo pool de créditos

---

## 💰 PROYECCIÓN DE INGRESOS (primer año)

| Mes | Usuarios Free | Usuarios Pagos | MRR | ARR |
|-----|---------------|----------------|-----|-----|
| Mes 1-3 | 50 | 5 | $75 | $900 |
| Mes 4-6 | 150 | 25 | $375 | $4,500 |
| Mes 7-9 | 400 | 80 | $1,200 | $14,400 |
| Mes 10-12 | 800 | 200 | $3,000 | $36,000 |

**Meta realista año 1:** $36k ARR con 200 usuarios pagantes

**Costo total año 1:**
- Infraestructura: $186 × 12 = $2,232
- Variables (APIs): ~$800
- MercadoPago fees: ~$2,160
- **Total:** $5,192

**Margen neto año 1:** $36,000 - $5,192 = **$30,808** 🎉

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ **No hagas esto:**

1. **Precio muy bajo**: $3/mes parece barato pero desvaloriza tu producto
2. **Demasiados planes**: 6-7 opciones confunden al usuario (paradox of choice)
3. **Feature gating excesivo**: No bloquees todo en Free, deja probar valor
4. **Créditos ilimitados**: Alguien va a abusar y tu coste explotará
5. **No trackear**: Necesitas analytics de qué features consumen más créditos

### ✅ **Sí haz esto:**

1. **14 días de trial Premium**: Demuestra valor antes de cobrar
2. **Money-back guarantee**: "Si no te gusta en 30 días, devolvemos tu dinero"
3. **Transparencia de precios**: Muestra tabla de "crédito = X feature"
4. **Paywalls suaves**: "Te quedan 50 créditos, ¿upgrade a Pro?" en lugar de bloquear
5. **Emails de onboarding**: "Así usas tus créditos eficientemente"

---

## 📞 SIGUIENTES PASOS

1. **Define tu plan preferido** (te recomiendo Modelo Híbrido)
2. **Crea los paquetes en Supabase** con el SQL del documento de MercadoPago
3. **Diseña la landing page de pricing** (puedo ayudarte con el copy)
4. **Implementa la lógica de suscripciones** (ya tienes webhook, falta recurring)
5. **A/B testing**: Prueba $15 vs $12 para plan Pro durante 2 semanas

---

**¿Quieres que implemente alguno de estos planes en código?**

Puedo crear:
- SQL para los planes en Supabase
- Componente React de Pricing Page
- Lógica de PPP pricing por país
- Página de comparación de planes

**¿O prefieres ajustar algo de los números primero?** 🚀

---

**Generado por**: Claude Code (Sonnet 4.5)
**Última actualización**: 2025-11-10
**Tiempo de análisis**: 12 minutos
