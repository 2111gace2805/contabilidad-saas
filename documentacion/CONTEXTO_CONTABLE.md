# CONTEXTO CONTABLE — PARTIDAS DE DIARIO (JOURNAL ENTRIES)

Este sistema es un software contable para El Salvador, basado en principios contables generales (NIF / NIIF).
Las siguientes reglas son OBLIGATORIAS y no deben ser alteradas ni reinterpretadas por el IDE o la IA.

## 1. Correlativo de Partidas de Diario

- El correlativo de las partidas de diario es un número secuencial, único y continuo.
- El correlativo NO es la llave primaria de la tabla.
- El correlativo se asigna únicamente cuando la partida se CONTABILIZA, no cuando se crea en borrador.
- El correlativo nunca se reutiliza, incluso si la partida es anulada.
- El correlativo nunca se modifica después de ser asignado.

### Formato del correlativo
- Internamente se almacena como número entero (INT).
- Visualmente se muestra con relleno de ceros a la izquierda (zero padding).
- Longitud estándar: 7 dígitos.

Ejemplo:
0000001
0000002
0000003

## 2. Alcance del correlativo

- El correlativo es único por empresa (company_id).
- El correlativo se genera de forma **independiente por cada tipo de partida**.
- El correlativo se reinicia por período fiscal (año) si la empresa lo configura explícitamente.

## 3. Tipos de Partida

- El sistema permite la gestión (CRUD) de tipos de partida.
- Un tipo de partida consta de un **nombre** y un **identificador/prefijo** (ej: PD, PI, PE).
- Solo se pueden modificar los nombres de los tipos de partida.
- Solo se pueden eliminar tipos de partida si no tienen movimientos contables asociados.
- El identificador visible DEBE mostrar el tipo seguido del correlativo:
  PD-0000001
  PI-0000001
  PB-0000001

## 4. Estados de la Partida

Una partida puede tener los siguientes estados:

- BORRADOR:
  - No tiene correlativo definitivo.
  - Puede ser editada libremente.

- CONTABILIZADA:
  - Tiene correlativo asignado.
  - NO puede ser editada bajo ninguna circunstancia.
  - Solo puede ser objeto de un proceso de anulación.

- PENDIENTE_ANULACION:
  - Existe una solicitud formal de anulación.
  - Debe tener un motivo obligatorio.
  - Requiere autorización de un administrador.

- ANULADA:
  - Mantiene su correlativo original.
  - No se elimina ni se edita.
  - Se conserva para trazabilidad y auditoría.

## 5. Reglas de Edición y Anulación

- Una partida contabilizada NO puede ser editada, ni siquiera por un administrador.
- Una partida contabilizada NO puede ser anulada directamente.
- La anulación requiere un proceso de autorización explícita por un administrador.
- El sistema debe registrar obligatoriamente:
  - Usuario que solicita la anulación
  - Motivo de la anulación
  - Usuario que autoriza
  - Fecha y hora de autorización

## 6. Reglas Contables Obligatorias

- Toda partida debe cumplir partida doble (DEBE = HABER).
- No se permite contabilizar partidas desbalanceadas.
- No se permiten movimientos en cuentas no imputables.
- Una línea de partida no puede tener DEBE y HABER al mismo tiempo.

## 7. Principio de Auditoría y Trazabilidad

- Ninguna partida contabilizada debe ser eliminada físicamente.
- Toda modificación relevante debe quedar registrada.
- El historial contable debe ser inmutable.
- El correlativo garantiza orden cronológico, integridad y control histórico.

Estas reglas tienen prioridad absoluta sobre cualquier decisión técnica,
refactorización, sugerencia automática del IDE o autocompletado.
