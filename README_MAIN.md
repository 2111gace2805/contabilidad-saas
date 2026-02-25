# 🚀 Sistema Contable Multi-Empresa - Laravel + React

Sistema contable completo con backend Laravel 11 y frontend React + TypeScript, con soporte multi-empresa y aislamiento completo de datos.

---

## ⚡ Inicio Rápido

Elige tu método preferido:

### 🐳 Opción 1: Con Docker (Recomendado)

```bash
# 1. Configurar .env
cd backend
cp .env.example .env
# Editar .env y cambiar DB_HOST=mysql

# 2. Iniciar servicios
cd ..
chmod +x start-docker.sh
./start-docker.sh

# 3. Migrar base de datos (primera vez)
docker-compose exec backend php artisan migrate:fresh --seed

# 4. Acceder a: http://localhost:8000
```

📚 **Guía completa:** [DOCKER_START.md](DOCKER_START.md)

---

### 💻 Opción 2: Sin Docker (Local)

**Requisitos:** PHP 8.2+, Node 20+, MySQL 8+

```bash
# 1. Configurar .env
cd backend
cp .env.example .env
php artisan key:generate
# Editar .env con tu configuración de MySQL local

# 2. Instalar dependencias
composer install
npm install

# 3. Migrar base de datos
php artisan migrate:fresh --seed

# 4. Iniciar servidores (2 terminales)
# Terminal 1:
php artisan serve

# Terminal 2:
npm run dev

# 5. Acceder a: http://localhost:8000
```

📚 **Guía completa:** [START_HERE.md](backend/START_HERE.md)

---

## 🔐 Login por Defecto

- **URL:** http://localhost:8000
- **Email:** `admin@example.com`
- **Password:** `password`

---

## 📋 Características

### ✨ Módulos Implementados

- ✅ **Multi-empresa** - Aislamiento completo de datos por empresa
- ✅ **Catálogo de cuentas** - Jerárquico multinivel configurable
- ✅ **Tipos de cuenta** - Activo, Pasivo, Capital, Ingresos, Gastos
- ✅ **Segmentos contables** - Configurables por empresa
- ✅ **Períodos fiscales** - Con cierre/apertura y restricciones
- ✅ **Partidas contables** - Diario, ingresos, egresos con validación
- ✅ **Clientes y CxC** - Gestión de cuentas por cobrar
- ✅ **Proveedores y CxP** - Gestión de cuentas por pagar
- ✅ **Facturas de venta** - Con posting automático
- ✅ **Facturas de compra** - Alimenta inventario y CxP
- ✅ **Inventario** - Control de existencias y movimientos
- ✅ **Activos fijos** - Con depreciación automática
- ✅ **Bancos y tesorería** - Conciliaciones bancarias
- ✅ **Reportes financieros** - Balance, Estado de resultados, Balanza, etc.

### 📊 Reportes Disponibles

- Balance General (Estado de Situación Financiera)
- Estado de Resultados (P&L)
- Balanza de Comprobación
- Libro Mayor
- Auxiliares de CxC
- Auxiliares de CxP

### 🔒 Seguridad

- Autenticación con Laravel Sanctum
- Tokens de API seguros
- Middleware de contexto de empresa
- Validación de permisos por empresa
- Sanitización de datos

---

## 🏗️ Stack Tecnológico

### Backend
- **Framework:** Laravel 11
- **Base de datos:** MySQL 8.0
- **Autenticación:** Laravel Sanctum
- **API:** RESTful JSON API
- **Validación:** Form Requests
- **Autorización:** Policies

### Frontend
- **Framework:** React 18
- **Lenguaje:** TypeScript
- **Bundler:** Vite 5
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **HTTP Client:** Fetch API nativo

### DevOps
- **Contenedores:** Docker + Docker Compose
- **Web Server:** PHP Built-in (dev) / Nginx (prod)
- **Package Manager:** Composer + NPM

---

## 📁 Estructura del Proyecto

```
contabilidad-saas/
├── backend/                    # Laravel + React integrados
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # Controladores de API
│   │   │   └── Middleware/       # Middleware (SetCompanyContext)
│   │   ├── Models/               # Modelos Eloquent
│   │   └── Policies/             # Políticas de autorización
│   ├── database/
│   │   ├── migrations/           # 40+ migraciones
│   │   └── seeders/              # Datos de prueba
│   ├── resources/
│   │   ├── js/                   # Frontend React/TypeScript
│   │   │   ├── components/       # Componentes React
│   │   │   ├── contexts/         # Context API
│   │   │   ├── lib/              # API client
│   │   │   └── types/            # TypeScript types
│   │   └── views/
│   │       └── app.blade.php     # HTML base
│   └── routes/
│       └── api.php               # Rutas de API
├── docker/                     # Dockerfiles
├── docker-compose.yml          # Orquestación de contenedores
└── start-docker.sh             # Script de inicio rápido
```

---

## 🔧 Comandos Útiles

### Con Docker

```bash
# Ver logs
docker-compose logs -f

# Ejecutar artisan
docker-compose exec backend php artisan route:list

# Acceder a MySQL
docker-compose exec mysql mysql -uapp -papp contabilidad

# Reinstalar dependencias
docker-compose exec backend composer install
docker-compose exec frontend npm install

# Detener todo
docker-compose down
```

### Sin Docker

```bash
# Limpiar cachés
cd backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Ver rutas
php artisan route:list

# Reinstalar
composer install
npm install
```

---

## 🧪 Testing

```bash
# Con Docker
docker-compose exec backend php artisan test

# Sin Docker
cd backend
php artisan test
```

---

## 📚 Documentación

### Guías de Inicio
- [DOCKER_START.md](DOCKER_START.md) - Inicio con Docker
- [START_HERE.md](backend/START_HERE.md) - Inicio sin Docker
- [QUICK_START.md](backend/QUICK_START.md) - Resumen ejecutivo

### Documentación Técnica
- [FIXES_APPLIED.md](backend/FIXES_APPLIED.md) - Correcciones aplicadas
- [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) - API Reference
- [FIX_LOGIN_ERROR.md](backend/FIX_LOGIN_ERROR.md) - Soluciones comunes

### Guías Funcionales
- [CONFIGURACION_COMPLETA.md](backend/CONFIGURACION_COMPLETA.md) - Configuración del sistema
- [FLUJO_POLIZAS.md](backend/FLUJO_POLIZAS.md) - Flujo de partidas contables
- [CONTROL_PERIODOS_FISCALES.md](backend/CONTROL_PERIODOS_FISCALES.md) - Períodos fiscales

---

## 🐛 Solución de Problemas

### "Vite manifest not found"
👉 **Solución:** Inicia Vite  
- **Con Docker:** `docker-compose restart frontend`
- **Sin Docker:** `npm run dev` en terminal separada

### "405 Method Not Allowed" en login
👉 **Solución:** Limpia cachés  
```bash
php artisan route:clear
```

### "SQLSTATE[HY000] [2002] Connection refused"
👉 **Solución:** Verifica MySQL  
- **Con Docker:** `docker-compose logs mysql`
- **Sin Docker:** `sudo systemctl status mysql`

### Más problemas?
📖 Ver: [FIX_LOGIN_ERROR.md](backend/FIX_LOGIN_ERROR.md)

---

## 🚀 Producción

### Build del Frontend
```bash
# Con Docker
docker-compose exec frontend npm run build

# Sin Docker
cd backend
npm run build
```

Los assets compilados estarán en `backend/public/build/`

### Optimizar Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo de Desarrollo

Desarrollado para gestión contable profesional multi-empresa.

---

## 🎯 Roadmap

- [ ] Módulo de nómina
- [ ] Integración con facturación electrónica
- [ ] Reportes avanzados con gráficos
- [ ] Export a Excel/PDF
- [ ] API pública para integraciones
- [ ] App móvil

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisa la documentación en los archivos `.md`
2. Verifica los logs: `docker-compose logs` o `storage/logs/laravel.log`
3. Ejecuta el script de verificación: `./verify-fixes.sh`

---

**¿Listo para empezar?** Sigue la guía [DOCKER_START.md](DOCKER_START.md) o [START_HERE.md](backend/START_HERE.md)
