# ✅ SOLUCIÓN: Error de Redirección en Vercel

**Error:** 
```
Error: Redirect at index 1 has segment ":1" in `destination` property but not in `source` or `has` property.
```

---

## 🔍 CAUSA DEL ERROR

En Vercel, cuando usas grupos de captura en el `source` con `(.*)`, debes referenciarlos en el `destination` con `$1` (no `:1`).

**❌ Incorrecto:**
```json
{
  "source": "/(.*)",
  "destination": "https://creovision.io/:1"  // ❌ :1 no es válido
}
```

**✅ Correcto:**
```json
{
  "source": "/(.*)",
  "destination": "https://creovision.io/$1"  // ✅ $1 es la sintaxis correcta
}
```

---

## ✅ SOLUCIÓN APLICADA

**Archivo:** `vercel.json`

**Cambio realizado:**
```json
{
  "source": "/(.*)",
  "has": [
    {
      "type": "host",
      "value": "creovision.io"
    }
  ],
  "destination": "https://creovision.io/$1",  // ✅ Cambiado de :1 a $1
  "permanent": true
}
```

---

## 📝 SINTAXIS DE VERCEL PARA REDIRECCIONES

### **Grupos de Captura:**

| Patrón en `source` | Referencia en `destination` | Ejemplo |
|-------------------|----------------------------|---------|
| `(.*)` | `$1` | `"destination": "/nuevo/$1"` |
| `/(.*)` | `$1` | `"destination": "/nuevo/$1"` |
| `/:path*` | `:path*` | `"destination": "/nuevo/:path*"` |

### **Ejemplos:**

```json
// Ejemplo 1: Capturar path completo
{
  "source": "/(.*)",
  "destination": "https://nuevo-dominio.com/$1"
}

// Ejemplo 2: Usar wildcard
{
  "source": "/:path*",
  "destination": "https://nuevo-dominio.com/:path*"
}

// Ejemplo 3: Capturar segmento específico
{
  "source": "/blog/:slug",
  "destination": "/articulos/$1"
}
```

---

## 🧪 VERIFICAR

Después de corregir, puedes verificar con:

```bash
# Verificar sintaxis
vercel --version

# Probar deploy
vercel --prod
```

---

## ✅ RESULTADO

El error debería estar resuelto. La redirección HTTP → HTTPS funcionará correctamente:

- `http://creovision.io/` → `https://creovision.io/`
- `http://creovision.io/dashboard` → `https://creovision.io/dashboard`
- `http://creovision.io/cualquier/path` → `https://creovision.io/cualquier/path`

---

**¿El error se resolvió?** 🚀

