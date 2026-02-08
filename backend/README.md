# Sistema Contable Multi-Empresa - Laravel + React

Sistema contable completo con backend Laravel 11 y frontend React + TypeScript.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
composer install
npm install
```

### 2. Configurar Base de Datos

```bash
cp .env.example .env
php artisan key:generate
```

Edita `.env` y configura MySQL:
```env
DB_DATABASE=tu_base_de_datos
DB_USERNAME=tu_usuario  
DB_PASSWORD=tu_password
```

### 3. Migrar y Poblar Datos

```bash
php artisan migrate:fresh --seed
```

### 4. Iniciar Servidores

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

### 5. Acceder

- URL: http://localhost:5173
- Email: admin@example.com
- Password: password

## 📋 Si Hay Errores

Ver guía completa: [CONFIGURACION_COMPLETA.md](CONFIGURACION_COMPLETA.md)

## 🏗️ Stack Tecnológico

- **Backend:** Laravel 11, MySQL, Sanctum
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Características:** Multi-empresa, contabilidad completa, períodos fiscales

## 📚 Documentación

- [Configuración Completa](CONFIGURACION_COMPLETA.md) - Guía paso a paso
- [API Documentation](API_DOCUMENTATION.md) - Referencia de endpoints
- [Migration Summary](MIGRATION_SUMMARY.md) - Migración de Supabase

## 🧪 Testing

```bash
php artisan test
```

## 📦 Módulos Incluidos

- Dashboard con estadísticas
- Gestión de empresas multi-compañía
- Catálogo de cuentas jerárquico
- Pólizas contables (diario, ingresos, egresos)
- Períodos fiscales
- Clientes y CxC
- Proveedores y CxP
- Inventario
- Activos fijos
- Bancos y tesorería
- Reportes financieros

## 🔧 Comandos Útiles

```bash
# Reiniciar base de datos
php artisan migrate:fresh --seed

# Limpiar cachés
php artisan config:clear
php artisan cache:clear

# Ver logs
tail -f storage/logs/laravel.log
```

## ⚡ Solución de Problemas

### Error de preamble de Vite
```bash
rm -rf node_modules/.vite
npm run dev
```

### CORS errors
Verifica en `.env`:
```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

### Pantalla blanca
1. Abre consola del navegador (F12)
2. Verifica que ambos servidores estén corriendo
3. Revisa `CONFIGURACION_COMPLETA.md` para diagnóstico completo

## 📄 Licencia

MIT
