# Solución al Error de Preamble de Vite React Plugin

## Problema
Error: `@vitejs/plugin-react can't detect preamble`

## Soluciones Aplicadas

### 1. Imports Explícitos de React
Se agregó `import React` a todos los archivos principales que usan JSX:
- `resources/js/main.tsx`
- `resources/js/App.tsx`
- `resources/js/contexts/AuthContext.tsx`
- `resources/js/contexts/CompanyContext.tsx`

### 2. Referencias de Tipos
Se agregaron referencias de tipos en `resources/js/vite-env.d.ts`:
```typescript
/// <reference types="react" />
/// <reference types="react-dom" />
```

## Pasos para Resolver

### 1. Instalar Dependencias (MUY IMPORTANTE)
```bash
npm install
```

**Nota:** Si las dependencias no están instaladas, Vite no puede funcionar correctamente.

### 2. Limpiar Caché de Vite
```bash
rm -rf node_modules/.vite
```

### 3. Reconstruir
```bash
npm run build
```

### 4. Iniciar en Modo Desarrollo
```bash
# Terminal 1 - Backend
php artisan serve

# Terminal 2 - Frontend
npm run dev
```

## Verificación

Después de ejecutar los pasos anteriores, accede a:
- http://localhost:5173

La aplicación debería cargar sin errores.

## Si el Error Persiste

1. **Verificar versiones de Node.js:**
   ```bash
   node --version  # Debe ser 18+
   npm --version
   ```

2. **Reinstalar dependencias completamente:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verificar que @vitejs/plugin-react esté instalado:**
   ```bash
   npm list @vitejs/plugin-react
   ```
   Debería mostrar: `@vitejs/plugin-react@4.3.1`

4. **Si nada funciona, usar classic runtime:**
   Editar `tsconfig.app.json` y cambiar:
   ```json
   "jsx": "react"
   ```
   en lugar de:
   ```json
   "jsx": "react-jsx"
   ```

## Notas Adicionales

- El archivo `resources/js/lib/supabase.ts` es una capa de compatibilidad temporal
- No es el cliente real de Supabase
- Permite que componentes no migrados funcionen con la API de Laravel
