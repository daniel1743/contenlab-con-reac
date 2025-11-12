# 🔐 CONFIGURACIÓN DE VARIABLES DE ENTORNO EN VERCEL

## 📋 INSTRUCCIONES PASO A PASO

### 1. Accede al Dashboard de Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **CONTENTLAB** (o como lo hayas nombrado)

### 2. Navega a Environment Variables
1. Click en **Settings** (configuración)
2. En el menú lateral, click en **Environment Variables**

### 3. Agregar las Variables una por una

Para cada variable:
1. Click en **Add New**
2. En **Key**: ingresa el nombre de la variable (sin el prefijo VITE_)
3. En **Value**: pega el valor correspondiente
4. En **Environments**: selecciona **Production**, **Preview** y **Development** (todas)
5. Click en **Save**

---

## 🔑 VARIABLES A CONFIGURAR

### ✅ APIs DE IA (ACTUALIZADAS - NOVIEMBRE 2025)

```env
# DeepSeek AI (Asistente Conversacional)
DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a

# Qwen AI (Alibaba Cloud - Análisis de Tendencias)
QWEN_API_KEY=sk-9114f3c128114265a0fdfcafac26a576
```

---

### 📌 OTRAS VARIABLES IMPORTANTES

**IMPORTANTE:** Para el frontend (VITE), las variables deben tener prefijo `VITE_`
**IMPORTANTE:** Para el backend (API routes), las variables NO deben tener prefijo `VITE_`

Configura AMBAS versiones de cada variable:

#### Supabase (Base de Datos)
```env
# Frontend
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY_AQUI

# Backend (sin VITE_)
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY_AQUI
```

#### APIs de IA (DeepSeek y Qwen)
```env
# Frontend (con VITE_)
VITE_DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a
VITE_QWEN_API_KEY=sk-9114f3c128114265a0fdfcafac26a576

# Backend (sin VITE_) - Para API routes
DEEPSEEK_API_KEY=sk-4d4cc3ac92254985b045a1881b85b12a
QWEN_API_KEY=sk-9114f3c128114265a0fdfcafac26a576
```

#### Otras APIs (si las tienes configuradas)
```env
# Gemini AI
VITE_GEMINI_API_KEY=TU_GEMINI_API_KEY
GEMINI_API_KEY=TU_GEMINI_API_KEY

# OpenAI
VITE_OPENAI_API_KEY=TU_OPENAI_API_KEY
OPENAI_API_KEY=TU_OPENAI_API_KEY

# YouTube
VITE_YOUTUBE_API_KEY=TU_YOUTUBE_API_KEY

# Twitter
VITE_TWITTER_API_KEY=TU_TWITTER_API_KEY

# NewsAPI
VITE_NEWSAPI_KEY=TU_NEWSAPI_KEY

# Unsplash
VITE_UNSPLASH_ACCESS_KEY=TU_UNSPLASH_ACCESS_KEY
VITE_UNSPLASH_SECRET_KEY=TU_UNSPLASH_SECRET_KEY

# Giphy
VITE_GIPHY_API_KEY=TU_GIPHY_API_KEY

# Mercado Pago
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu_public_key
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu_access_token
```

---

## 🚀 DESPUÉS DE CONFIGURAR

### 4. Re-desplegar el Proyecto

Las variables de entorno solo se aplicarán en el **próximo despliegue**.

Opción A - Desde la terminal:
```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"
vercel --prod
```

Opción B - Desde el Dashboard de Vercel:
1. Ve a la pestaña **Deployments**
2. Click en el último deployment exitoso
3. Click en el menú ⋯ (tres puntos)
4. Selecciona **Redeploy**
5. Marca la opción **Use existing Build Cache**
6. Click en **Redeploy**

---

## ✅ VERIFICACIÓN

Una vez desplegado, verifica que las APIs funcionen:

1. **Análisis de Tendencias:**
   - Desbloquea una tendencia
   - Verifica que el análisis sea coherente (no "robot")
   - Revisa la consola del navegador - NO deben aparecer errores 404 para `/api/ai/chat`

2. **Chat Conversacional:**
   - Abre el chat de Creo
   - Envía un mensaje
   - Verifica que responda con personalidad

3. **Memoria Persistente:**
   - Verifica que las conversaciones se guarden
   - Cierra sesión y vuelve a entrar
   - Las memorias deben persistir

---

## 🔒 SEGURIDAD

### ⚠️ NUNCA COMMITEES .env A GIT

Tu `.env` local ya está protegido en `.gitignore`. Pero por si acaso:

```bash
# Verificar que .env no esté trackeado
git status

# Si aparece .env, eliminarlo del tracking:
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

### 🔄 Rotar API Keys

Si alguna vez expones accidentalmente una API key:
1. Revoca la key inmediatamente en la plataforma correspondiente
2. Genera una nueva
3. Actualiza `.env` local
4. Actualiza variables en Vercel
5. Re-despliega

---

## 📊 RESUMEN DE KEYS ACTUALIZADAS

| Servicio | Key | Estado |
|----------|-----|--------|
| DeepSeek | `sk-4d4cc3ac92254985b045a1881b85b12a` | ✅ Actualizada |
| Qwen (Alibaba) | `sk-9114f3c128114265a0fdfcafac26a576` | ✅ Actualizada |

---

## 🆘 TROUBLESHOOTING

### Error: "Environment variable not found"
- Verifica que hayas agregado AMBAS versiones (con y sin `VITE_`)
- Asegúrate de haber re-desplegado después de agregar las variables

### Error: 404 en /api/ai/chat
- Verifica que las variables SIN prefijo `VITE_` estén configuradas
- Las API routes de Vercel necesitan las variables sin prefijo

### Error: "Invalid API Key"
- Verifica que copiaste las keys correctamente (sin espacios extra)
- Asegúrate de que las keys no hayan expirado

---

## 📞 DOCUMENTACIÓN OFICIAL

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [DeepSeek Platform](https://platform.deepseek.com/)
- [Qwen AI Platform](https://qwen.ai/apiplatform)
- [Supabase Dashboard](https://app.supabase.com/)

---

**Última actualización:** 12 de Noviembre 2025
**Versión:** 2.0 (Keys actualizadas)
