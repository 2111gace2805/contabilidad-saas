# Sistema RBAC - Sistema de 3 Niveles Implementado

## Resumen

Se ha implementado un sistema completo de Control de Acceso Basado en Roles (RBAC) con 3 niveles jerárquicos:

### 1. **SUPER ADMIN**
- Puede crear y eliminar empresas
- Puede crear y gestionar todos los usuarios del sistema
- Puede asignar usuarios a empresas con roles específicos
- **NO tiene acceso** a los módulos operativos de las empresas
- Tiene su propia interfaz de gestión (`SuperAdminDashboard`)

### 2. **ADMIN** (Administrador de Empresa)
- Puede configurar su propia empresa
- Tiene acceso completo a todos los módulos operativos
- Puede ver y gestionar configuraciones (Settings, Períodos, Tipos de Cuenta, etc.)
- **NO puede ver otras empresas**
- **NO puede crear nuevas empresas** en el sistema

### 3. **USUARIO** (Viewer/Contador)
- Acceso a módulos operativos (Ventas, Compras, Pólizas, etc.)
- **NO tiene acceso** a configuraciones del sistema
- **NO puede ver Settings**
- Puede consultar reportes y trabajar en operaciones del día a día

---

## Cambios Implementados

### Backend

#### 1. **Migración de Base de Datos**
- **Archivo**: `backend/database/migrations/0001_01_01_000000_create_users_table.php`
- **Cambio**: Agregado campo `is_super_admin` (boolean, default: false) directamente en la migración inicial

#### 2. **Modelo User**
- **Archivo**: `backend/app/Models/User.php`
- **Cambios**:
  - Agregado `is_super_admin` a `$fillable`
  - Agregado `is_super_admin` a `$casts` (como boolean)
  - Métodos helper agregados:
    - `isSuperAdmin()`: Verifica si es super admin
    - `isAdminOfCompany($companyId)`: Verifica si es admin de una empresa específica
    - `hasAccessToCompany($companyId)`: Verifica acceso a una empresa

#### 3. **Middleware**
- **Archivo**: `backend/app/Http/Middleware/SuperAdminMiddleware.php` (NUEVO)
- **Propósito**: Proteger rutas exclusivas de super admin
- **Registro**: Agregado en `bootstrap/app.php` con alias `super.admin`

#### 4. **Controlador Super Admin**
- **Archivo**: `backend/app/Http/Controllers/Api/SuperAdminController.php` (NUEVO)
- **Endpoints**:
  - `GET /super-admin/companies` - Listar todas las empresas
  - `POST /super-admin/companies` - Crear empresa
  - `DELETE /super-admin/companies/{id}` - Eliminar empresa
  - `GET /super-admin/users` - Listar todos los usuarios
  - `POST /super-admin/users` - Crear usuario
  - `POST /super-admin/users/assign` - Asignar usuario a empresa
  - `PUT /super-admin/users/role` - Actualizar rol de usuario
  - `DELETE /super-admin/users/remove` - Remover usuario de empresa

#### 5. **Rutas API**
- **Archivo**: `backend/routes/api.php`
- **Cambio**: Agregado grupo de rutas protegidas con middleware `super.admin`:
  ```php
  Route::middleware(['auth:sanctum', 'super.admin'])->prefix('super-admin')->group(...)
  ```

#### 6. **Seeders**
- **Archivo**: `backend/database/seeders/DatabaseSeeder.php`
- **Cambio**: Creados 3 usuarios por defecto:
  - `superadmin@example.com` (Super Admin, contraseña: `password`)
  - `admin@example.com` (Admin de "Empresa Demo", contraseña: `password`)
  - `user@example.com` (Usuario/Viewer de "Empresa Demo", contraseña: `password`)

#### 7. **Modelo Company**
- **Archivo**: `backend/app/Http/Controllers/Api/CompanyController.php`
- **Cambio**: El método `index()` ahora incluye explícitamente `withPivot('role')` para devolver roles

---

### Frontend

#### 8. **Tipos TypeScript**
- **Archivo**: `backend/resources/js/types/index.ts`
- **Cambios**:
  - Agregado `is_super_admin: boolean` a interface `User`
  - Agregado `active: boolean` a interface `User`
  - Agregado `pivot` opcional a interface `Company` con tipo `{ role: 'admin' | 'accountant' | 'viewer' }`

#### 9. **Contexto de Autenticación**
- **Archivo**: `backend/resources/js/contexts/AuthContext.tsx`
- **Cambio**: Ya funcionaba correctamente, retorna usuario con campo `is_super_admin`

#### 10. **Super Admin Dashboard**
- **Archivo**: `backend/resources/js/components/modules/SuperAdminDashboard.tsx` (NUEVO)
- **Características**:
  - Vista de todas las empresas con estadísticas
  - Gestión de usuarios del sistema
  - Creación de empresas con asignación de admin
  - Creación de usuarios (incluido super admins)
  - Asignación de usuarios a empresas con roles
  - Eliminación de empresas (con validación de transacciones)

#### 11. **Sidebar Dinámico**
- **Archivo**: `backend/resources/js/components/layout/Sidebar.tsx`
- **Cambios**:
  - Menú dinámico basado en `user.is_super_admin` y `selectedCompany.pivot.role`
  - **Super Admin**: Solo muestra "Gestión del Sistema"
  - **Admin**: Muestra todos los módulos + Administración + Settings
  - **Viewer/Contador**: Muestra módulos operativos, pero SIN Administración ni Settings

#### 12. **App Principal**
- **Archivo**: `backend/resources/js/App.tsx`
- **Cambios**:
  - Importado `SuperAdminDashboard`
  - Agregada ruta `super-admin` en `renderModule()`

---

## Credenciales de Acceso

Después de ejecutar `php artisan migrate:fresh --seed`:

### Super Administrador
- **Email**: `superadmin@example.com`
- **Contraseña**: `password`
- **Acceso**: Panel de gestión del sistema completo

### Administrador de Empresa
- **Email**: `admin@example.com`
- **Contraseña**: `password`
- **Empresa**: "Empresa Demo"
- **Acceso**: Módulos operativos + configuración de su empresa

### Usuario / Visor
- **Email**: `user@example.com`
- **Contraseña**: `password`
- **Empresa**: "Empresa Demo"
- **Acceso**: Solo módulos operativos

---

## Flujo de Trabajo

### 1. Super Admin crea una empresa:
1. Login como `superadmin@example.com`
2. Ir a "Gestión del Sistema"
3. Crear nueva empresa (puede asignar admin inmediatamente)

### 2. Super Admin crea usuarios:
1. En "Gestión del Sistema" → Tab "Usuarios"
2. Crear nuevo usuario (especificar si es super admin o no)
3. Asignar usuario a empresa con rol (admin/accountant/viewer)

### 3. Admin configura su empresa:
1. Login como admin de la empresa
2. Seleccionar su empresa
3. Acceder a Settings → Configurar períodos, catálogo, etc.

### 4. Usuario trabaja:
1. Login como usuario
2. Seleccionar empresa
3. Usar módulos operativos (Ventas, Compras, Pólizas, etc.)
4. **NO puede acceder** a Settings

---

## Seguridad

- **Backend**: Middleware `SuperAdminMiddleware` protege rutas `/super-admin/*`
- **Frontend**: Sidebar y rutas se ocultan/deshabilitan según rol
- **Base de Datos**: Los seeders crean usuarios con roles bien definidos
- **Validaciones**: No se pueden eliminar empresas con transacciones

---

## Próximos Pasos Recomendados

1. **Testing**: Probar cada flujo con los 3 usuarios diferentes
2. **Validaciones adicionales**: Agregar más validaciones en frontend para roles
3. **Logs de auditoría**: Registrar acciones de super admin
4. **Gestión de permisos más granular**: Si se requiere permisos por módulo
5. **Recuperación de contraseñas**: Implementar reset password
6. **Perfil de usuario**: Permitir cambio de contraseña por usuario

---

## Comandos Útiles

```bash
# Resetear base de datos y crear usuarios de prueba
docker-compose exec backend php artisan migrate:fresh --seed

# Ver logs del backend
docker-compose logs -f backend

# Acceder a MySQL
docker-compose exec mysql mysql -u sail -psail contabilidad_saas
```

---

**Fecha de implementación**: 2026-02-05
**Versión**: 1.0 RBAC
**Estado**: ✅ COMPLETO
