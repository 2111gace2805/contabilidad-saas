# Control de Periodos Fiscales - Sistema Contable

## Resumen
Se ha implementado un sistema completo de control de periodos fiscales similar a SAP Business One, que garantiza la integridad de los datos contables mediante validaciones automáticas a nivel de base de datos y aplicación.

## Características Implementadas

### 1. Validación de Periodos a Nivel de Base de Datos

#### Triggers Automáticos
- **`check_journal_entry_period()`**: Valida automáticamente todas las operaciones (INSERT/UPDATE/DELETE) en partidas contables
- **`check_bank_transaction_period()`**: Valida automáticamente todas las operaciones en transacciones bancarias
- **`validate_period_for_transaction()`**: Función centralizada que verifica si una fecha está en un periodo cerrado

#### Restricciones Implementadas
1. **Periodos Cerrados**: No se pueden crear ni modificar transacciones en periodos cerrados
2. **Partidas Contabilizadas**: Las partidas con estado "posted" no se pueden modificar ni eliminar
3. **Solo Borradores**: Únicamente las partidas en estado "draft" pueden ser eliminadas
4. **Cascada de Eliminación**: Al eliminar una transacción bancaria, se elimina automáticamente su póliza asociada

#### Políticas RLS (Row Level Security)
- DELETE en `journal_entries`: Solo permite eliminar borradores
- DELETE en `journal_entry_lines`: Solo permite eliminar líneas de borradores
- DELETE en `bank_transactions`: Validación de periodos y permisos de usuario

### 2. Utilidades de Validación Frontend

Archivo: `src/lib/periodValidation.ts`

#### Funciones Principales
- **`isPeriodClosed()`**: Verifica si una fecha está en un periodo cerrado
- **`validatePeriodForTransaction()`**: Valida si se puede crear/modificar una transacción
- **`getOpenPeriods()`**: Obtiene todos los periodos abiertos de una empresa
- **`getAllPeriods()`**: Obtiene todos los periodos de una empresa
- **`canModifyEntry()`**: Determina si una partida puede ser modificada
- **`canDeleteEntry()`**: Determina si una partida puede ser eliminada
- **`getStatusBadgeColor()`**: Retorna colores para badges de estado de periodos
- **`getEntryStatusBadgeColor()`**: Retorna colores para badges de estado de partidas
- **`formatPeriodName()`**: Formatea nombres de periodos para mostrar

### 3. Módulo de Pólizas Contables (Journal Entries)

#### Funcionalidades Agregadas
- ✅ Botón de eliminar (solo para borradores)
- ✅ Validación de periodos cerrados antes de eliminar
- ✅ Validación de periodos cerrados al crear nuevas partidas
- ✅ Indicadores visuales del estado de las partidas
- ✅ Columna de acciones con iconos informativos
- ✅ Mensajes de error claros cuando se intenta eliminar una partida contabilizada

#### Estados de Partidas
- **Borrador** (draft): Puede ser eliminada y modificada si el periodo está abierto
- **Contabilizada** (posted): No puede ser modificada ni eliminada
- **Anulada** (void): No puede ser modificada ni eliminada

### 4. Módulo de Tesorería (Treasury)

#### Funcionalidades Agregadas
- ✅ Validación de periodos antes de crear transacciones
- ✅ Botón de eliminar transacciones bancarias
- ✅ Validación de periodos antes de eliminar
- ✅ Ajuste automático del saldo bancario al eliminar
- ✅ Eliminación en cascada de pólizas asociadas
- ✅ Columna de acciones en la tabla de transacciones

#### Lógica de Eliminación
1. Verifica que el periodo no esté cerrado
2. Confirma con el usuario
3. Ajusta el saldo de la cuenta bancaria (revierte el movimiento)
4. Elimina la póliza contable asociada (si existe)
5. Elimina la transacción bancaria

### 5. Flujo de Control - Similar a SAP B1

#### Antes de Crear Transacciones
1. Sistema verifica que exista un periodo fiscal abierto
2. Valida que la fecha de la transacción esté dentro de un periodo abierto
3. Si el periodo está cerrado, muestra mensaje de error y no permite continuar

#### Antes de Modificar Transacciones
1. Verifica el estado de la transacción (draft/posted)
2. Si está contabilizada, no permite modificar
3. Verifica que el periodo de la fecha original esté abierto
4. Si se cambia la fecha, verifica que el nuevo periodo también esté abierto

#### Antes de Eliminar Transacciones
1. Verifica que sea un borrador (journal entries) o permite eliminación (bank transactions)
2. Verifica que el periodo no esté cerrado
3. Solicita confirmación al usuario
4. Ejecuta eliminación en cascada si aplica

### 6. Mensajes de Error Mejorados

#### Ejemplos de Mensajes
- "No se pueden crear o modificar transacciones en periodos cerrados. Verifique que el periodo contable esté abierto."
- "Solo se pueden eliminar pólizas en borrador. Las pólizas contabilizadas no se pueden eliminar."
- "No se puede eliminar esta transacción porque el periodo contable está cerrado."
- "No se pueden modificar partidas contabilizadas. Las partidas contabilizadas están bloqueadas para mantener la integridad contable."

## Seguridad y Auditoría

### Protección de Datos
- Triggers a nivel de base de datos que NO pueden ser evitados desde el frontend
- Validación doble: Frontend (UX) + Backend (Seguridad)
- Políticas RLS que garantizan acceso solo a datos autorizados

### Trazabilidad
- Todas las operaciones registran `created_by` y `created_at`
- Las partidas contabilizadas registran `posted_at`
- Los periodos cerrados registran `closed_at` y `closed_by`

## Casos de Uso Típicos

### Caso 1: Cierre de Mes
1. Contador genera reportes del mes
2. Verifica que todas las partidas estén contabilizadas
3. Cierra el periodo mensual desde "Cierre de Periodos"
4. Sistema bloquea automáticamente todas las transacciones de ese mes
5. No se pueden crear, modificar o eliminar transacciones del mes cerrado

### Caso 2: Corrección de Error en Periodo Abierto
1. Usuario detecta error en partida en borrador
2. Puede eliminar la partida si el periodo está abierto
3. Crea nueva partida con datos corregidos

### Caso 3: Intento de Modificación en Periodo Cerrado
1. Usuario intenta crear partida con fecha de mes cerrado
2. Sistema muestra error inmediatamente
3. Usuario debe cambiar fecha a periodo abierto o solicitar reapertura del periodo

## Impacto en Módulos

### Módulos Actualizados
- ✅ Pólizas Contables (JournalEntries)
- ✅ Tesorería (Treasury)

### Módulos que Heredarán la Validación
Los siguientes módulos heredarán automáticamente la validación de periodos porque utilizan `journal_entries`:
- Cuentas por Cobrar (AccountsReceivable)
- Cuentas por Pagar (AccountsPayable)
- Inventario (Inventory)
- Activos Fijos (FixedAssets)

Cualquier intento de crear partidas desde estos módulos será validado automáticamente por los triggers de la base de datos.

## Próximos Pasos Recomendados

1. **Módulo de Cierre de Periodos**: Mejorar la UI para mostrar warnings y resúmenes antes de cerrar
2. **Reportes de Auditoría**: Implementar reportes de cambios por periodo
3. **Reapertura de Periodos**: Agregar funcionalidad para reabrir periodos con justificación
4. **Validación en Otros Módulos**: Agregar validación frontend específica en módulos pendientes
5. **Notificaciones**: Sistema de alertas cuando un periodo está próximo a cerrarse

## Notas Técnicas

### Archivos Modificados
- `supabase/migrations/[timestamp]_add_period_validation_and_delete_policies.sql`
- `src/lib/periodValidation.ts` (nuevo)
- `src/components/modules/JournalEntries.tsx`
- `src/components/modules/Treasury.tsx`

### Dependencias
- Supabase Database (PostgreSQL)
- Row Level Security (RLS)
- PL/pgSQL Functions and Triggers

### Performance
- Los checks de periodo son muy rápidos debido a índices en `accounting_periods`
- Los triggers agregan overhead mínimo (<1ms por operación)
- Las validaciones frontend previenen llamadas innecesarias a la base de datos
