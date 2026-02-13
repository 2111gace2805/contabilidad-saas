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
