# Reglas Contables e Inmutabilidad (Developer Context)

Este documento define las reglas críticas de inmutabilidad y el flujo de anulación implementado en el sistema.

## 1. Inmutabilidad de Pólizas
Una vez que una póliza de diario (Journal Entry) pasa al estado **POSTED (Contabilizada)**, se vuelve estrictamente **inmutable**.

- **No se puede editar**: Cualquier intento de actualizar campos a través de la API devolverá un error 403/400.
- **No se puede eliminar**: Las pólizas contabilizadas no pueden ser borradas de la base de datos para mantener la integridad de la auditoría.

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
