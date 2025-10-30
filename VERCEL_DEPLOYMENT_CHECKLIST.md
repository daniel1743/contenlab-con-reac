# Vercel Deployment Checklist – CreoVision

Este checklist deja el proyecto listo para desplegarlo en Vercel utilizando las convenciones actuales del repositorio.

## 1. Requisitos previos
- Node.js 18 o 20 (lo que Vercel usa por defecto).
- Cuenta en Vercel con acceso al equipo/proyecto CreoVision.
- Acceso a las APIs configuradas (Supabase, Google, DeepSeek, etc.).

## 2. Variables de entorno
Define los secretos en Vercel → *Project Settings → Environment Variables* usando estos nombres (coinciden con `vercel.json`):

| Variable | Descripción |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Llave pública de Supabase. |
| `VITE_GEMINI_API_KEY` | API key de Gemini. |
| `VITE_OPENAI_API_KEY` | (Opcional) API key de OpenAI si se activa. |
| `VITE_DEEPSEEK_API_KEY` | API key de DeepSeek. |
| `VITE_NEWS_API_KEY` | API key de NewsAPI (tendencias). |
| `VITE_TWITTER_BEARER_TOKEN` | Token para Twitter/X. |
| `VITE_YOUTUBE_API_KEY` | API key YouTube Data API v3. |
| `VITE_MERCADOPAGO_PUBLIC_KEY` | Public key Mercado Pago. |
| `VITE_MERCADOPAGO_ACCESS_TOKEN` | Token privado Mercado Pago. |

> Repite los valores en los entornos `Production`, `Preview` y `Development` si quieres que todas las ramas usen las mismas integraciones. Para entornos sandbox puedes crear llaves alternativas.

## 3. Configuración del proyecto
1. **Importar repositorio** en Vercel (`New Project → Import Git Repository`).
2. Seleccionar el directorio raíz (este repo).
3. Vercel detectará framework `Vite` automáticamente. Confirma los siguientes comandos:
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `dist`
4. Asegúrate de que el archivo `vercel.json` se encuentra en la raíz del proyecto (ya incluido).
5. Vercel creará automáticamente rutas amigables gracias a `routes` en `vercel.json`, permitiendo SPA fallback a `index.html`.

## 4. Tests locales antes del deploy
```bash
npm install
npm run lint
npm run build
```
Si quieres simular el entorno productivo:
```bash
npm run preview
```

## 5. Deploy manual opcional
- Para forzar un deploy manual: `vercel --prod` (asegúrate de tener la CLI y estar autenticado con `vercel login`).
- Para revisar las variables desde CLI: `vercel env ls`.

## 6. Dominio `creovision.io`
- Una vez que el primer deploy esté listo, ve a *Project Settings → Domains* y agrega `creovision.io`.
- Configura los registros DNS:
  - CNAME `www` → `cname.vercel-dns.com`
  - APEX (root) con registros A de Vercel o ALIAS si el proveedor lo soporta (`76.76.21.21`).
- Activa `Redirect www → root` para evitar duplicidad (`www.creovision.io` → `creovision.io`).

## 7. Post-deploy
1. Verificar `https://creovision.io/robots.txt` y `https://creovision.io/sitemap.xml`.
2. Ejecutar el script de verificación si se desea: `node scripts/verify-seo.js`.
3. Conectar Vercel con Supabase (si usas webhooks) desde *Integrations*.
4. Activar Analytics/Monitoring que necesites (Vercel Speed Insights, Log Drains, etc.).

Con esto, el proyecto queda preparado para desplegarse en Vercel sin ajustes adicionales.
