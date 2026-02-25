# MÓDULO DE FACTURACIÓN (VENTAS) Y CUENTAS POR COBRAR
## ERP Contable Multiempresa – El Salvador

---

# 1. OBJETIVO

Implementar el módulo de:

- Clientes
- Facturación de venta
- Cuentas por cobrar (CxC)
- Aplicación de pagos
- Generación automática de partidas contables

Cumpliendo:

- Normativa contable formal
- Estructura fiscal de El Salvador
- Arquitectura multiempresa
- Preparación para Facturación Electrónica

## Cambios recientes en UI/Flujo

- Clientes: código se asigna automáticamente por empresa (secuencia 000001, 000002...). No se captura manualmente en el formulario.
- Clientes: selección de cliente en facturación usa buscador tipo autocomplete (código/nombre/NIT) con navegación de teclado, mismo UX que búsqueda de cuentas contables.
- Clientes: campo "Tipo de cliente" es obligatorio; perfil por defecto jurídica. Persona natural muestra "Nombres y apellidos" y DUI; jurídica muestra razón social y nombre comercial.
- Clientes: búsqueda y paginación (100 por página) en la grilla de clientes.
- Facturas de venta: el correlativo se genera automáticamente por tipo DTE y establecimiento (ej. `DTE-01-M001P001-000000000000001`) y se muestra solo lectura en el modal.
- Configuración > Establecimientos: ahora se gestiona **Casa Matriz / Sucursal** con codificación MH (`M001` / `S001`) y código interno de Punto de Venta (`P001`).
- Regla por defecto: toda empresa debe tener al menos una **Casa Matriz M001** y **Punto de Venta P001**.

---

# 2. ESTRUCTURA GEOGRÁFICA

## 2.1 Departments

Tabla: `departments`

- depa_id (varchar) PRIMARY KEY
- name (varchar)
- status (ACTIVE / INACTIVE)

---

## 2.2 Municipalities

Tabla: `municipalities`

- id (bigint autoincrement) PRIMARY KEY
- muni_id (varchar)
- depa_id (varchar FK departments.depa_id)
- muni_nombre (varchar)
- muni_status (ACTIVE / INACTIVE)

---

## 2.3 Districts

Tabla: `districts`

- dis_id (bigint autoincrement) PRIMARY KEY
- munidepa_id (int FK municipalities.id)
- dist_name (varchar)
- dist_status (ACTIVE / INACTIVE)

---

# 3. TIPOS DE CLIENTE

Tabla: `customer_types`

- id (uuid)
- company_id (uuid)
- code (varchar)
- name (varchar)
- is_active (boolean)
- created_at
- updated_at

Restricción única:
unique(company_id, code)

Registros mínimos por defecto:

- PERSONA_NATURAL
- PERSONERIA_JURIDICA

---

# 4. ACTIVIDAD ECONÓMICA

Tabla: `economic_activities`

- id (uuid)
- code (char(5)) UNIQUE
- name (varchar)
- is_parent (boolean)
- parent_id (uuid nullable)
- order_number (int)
- status (ACTIVE / INACTIVE)

Este catálogo es global (no depende de company_id).

---

# 5. CLIENTES

Tabla: `customers`

- id (uuid)
- company_id (uuid)

- customer_type_id (uuid FK customer_types)
- economic_activity_id (uuid FK economic_activities)

- depa_id (varchar FK departments)
- municipality_id (int FK municipalities)
- district_id (int FK districts)

- name (varchar)
- contact_name (varchar)

- email1 (varchar NOT NULL)
- email2 (varchar nullable)
- email3 (varchar nullable)

- address (text)

- nit (varchar 17 nullable)
- nrc (varchar nullable)
- dui (varchar 10 nullable)

- is_gran_contribuyente (boolean default false)
- is_exento_iva (boolean default false)
- is_no_sujeto_iva (boolean default false)

- credit_limit (decimal 15,2 default 0)
- credit_days (int default 0)

- status (ACTIVE / INACTIVE)

- created_at
- updated_at

---

# 6. VALIDACIONES IMPORTANTES

## Persona Natural

- DUI opcional (máximo 10 caracteres)
- NIT opcional (17 caracteres)
- NRC opcional

## Persona Jurídica

- NIT obligatorio
- NRC obligatorio
- Actividad económica obligatoria

---

# 7. FACTURAS DE VENTA

Tabla: `invoices`

- id (uuid)
- company_id (uuid)
- customer_id (uuid)
- invoice_number (varchar)
- fiscal_year (int)
- invoice_date (date)
- due_date (date)

- subtotal (decimal 15,2)
- iva_amount (decimal 15,2)
- total (decimal 15,2)

- status (DRAFT, POSTED, VOID)

- journal_entry_id (uuid nullable)

- created_by (uuid)
- created_at
- updated_at

Restricción única:
unique(company_id, invoice_number)

---

## Líneas de factura

Tabla: `invoice_lines`

- id (uuid)
- invoice_id (uuid)
- description (text)
- quantity (decimal 15,2)
- unit_price (decimal 15,2)
- discount (decimal 15,2)
- tax_id (uuid FK taxes nullable)

- subtotal (decimal 15,2)
- iva_amount (decimal 15,2)
- total (decimal 15,2)

---

# 8. CORRELATIVO DE FACTURAS POR TIPO DTE

Tabla: `document_types`

- id (bigint)
- company_id (bigint)
- code (varchar) — código DTE (`DTE-01`, `DTE-03`, etc.)
- name (varchar)
- prefix (varchar) — prefijo de correlativo (normalmente igual al código DTE)
- next_number (int) — siguiente secuencia a emitir

Tabla: `invoices`

- document_type_id (FK a `document_types`)
- invoice_number (varchar, único por empresa)

Restricción:
unique(company_id, invoice_number)

Formato vigente:

`{prefix}-{mh_code}{pos_code}-{correlativo_15_dígitos}`

Ejemplos:

- `DTE-01-M001P001-000000000000001`
- `DTE-03-S001P001-000000000000001`

Reglas técnicas obligatorias:

- Se genera en backend dentro de `DB::transaction()`.
- Se usa `lockForUpdate()` sobre el `document_type` para evitar colisiones concurrentes.
- No usar `MAX()` ni `COUNT()` para asignar correlativos.
- El frontend solo muestra vista previa; el número final lo asigna el backend.

Nota: Para aplicar estos cambios en desarrollo, ejecutar `php artisan migrate` y luego `php artisan db:seed` (o `php artisan migrate:fresh --seed` para reinicio completo).

---

# 9. CONTABILIZACIÓN AUTOMÁTICA

Cuando una factura cambia a POSTED:

Debe generar automáticamente una partida contable.

Asiento típico:

Debe:
- Cuenta por cobrar

Haber:
- Ventas
- IVA débito fiscal

La partida debe usar el correlativo del tipo INGRESO.

---

# 10. REGLAS INMUTABLES

1. No se puede editar una factura POSTED
2. No se puede registrar en período cerrado
3. No se puede eliminar factura POSTED
4. Solo puede anularse (VOID)
5. No se reutilizan correlativos
6. Si se anula, debe generarse partida reversa

---

# 11. PAGOS (CUENTAS POR COBRAR)

Tabla: `customer_payments`

- id (uuid)
- company_id (uuid)
- customer_id (uuid)
- payment_date (date)
- amount (decimal 15,2)
- payment_method_id (uuid)
- reference (varchar)
- status (DRAFT, POSTED)
- journal_entry_id (uuid)

---

Tabla: `payment_applications`

- id (uuid)
- payment_id (uuid)
- invoice_id (uuid)
- applied_amount (decimal 15,2)

---

# 12. CONTABILIZACIÓN DE PAGO

Debe:

Debe:
- Banco / Caja

Haber:
- Cuentas por cobrar

---

# 13. PRINCIPIOS ARQUITECTÓNICOS

- No mezclar company_id
- No generar partidas manuales para ventas
- Toda contabilización debe ejecutarse en DB::transaction()
- Las facturas POSTED son inmutables
- No reutilizar correlativos
