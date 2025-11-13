# 📺 SETUP RÁPIDO: YouTube Data API v3

## ⏱️ Tiempo estimado: 5 minutos

### Paso 1: Ir a Google Cloud Console
https://console.cloud.google.com/

### Paso 2: Crear Proyecto (si no tienes uno)
1. Click en selector de proyectos (arriba izquierda)
2. Click "Nuevo proyecto"
3. Nombre: `CreoVision` (o cualquier nombre)
4. Click **"Crear"**
5. Espera 10 segundos a que se cree

### Paso 3: Habilitar YouTube Data API v3
1. En el menú ☰ → **APIs y servicios** → **Biblioteca**
2. En el buscador escribe: `YouTube Data API v3`
3. Click en el primer resultado
4. Click botón azul **"Habilitar"**
5. Espera 5 segundos

### Paso 4: Crear API Key
1. Menú ☰ → **APIs y servicios** → **Credenciales**
2. Click **"Crear credenciales"** (arriba)
3. Selecciona **"Clave de API"**
4. Se generará una key como: `AIzaSyDxxx...`
5. **COPIAR** esa key

### Paso 5: Restricciones (OPCIONAL pero recomendado)
1. Click en **"Editar clave de API"**
2. En **"Restricciones de API"**:
   - Selecciona "Restringir clave"
   - Marca solo: **YouTube Data API v3**
3. Click **"Guardar"**

### Paso 6: Agregar al Proyecto
Abrir `.env` y reemplazar:

```env
VITE_YOUTUBE_API_KEY=AIzaSyDxxx_TU_KEY_REAL_AQUI
```

### Paso 7: Reiniciar Servidor
```bash
# PowerShell:
Ctrl+C  # Detener servidor
npm run dev  # Iniciar de nuevo
```

---

## ✅ Verificación

En la consola del navegador (F12), deberías ver:
```
🚀 Iniciando Creo Strategy...
✅ Channel ID: UC...
✅ Videos del usuario obtenidos: 8
```

---

## 🆘 Problemas Comunes

### Error: "API key not valid"
- Verifica que copiaste la key completa
- Asegúrate de habilitar YouTube Data API v3

### Error: "Quota exceeded"
- YouTube API tiene límite gratuito de 10,000 unidades/día
- Cada análisis consume ~100 unidades
- Suficiente para ~100 análisis diarios

### Error: "API not enabled"
- Vuelve al Paso 3 y habilita YouTube Data API v3
