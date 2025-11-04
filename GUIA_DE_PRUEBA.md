# 🧪 GUÍA DE PRUEBA - ANÁLISIS DE CANAL

## 🚀 PASO 1: Acceder a la aplicación

El servidor está corriendo en:
```
http://localhost:5174
```

## 🎯 PASO 2: Navegar al análisis de canal

### Opción A: URL Directa
```
http://localhost:5174/channel-analysis
```

### Opción B: Desde la aplicación
1. Abre `http://localhost:5174`
2. En la barra de direcciones, agrega `/channel-analysis`

---

## 📋 PASO 3: Probar el análisis

### **Prueba 1: Análisis Exitoso (Plan FREE - 5 videos)**

1. **Ingresa una URL de prueba:**
   ```
   https://youtube.com/@MrBeast
   ```
   O
   ```
   https://youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA
   ```

2. **Haz clic en "Analizar"**

3. **Verás:**
   - ⏳ Pantalla de carga "Analizando tus videos..."
   - ⏱️ Tarda aproximadamente 5-10 segundos
   - ✅ Dashboard completo con análisis

4. **Qué deberías ver en el Dashboard:**
   - 📊 Header con info del canal (nombre, suscriptores, vistas)
   - 📈 Gráfico de rendimiento de 5 videos
   - 🤖 Panel de IA con:
     * Fortalezas (3 puntos)
     * Mejoras (3 puntos)
     * Próximos pasos (3-4 pasos)
     * Score global (0-100)
   - 🖼️ Carousel de miniaturas (Swiper)
   - 🎙️ Análisis de voz y edición
   - 📊 Gráfico de engagement/retención
   - 📝 Análisis textual y SEO
   - ✨ Sello de CreoVision/ContentLab

---

### **Prueba 2: Cache Hit (No consume cuota)**

1. **Haz clic en "Analizar otro canal"**

2. **Ingresa LA MISMA URL otra vez:**
   ```
   https://youtube.com/@MrBeast
   ```

3. **Resultado esperado:**
   - ⚡ Respuesta INSTANTÁNEA (< 1 segundo)
   - ✅ Muestra el mismo dashboard
   - 🏷️ Badge "Desde cache" en el header
   - 💡 **NO consume tu cuota de 1 análisis/mes**

---

### **Prueba 3: Segundo análisis diferente (BLOQUEADO)**

1. **Haz clic en "Analizar otro canal"**

2. **Ingresa una URL DIFERENTE:**
   ```
   https://youtube.com/@mkbhd
   ```

3. **Resultado esperado:**
   - ❌ Error: "Límite mensual alcanzado"
   - 📅 Mensaje: "Tu plan FREE permite 1 análisis/mes. Se restablece el 1 de diciembre."
   - 🚫 NO te deja continuar

---

### **Prueba 4: URLs inválidas**

**Prueba con URLs incorrectas para verificar manejo de errores:**

1. **URL sin canal:**
   ```
   https://youtube.com/watch?v=dQw4w9WgXcQ
   ```
   - ❌ Debería mostrar error

2. **URL malformada:**
   ```
   canal-invalido
   ```
   - ❌ Debería mostrar error

3. **Canal privado/inexistente:**
   ```
   https://youtube.com/@canal-que-no-existe-12345
   ```
   - ❌ Debería mostrar error

---

## 🎨 PASO 4: Verificar el Dashboard

### **Elementos visuales a verificar:**

#### 1. **Header**
- ✅ Foto del canal (circular)
- ✅ Nombre del canal
- ✅ Suscriptores formateados (ej: 25,000,000)
- ✅ Vistas totales
- ✅ Fecha de creación
- ✅ Resumen de IA (frase motivacional)
- ✅ Badge "Desde cache" si aplica

#### 2. **Gráfico de Performance**
- ✅ Barras de colores:
  * Verde: Vistas
  * Azul: Likes
  * Magenta: Comentarios
- ✅ Hover muestra tooltip con título del video
- ✅ Números formateados (ej: 120,000,000)

#### 3. **Panel de IA**
- ✅ 3 columnas:
  * Lo que estás haciendo bien (verde)
  * Lo que podrías mejorar (amarillo)
  * Próximos pasos (magenta)
- ✅ Recomendaciones detalladas con prioridad
- ✅ Score global circular (0-100)

#### 4. **Carousel de Miniaturas**
- ✅ Swiper funcional (flechas + dots)
- ✅ Auto-play cada 3 segundos
- ✅ Score de 1-10 en cada miniatura
- ✅ Hover muestra info del video

#### 5. **Análisis de Voz y Edición**
- ✅ Gráfico circular (pie chart)
- ✅ Checklist con ✓ y ✗
- ✅ Feedback de IA

#### 6. **Engagement y Retención**
- ✅ 3 KPIs:
  * Tiempo promedio visto
  * Pico de abandono
  * Mejor retención
- ✅ Gráfico de línea con área
- ✅ Insight al final

#### 7. **Análisis Textual**
- ✅ Gráfico de sentimiento (3 barras horizontales)
- ✅ Keywords en badges
- ✅ Sugerencias SEO con prioridad
- ✅ Pro Tip al final

#### 8. **Sello Final**
- ✅ Logo animado
- ✅ Nombre "ContentLab"
- ✅ Botón CTA "Mejora tu contenido ahora"
- ✅ Estrellas animadas en esquinas

---

## 📱 PASO 5: Verificar Responsive

### **Desktop (> 1024px)**
- ✅ Grid de 2 columnas en secciones
- ✅ Sidebar con info adicional
- ✅ Gráficos anchos y claros

### **Tablet (640px - 1024px)**
- ✅ Grid de 1-2 columnas adaptativo
- ✅ Gráficos ajustados
- ✅ Navigation con scroll

### **Mobile (< 640px)**
- ✅ Todo en 1 columna
- ✅ Gráficos verticales
- ✅ Touch-friendly

**Prueba redimensionando la ventana del navegador.**

---

## 🐛 PASO 6: Verificar Console

### **Abre DevTools (F12) y revisa:**

#### Console (debería mostrar):
```
🚀 Iniciando análisis de canal con cache...
✅ Límite OK - Análisis 1/1. Videos permitidos: 5
🔍 Buscando análisis en cache...
ℹ️ No hay análisis en cache
📊 No hay cache - analizando canal...
🎯 Iniciando análisis de canal: https://youtube.com/@MrBeast (5 videos)
📊 Obteniendo información del canal...
🎬 Obteniendo últimos 5 videos...
💬 Obteniendo comentarios de videos...
✅ Análisis completado
🤖 Generando insights con Gemini AI...
✅ Insights generados
💾 Guardando en cache...
✅ Análisis guardado en Supabase
✅ Análisis completado y guardado!
```

#### Network Tab:
- ✅ Llamadas a YouTube API (`googleapis.com`)
- ✅ Llamadas a Gemini API (`generativelanguage.googleapis.com`)
- ✅ Llamadas a Supabase (`supabase.co`)

#### Errores:
- ❌ NO debería haber errores rojos
- ⚠️ Warnings amarillos son OK

---

## 🔍 PASO 7: Verificar Supabase (Opcional)

### **Si quieres ver los datos guardados:**

1. **Ve a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Navega a:**
   - Project: bouqpierlyeukedpxugk
   - Table Editor → `channel_analyses`

3. **Deberías ver:**
   - ✅ Una fila con el análisis
   - ✅ `user_id`: "demo-user-123"
   - ✅ `channel_id`: ID del canal
   - ✅ `channel_title`: Nombre del canal
   - ✅ `analysis_data`: JSON con métricas
   - ✅ `ai_insights`: JSON con insights de IA
   - ✅ `analyzed_at`: Fecha/hora actual
   - ✅ `expires_at`: +30 días
   - ✅ `is_active`: true

---

## ✅ CHECKLIST DE PRUEBA COMPLETA

### Funcionalidad
- [ ] Análisis exitoso con URL válida
- [ ] Cache hit (mismo canal 2 veces)
- [ ] Límite bloqueado (2do canal diferente)
- [ ] Manejo de errores (URLs inválidas)
- [ ] Botón "Analizar otro canal" funciona

### Dashboard
- [ ] Header muestra info correcta
- [ ] Gráfico de performance renderiza
- [ ] Panel de IA muestra insights
- [ ] Carousel de miniaturas funciona
- [ ] Gráficos de voz y edición
- [ ] Gráfico de engagement
- [ ] Análisis textual y SEO
- [ ] Sello final animado

### Visual
- [ ] Colores correctos (azul, magenta, verde, naranja)
- [ ] Animaciones suaves (Framer Motion)
- [ ] Iconos visibles (Lucide React)
- [ ] Fuentes legibles
- [ ] Responsive en mobile

### Performance
- [ ] Carga en < 10 segundos (primera vez)
- [ ] Cache en < 1 segundo (segunda vez)
- [ ] Sin errores en console
- [ ] Sin warnings críticos

---

## 🎥 VIDEO DE PRUEBA (Sugerido)

**Graba un video mostrando:**
1. Entrada de URL
2. Proceso de carga
3. Dashboard completo
4. Scroll por todas las secciones
5. Carousel funcionando
6. Segundo análisis (cache hit)
7. Tercer análisis (bloqueado)

**Duración:** 2-3 minutos

---

## 🐛 PROBLEMAS COMUNES

### "Cannot read properties of undefined"
**Solución:** Verifica que las API keys estén en `.env`:
```bash
VITE_YOUTUBE_API_KEY=tu_key_aqui
VITE_GEMINI_API_KEY=tu_key_aqui
```

### "Límite de YouTube API excedido"
**Solución:** Has alcanzado el límite diario (10,000 unidades). Espera hasta mañana o usa otra API key.

### Dashboard no carga datos
**Solución:** Abre DevTools → Console y verifica el error específico. Probablemente es:
- API key inválida
- Canal privado/inexistente
- Problema de red

### Swiper no funciona
**Solución:** Verifica que se instaló:
```bash
npm list swiper
```
Si no está, instala:
```bash
npm install swiper
```

---

## 📊 MÉTRICAS A OBSERVAR

Mientras pruebas, anota:

- ⏱️ **Tiempo de carga (primera vez):** _____ segundos
- ⚡ **Tiempo de carga (desde cache):** _____ segundos
- 📊 **Cantidad de videos analizados:** _____ (debería ser 5)
- 🤖 **Score de IA:** _____ (0-100)
- ✅ **¿Funcionó el cache?:** Sí / No
- ❌ **¿Bloqueó 2do análisis?:** Sí / No

---

## 🎉 RESULTADO ESPERADO

Si todo funciona correctamente:

✅ Análisis exitoso con 5 videos
✅ Dashboard completo y visual
✅ Cache funciona (instantáneo)
✅ Límite de 1 análisis/mes bloqueado
✅ Sin errores en console
✅ Responsive en todos los tamaños

**¡El sistema está funcionando perfectamente!** 🚀

---

**Creado:** 2025-11-04
**Para:** Pruebas de desarrollo
**Servidor:** http://localhost:5174/channel-analysis
