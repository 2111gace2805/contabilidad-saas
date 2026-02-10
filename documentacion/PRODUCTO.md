# Resumen del Producto: Sistema Contable Multi-Empresa

## 🎯 Objetivo del Sistema
El sistema contable multi-empresa está diseñado para gestionar la contabilidad de múltiples empresas de manera aislada, con soporte para catálogos contables jerárquicos, pólizas contables, reportes financieros, y módulos operativos como cuentas por cobrar, cuentas por pagar, inventarios, y activos fijos. Está construido con un backend en Laravel y un frontend en React, ofreciendo una experiencia moderna y eficiente.

---

## 🏗️ Stack Tecnológico

### Backend
- **Framework:** Laravel 11
- **Base de datos:** MySQL 8.0
- **Autenticación:** Laravel Sanctum
- **API:** RESTful JSON API
- **Validación:** Laravel Form Requests
- **Autorización:** Policies y Middleware

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

## 📋 Características Principales

### ✨ Módulos Implementados
- **Multi-empresa:** Aislamiento completo de datos por empresa.
- **Catálogo de cuentas:** Jerárquico multinivel configurable.
- **Tipos de cuenta:** Activo, Pasivo, Capital, Ingresos, Gastos.
- **Segmentos contables:** Configurables por empresa.
- **Períodos fiscales:** Con cierre/apertura y restricciones.
- **Pólizas contables:** Diario, ingresos, egresos con validación.
- **Clientes y CxC:** Gestión de cuentas por cobrar.
- **Proveedores y CxP:** Gestión de cuentas por pagar.
- **Inventario:** Control de existencias y movimientos.
- **Activos fijos:** Con depreciación automática.
- **Bancos y tesorería:** Conciliaciones bancarias.
- **Reportes financieros:** Balance, Estado de Resultados, Balanza, etc.
- **Importación de Catálogo (CSV):** Permite importar un plan de cuentas mediante archivo CSV (soporta drag & drop). Antes de insertar, muestra una vista previa que permite revisar los registros; tiene botones **Cargar** (confirma la inserción) y **Cancelar** (descarta la importación). La estructura esperada es: `code,name,account_type,nature,parent_code,level,is_postable,affects_tax,tax_type`.

### 🔒 Seguridad
- Autenticación con Laravel Sanctum.
- Middleware de contexto de empresa (`X-Company-Id`).
- Validación de permisos por empresa.
- Aislamiento completo de datos.

---

## 📊 Reportes Disponibles
- **Balance General (Estado de Situación Financiera).**
- **Estado de Resultados (Pérdidas y Ganancias).**
- **Balanza de Comprobación.**
- **Libro Mayor.**
- **Auxiliares de Cuentas por Cobrar.**
- **Auxiliares de Cuentas por Pagar.**

---

## 🚀 Flujo de Trabajo

### 1. Configuración Inicial
- Crear empresas y configurar catálogos contables.
- Definir períodos fiscales y abrirlos para registrar transacciones.

### 2. Operaciones Contables
- Registrar pólizas contables (diario, ingresos, egresos).
- Gestionar cuentas por cobrar y cuentas por pagar.
- Controlar inventarios y activos fijos.

### 3. Reportes y Cierre
- Generar reportes financieros para análisis.
- Cerrar períodos fiscales para evitar modificaciones.

---

## 🛠️ Comandos Útiles

### Backend
```bash
# Iniciar servidor Laravel
php artisan serve

# Migrar y poblar base de datos
php artisan migrate:fresh --seed

# Limpiar cachés
php artisan config:clear
php artisan cache:clear
```

### Frontend
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

**Instalar dependencias en entorno Docker (Frontend)**

Si tu entorno corre en Docker (como en este proyecto), instala paquetes front-end dentro del contenedor `contabilidad_frontend`:

```bash
# Instala una dependencia (ej. react-dropzone)
docker-compose exec frontend npm install react-dropzone --save

# Reinicia el contenedor para que Vite re-procese dependencias si es necesario
docker-compose restart frontend
```

> Nota: El proceso de importación CSV está disponible en `Configuración -> Catálogo` y soporta arrastrar/soltar (drag & drop), vista previa y confirmación antes de insertar los datos.

### Docker
```bash
# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## 📚 Documentación Relacionada
- [CONFIGURACION_COMPLETA.md](../backend/CONFIGURACION_COMPLETA.md): Guía paso a paso para configurar el sistema.
- [API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md): Referencia completa de endpoints API.
- [FLUJO_POLIZAS.md](../backend/FLUJO_POLIZAS.md): Flujo de trabajo para pólizas contables.
- [CONTROL_PERIODOS_FISCALES.md](../backend/CONTROL_PERIODOS_FISCALES.md): Gestión de períodos fiscales.

---

## ✅ Estado Actual del Sistema
- **Backend:** Completamente funcional con 95+ endpoints.
- **Frontend:** Integrado con el backend y funcional.
- **Base de datos:** Configurada con datos de prueba.
- **Documentación:** Completa y actualizada.

### 🛠️ Cambios recientes (Feb 2026)
- Períodos contables: Formato de fecha en la UI cambiado a **dd-mmm-yyyy** (ej: 09-feb-2026) para mayor legibilidad.
- UI Períodos: Agrupado por **año** con secciones expandibles/colapsables; el estado de expansión **se persiste** en sessionStorage para mejorar la navegación cuando la lista crece.
- Períodos: Añadidos **modales** para crear y editar períodos (soporte para casos especiales y edición de fechas) y acciones para generar un año completo (12 períodos).
- Seguridad en borrado: Ahora el backend **impide eliminar** un período si existen asientos (journal entries) dentro del rango de fechas; el frontend hace una verificación previa y muestra un mensaje claro.
- Bugfix: `generate-year` arreglado — se corrige `period_type` a `'monthly'` al crear períodos y la operación ahora está protegida con transacción y manejo de errores.
- Seeder: Los seeders de períodos se hicieron idempotentes y ahora incluyen los campos **`month`**, **`year`** y **`period_name`** (ej. "Febrero 2026") para mejorar la visualización en la UI.
- Seeder: Los seeders de cuentas (catálogo base) se hicieron idempotentes (se reemplazó `create()` por `updateOrCreate()`) y se ejecutó `php artisan db:seed` con éxito sin errores de duplicado.
- Frontend: Corregido warning de React sobre `key` en listas (filas de períodos usan claves únicas), y se muestra "Sin definir" donde faltaban datos en vez de `undefined`.
- Operación ejecutada: Hice backup de los períodos existentes en `storage/logs/accounting_periods_backup.json`, borré los períodos existentes de `company_id = 1` y recreé un conjunto limpio para el año actual (1 anual + 12 mensuales). También actualicé los seeders para evitar duplicados al ejecutarlos de nuevo.
- Infra: Añadido `favicon.svg` y se enlazó en la plantilla (`app.blade.php`) para evitar 404 en `favicon.ico`.

---

## 🎯 Próximos Pasos
1. **Agregar módulo de nómina.**
2. **Integrar facturación electrónica.**
3. **Desarrollar reportes avanzados con gráficos.**
4. **Exportar datos a Excel/PDF.**
5. **Crear una API pública para integraciones.**
6. **Desarrollar una app móvil.**

---

**¡El sistema está listo para usar!** 🎉