# 🐳 Configuración de .env para Docker

## ⚡ Configuración Rápida

Ejecuta estos comandos:

```bash
cd backend

# Copiar .env de ejemplo
cp .env.example .env

# Generar key de Laravel
php artisan key:generate
```

## ✏️ Editar .env para Docker

Abre `backend/.env` y **cambia estas líneas**:

### Antes (local):
```env
DB_HOST=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=
```

### Después (Docker):
```env
DB_HOST=mysql
DB_USERNAME=app
DB_PASSWORD=app
```

## 📋 Archivo Completo para Docker

Copia esto en `backend/.env`:

```env
APP_NAME="Sistema Contable"
APP_ENV=local
APP_KEY=  # ← Se genera automáticamente con: php artisan key:generate
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

APP_LOCALE=es
APP_FALLBACK_LOCALE=es

LOG_CHANNEL=stack
LOG_LEVEL=debug

# 🐳 BASE DE DATOS - DOCKER
DB_CONNECTION=mysql
DB_HOST=mysql  # ← IMPORTANTE: Usar 'mysql' (nombre del servicio Docker)
DB_PORT=3306
DB_DATABASE=contabilidad
DB_USERNAME=app  # ← Usuario de docker-compose.yml
DB_PASSWORD=app  # ← Password de docker-compose.yml

SESSION_DRIVER=database
SESSION_LIFETIME=120

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MAIL_MAILER=log

VITE_APP_NAME="${APP_NAME}"
```

## ✅ Verificación

Verifica que tu configuración es correcta:

```bash
# Con Docker
docker-compose exec backend php artisan config:show database

# Debe mostrar:
# database.connections.mysql.host => "mysql"
# database.connections.mysql.username => "app"
```

## 🔄 Si cambias .env

Cada vez que modifiques el `.env`, limpia el caché:

```bash
# Con Docker
docker-compose exec backend php artisan config:clear

# Sin Docker
php artisan config:clear
```

## 📊 Diferencias Local vs Docker

| Configuración | Local | Docker |
|---------------|-------|--------|
| DB_HOST | `127.0.0.1` | `mysql` |
| DB_USERNAME | `root` | `app` |
| DB_PASSWORD | tu password | `app` |
| URL MySQL | localhost:3306 | mysql:3306 |

## 🎯 ¿Por qué `mysql` como host?

Docker Compose crea una red interna donde los contenedores se comunican por nombre de servicio:

```yaml
# En docker-compose.yml
services:
  mysql:      # ← Este nombre se convierte en el hostname
    ...
  backend:    # ← Este contenedor puede acceder a "mysql"
    ...
```

Desde el contenedor `backend`, el hostname `mysql` resuelve automáticamente a la IP interna del contenedor MySQL.

## ⚠️ Importante

- ✅ Usa `mysql` como `DB_HOST` cuando uses Docker
- ✅ Usa `127.0.0.1` o `localhost` cuando NO uses Docker
- ⚠️ NO subas el archivo `.env` al repositorio (está en `.gitignore`)
- ⚠️ Cada desarrollador debe configurar su propio `.env`
