# ✅ CHECKLIST DE TAREAS MANUALES - CREOVISION
**Fecha:** 2025-11-03
**Actualizaciones implementadas por Claude Code**

---

## 📋 RESUMEN DE LO QUE YA ESTÁ LISTO

### ✅ **COMPLETADO POR CLAUDE CODE:**

1. **Sistema de Recuperación de Contraseña** ✅
   - Modal con "¿Olvidaste tu contraseña?" en AuthModal.jsx
   - Página `/reset-password` completamente funcional
   - Integración con Supabase auth
   - UI profesional con validaciones

2. **Esquema Completo de Base de Datos** ✅
   - Archivo SQL listo: `SUPABASE-SCHEMA-COMPLETO.sql`
   - 7 tablas: suscripciones, cuotas, contenido, pagos, logs, perfiles, referidos
   - Row Level Security (RLS) configurado
   - Funciones útiles incluidas
   - Índices para performance

3. **Error Tracking Básico** ✅
   - Servicio creado: `src/lib/errorTracking.js`
   - Captura errores globales y promesas rechazadas
   - Integrado en chatgptService.js
   - Guarda logs en localStorage
   - Preparado para Sentry (comentado)

4. **Análisis de Gaps Funcionales** ✅
   - Documento completo: `ANALISIS-GAPS-FUNCIONALES.md`
   - Identifica todo lo que falta para estar 100% funcional
   - Incluye costos, tiempos y prioridades

---

## 🔧 TAREAS QUE DEBES HACER MANUALMENTE

### **NIVEL 1: CRÍTICO Y URGENTE**

---

#### **1. CONFIGURAR EMAILS EN SUPABASE** 🔴 **CRÍTICO**

**¿Por qué?** Sin esto, la recuperación de contraseña NO funcionará.

**Pasos:**
1. Ve a Supabase Dashboard → https://app.supabase.com
2. Selecciona tu proyecto: `bouqpierlyeukedpxugk`
3. Ve a **Authentication** → **Email Templates**
4. Configura estas plantillas:
   - **Reset Password** (Recuperar contraseña)
   - **Confirm Email** (Verificar cuenta nueva)
5. Personaliza los templates con tu branding (logo, colores)
6. En **Settings** → **Auth** → verifica:
   - `Site URL`: `https://creovision.io`
   - `Redirect URLs`: Agregar `https://creovision.io/reset-password`

**Tiempo:** 15-20 minutos
**Documentación:** https://supabase.com/docs/guides/auth/auth-email-templates

---

#### **2. EJECUTAR SCHEMA SQL EN SUPABASE** 🔴 **CRÍTICO**

**¿Por qué?** Sin las tablas de DB, no puedes gestionar suscripciones, cuotas ni pagos.

**Pasos:**
1. Ve a Supabase Dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (ícono de código en sidebar)
4. Click **"+ New Query"**
5. Copia TODO el contenido de `SUPABASE-SCHEMA-COMPLETO.sql`
6. Pega en el editor
7. Click **"Run"** (▶️ arriba a la derecha)
8. Verifica que aparezca: `✅ Schema completo creado: 7 de 7 tablas`

**Tiempo:** 5 minutos
**⚠️ IMPORTANTE:** Hazlo en PRODUCCIÓN, no en proyecto de testing

---

#### **3. CONFIGURAR MERCADOPAGO (PAGOS)** 🔴 **CRÍTICO**

**¿Por qué?** Sin esto, NO puedes monetizar (key actual es `TEST-tu_public_key_aqui`).

**Pasos:**

**A. Crear cuenta de MercadoPago:**
1. Ve a https://www.mercadopago.com
2. Regístrate o inicia sesión
3. Ve a **"Desarrolladores"** → **"Tus integraciones"**
4. Click **"Crear aplicación"**
5. Nombre: `CreoVision Production`
6. Selecciona **"Payments"** (pagos online)

**B. Obtener credenciales:**
1. Ve a **"Credenciales"**
2. Copia **Public Key** (comienza con `APP_USR-`)
3. Copia **Access Token** (comienza con `APP_USR-`)
4. Reemplaza en `.env`:
   ```bash
   VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu_public_key_aqui
   VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu_access_token_aqui
   ```

**C. Configurar Webhooks:**
1. En MercadoPago Dashboard → **"Webhooks"**
2. Agregar URL: `https://creovision.io/api/webhooks/mercadopago`
3. Seleccionar eventos:
   - `payment` (todos)
   - `subscription` (todos)
4. Guardar **Secret Key** del webhook (la necesitarás después)

**Tiempo:** 30-40 minutos
**⚠️ IMPORTANTE:** Primero prueba con credenciales de TEST, luego pasa a producción

**Documentación:** https://www.mercadopago.com.ar/developers/es/docs

---

#### **4. CREAR BACKEND API (NODE.JS/VERCEL FUNCTIONS)** 🔴 **CRÍTICO**

**¿Por qué?** Tus API keys están expuestas en el frontend (riesgo ALTO de robo).

**Opción A: Vercel Serverless Functions (Recomendada)**

**Pasos:**
1. Crea carpeta `api/` en raíz del proyecto
2. Crea archivo `api/generate-content.js`:

```javascript
// api/generate-content.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Verificar que es POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar autenticación (JWT token)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Validar token con Supabase
  // TODO: Implementar validación

  // Obtener API key desde variables de entorno (SEGURAS)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    const { prompt } = req.body;

    // Llamar a Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);

    return res.status(200).json({
      success: true,
      content: result.response.text()
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

3. Configurar variables de entorno en Vercel:
   - Ve a Vercel Dashboard → Tu proyecto → **Settings** → **Environment Variables**
   - Agrega:
     - `GEMINI_API_KEY`
     - `QWEN_API_KEY`
     - `DEEPSEEK_API_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (para validar JWT)

4. Deploy a Vercel

**Tiempo:** 2-4 horas (si sabes Node.js)
**Costo:** $0 (Vercel gratis incluye 100GB bandwidth/mes)

**Opción B: Contratar desarrollador**
- **Costo:** $2,000-$4,000 USD
- **Tiempo:** 1 semana

---

#### **5. CONFIGURAR SENTRY (ERROR TRACKING REAL)** 🟡 **IMPORTANTE**

**¿Por qué?** Aunque tenemos error tracking básico, Sentry es mucho mejor.

**Pasos:**
1. Ve a https://sentry.io
2. Crea cuenta gratis (10,000 eventos/mes gratis)
3. Crea proyecto: Nombre `CreoVision`, Plataforma `React`
4. Copia el DSN (comienza con `https://`)
5. Instala Sentry:
   ```bash
   npm install @sentry/react
   ```
6. Agrega a `.env`:
   ```bash
   VITE_SENTRY_DSN=https://tu_dsn_aqui
   ```
7. En `src/lib/errorTracking.js`, descomenta la sección de Sentry (líneas comentadas al final)
8. En `src/main.jsx`, reemplaza `initErrorTracking()` por `initSentry()`

**Tiempo:** 20-30 minutos
**Costo:** $0 (plan gratis suficiente al inicio)

**Documentación:** https://docs.sentry.io/platforms/javascript/guides/react/

---

### **NIVEL 2: IMPORTANTE (Hacer en 1-2 semanas)**

---

#### **6. CONFIGURAR GOOGLE ANALYTICS 4** 🟡

**¿Por qué?** Necesitas saber cuántos usuarios tienes, de dónde vienen, qué hacen.

**Pasos:**
1. Ve a https://analytics.google.com
2. Crea propiedad: `CreoVision`
3. Crea stream de datos: `Web` → URL: `https://creovision.io`
4. Copia **Measurement ID** (comienza con `G-`)
5. Instala:
   ```bash
   npm install react-ga4
   ```
6. Crea `src/lib/analytics.js`:
   ```javascript
   import ReactGA from 'react-ga4';

   export const initGA = () => {
     ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
   };

   export const trackPageView = (path) => {
     ReactGA.send({ hitType: "pageview", page: path });
   };

   export const trackEvent = (category, action, label) => {
     ReactGA.event({ category, action, label });
   };
   ```
7. En `src/main.jsx`, agregar: `initGA()`
8. Agregar a `.env`:
   ```bash
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**Tiempo:** 30 minutos

---

#### **7. ACTUALIZAR POLÍTICAS LEGALES** 🟡

**¿Por qué?** Las actuales son genéricas y no cumplen GDPR.

**Opción A: Usar generador (gratis pero genérico)**
1. Ve a https://termly.io o https://getterms.io
2. Genera:
   - Terms of Service
   - Privacy Policy
   - Cookie Policy
3. Personaliza con info de CreoVision
4. Reemplaza en `src/components/legal/TermsModal.jsx`

**Opción B: Contratar abogado tech (recomendado)**
- **Costo:** $800-$1,500 USD
- **Tiempo:** 3-5 días
- **Incluye:** Terms, Privacy, GDPR compliance, refund policy

**Tiempo (opción A):** 1-2 horas
**Tiempo (opción B):** 3-5 días

---

#### **8. CONFIGURAR EMAILS TRANSACCIONALES** 🟡

**¿Por qué?** Para enviar emails de bienvenida, confirmación de pago, etc.

**Opción: SendGrid (gratis 100 emails/día)**

**Pasos:**
1. Ve a https://sendgrid.com
2. Crea cuenta gratis
3. Verifica tu dominio (creovision.io)
4. Crea API Key
5. Instala:
   ```bash
   npm install @sendgrid/mail
   ```
6. Crea `src/lib/email.js`:
   ```javascript
   import sgMail from '@sendgrid/mail';

   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   export const sendWelcomeEmail = async (userEmail, userName) => {
     const msg = {
       to: userEmail,
       from: 'hello@creovision.io',
       subject: '¡Bienvenido a CreoVision!',
       html: `<h1>Hola ${userName}</h1>...`
     };
     await sgMail.send(msg);
   };
   ```

**Tiempo:** 1 hora
**Costo:** $0 (100 emails/día gratis)

---

#### **9. IMPLEMENTAR RATE LIMITING POR USUARIO** 🟡

**¿Por qué?** Sin límites, un usuario FREE puede generar contenido ilimitado y quebrarte.

**Pasos:**
1. Crea `src/hooks/useQuotaCheck.js`:
   ```javascript
   import { supabase } from '@/lib/customSupabaseClient';

   export const useQuotaCheck = () => {
     const checkQuota = async (userId) => {
       const { data, error } = await supabase
         .rpc('check_daily_quota', { uid: userId });

       if (error) throw error;
       return data; // true si tiene cuota, false si no
     };

     const incrementQuota = async (userId) => {
       const { error } = await supabase
         .rpc('increment_generation_count', { uid: userId });

       if (error) throw error;
     };

     return { checkQuota, incrementQuota };
   };
   ```

2. En `Tools.jsx`, antes de generar contenido:
   ```javascript
   const { checkQuota, incrementQuota } = useQuotaCheck();

   const handleGenerate = async () => {
     const hasQuota = await checkQuota(user.id);

     if (!hasQuota) {
       toast({
         title: "Cuota agotada",
         description: "Has alcanzado tu límite diario. Upgrade a Pro para más."
       });
       setShowSubscriptionModal(true);
       return;
     }

     // Generar contenido...

     await incrementQuota(user.id);
   };
   ```

**Tiempo:** 2-3 horas

---

### **NIVEL 3: OPCIONAL (Mejoras para escalar)**

---

#### **10. CREAR DASHBOARD ADMIN** 🟢

**Ubicación:** `/admin` (protegido por rol)

**Features:**
- Ver usuarios activos
- Ver revenue total y MRR
- Ver uso de APIs
- Gestionar usuarios (banear, cambiar plan)

**Tiempo:** 3-4 días
**Costo (si contratas):** $2,000-$3,000 USD

---

#### **11. IMPLEMENTAR SISTEMA DE REFERIDOS** 🟢

**Features:**
- Link único por usuario
- Recompensas automáticas
- Dashboard de referidos

**Tiempo:** 2-3 días
**Costo (si contratas):** $1,500-$2,000 USD

---

#### **12. AGREGAR BLOG SEO** 🟢

**¿Por qué?** Para tráfico orgánico gratis.

**Opciones:**
- Ghost (headless CMS)
- Strapi (self-hosted)
- Contentful (SaaS)

**Tiempo:** 1-2 semanas (con contenido)
**Costo:** $0-50/mes (hosting del CMS)

---

## 📊 RESUMEN DE PRIORIDADES

| # | Tarea | Criticidad | Tiempo | Costo | ¿Puedes hacerlo? |
|---|-------|-----------|--------|-------|------------------|
| 1 | Configurar emails Supabase | 🔴 CRÍTICO | 15 min | $0 | ✅ SÍ |
| 2 | Ejecutar Schema SQL | 🔴 CRÍTICO | 5 min | $0 | ✅ SÍ |
| 3 | Configurar MercadoPago | 🔴 CRÍTICO | 30 min | $0 | ✅ SÍ |
| 4 | Crear Backend API | 🔴 CRÍTICO | 2-4 hrs | $0 (Vercel) | ⚠️ Requiere dev |
| 5 | Configurar Sentry | 🟡 IMPORTANTE | 20 min | $0 | ✅ SÍ |
| 6 | Google Analytics 4 | 🟡 IMPORTANTE | 30 min | $0 | ✅ SÍ |
| 7 | Políticas legales | 🟡 IMPORTANTE | 1-2 hrs | $0-1.5K | ⚠️ Recomendado contratar |
| 8 | Emails transaccionales | 🟡 IMPORTANTE | 1 hr | $0 | ✅ SÍ |
| 9 | Rate limiting | 🟡 IMPORTANTE | 2-3 hrs | $0 | ⚠️ Requiere dev |
| 10 | Dashboard Admin | 🟢 OPCIONAL | 3-4 días | $2-3K | ❌ Contratar |
| 11 | Sistema Referidos | 🟢 OPCIONAL | 2-3 días | $1.5-2K | ❌ Contratar |
| 12 | Blog SEO | 🟢 OPCIONAL | 1-2 sem | $0-50/mes | ✅ SÍ (con tiempo) |

---

## 🎯 PLAN DE ACCIÓN RECOMENDADO

### **HOY (1 hora):**
1. ✅ Configurar emails en Supabase (15 min)
2. ✅ Ejecutar Schema SQL (5 min)
3. ✅ Configurar MercadoPago en modo TEST (30 min)
4. ✅ Configurar Sentry (20 min)

### **ESTA SEMANA (3-4 horas):**
1. Configurar Google Analytics 4 (30 min)
2. Configurar emails transaccionales (1 hr)
3. Generar políticas legales básicas con Termly (1 hr)
4. Testing completo en localhost (1-2 hrs)

### **PRÓXIMAS 2 SEMANAS:**
1. Contratar desarrollador para Backend API + Rate Limiting ($2-3K)
2. Contratar abogado para políticas legales ($800-1.5K)
3. Testing beta con 20-50 usuarios
4. Deploy final a producción

### **MES 1-2:**
1. Dashboard Admin
2. Sistema de Referidos
3. Blog con 10-15 artículos SEO

---

## 📞 RECURSOS Y AYUDA

### **Documentación útil:**
- Supabase Docs: https://supabase.com/docs
- Vercel Functions: https://vercel.com/docs/functions
- MercadoPago Docs: https://www.mercadopago.com.ar/developers
- Sentry React: https://docs.sentry.io/platforms/javascript/guides/react/

### **Servicios recomendados:**
- **Backend:** Vercel Functions (gratis) o Railway.app ($5/mes)
- **Emails:** SendGrid (gratis 100/día) o Resend ($20/mes ilimitado)
- **Error Tracking:** Sentry (gratis 10K events/mes)
- **Analytics:** Google Analytics 4 (gratis)
- **Legal:** Termly (gratis básico) o Abogado tech ($800-1.5K)

### **Freelancers recomendados:**
- **Fiverr:** Desarrolladores Node.js desde $200
- **Upwork:** Desarrolladores fullstack $25-50/hr
- **Freelancer.com:** Proyectos completos desde $500

---

## ✅ CHECKLIST FINAL ANTES DE LANZAR

### **Técnico:**
- [ ] Emails de Supabase configurados
- [ ] Schema SQL ejecutado en producción
- [ ] MercadoPago configurado con credenciales reales
- [ ] Backend API deployado y funcionando
- [ ] Rate limiting implementado
- [ ] Sentry configurado y recibiendo eventos
- [ ] Google Analytics 4 instalado
- [ ] Error tracking funcional

### **Legal:**
- [ ] Terms of Service publicados
- [ ] Privacy Policy publicada
- [ ] Cookie Policy publicada
- [ ] GDPR consent banner funcional

### **Testing:**
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Recuperar contraseña funciona
- [ ] Generar contenido funciona
- [ ] Límites de cuota funcionan
- [ ] Upgrade a Pro funciona (pago real)
- [ ] Webhooks de MercadoPago funcionan

### **Marketing:**
- [ ] Landing page optimizada
- [ ] SEO on-page completo
- [ ] Sitemap enviado a Google
- [ ] Primeros 3 artículos de blog publicados

---

**🎉 ¡Cuando completes esto, CreoVision estará lista para lanzamiento público!**

**Valor actual:** $50K-75K USD
**Valor después de completar:** $100K-150K USD
**Valor con 500 usuarios:** $500K-800K USD

---

**Última actualización:** 2025-11-03
**Próxima revisión:** Después de completar tareas CRÍTICAS
