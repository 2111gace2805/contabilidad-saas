# 🔧 Solución: Error de Login "405 Method Not Allowed"

## ❌ Error Reportado
```
The POST method is not supported for route api/login. 
Supported methods: GET, HEAD.
```

## 🎯 Causa del Problema
El navegador tiene en **caché** el JavaScript compilado antiguo que usa `/api/login` en lugar de `/api/auth/login`.

## ✅ Solución (2 opciones)

---

### **Opción 1: Solución Rápida (Recomendada)** ⚡

He agregado rutas de compatibilidad en el backend. Solo necesitas:

#### Paso 1: Limpiar cachés
```bash
cd backend

# Limpiar cachés de Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Limpiar caché de Vite
rm -rf node_modules/.vite
rm -rf public/build
```

#### Paso 2: Reiniciar servidores

**Terminal 1 - Backend:**
```bash
# Si está corriendo, detenerlo con Ctrl+C
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
# Si está corriendo, detenerlo con Ctrl+C
npm run dev
```

#### Paso 3: Recargar navegador
- **Chrome/Edge:** Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
- **Firefox:** Presiona `Ctrl + F5`
- O abre el navegador en **modo incógnito**

---

### **Opción 2: Script Automático** 🤖

```bash
cd backend
chmod +x fix-cache.sh
./fix-cache.sh

# Luego reinicia los servidores manualmente
```

---

## 🧪 Verificar que Funciona

### 1. Verificar rutas en el backend
```bash
php artisan route:list | grep login
```

**Salida esperada:**
```
POST    api/auth/login    ✅
POST    api/login         ✅ (compatibilidad)
```

### 2. Probar con cURL
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**Respuesta esperada:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

### 3. Probar en el navegador
1. Ir a http://localhost:5173
2. Abrir **DevTools** (F12)
3. Ir a la pestaña **Network**
4. Intentar login con:
   - Email: `admin@example.com`
   - Password: `password`
5. Verificar que la petición a `/api/login` retorna **200 OK** (no 405)

---

## 📋 Rutas de Autenticación Disponibles

Ahora tienes **ambas rutas** funcionando:

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/login` | POST | Ruta legacy (compatibilidad) |
| `/api/auth/login` | POST | Ruta nueva (recomendada) |
| `/api/register` | POST | Ruta legacy (compatibilidad) |
| `/api/auth/register` | POST | Ruta nueva (recomendada) |
| `/api/logout` | POST | Ruta legacy (compatibilidad) |
| `/api/auth/logout` | POST | Ruta nueva (recomendada) |
| `/api/user` | GET | Obtener usuario autenticado |
| `/api/auth/user` | GET | Obtener usuario autenticado |

---

## 🔍 Debugging Adicional

### Si todavía no funciona:

#### 1. Verificar que el backend está corriendo
```bash
curl http://localhost:8000/api/login
# Debe retornar algo (no "Connection refused")
```

#### 2. Verificar logs del backend
```bash
tail -f storage/logs/laravel.log
```

#### 3. Verificar que las rutas están registradas
```bash
php artisan route:list --json | jq '.[] | select(.uri | contains("login"))'
```

#### 4. Limpiar TODO (última opción)
```bash
# Detener servidores
# Terminal 1: Ctrl+C
# Terminal 2: Ctrl+C

# Limpiar TODA la caché
rm -rf vendor/
rm -rf node_modules/
rm -rf bootstrap/cache/*.php
rm -rf storage/framework/cache/*
rm -rf storage/framework/views/*
rm -rf public/build/
rm -rf public/hot

# Reinstalar dependencias
composer install
npm install

# Limpiar Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Reiniciar
php artisan serve &
npm run dev
```

---

## 🎯 Cambios Aplicados en el Backend

Archivo modificado: `routes/api.php`

```php
// ✅ Rutas nuevas (recomendadas)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    // ...
});

// ✅ Rutas de compatibilidad (para código legacy)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
// ...
```

Esto permite que **ambas rutas funcionen**:
- `/api/login` ✅
- `/api/auth/login` ✅

---

## ✅ Resumen

1. ✅ Backend ahora acepta ambas rutas
2. ✅ Limpiar cachés de Laravel y Vite
3. ✅ Reiniciar servidores
4. ✅ Recargar navegador con hard reload
5. ✅ Login debe funcionar

---

**Si después de seguir estos pasos todavía tienes problemas, comparte:**
1. El output de `php artisan route:list | grep login`
2. El contenido completo del error en la consola del navegador
3. Los logs de `storage/logs/laravel.log`
