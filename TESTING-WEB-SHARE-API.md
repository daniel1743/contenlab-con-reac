# 📤 Testing Web Share API - Instrucciones

**Fecha**: 10 de Noviembre 2025
**Feature**: Web Share API con fallback a clipboard
**Commit**: 3bfc57a0

---

## ✅ ¿Qué se implementó?

### **ShareButton Component** (`src/components/ShareButton.jsx`):
- Componente reutilizable para compartir contenido
- Detecta automáticamente si Web Share API está disponible
- **En móvil**: Abre el sheet nativo de compartir (WhatsApp, Instagram, TikTok, etc.)
- **En desktop**: Copia al portapapeles con notificación

### **Integración en Tools.jsx**:
- Nuevo botón "Compartir" en el panel "Guión Limpio"
- Posicionado como primer botón (más prominente)
- Comparte el guión completo con título y URL de CreoVision

---

## 🧪 Cómo Testearlo

### **Paso 1: Desplegar en Vercel**

Los cambios ya están pusheados a GitHub. Vercel debe redesplegar automáticamente en 2-3 minutos.

Verifica el deployment en: https://vercel.com/daniels-projects-29fb139e/contenlab-con-reac-daniel

---

### **Paso 2: Testing en Desktop (Chrome/Edge/Firefox)**

1. Ve a https://creovision.io/tools
2. Genera un guión viral con cualquier herramienta
3. En el panel "Guión Limpio", haz clic en **"Copiar"** (primer botón con ícono de portapapeles)
4. Deberías ver:
   - ✅ Toast notification: "Copiado al portapapeles"
   - ✅ El texto del guión copiado al clipboard
   - ✅ Botón cambia a "¡Copiado!" con checkmark por 2 segundos

**Resultado esperado**: ✅ En desktop NO se muestra Web Share (porque no está soportado en navegadores de escritorio)

---

### **Paso 3: Testing en Móvil (iOS Safari / Android Chrome)**

#### **iOS Safari** (iPhone/iPad):

1. Abre Safari y ve a https://creovision.io/tools
2. Inicia sesión si es necesario
3. Genera un guión viral
4. En el panel "Guión Limpio", toca el botón **"Compartir"** (ícono de share)
5. Deberías ver:
   - ✅ Se abre el **iOS Share Sheet** nativo
   - ✅ Opciones de compartir: WhatsApp, Instagram, TikTok, Notas, Mail, etc.
   - ✅ El texto incluye: título, guión completo, y URL de CreoVision

**Apps donde deberías poder compartir**:
- WhatsApp
- Instagram Stories
- TikTok (si está instalado)
- Twitter/X
- iMessage
- Notas
- Mail
- Copiar

#### **Android Chrome**:

1. Abre Chrome y ve a https://creovision.io/tools
2. Inicia sesión
3. Genera un guión
4. Toca el botón **"Compartir"**
5. Deberías ver:
   - ✅ Se abre el **Android Share Sheet** nativo
   - ✅ Opciones de WhatsApp, Instagram, TikTok, etc.

---

## 📱 Testing Avanzado - Deep Links (Próximo Sprint)

**Actualmente NO implementado**, pero cuando esté listo, funcionará así:

### TikTok:
```
tiktok://create?text=[guion_aqui]
```
Abrirá TikTok directamente en la pantalla de creación con el texto pre-llenado.

### YouTube:
```
youtube://create?text=[guion_aqui]
```
Abrirá YouTube Studio móvil con el texto en la descripción.

### Instagram:
No tiene deep link directo, pero se comparte vía Share Sheet.

---

## 🐛 Problemas Conocidos y Soluciones

### **Problema 1**: Botón dice "Copiar" en móvil en lugar de "Compartir"

**Causa**: Web Share API no está disponible (navegador antiguo o HTTPS no está activo)

**Solución**:
- Verificar que el sitio esté en HTTPS (no HTTP)
- Actualizar navegador a la última versión
- Probar en Safari (iOS) o Chrome (Android) que son los más compatibles

---

### **Problema 2**: Al hacer clic en "Compartir" no pasa nada

**Causa**: Usuario canceló el share o error de permisos

**Debug**:
1. Abrir DevTools (F12)
2. Ir a Console
3. Buscar mensajes de error
4. Si dice "AbortError" = Usuario canceló (normal)
5. Si dice otro error = Reportar

---

### **Problema 3**: El texto compartido está incompleto

**Causa**: Límite de caracteres de la Web Share API (varía por navegador)

**Solución**: El componente ya maneja esto automáticamente:
- iOS Safari: ~5000 caracteres
- Android Chrome: ~8000 caracteres
- Si el guión es muy largo, se truncará automáticamente

---

## 📊 Métricas de Éxito

Track these metrics en Plausible/Analytics:

1. **Click Rate del botón Share**: Clicks / Guiones generados
2. **Share completado**: Success / Total clicks
3. **Plataforma más usada**: WhatsApp vs Instagram vs TikTok
4. **Desktop vs Mobile**: Cuántos usan clipboard vs share nativo

### **Goal estimado**:
- 30-40% de usuarios comparten el contenido (vs 10% antes)
- Reduce fricción de "copiar → cambiar app → pegar"

---

## 🎯 Qué Probar Específicamente

### ✅ **Desktop** (Chrome, Firefox, Edge):
- [ ] Botón muestra ícono de "Copiar" (no "Share")
- [ ] Al hacer clic, copia al portapapeles
- [ ] Toast notification aparece
- [ ] Botón cambia a "¡Copiado!" por 2 segundos

### ✅ **iOS Safari**:
- [ ] Botón muestra ícono de "Compartir"
- [ ] Al hacer clic, abre iOS Share Sheet
- [ ] Puedes compartir a WhatsApp
- [ ] Puedes compartir a Instagram Stories
- [ ] Puedes copiar al portapapeles desde el sheet
- [ ] El texto incluye título + guión + URL

### ✅ **Android Chrome**:
- [ ] Botón muestra ícono de "Compartir"
- [ ] Al hacer clic, abre Android Share Sheet
- [ ] Puedes compartir a WhatsApp
- [ ] Puedes compartir a Instagram
- [ ] El texto está completo

### ✅ **Fallbacks**:
- [ ] En navegadores antiguos (IE11), el botón muestra "Copiar"
- [ ] Si clipboard API falla, muestra error user-friendly
- [ ] No rompe la app si algo falla

---

## 🚀 Próximos Pasos (No implementados aún)

1. **Analytics tracking**: Agregar eventos de Plausible
   ```javascript
   plausible('Share_Click', {
     props: { method: 'native', platform: 'iOS' }
   });
   ```

2. **Deep links directos**: Abrir TikTok/YouTube directamente
3. **Share en otros componentes**: Agregar ShareButton en:
   - Análisis de contenido
   - Hashtags generados
   - Resultados de Weekly Trends

4. **A/B Testing**: Probar diferentes CTAs:
   - "Compartir"
   - "Enviar a WhatsApp"
   - "Publicar Ahora"

---

## 📞 ¿Encontraste un Bug?

Reporta con:
1. **Dispositivo**: iPhone 13, Samsung Galaxy S21, etc.
2. **Navegador**: Safari 17, Chrome 120, etc.
3. **Pasos para reproducir**
4. **Screenshot o video del error**
5. **Mensaje de error en Console** (si hay)

---

**Generado por**: Claude Code
**Feature Owner**: Daniel
**Testing Window**: 10-11 Noviembre 2025
