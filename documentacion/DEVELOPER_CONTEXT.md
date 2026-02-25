# Contexto para Desarrolladores (Guía de Arquitectura y Estándares)

Este documento sirve como referencia central para entender la infraestructura, patrones de diseño y flujos de trabajo del Sistema Contable SaaS. Debe ser consultado antes de iniciar cualquier nuevo desarrollo.

## 🛠️ Stack Tecnológico

- **Backend**: Laravel 11.x (PHP 8.2+)
- **Frontend**: React 18 (TypeScript) + Vite 5
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Base de Datos**: MySQL 8.0
- **Autenticación**: Laravel Sanctum
- **Llamadas API**: Fetch API nativo

## 🏗️ Arquitectura y Patrones

### 1. Multi-Tenancy (Multi-Empresa)
- **Aislamiento**: Se basa en `company_id` en las tablas operativas.
- **Contexto**: El frontend envía el ID de la empresa en el header `X-Company-Id`.
- **Middleware**: `CompanyContextMiddleware` en el backend intercepta las peticiones y asegura que el usuario tenga acceso y los datos estén filtrados.

### 2. Sistema de Roles (RBAC)
Existen tres niveles jerárquicos definidos en `User.php` y protegidos por middleware:
- **SUPER ADMIN**: Gestiona empresas y usuarios globales. (Middleware: `super.admin`)
- **ADMIN**: Administrador de la empresa. Acceso total a módulos y configuración.
- **USUARIO**: Operador/Contador. Acceso a módulos operativos, sin acceso a configuración.

### 3. Flujo de Partidas (Journal Entries)
Se implementa un patrón de "Documento en Borrador":
- `draft`: Editable, no afecta saldos.
- `posted`: No editable, genera registros en el libro mayor.
- `void`: Reversión contable automática.

### 4. Idioma y Localización
- **Mensajes de Usuario**: Todos los mensajes de error, notificaciones y etiquetas en la UI deben estar en **Español**.
- **Validaciones**: Las respuestas de validación del backend deben ser traducidas o personalizadas al español.

### 5. Secuenciación de Partidas
Las partidas utilizan tres identificadores para su control y visualización:
- **Identificador (`sequence_number`)**: Un número incremental global por cada empresa (infinito).
- **Tipo de Partida (`entry_type`)**: Categoría de la partida (PD, PI, PE, PA, etc.).
- **Correlativo (`type_number`)**: Un número incremental de 7 dígitos que se gestiona por cada tipo de partida dentro de la misma empresa.

## 📐 Estándares de Código

### Backend (Laravel)
- **Modelos**: Usar Eloquent con relaciones bien definidas y `fillable`/`casts`.
- **Controladores**: Mantener controladores delgados, usar Form Requests para validación.
- **Rutas**: Definidas en `api.php`. Usar grupos de middleware para protección de contexto.
- **Migraciones**: Seguir nomenclatura estándar. Siempre incluir `company_id` en tablas operativas.

### Frontend (React/TS)
- **Componentes**: Funcionales con hooks. Ubicados en `resources/js/components`.
- **Contextos**: Usar `AuthContext` y `CompanyContext` para estados globales.
- **Tipado**: Definir interfaces en `resources/js/types/index.ts`.
- **Estilos**: Usar exclusivamente clases de Tailwind. Evitar CSS embebido.

## 🧪 Pruebas y Calidad

- **Ubicación**: `/tests/backend` para PHPUnit.
- **Ejecución**: `docker-compose exec backend vendor/bin/phpunit`.
- **Feature Tests**: Priorizar pruebas de integración que validen flujos completos (ej: creación de partida balanceada).

## 🚀 Despliegue y Docker

- El entorno se levanta con `./start-docker.sh`.
- **Backend Port**: 8000
- **Frontend Port**: 5173 (Vite HMR)
- **MySQL Port**: 3306

## 📚 Documentación de Referencia
- `RBAC_IMPLEMENTATION.md`: Detalles técnicos del sistema de roles.
- `FLUJO_POLIZAS.md`: Lógica del motor contable.
- `CONFIGURACION_EMPRESA.md`: Estructura del módulo de settings.

## 🧾 Compras con JSON DTE

- El módulo de compras soporta importación de JSON DTE (MH El Salvador) para autocompletar encabezado, emisor, detalle y resumen.
- Campos críticos no editables cuando se importa JSON: `Correlativo/numeroControl` y `Fecha de emisión`.
- Si el proveedor del JSON no existe en catálogo, el backend guarda la compra con snapshot del emisor y crea proveedor automáticamente en la empresa.
- Se persiste metadata DTE en `bills`: tipo DTE, código de generación, sello recibido, firma, bloques JSON (`emisor`, `receptor`, `cuerpoDocumento`, `resumen`, `apendice`) y JSON crudo.
- Regla fiscal: solo compras con `tipo_dte = "03"` (Comprobante de Crédito Fiscal) alimentan `Libro de Compras`; `tipo_dte = "01"` se registra en compras pero no entra al libro.

## 🆕 Ajustes ERP recientes (Febrero 2026)

- **Clientes**
	- El alta de cliente mantiene `Tipo de Cliente` como selector principal en UI.
	- Backend normaliza payloads de integración con alias (`nombre`, `correo`, `telefono`, `codActividad`, `direccion.*`) para evitar 422 por diferencias de nombre de campos.
	- Si no llega `district_id`, el backend intenta resolver uno válido según municipio.

- **Facturación (Nueva Factura)**
	- Búsqueda de ítems/productos con autocompletado conectado a backend (`search` + paginación), no solo listado local inicial.
	- El usuario escribe y autocompleta; el tipo de ítem se determina automáticamente desde catálogo de inventario.

- **Inventario / Ítems**
	- Se formalizó `item_type` con valores `bien`, `servicio`, `ambos` en base de datos, backend y frontend.

- **Administración → Tipos de Cuenta**
	- Interfaz y etiquetas unificadas en español.
	- Flujo de `Nuevo Tipo`, edición y eliminación funcional.
	- Naturaleza mostrada como `Deudora`/`Acreedora`.

---
*Última actualización: Febrero 2026*
