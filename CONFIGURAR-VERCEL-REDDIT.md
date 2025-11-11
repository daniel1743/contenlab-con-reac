# 📱 Configurar Reddit API en Vercel (Backend Seguro)

**IMPORTANTE**: Las credenciales de Reddit NO deben estar en el frontend (.env con VITE_)

---

## 🔐 Paso 1: Agregar variables en Vercel

1. Ve a https://vercel.com
2. Selecciona tu proyecto "contenlab-con-reac-daniel"
3. Haz clic en **Settings** → **Environment Variables**
4. Agrega estas 2 variables:

| Variable Name | Value |
|---------------|-------|
| `REDDIT_CLIENT_ID` | `Po_BNW_hocVZ59rFc8eNog` |
| `REDDIT_CLIENT_SECRET` | `V17cFVUwjuWQpPcDZYm4vyd9xUxkg` |
| `REDDIT_USER_AGENT` | `creovision:v1.0 (by /u/Real-Juggernaut-1467)` |
| `REDDIT_REDIRECT_URI` | `https://creovision.io/api/reddit-auth` |

**IMPORTANTE**: Marca las 3 cajitas para cada variable:
- ☑️ Production
- ☑️ Preview
- ☑️ Development

5. Haz clic en "Save" para cada una

**NOTA**: Son 4 variables en total (Client ID, Client Secret, User Agent, Redirect URI)

---

## 🚀 Paso 2: Redeploy

1. Ve a la pestaña **Deployments**
2. Haz clic en el deployment más reciente
3. Haz clic en los 3 puntos `...`
4. Haz clic en **"Redeploy"**
5. Espera 2-3 minutos

---

## ✅ Paso 3: Verificar

Las variables estarán disponibles en tus API endpoints con:
```javascript
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI;
```

**NO estarán disponibles** en el frontend (correcto, por seguridad).

---

## 🔧 Paso 4: Crear endpoint de Reddit (Opcional para OAuth)

Si vas a usar OAuth de Reddit (para usuarios que autoricen acceso), necesitas crear el endpoint:

1. Crea archivo: `api/reddit-auth.js`
2. Este endpoint manejará el callback de Reddit OAuth
3. Documentación: https://github.com/reddit-archive/reddit/wiki/OAuth2

---

¡Listo! Reddit API configurado de forma segura 🔒
