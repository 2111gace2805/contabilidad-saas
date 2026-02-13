# Flujo de Trabajo de Pólizas Contables

## Problema Resuelto

Anteriormente, todas las pólizas se creaban directamente como **"Contabilizadas"** (status: `posted`), lo que impedía:
- Editar pólizas después de crearlas
- Eliminar pólizas si había errores
- Revisar y aprobar antes de afectar la contabilidad

## Solución Implementada

Ahora las pólizas siguen un flujo de trabajo de 3 estados:

### 1. Borrador (draft)
- **Estado inicial** al crear una póliza
- Se puede editar
- Se puede eliminar
- **NO afecta** los saldos contables
- **NO aparece** en reportes oficiales
- Cada partida incluye un **correlativo** generado automáticamente, pero el usuario puede editarlo si lo desea.
- **Soporte para múltiples líneas:**
  - Cada partida puede incluir múltiples detalles de cuentas (líneas).
  - Cada línea debe especificar:
    - **Cuenta contable** (obligatoria)
    - **Descripción** (opcional)
    - **Débito** o **Crédito** (obligatorio, al menos uno debe ser mayor a 0).
  - El sistema valida automáticamente que la suma de débitos sea igual a la suma de créditos antes de permitir contabilizar la póliza.

- **Autocompletado de cuentas (UX):**
  - En la pantalla **Nueva Póliza** el campo de cuenta ahora es un **campo de texto con autocompletado**.
  - El usuario puede escribir código o nombre de cuenta y el sistema mostrará sugerencias dinámicas (soporta navegación por teclado y selección con Enter).
  - Al seleccionar una sugerencia se rellena la cuenta y se guarda su `account_id`.
  - El modal de creación se ha ampliado para mejorar la visualización (`max-width` aumentado) y mostrar claramente código y nombre de cuenta.

- **Validación de líneas:**
  - No se permite guardar una póliza que contenga líneas sin **cuenta seleccionada**.
  - En el modal, las líneas sin cuenta se marcarán con un mensaje de error y se impedirá el guardado hasta que se seleccione una cuenta para cada línea.
  - El servidor también valida `lines.*.account_id` (campo obligatorio), por lo que si el cliente omitiera la validación el backend devolvería 422 con los errores correspondientes.

### 2. Contabilizada (posted)
- Estado después de aprobar un borrador
- **Regla actualizada:**
- **SÍ se puede editar** siempre y cuando el periodo fiscal donde se encuentra la fecha de la póliza esté **ABIERTO**. Si el periodo está **CERRADO**, no se permite la edición.
- **No se puede revertir a borrador** si la póliza ya tiene asignado un número/correlativo (sequence_number / entry_number). En ese caso la póliza debe permanecer contabilizada y solo podrá anularse (void) si procede.
- **NO se puede eliminar**
- **SÍ afecta** los saldos contables
- **SÍ aparece** en reportes oficiales
- Se puede **anular** si hay errores

### 3. Anulada (void)
- Estado después de anular una póliza contabilizada
- **NO se puede editar**
- **NO se puede eliminar**
- **NO afecta** los saldos contables (se revierte)
- Permanece visible con marca de "Anulada"

## Flujo Visual

```
┌─────────────┐
│   CREAR     │
│   PÓLIZA    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│  BORRADOR   │─────▶│   ELIMINAR   │
│   (draft)   │      └──────────────┘
└──────┬──────┘
       │
       │ Contabilizar
       ▼
┌─────────────┐
│CONTABILIZADA│
│  (posted)   │
└──────┬──────┘
       │
       │ Anular
       ▼
┌─────────────┐
│   ANULADA   │
│   (void)    │
└─────────────┘
```

## Acciones Disponibles por Estado

### Borrador
| Acción | Disponible | Icono | Color |
|--------|-----------|-------|-------|
| Ver detalles | ✅ | - | - |
| Editar | ✅ | ✏️ | Azul |
| Contabilizar | ✅ | ✓ | Verde |
| Eliminar | ✅ | 🗑️ | Rojo |
| Anular | ❌ | - | - |
| Agregar detalles de cuentas | ✅ | ➕ | Verde |

### Contabilizada
| Acción | Disponible | Icono | Color |
|--------|-----------|-------|-------|
| Ver detalles | ✅ | - | - |
| Editar | ✅ (solo si el periodo fiscal está ABIERTO) | ✏️ | Azul |
| Contabilizar | ❌ (botón inhabilitado si ya está contabilizada; solo disponible en `Borrador`) | - | - |
| Eliminar | ❌ | - | - |
| Anular | ✅ | ⊗ | Naranja |

### Anulada
| Acción | Disponible | Icono | Color |
|--------|-----------|-------|-------|
| Ver detalles | ✅ | - | - |
| Editar | ❌ | - | - |
| Contabilizar | ❌ | - | - |
| Eliminar | ❌ | - | - |
| Anular | ❌ | - | - |

## Cambios Realizados

### 1. Código Frontend (JournalEntries.tsx)

#### Creación de Pólizas (Línea 155)
**Antes:**
```typescript
status: 'posted',
posted_at: new Date().toISOString(),
```

**Después:**
```typescript
status: 'draft',
// No se establece posted_at hasta contabilizar
```

#### Nuevas Funciones

**handlePost()** - Contabilizar una póliza en borrador:
```typescript
const handlePost = async (entry: JournalEntry) => {
  // Validaciones:
  // - Solo pólizas en borrador
  // - Periodo no cerrado
  // - Confirmación del usuario

  // Actualiza:
  status: 'posted',
  posted_at: timestamp,
  posted_by: user_id
}
```

**handleVoid()** - Anular una póliza contabilizada:
```typescript
const handleVoid = async (entry: JournalEntry) => {
  // Validaciones:
  // - Solo pólizas contabilizadas
  // - Periodo no cerrado
  // - Confirmación del usuario

  // Actualiza:
  status: 'void',
  voided_at: timestamp,
  voided_by: user_id
}
```

#### Botones Dinámicos en la Tabla

**Estado: Borrador**
- ✅ Botón verde "Contabilizar" (CheckCircle)
- 🗑️ Botón rojo "Eliminar" (Trash2)

**Estado: Contabilizada**
- ⊗ Botón naranja "Anular" (XCircle)

**Estado: Anulada**
- ⚠️ Icono gris informativo (AlertCircle)

### 2. Mensajes y Notificaciones

#### En el Modal de Creación
```
Nota: La póliza se guardará como borrador.
Podrás revisarla y contabilizarla más tarde desde la lista de pólizas.
```

#### Al Contabilizar
```
¿Contabilizar la póliza "P-001"?

Una vez contabilizada:

  - La póliza permanece contabilizada; **no se puede eliminar**.
  - **Editar:** permitido solo si la fecha de la póliza está dentro de un **periodo fiscal abierto** y la partida resultante queda **cuadrada**; en ese caso el frontend permitirá guardar cambios pero el backend validará el periodo y el balance.
  - **Revertir a borrador NO está permitido** si la póliza ya tiene un `type_number`/`entry_number` asignado (el `entry_number` usa el formato `TIPO-0000001`, p.ej. `PD-0000001`).
```

#### Al Anular
```
¿Anular la póliza "P-001"?

Esta acción marcará la póliza como anulada y se revertirán sus efectos contables.
```

## Validaciones de Seguridad

### Todas las Acciones Verifican:
1. **Periodo Contable Cerrado**: No se permite ninguna operación
2. **Estado Correcto**: Cada acción solo se ejecuta en el estado apropiado
3. **Confirmación del Usuario**: Diálogos antes de acciones irreversibles

### Mensajes de Error Comunes:

**Periodo Cerrado:**
```
No se puede [acción] esta póliza porque el periodo contable está cerrado.
```

**Estado Incorrecto:**
```
Solo se pueden [acción] pólizas en [estado].
```

## Casos de Uso

### Caso 1: Crear y Contabilizar Inmediatamente
1. Usuario crea nueva póliza
2. Llena los movimientos
3. Guarda como borrador ✅
4. Inmediatamente presiona "Contabilizar" ✅
5. Póliza queda contabilizada

### Caso 2: Revisar Antes de Contabilizar
1. Usuario crea nueva póliza al final del día
2. Guarda como borrador ✅
3. Al día siguiente revisa la lista
4. Verifica que todo esté correcto
5. Presiona "Contabilizar" ✅
6. Póliza queda contabilizada

### Caso 3: Corregir Error en Borrador
1. Usuario crea nueva póliza
2. Se da cuenta de un error
3. Presiona "Eliminar" 🗑️
4. Crea nueva póliza correcta
5. Contabiliza ✅

### Caso 4: Corregir Error en Póliza Contabilizada
1. Póliza ya está contabilizada
2. Se detecta error grave
3. Usuario presiona "Anular" ⊗
4. Póliza queda anulada (reversión contable)
5. Crea nueva póliza con datos correctos
6. Contabiliza la nueva ✅

### Caso 5: Intento de Eliminar Póliza Contabilizada
1. Usuario intenta eliminar póliza contabilizada
2. Sistema muestra mensaje: "Solo se pueden eliminar pólizas en borrador"
3. Botón de eliminar no está disponible
4. Usuario debe usar "Anular" en su lugar

## Campos de Auditoría

### En la Tabla `journal_entries`:

**Creación:**
- `created_at` - timestamp automático
- `created_by` - user_id del creador

**Contabilización:**
- `posted_at` - timestamp cuando se contabiliza
- `posted_by` - user_id quien contabilizó

**Anulación:**
- `voided_at` - timestamp cuando se anula
- `voided_by` - user_id quien anuló

## Colores y Badges

### Estados Visuales:
- **Borrador**: Badge azul claro (`bg-blue-100 text-blue-800`)
- **Contabilizada**: Badge verde (`bg-green-100 text-green-800`)
- **Anulada**: Badge rojo (`bg-red-100 text-red-800`)

### Botones de Acción:
- **Contabilizar**: Verde (`text-green-600`)
- **Anular**: Naranja (`text-orange-600`)
- **Eliminar**: Rojo (`text-red-600`)

## Próximas Mejoras Recomendadas

### 1. Edición de Borradores
Permitir editar pólizas en estado borrador antes de contabilizarlas:
- Botón "Editar" junto a "Contabilizar" y "Eliminar"
- Abrir modal con datos pre-cargados
- Actualizar en lugar de insertar

### 2. Aprobación Multi-Nivel
Para empresas que requieren múltiples aprobaciones:
- Estado adicional: `pending_approval`
- Roles: Creador → Revisor → Autorizador
- Flujo: draft → pending → posted

### 3. Pólizas Recurrentes
Plantillas para pólizas que se repiten cada mes:
- Guardar como plantilla
- Aplicar plantilla con nueva fecha
- Ajustar montos automáticamente

### 4. Notas y Comentarios
Agregar campo de notas para documentar:
- Razón de la póliza
- Documentos de respaldo
- Aprobaciones verbales

### 5. Histórico de Cambios
Tabla de auditoría con:
- Qué cambió
- Quién lo cambió
- Cuándo lo cambió
- Razón del cambio

### 6. Contabilización Masiva
Contabilizar múltiples borradores a la vez:
- Checkboxes para seleccionar
- Botón "Contabilizar seleccionadas"
- Validación individual
- Reporte de éxitos/errores

### 7. Exportación
Exportar pólizas a diferentes formatos:
- PDF para impresión
- Excel para análisis
- XML para SAT/autoridades fiscales
- Integración con otros sistemas

## Integración con Periodos Contables

Las validaciones de periodo se aplican a:
- ✅ Crear póliza (puede crear en periodo abierto)
- ✅ Contabilizar póliza (solo en periodo abierto)
- ✅ Anular póliza (solo en periodo abierto)
- ✅ Eliminar borrador (solo en periodo abierto)

**Nota:** Si un periodo se cierra con borradores sin contabilizar:
- Los borradores permanecen como borradores
- No se pueden contabilizar (periodo cerrado)
- Se pueden eliminar (son borradores)
- Recomendación: Contabilizar o eliminar antes de cerrar periodo

## Reportes y Consultas

### En Reportes Contables:
- **Balance General**: Solo pólizas con `status = 'posted'`
- **Estado de Resultados**: Solo pólizas con `status = 'posted'`
- **Libro Diario**: Solo pólizas con `status = 'posted'`
- **Libro Mayor**: Solo pólizas con `status = 'posted'`

### En Consultas Especiales:
- **Pólizas Pendientes**: Solo `status = 'draft'`
- **Pólizas Anuladas**: Solo `status = 'void'` (para auditoría)
- **Todas las Pólizas**: Incluye todos los estados (para administración)

### Filtros Recomendados:
```sql
-- Solo contabilizadas (para reportes oficiales)
WHERE status = 'posted'

-- Borradores pendientes (para revisión)
WHERE status = 'draft'

-- Anuladas (para auditoría)
WHERE status = 'void'

-- Activas (para cálculos)
WHERE status IN ('posted')
-- Nota: Las anuladas NO se incluyen porque ya están revertidas
```

## Conclusión

El nuevo flujo de trabajo proporciona:
- ✅ **Flexibilidad**: Crear y revisar antes de contabilizar
- ✅ **Seguridad**: No se pueden eliminar pólizas contabilizadas
- ✅ **Auditoría**: Registro completo de quién y cuándo
- ✅ **Control**: Estados claros y transiciones validadas
- ✅ **Corrección**: Posibilidad de anular y crear nuevas
- ✅ **Usabilidad**: Iconos y colores intuitivos

Este flujo es similar a sistemas profesionales como SAP Business One, donde:
1. Se crean documentos en borrador
2. Se revisan y aprueban
3. Se contabilizan para afectar libros
4. Se anulan solo cuando es necesario (no se eliminan)
