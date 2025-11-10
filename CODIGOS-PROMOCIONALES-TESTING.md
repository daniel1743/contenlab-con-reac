# 🎟️ CÓDIGOS PROMOCIONALES - TESTING PRODUCCIÓN
## CreoVision - Sistema de Códigos de Prueba

---

## 📋 CÓDIGOS ACTIVOS (8 códigos)

### Códigos de Testing (3000 créditos cada uno)

| # | Código | Créditos | Tipo | Estado | Expira | Usos Max | Usos Actuales |
|---|--------|----------|------|--------|--------|----------|---------------|
| 1 | `CREO-TEST-001` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |
| 2 | `CREO-TEST-002` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |
| 3 | `CREO-TEST-003` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |
| 4 | `CREO-TEST-004` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |
| 5 | `CREO-TEST-005` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |
| 6 | `CREO-TEST-006` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |
| 7 | `CREO-TEST-007` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |
| 8 | `CREO-TEST-008` | 3000 | testing | 🟢 Activo | Never | 1 | 0 |

---

## 🎯 USO RECOMENDADO

### Por Código:

1. **CREO-TEST-001** → Growth Dashboard completo (380 créditos × 7 análisis = 2,660)
2. **CREO-TEST-002** → Playbooks unlock testing (150 créditos × 20 playbooks = 3,000)
3. **CREO-TEST-003** → Asesor Premium testing (25 créditos × 120 sesiones = 3,000)
4. **CREO-TEST-004** → Mix: viral scripts + threads + análisis
5. **CREO-TEST-005** → Testing de límites y edge cases
6. **CREO-TEST-006** → Performance testing (múltiples features simultáneas)
7. **CREO-TEST-007** → User flow testing completo
8. **CREO-TEST-008** → Backup / Contingencia

---

## 💡 CARACTERÍSTICAS

- ✅ **3000 créditos** por código (suficiente para testing exhaustivo)
- ✅ **Uso único** (1 vez por código)
- ✅ **Sin expiración** (permanentes para testing)
- ✅ **Solo para Owner/Admin** (validación por email)
- ✅ **Trackeable** (registro completo en `promo_code_usage`)
- ✅ **Revocable** (se puede desactivar si se compromete)

---

## 🔒 SEGURIDAD

### Validaciones implementadas:
1. Código debe existir en tabla `promo_codes`
2. Código debe estar activo (`is_active = true`)
3. No debe estar expirado
4. No debe haber alcanzado el límite de usos
5. Usuario no debe haber usado ese código antes
6. (Opcional) Validación de email owner para testing

### Logs de auditoría:
- Cada uso se registra en `promo_code_usage` con:
  - `user_id`, `code`, `credits_granted`, `timestamp`
  - IP address (opcional)
  - User agent (opcional)

---

## 📊 TESTING COVERAGE

Con 8 códigos × 3000 créditos = **24,000 créditos totales**

### Features que puedes testear:

| Feature | Costo | Tests Posibles | Código Sugerido |
|---------|-------|----------------|-----------------|
| Growth Dashboard | 380 | 63 análisis | CREO-TEST-001 |
| Playbook Unlock | 150 | 160 playbooks | CREO-TEST-002 |
| Asesor Premium | 25 | 960 sesiones | CREO-TEST-003 |
| Viral Script | 15 | 1,600 scripts | CREO-TEST-004 |
| Video Analysis | 15 | 1,600 análisis | CREO-TEST-004 |
| Thread Generator | 8 | 3,000 threads | CREO-TEST-005 |
| Copy Ads | 6 | 4,000 copies | CREO-TEST-005 |
| SEO Analysis | 5 | 4,800 análisis | CREO-TEST-006 |
| Trend Research | 4 | 6,000 búsquedas | CREO-TEST-006 |
| Image Analysis | 12 | 2,000 análisis | CREO-TEST-007 |
| Thumbnail Gen | 10 | 2,400 thumbnails | CREO-TEST-007 |
| Hashtag Gen | 2 | 12,000 sets | CREO-TEST-008 |

---

## 🚨 IMPORTANTE

### ⚠️ NUNCA compartir estos códigos:
- No publicar en redes sociales
- No compartir en Discord/Slack públicos
- No incluir en código fuente público (usar .env)
- No enviar por email sin cifrar

### 🔄 Si un código se compromete:
1. Ir a Supabase → `promo_codes` table
2. Encontrar el código comprometido
3. Set `is_active = false`
4. Crear nuevo código con otro nombre

### 📝 Cómo crear códigos adicionales:
```sql
INSERT INTO promo_codes (code, credit_amount, max_uses, expires_at, is_active, description)
VALUES
  ('CREO-TEST-009', 3000, 1, NULL, true, 'Testing code 9'),
  ('CREO-TEST-010', 3000, 1, NULL, true, 'Testing code 10');
```

---

## 📈 TRACKING DE TESTING

### Checklist de Features a Probar:

**Growth Dashboard (CREO-TEST-001):**
- [ ] Generar análisis con Channel ID
- [ ] Generar análisis con Keywords
- [ ] Verificar todas las 7 tabs
- [ ] Desbloquear playbook
- [ ] Exportar análisis a JSON
- [ ] Verificar historial
- [ ] Probar asistente exclusivo (6 mensajes)

**Sistema de Créditos (CREO-TEST-002):**
- [ ] Canjear código promocional
- [ ] Verificar balance actualizado
- [ ] Consumir créditos en diferentes features
- [ ] Verificar orden de consumo (monthly → purchased → bonus)
- [ ] Verificar que no se pueda usar el mismo código 2 veces

**Features Premium (CREO-TEST-003):**
- [ ] Asesor Premium (25 créditos)
- [ ] Generador de Guiones Virales (15 créditos)
- [ ] Análisis de Video Competitor (15 créditos)
- [ ] Análisis de Imagen IA (12 créditos)
- [ ] Generador de Miniatura (10 créditos)

**Features Standard (CREO-TEST-004):**
- [ ] Thread Generator (8 créditos)
- [ ] Copy Publicitario (6 créditos)
- [ ] Análisis SEO (5 créditos)
- [ ] Trend Research (4 créditos)
- [ ] Hashtag Generator (2 créditos)

**Edge Cases (CREO-TEST-005):**
- [ ] Intentar canjear código ya usado
- [ ] Intentar canjear código inválido
- [ ] Intentar usar feature sin suficientes créditos
- [ ] Verificar mensaje de error claro
- [ ] Verificar que no se consuman créditos en error

**Performance (CREO-TEST-006):**
- [ ] Generar múltiples features simultáneamente
- [ ] Verificar velocidad de respuesta
- [ ] Verificar caché de APIs (24h)
- [ ] Verificar que no haya race conditions en consumo de créditos

**User Flow Completo (CREO-TEST-007):**
- [ ] Onboarding → Canjear código → Usar features → Ver historial
- [ ] Verificar notificaciones de créditos bajos
- [ ] Verificar límites de tasa (rate limiting)
- [ ] Verificar logs de auditoría

**Backup Testing (CREO-TEST-008):**
- [ ] Reservado para issues no anticipados
- [ ] Testing de hotfixes
- [ ] Validación de parches de seguridad

---

## 🎓 NOTAS DE DESARROLLO

### Campos en tabla `promo_codes`:
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  credit_amount INTEGER NOT NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Campos en tabla `promo_code_usage`:
```sql
CREATE TABLE promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES promo_codes(id),
  user_id UUID REFERENCES auth.users(id),
  credits_granted INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

**Elaborado:** 10 de Noviembre 2025
**Autor:** Daniel + Claude Code
**Versión:** 1.0
**Status:** 🟢 Activo para Testing en Producción
