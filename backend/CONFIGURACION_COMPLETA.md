# Guía de Configuración Laravel + React - PASO A PASO

## ⚠️ IMPORTANTE: Sigue estos pasos EN ORDEN

### Paso 1: Verificar Requisitos

```bash
# Verificar versiones
node --version   # Debe ser 18 o superior
npm --version
php --version    # Debe ser 8.2 o superior
composer --version
```

Si alguna versión no cumple, actualízala antes de continuar.

### Paso 2: Limpiar Todo (CRÍTICO)

```bash
# En el directorio del proyecto
rm -rf node_modules
rm -rf vendor
rm -f package-lock.json
rm -f composer.lock
```

### Paso 3: Instalar Dependencias PHP

```bash
composer install
```

Si hay error, ejecuta:
```bash
composer update
composer install
```

### Paso 4: Configurar .env

```bash
cp .env.example .env
php artisan key:generate
```

Edita `.env` y configura tu base de datos MySQL:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nombre_de_tu_base_de_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

### Paso 5: Crear Base de Datos

```bash
# En MySQL
CREATE DATABASE nombre_de_tu_base_de_datos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Paso 6: Ejecutar Migraciones

```bash
php artisan migrate:fresh --seed
```

Esto creará:
- Usuario: admin@example.com / password
- Empresa demo con datos de prueba
- Catálogo de cuentas completo

### Paso 7: Instalar Dependencias Node

```bash
npm install
```

Si hay errores, intenta:
```bash
npm install --legacy-peer-deps
```

### Paso 8: Limpiar Cachés

```bash
# Caché de Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Caché de Vite
rm -rf node_modules/.vite
```

### Paso 9: Iniciar Servidores

**Terminal 1 - Backend Laravel:**
```bash
php artisan serve
```
Debería mostrar: `Server running on [http://127.0.0.1:8000]`

**Terminal 2 - Frontend Vite:**
```bash
npm run dev
```
Debería mostrar: `Local: http://localhost:5173/`

### Paso 10: Acceder a la Aplicación

Abre tu navegador en: **http://localhost:5173**

Deberías ver la pantalla de login. Usa:
- Email: admin@example.com
- Password: password

## Si NO Funciona

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "@vitejs/plugin-react can't detect preamble"
```bash
rm -rf node_modules/.vite
npm run build
npm run dev
```

### Error: "CORS" o "Network Error"
Verifica que `.env` tenga:
```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

Luego:
```bash
php artisan config:clear
php artisan serve
```

### Error: "Base de datos no existe"
```bash
# Crear la base de datos manualmente en MySQL
CREATE DATABASE nombre_de_tu_base_de_datos;

# Luego ejecutar migraciones
php artisan migrate:fresh --seed
```

### Pantalla Blanca

1. Abre consola del navegador (F12)
2. Verifica errores
3. Si dice "Failed to fetch", Laravel no está corriendo
4. Si dice "404", verifica que `npm run dev` esté activo

### Error de Permisos (Linux/Mac)
```bash
chmod -R 775 storage bootstrap/cache
```

## Verificación Final

Si todo está bien, deberías:
1. Ver el login en http://localhost:5173
2. Poder iniciar sesión con admin@example.com / password
3. Ver el dashboard con datos de la empresa demo

## Comandos de Desarrollo

```bash
# Reiniciar todo desde cero
php artisan migrate:fresh --seed
rm -rf node_modules/.vite
npm run dev

# Ver logs de Laravel
tail -f storage/logs/laravel.log

# Ver errores de Vite
# Están en la terminal donde ejecutaste npm run dev
```

## Estructura de Archivos

```
project-bolt-laravel/
├── app/                      # Backend Laravel
│   ├── Http/Controllers/Api/ # Controladores API
│   └── Models/              # Modelos Eloquent
├── database/
│   ├── migrations/          # Migraciones
│   └── seeders/             # Seeders
├── resources/
│   ├── js/                  # Frontend React
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Contextos (Auth, Company)
│   │   ├── lib/            # Utilidades y API client
│   │   ├── App.tsx         # App principal
│   │   └── main.tsx        # Entry point
│   └── views/
│       └── app.blade.php   # Template principal
├── routes/
│   ├── api.php             # Rutas API
│   └── web.php             # Rutas web
└── vite.config.ts          # Configuración Vite

```

## Contacto para Soporte

Si sigues teniendo problemas después de seguir TODOS los pasos:

1. Verifica que hayas ejecutado TODOS los pasos en orden
2. Revisa los logs:
   - Terminal donde corre `php artisan serve`
   - Terminal donde corre `npm run dev`
   - Consola del navegador (F12)
3. Copia el error COMPLETO que aparece
