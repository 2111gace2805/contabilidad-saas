# 🐳 Iniciar con Docker

## ⚡ Inicio Rápido

### Paso 1: Copiar y configurar .env

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` y configura la base de datos para Docker:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=contabilidad
DB_USERNAME=app
DB_PASSWORD=app
```

### Paso 2: Dar permisos al script

```bash
chmod +x start-docker.sh
```

### Paso 3: Iniciar todo con un solo comando

```bash
./start-docker.sh
```

¡Listo! Accede a: **http://localhost:8000**

---

## 🔧 Primera Vez (Setup Inicial)

Si es la primera vez que inicias el proyecto:

```bash
# 1. Iniciar contenedores
./start-docker.sh

# 2. Esperar a que todo esté listo (30 segundos)

# 3. En otra terminal, ejecutar migraciones
docker-compose exec backend php artisan migrate:fresh --seed

# 4. Recargar http://localhost:8000
```

---

## 📋 Comandos Útiles

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo MySQL
docker-compose logs -f mysql
```

### Ejecutar comandos en el backend
```bash
# Artisan commands
docker-compose exec backend php artisan route:list
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan db:seed

# Composer
docker-compose exec backend composer install
docker-compose exec backend composer update
```

### Ejecutar comandos en el frontend
```bash
# NPM commands
docker-compose exec frontend npm install
docker-compose exec frontend npm run build
docker-compose exec frontend npm run dev
```

### Acceder a MySQL
```bash
docker-compose exec mysql mysql -uapp -papp contabilidad

# O desde tu host
mysql -h127.0.0.1 -P3306 -uapp -papp contabilidad
```

### Reiniciar servicios
```bash
# Reiniciar todos
docker-compose restart

# Reiniciar solo uno
docker-compose restart backend
docker-compose restart frontend
```

### Detener servicios
```bash
docker-compose down

# Detener y eliminar volúmenes (¡cuidado! borra la BD)
docker-compose down -v
```

### Reconstruir contenedores
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🔍 Verificar que Todo Funciona

### 1. Ver estado de contenedores
```bash
docker-compose ps
```

Debe mostrar:
```
contabilidad_mysql      running   0.0.0.0:3306->3306/tcp
contabilidad_backend    running   0.0.0.0:8000->8000/tcp
contabilidad_frontend   running   0.0.0.0:5173->5173/tcp
```

### 2. Verificar logs del frontend
```bash
docker-compose logs frontend
```

Debe mostrar:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 3. Verificar logs del backend
```bash
docker-compose logs backend
```

Debe mostrar:
```
[Thu Jan 19 ...] PHP 8.2.30 Development Server (http://0.0.0.0:8000) started
```

### 4. Test de conectividad
```bash
# Backend
curl http://localhost:8000

# Debe retornar HTML

# API
curl http://localhost:8000/api/login
```

---

## ⚠️ Solución de Problemas

### Error: "Vite manifest not found"

**Causa:** El contenedor frontend no está corriendo o Vite no se inició

**Solución:**
```bash
# Ver logs del frontend
docker-compose logs frontend

# Si no muestra "Vite ready", reiniciar
docker-compose restart frontend

# Ver logs en tiempo real
docker-compose logs -f frontend
```

### Error: "Connection refused" al acceder a MySQL

**Causa:** MySQL aún no está listo

**Solución:**
```bash
# Ver logs
docker-compose logs mysql

# Esperar a ver: "ready for connections"

# Verificar
docker-compose exec mysql mysql -uroot -proot -e "SHOW DATABASES;"
```

### Error: "Port already in use"

**Causa:** Ya hay algo corriendo en el puerto

**Solución:**
```bash
# Ver qué está usando el puerto
lsof -i :8000
lsof -i :5173
lsof -i :3306

# Detener otros servicios o cambiar puertos en docker-compose.yml
```

### Contenedor se detiene inmediatamente

**Solución:**
```bash
# Ver logs completos
docker-compose logs backend
docker-compose logs frontend

# Entrar al contenedor manualmente
docker-compose run --rm backend sh
docker-compose run --rm frontend sh
```

### Cambios en el código no se reflejan

**Frontend (React/TypeScript):**
- Vite debería detectar cambios automáticamente
- Si no: `docker-compose restart frontend`

**Backend (PHP):**
- Los cambios se aplican automáticamente
- Si no: `docker-compose restart backend`

### Limpiar todo y empezar de cero

```bash
# Detener y eliminar todo (¡CUIDADO! Borra la BD)
docker-compose down -v

# Eliminar imágenes
docker-compose down --rmi all

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up -d

# Migrar de nuevo
docker-compose exec backend php artisan migrate:fresh --seed
```

---

## 📊 Arquitectura

```
┌─────────────────────────────────────────┐
│           localhost:8000                │
│        (Navegador del usuario)          │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │   Backend       │
        │  PHP 8.2 :8000  │
        └────────┬────────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│Frontend │ │  MySQL  │ │  Vite   │
│Node :5173│ │  :3306  │ │  HMR    │
└─────────┘ └─────────┘ └─────────┘
```

---

## 🎯 Flujo de Desarrollo

```bash
# 1. Iniciar servicios
./start-docker.sh

# 2. Hacer cambios en el código
# Los cambios se aplican automáticamente

# 3. Ver logs si hay errores
docker-compose logs -f

# 4. Ejecutar comandos de Laravel si es necesario
docker-compose exec backend php artisan ...

# 5. Detener cuando termines
docker-compose down
```

---

## 📝 Notas Importantes

1. ⚠️ **NO uses** `http://localhost:5173` directamente
2. ✅ **USA** `http://localhost:8000` siempre
3. 🔄 Los cambios en React se reflejan automáticamente (HMR)
4. 🔄 Los cambios en PHP se reflejan automáticamente
5. 💾 Los datos de MySQL persisten entre reinicios (volumen Docker)
6. 🧹 Usa `docker-compose down -v` solo si quieres borrar TODO

---

## 🚀 Para Producción

Para compilar para producción:

```bash
# Build frontend
docker-compose exec frontend npm run build

# Los assets compilados estarán en backend/public/build/

# Ya no necesitas Vite en producción
docker-compose stop frontend
```

---

## ✅ Checklist de Inicio

- [ ] Docker y docker-compose instalados
- [ ] `backend/.env` configurado con DB_HOST=mysql
- [ ] Ejecutado `chmod +x start-docker.sh`
- [ ] Ejecutado `./start-docker.sh`
- [ ] Esperado 30 segundos
- [ ] Ejecutado migraciones: `docker-compose exec backend php artisan migrate:fresh --seed`
- [ ] Accedido a http://localhost:8000
- [ ] Login con admin@example.com / password

---

**¿Problemas?** Comparte el output de:
```bash
docker-compose ps
docker-compose logs frontend
docker-compose logs backend
```
