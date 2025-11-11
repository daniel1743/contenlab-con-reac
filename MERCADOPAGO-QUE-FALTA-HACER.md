# 💳 MercadoPago - ¿Qué Falta Hacer?

**Fecha**: 10 de Noviembre 2025
**Status**: 🟡 Casi completo - Faltan configuraciones en Vercel y testing

---

## 📊 RESUMEN EJECUTIVO

### ✅ **Lo que YA está hecho** (90% completo):
- ✅ Código backend completo
- ✅ Código frontend completo
- ✅ Webhook configurado
- ✅ Variables en `.env` locales

### ❌ **Lo que FALTA hacer** (10% restante):
- ❌ Configurar variables de entorno en Vercel
- ❌ Crear planes/paquetes en Supabase
- ❌ Configurar webhook URL en MercadoPago dashboard
- ❌ Testing completo del flujo de pago

---

## 🎯 PASOS PARA COMPLETAR (Explicación para un niño de 5 años)

Imagina que MercadoPago es como una alcancía mágica. Ya construimos la alcancía, pero nos faltan 3 cositas:

1. **Decirle a Vercel el "código secreto"** para que pueda hablar con MercadoPago
2. **Crear los "precios"** en la base de datos (cuánto cuesta cada plan)
3. **Probar que todo funciona** comprando algo de mentira

---

## 🔧 PASO 1: Configurar Variables en Vercel (5 minutos)

### ¿Qué es esto?
Vercel es donde vive tu página web en internet. Necesita saber los "códigos secretos" de MercadoPago para poder cobrar.

### ¿Cómo lo hago?

**1.1. Entra a Vercel:**
- Ve a https://vercel.com
- Haz clic en tu proyecto "contenlab-con-reac-daniel"
- Haz clic en la pestaña **"Settings"** (configuración)

**1.2. Ve a Environment Variables:**
- En el menú de la izquierda, haz clic en **"Environment Variables"**

**1.3. Agrega estas 4 variables:**

Copia y pega EXACTAMENTE estas 4 líneas, una por una:

| Variable Name | Value (copia esto) |
|---------------|-------------------|
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-3244950379489747-110608-03f3e1ef2ef677869e41cb66088af9aa-659472935` |
| `MERCADOPAGO_PUBLIC_KEY` | `APP_USR-d11b2ca8-1852-43ce-9f34-08dabf533f22` |
| `MERCADOPAGO_CLIENT_ID` | `3244950379489747` |
| `MERCADOPAGO_CLIENT_SECRET` | `RV5cH9U6Wqe2qCW4zYwo2e7q29PuJWZd` |

**IMPORTANTE**: Para cada variable, marca las 3 cajitas:
- ☑️ Production
- ☑️ Preview
- ☑️ Development

**1.4. Haz clic en "Save" después de cada una**

**1.5. Redeploy tu proyecto:**
- Ve a la pestaña **"Deployments"**
- Haz clic en el deployment más reciente (el de arriba)
- Haz clic en el botón con 3 puntitos `...`
- Haz clic en **"Redeploy"**

Espera 2-3 minutos a que termine de desplegar.

---

## 🗄️ PASO 2: Crear Planes en Supabase (10 minutos)

### ¿Qué es esto?
Supabase es tu base de datos (como un archivero). Necesitas crear los "paquetes de créditos" que los usuarios pueden comprar.

### ¿Cómo lo hago?

**2.1. Entra a Supabase:**
- Ve a https://supabase.com/dashboard
- Abre tu proyecto `bouqpierlyeukedpxugk`
- Haz clic en **"SQL Editor"** en el menú izquierdo

**2.2. Copia y pega este código:**

```sql
-- Borrar paquetes anteriores si existen
DELETE FROM public.credit_packages;

-- Crear 3 paquetes de créditos
INSERT INTO public.credit_packages (slug, name, total_credits, price_usd, description, is_active) VALUES
  ('pro', 'Plan Pro', 3000, 15.00, 'Perfecto para creadores frecuentes', true),
  ('premium', 'Plan Premium', 8000, 25.00, 'Máximo poder creativo', true),
  ('starter', 'Paquete Starter', 500, 5.00, 'Prueba nuestras herramientas', true);
```

**2.3. Haz clic en el botón "Run" (abajo a la derecha)**

Deberías ver: `Success. 3 rows inserted`

### ✅ ¡Listo! Ya tienes 3 planes:
- **Starter**: 500 créditos por $5
- **Pro**: 3000 créditos por $15
- **Premium**: 8000 créditos por $25

---

## 🔗 PASO 3: Configurar Webhook en MercadoPago (5 minutos)

### ¿Qué es esto?
Cuando alguien paga, MercadoPago necesita "avisarle" a tu página web. El webhook es como el teléfono para recibir esa llamada.

### ¿Cómo lo hago?

**3.1. Entra a MercadoPago:**
- Ve a https://www.mercadopago.com.ar/developers/panel
- Inicia sesión con tu cuenta

**3.2. Ve a tus aplicaciones:**
- Haz clic en **"Tus aplicaciones"** en el menú superior
- Haz clic en tu aplicación (o crea una si no tienes)

**3.3. Configura el webhook:**
- En el menú lateral, haz clic en **"Webhooks"**
- Haz clic en el botón **"Agregar URL de notificaciones"**

**3.4. Llena el formulario:**

| Campo | Valor |
|-------|-------|
| **URL de notificaciones** | `https://creovision.io/api/webhooks/mercadopago` |
| **Eventos** | Selecciona TODOS: `payment`, `merchant_order`, `subscription` |

**3.5. Haz clic en "Guardar"**

---

## 🧪 PASO 4: Testing Completo (20 minutos)

### ¿Qué es esto?
Antes de abrir los pagos a usuarios reales, necesitas probar que todo funciona con "dinero de juguete".

### ¿Cómo lo hago?

**4.1. Usa las tarjetas de prueba de MercadoPago:**

Ve a tu página: https://creovision.io
Inicia sesión y ve a la sección de pagos.

**Tarjetas de prueba de MercadoPago:**

| Tipo | Número | CVV | Fecha |
|------|--------|-----|-------|
| **VISA** (aprobada) | `4509 9535 6623 3704` | `123` | `11/25` |
| **MASTERCARD** (rechazada) | `5031 7557 3453 0604` | `123` | `11/25` |

**4.2. Flujo de prueba completo:**

1. **Seleccionar plan**:
   - Ve a la página de planes/pricing
   - Haz clic en "Comprar Plan Pro" ($15)

2. **Iniciar pago**:
   - Deberías ver un botón "Pagar con MercadoPago"
   - Haz clic y te redirigirá a MercadoPago

3. **Completar pago**:
   - Usa la tarjeta de prueba VISA (4509 9535 6623 3704)
   - Completa el formulario
   - Haz clic en "Pagar"

4. **Verificar redirect**:
   - Deberías volver a: `https://creovision.io/payment/success`

5. **Verificar créditos**:
   - Ve a tu perfil o dashboard
   - Deberías ver +3000 créditos agregados

**4.3. Revisar logs en Vercel:**

- Ve a Vercel Dashboard → tu proyecto
- Haz clic en **"Functions"** en el menú
- Busca `/api/webhooks/mercadopago`
- Haz clic en la función más reciente
- Deberías ver logs como:
  ```
  ✅ Webhook válido
  💰 Payment approved: [payment_id]
  🎉 3000 créditos agregados al usuario
  ```

---

## 🐛 ERRORES COMUNES Y SOLUCIONES

### **Error 1: "MercadoPago no configurado"**
**Causa**: No agregaste las variables en Vercel
**Solución**: Vuelve al **PASO 1** y asegúrate de que todas las 4 variables estén en Vercel

---

### **Error 2: "No se pudo determinar el monto a cobrar"**
**Causa**: No creaste los planes en Supabase
**Solución**: Vuelve al **PASO 2** y ejecuta el SQL para crear los paquetes

---

### **Error 3: "Webhook signature invalid"**
**Causa**: El webhook secret no está configurado correctamente
**Solución**:
1. Ve a MercadoPago Dashboard
2. Copia el "Webhook Secret" (una cadena larga)
3. Agrégalo como variable en Vercel:
   - Variable Name: `MERCADOPAGO_WEBHOOK_SECRET`
   - Value: [el secret que copiaste]

---

### **Error 4: "No recibes notificación del webhook"**
**Causa**: La URL del webhook no está bien configurada en MercadoPago
**Solución**: Vuelve al **PASO 3** y verifica que la URL sea exactamente:
```
https://creovision.io/api/webhooks/mercadopago
```
(¡Sin espacios ni caracteres raros!)

---

### **Error 5: "Los créditos no se agregan después del pago"**
**Causa**: Probablemente el webhook no se está ejecutando
**Solución**:
1. Ve a Vercel → Functions → `/api/webhooks/mercadopago`
2. Revisa los logs recientes
3. Busca errores como:
   - `❌ Error adding credits`
   - `❌ RPC function failed`
4. Si ves ese error, ve a Supabase y verifica que la función `add_credits` existe:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'add_credits';
   ```
5. Si no existe, ejecuta:
   ```sql
   CREATE OR REPLACE FUNCTION add_credits(p_user_id uuid, p_amount integer, p_description text)
   RETURNS void AS $$
   BEGIN
     -- Actualizar total de créditos
     UPDATE public.user_credits
     SET
       total_credits = total_credits + p_amount,
       updated_at = NOW()
     WHERE user_id = p_user_id;

     -- Si el usuario no existe, crearlo
     IF NOT FOUND THEN
       INSERT INTO public.user_credits (user_id, total_credits, monthly_credits, purchased_credits, bonus_credits, free_credits)
       VALUES (p_user_id, p_amount, 0, p_amount, 0, 0);
     END IF;

     -- Registrar transacción
     INSERT INTO public.credit_transactions (user_id, amount, type, description)
     VALUES (p_user_id, p_amount, 'purchase', p_description);
   END;
   $$ LANGUAGE plpgsql;
   ```

---

## 📋 CHECKLIST FINAL

Antes de abrir los pagos a usuarios reales, verifica:

### **Backend:**
- [ ] Variables de MercadoPago en Vercel (PASO 1)
- [ ] Planes creados en Supabase (PASO 2)
- [ ] Webhook URL configurado en MercadoPago (PASO 3)
- [ ] Función `add_credits` existe en Supabase
- [ ] Testing con tarjeta de prueba exitoso (PASO 4)

### **Frontend:**
- [ ] Botón "Pagar con MercadoPago" aparece
- [ ] Redirect a MercadoPago funciona
- [ ] Redirect de vuelta después del pago funciona
- [ ] Créditos se agregan correctamente al usuario
- [ ] Página `/payment/success` muestra mensaje correcto
- [ ] Página `/payment/failure` muestra mensaje de error

### **Testing de Edge Cases:**
- [ ] Probar con tarjeta rechazada (MASTERCARD de prueba)
- [ ] Probar pago pendiente (tarjeta AMEX de prueba: `3711 8030 3257 522`)
- [ ] Verificar que el webhook maneja pagos duplicados
- [ ] Verificar que no se agregan créditos si el pago falla

---

## 🚀 DESPUÉS DE COMPLETAR TODO

Una vez que hayas completado los 4 pasos y el checklist final:

1. **Cambia a Producción**:
   - En MercadoPago Dashboard, cambia de modo "Sandbox" a "Producción"
   - Obtén las credenciales de producción (diferentes a las de prueba)
   - Actualiza las 4 variables en Vercel con las nuevas credenciales

2. **Monitoreo**:
   - Revisa los logs de Vercel diariamente por 1 semana
   - Verifica que los webhooks se están recibiendo correctamente
   - Monitorea que los créditos se estén agregando bien

3. **Seguridad**:
   - Nunca compartas las credenciales de MercadoPago
   - Nunca subas el `.env` a GitHub (ya está en .gitignore, ¡no lo quites!)
   - Verifica que el webhook signature esté validándose correctamente

---

## 📞 ¿NECESITAS AYUDA?

Si algo no funciona:

1. **Revisa los logs en Vercel**:
   - Ve a Functions → `/api/webhooks/mercadopago`
   - Ve a Functions → `/api/mercadopago/create-preference`

2. **Revisa los logs en MercadoPago**:
   - Ve a https://www.mercadopago.com.ar/developers/panel
   - Haz clic en "Webhooks" → "Historial de notificaciones"

3. **Revisa Supabase**:
   - Ve a SQL Editor
   - Ejecuta: `SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;`
   - Verifica si los pagos se están registrando

---

## 📊 TIEMPO ESTIMADO TOTAL

| Paso | Tiempo |
|------|--------|
| Paso 1: Variables en Vercel | 5 min |
| Paso 2: Planes en Supabase | 10 min |
| Paso 3: Webhook en MercadoPago | 5 min |
| Paso 4: Testing completo | 20 min |
| **TOTAL** | **40 minutos** |

---

**Generado por**: Claude Code
**Última actualización**: 2025-11-10
**Autor**: Daniel

---

## 🎉 ¡RECUERDA!

Una vez que termines estos 4 pasos, **MercadoPago estará 100% funcional** y los usuarios podrán:

1. Seleccionar un plan
2. Pagar con tarjeta
3. Recibir sus créditos automáticamente
4. Empezar a usar CreoVision inmediatamente

¡Ánimo! Solo te faltan 40 minutos para tener pagos funcionando 🚀
