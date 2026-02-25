# Reglas Contables e Inmutabilidad (Developer Context)

Este documento define las reglas críticas de inmutabilidad y el flujo de anulación implementado en el sistema.

## 1. Inmutabilidad de Pólizas
Las reglas han sido ajustadas: las pólizas contabilizadas (`POSTED`) pueden ser editadas bajo condiciones controladas.

- **Edición de pólizas contabilizadas:** Se permite la edición de pólizas cuyo estado original es `POSTED` siempre y cuando la fecha de la póliza se encuentre dentro de un **periodo fiscal abierto**. El controlador `JournalEntryController` valida este requisito antes de permitir la actualización.
- **Revertir a borrador:** No se permite cambiar el estado de una póliza `POSTED` a `DRAFT` si la póliza ya tiene asignado un `sequence_number` o `entry_number` (correlativo). Esto evita romper la numeración contable.
- **Anuladas (VOID):** Las pólizas en estado `VOID` o `VOIDED` siguen siendo inmutables y no pueden editarse ni eliminarse.

Nota: El modelo anteriormente contenía una restricción global que prevenía cualquier `update` si el estado original era `POSTED`. Esa lógica fue relajada en el hook `boot()` del modelo para delegar las validaciones específicas al controlador.

## 2. Flujo de Anulación
Para corregir una póliza contabilizada, se debe seguir el flujo de anulación bajo autorización:

### Paso 1: Solicitud de Anulación
- El usuario solicita la anulación desde la interfaz.
- Se debe proporcionar un **motivo obligatorio** (mínimo 10 caracteres).
- El estado cambia a `PENDING_VOID`.

### Paso 2: Autorización Administrativa
- Un usuario con rol `ADMIN` o `SUPER_ADMIN` debe revisar la solicitud.
- Al autorizar, el estado cambia a `VOID`.
- Se registran los campos `void_authorized_by` y `void_authorized_at`.

## 3. Numeración (Correlativos)
- Las pólizas en estado `DRAFT` **no tienen correlativo asignado** visible para el usuario (se muestra como "BORRADOR").
- El **sequence_number** (correlativo global) se asigna únicamente en el momento de la contabilización (`post`).
- Esto garantiza que no haya saltos en la numeración de auditoría por borradores eliminados.

## 4. Restricciones Técnicas
- El modelo `JournalEntry` tiene un hook `boot` que previene actualizaciones si el status original es `POSTED` o `VOID`.
- El controlador `JournalEntryController` valida el estado antes de permitir `update` o `destroy`.
- Solo se permite modificar o eliminar pólizas en estado `DRAFT`.

## 5. Compras por Importación JSON (DTE)
- `Purchases.tsx` ahora soporta carga de JSON DTE para evitar digitación manual de facturas.
- `BillController` acepta campos DTE (`tipo_dte`, `dte_codigo_generacion`, `dte_numero_control`, `dte_*`) y guarda bloques JSON completos.
- Si `supplier_id` no viene, se usa snapshot del emisor (`supplier_name_snapshot`, `supplier_tax_id_snapshot`) y se resuelve/crea proveedor automáticamente.
- `ReportController@purchaseBook` solo incluye compras con `is_fiscal_credit = true` (tipo DTE `03`).

## 6. Formato Oficial de Número DTE en Ventas
- El número de factura/`numeroControl` para ventas se normaliza al formato:
	- `DTE-{tipoDocumento}-{codigoSucursal}{codigoPuntoVenta}-{correlativo15}`
- Estructura esperada:
	- `tipoDocumento`: 2 dígitos (ej. `01`, `03`, `07`).
	- `codigoSucursal`: 4 caracteres (ej. `M001`).
	- `codigoPuntoVenta`: 4 caracteres (ej. `P001`).
	- `correlativo15`: 15 dígitos numéricos con ceros a la izquierda.
- Ejemplos válidos:
	- `DTE-01-M001P001-250000000000273`
	- `DTE-03-M001P001-260000000000039`
	- `DTE-07-M001P001-000000000001348`
- Los códigos `M001` y `P001` son configurables por empresa en `CompanyPreference`:
	- `dte_establishment_code`
	- `dte_point_of_sale_code`
- Backend valida estrictamente este formato al crear/editar ventas y autogenera correlativo cuando no se envía `invoice_number`.

## 7. Ajustes ERP (Clientes, Ítems, Tipos de Cuenta)
- **Clientes (alta por integración):** `CustomerController` normaliza alias de payload (`nombre`, `correo`, `telefono`, `codActividad`, `direccion.departamento`, `direccion.municipio`, `direccion.complemento`) hacia el esquema interno (`name`, `email1`, `phone`, `economic_activity_id`, `depa_id`, `municipality_id`, `address`).
- **Clientes (ubicación):** cuando no se recibe `district_id`, se resuelve automáticamente el primer distrito activo del municipio para evitar errores 422 en altas externas.
- **Facturación ventas:** autocompletado de ítems/productos ahora usa búsqueda backend (`/inventory-items?search=...`) y no depende solo del primer bloque paginado.
- **Inventario/Ítems:** se formaliza `item_type` con catálogo cerrado (`bien`, `servicio`, `ambos`) en backend y frontend.
- **Tipos de cuenta (Administración):** UI corregida en español y flujo completo de creación/edición/eliminación desde modal.
