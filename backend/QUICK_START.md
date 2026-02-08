# 🚀 Inicio Rápido - Sistema Corregido

## ✅ Correcciones Aplicadas

Todos los problemas críticos han sido corregidos:

- ✅ **Namespaces corregidos** - Eliminado `/V1` de todas las rutas
- ✅ **Middleware registrado** - `company.context` ahora funcional
- ✅ **API Client actualizado** - Rutas de autenticación corregidas
- ✅ **Sin errores de lint** - Código limpio y validado

---

## 🎯 Iniciar el Sistema (3 pasos)

### Paso 1: Configurar Base de Datos (Solo primera vez)

```bash
cd backend

# Si no existe .env, crearlo
cp .env.example .env
php artisan key:generate

# Editar .env y configurar MySQL:
# DB_DATABASE=contabilidad
# DB_USERNAME=root
# DB_PASSWORD=tu_password

# Migrar y poblar datos
php artisan migrate:fresh --seed
```

### Paso 2: Iniciar Backend

```bash
cd backend
php artisan serve
```

Salida esperada:
```
INFO  Server running on [http://127.0.0.1:8000]
```

### Paso 3: Iniciar Frontend (en otra terminal)

```bash
cd backend
npm run dev
```

Salida esperada:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🔐 Login

1. Abre: **http://localhost:5173**
2. Credenciales:
   - **Email:** `admin@example.com`
   - **Password:** `password`

---

## ✅ Verificar que Todo Funciona

### Opción 1: Script Automático (Linux/Mac/WSL)

```bash
cd backend
chmod +x verify-fixes.sh
./verify-fixes.sh
```

### Opción 2: Verificación Manual

```bash
cd backend

# 1. Ver rutas registradas
php artisan route:list | grep "api/"

# 2. Limpiar cachés
php artisan config:clear
php artisan cache:clear

# 3. Verificar que el middleware está registrado
grep "company.context" bootstrap/app.php

# 4. Verificar que las rutas no tienen V1
grep -c "Api\\\\V1" routes/api.php  # Debe retornar 0
```

---

## 📋 Estructura de Rutas

### Públicas (Sin autenticación)
```
POST /api/auth/register
POST /api/auth/login
```

### Autenticadas (Con token)
```
POST /api/auth/logout
GET  /api/auth/user
GET  /api/dashboard
GET  /api/companies
POST /api/companies/{id}/select
```

### Con Empresa (Token + X-Company-Id)
```
GET  /api/accounts
GET  /api/accounting-periods
GET  /api/journal-entries
GET  /api/customers
GET  /api/suppliers
GET  /api/invoices
GET  /api/bills
GET  /api/reports/balance-sheet
GET  /api/reports/income-statement
... y más
```

---

## 🧪 Probar con cURL

### 1. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**Respuesta esperada:**
```json
{
  "user": { ... },
  "token": "1|xxxxxxxxxxxxxxxx"
}
```

### 2. Obtener Empresas
```bash
# Reemplaza {TOKEN} con el token del paso anterior
curl -X GET http://localhost:8000/api/companies \
  -H "Authorization: Bearer {TOKEN}"
```

### 3. Obtener Cuentas Contables
```bash
# Reemplaza {TOKEN} y {COMPANY_ID}
curl -X GET http://localhost:8000/api/accounts \
  -H "Authorization: Bearer {TOKEN}" \
  -H "X-Company-Id: {COMPANY_ID}"
```

---

## 📊 Flujo de Trabajo

```
1. Usuario hace login
   ↓
2. Obtiene token de autenticación
   ↓
3. Selecciona una empresa
   ↓
4. Todas las peticiones incluyen:
   - Header: Authorization: Bearer {token}
   - Header: X-Company-Id: {company_id}
   ↓
5. Backend filtra datos por empresa automáticamente
```

---

## 🔧 Solución de Problemas

### Error: "Target class [App\Http\Controllers\Api\V1\...] does not exist"
**Causa:** Caché de rutas desactualizado  
**Solución:**
```bash
php artisan route:clear
php artisan config:clear
```

### Error: "Company ID required"
**Causa:** Falta el header `X-Company-Id`  
**Solución:** Asegúrate de que el frontend envíe el header en cada petición

### Error: "SQLSTATE[HY000] [1049] Unknown database"
**Causa:** Base de datos no existe  
**Solución:**
```bash
# Crear la base de datos manualmente en MySQL
mysql -u root -p
CREATE DATABASE contabilidad;
exit

# Luego migrar
php artisan migrate:fresh --seed
```

### Error 404 en rutas API
**Causa:** Rutas no registradas correctamente  
**Solución:**
```bash
php artisan route:list | grep "api/"
# Si no aparecen rutas, revisar routes/api.php
```

---

## 📚 Documentación Adicional

- `FIXES_APPLIED.md` - Detalles técnicos de las correcciones
- `API_DOCUMENTATION.md` - Referencia completa de endpoints
- `README.md` - Información general del proyecto

---

## 🎉 ¡Listo!

El sistema ahora está completamente funcional. Puedes:

1. ✅ Crear empresas
2. ✅ Cambiar entre empresas
3. ✅ Configurar catálogo de cuentas
4. ✅ Crear pólizas contables
5. ✅ Gestionar clientes/proveedores
6. ✅ Crear facturas de venta/compra
7. ✅ Ver reportes financieros

---

**¿Necesitas ayuda?** Revisa los archivos de documentación o pregunta al equipo de desarrollo.
