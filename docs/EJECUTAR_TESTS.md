# 🧪 GUÍA - EJECUTAR TESTS DEL COACH CREO

## 📋 **CONFIGURACIÓN INICIAL**

### **Paso 1: Instalar dependencias de testing**

```bash
cd "C:\Users\Lenovo\Desktop\proyectos desplegados importante\CONTENTLAB"

npm install --save-dev jest @jest/globals @testing-library/react @testing-library/jest-dom
```

### **Paso 2: Configurar Jest**

Crea o actualiza el archivo `jest.config.js`:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.test.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/services/CreoChatService.js',
    'src/services/creoAnalytics.js',
    'src/utils/creoPromptBuilder.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### **Paso 3: Actualizar package.json**

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:creo": "jest tests/creo-chat.test.js",
    "test:verbose": "jest --verbose"
  }
}
```

---

## 🚀 **EJECUTAR TESTS**

### **Ejecutar todos los tests:**

```bash
npm test
```

### **Ejecutar solo tests de Creo:**

```bash
npm run test:creo
```

### **Ejecutar en modo watch (se re-ejecutan al guardar cambios):**

```bash
npm run test:watch
```

### **Ejecutar con reporte de cobertura:**

```bash
npm run test:coverage
```

---

## 📊 **INTERPRETAR RESULTADOS**

### **✅ Test Exitoso:**

```
PASS  tests/creo-chat.test.js
  🧠 CreoChatService - Orquestador Principal
    ✓ debe inicializar sesión correctamente (245ms)
    ✓ debe obtener estadísticas de sesión (123ms)
    ✓ debe enviar mensaje y actualizar contador (456ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Time:        8.234s
```

### **❌ Test Fallido:**

```
FAIL  tests/creo-chat.test.js
  🧠 CreoChatService - Orquestador Principal
    ✕ debe inicializar sesión correctamente (245ms)

  ● debe inicializar sesión correctamente

    expect(received).toBe(expected)

    Expected: "active"
    Received: "inactive"

Test Suites: 1 failed, 1 total
Tests:       1 failed, 11 passed, 12 total
```

---

## 🔧 **TROUBLESHOOTING**

### **Error: "Cannot find module '@/services/CreoChatService'"**

**Solución:**
```bash
# Verificar que el alias @ esté configurado
# En jest.config.js debe estar:
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

### **Error: "Supabase client not configured"**

**Solución:**
Asegúrate de que `.env` tenga:
```bash
VITE_SUPABASE_URL=https://bouqpierlyeukedpxugk.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_DEEPSEEK_API_KEY=tu-deepseek-key
```

### **Error: "Timeout exceeded"**

**Solución:**
Los tests de integración pueden tardar. Aumenta el timeout:

```javascript
// En el test específico
test('test largo', async () => {
  // ...
}, 60000); // 60 segundos
```

---

## 📈 **REPORTE DE COBERTURA**

Después de ejecutar `npm run test:coverage`, verás:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.23 |    78.45 |   82.67 |   85.23 |
 CreoChatService.js |   92.15 |    85.34 |   90.12 |   92.15 |
 creoAnalytics.js   |   78.56 |    71.23 |   75.45 |   78.56 |
 creoPromptBuilder  |   85.12 |    78.92 |   82.34 |   85.12 |
--------------------|---------|----------|---------|---------|
```

**Objetivo:** Mantener cobertura > 70% en todos los archivos.

---

## 🎯 **TESTS CRÍTICOS**

Estos tests **DEBEN pasar** antes de desplegar a producción:

1. ✅ `debe inicializar sesión correctamente`
2. ✅ `debe bloquear después de 8 mensajes gratuitos`
3. ✅ `debe guardar mensajes en creo_message_log`
4. ✅ `Flujo completo: Init → 8 mensajes → Límite → Cierre`

---

## 📞 **SOPORTE**

📧 impulsa@creovision.io
🌐 https://creovision.io

---

**Última actualización:** 2025-01-08
