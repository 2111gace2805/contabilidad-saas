# Configuración de Empresa - Sistema Contable

## Resumen
Se ha implementado un módulo completo de configuración de empresa similar a SAP Business One, con pestañas organizadas y todos los campos necesarios para una gestión empresarial completa.

## Características Implementadas

### 1. Base de Datos

#### Nuevos Campos en la Tabla `companies`
- **NRC** (Número de Registro de Comercio)
- **NIT** (Número de Identificación Tributaria)
- **Tipo de Contribuyente**: micro, pequeño, mediano, grande
- **Agente de Retención y Percepción** (checkbox booleano)
- **Municipio**
- **Departamento**
- **Ciudad** (Domicilio)
- **Número Patronal** (Registro de empleador)
- **Teléfono**
- **Actividad o Giro del Negocio**
- **Línea de Dirección 2** (campo adicional)
- **Código Postal**
- **País** (por defecto: El Salvador)

#### Nueva Tabla: `balance_signers`
Tabla para gestionar los firmantes que aparecen en los balances y estados financieros:
- **company_id**: Referencia a la empresa
- **signer_name**: Nombre del firmante
- **position**: Cargo del firmante
- **order_index**: Orden de presentación (1-6)
- **created_at / updated_at**: Auditoría

**Características:**
- Constraint único por empresa y posición
- Políticas RLS restrictivas
- Trigger para actualizar `updated_at` automáticamente
- Máximo 6 firmantes por empresa

### 2. Interfaz de Usuario - Sistema de Pestañas

#### Pestaña 1: Datos de la empresa
Formulario completo con todos los campos organizados de forma lógica:

**Información Fiscal:**
- Nombre de la empresa
- NRC (Número de Registro de Comercio)
- NIT (Número de Identificación Tributaria)

**Tipo de Contribuyente:**
- Radio buttons para: Micro, Pequeño, Mediano, Grande
- Checkbox: Agente de Retención y percepción

**Dirección Completa:**
- Dirección (calle y número)
- Municipio y Departamento
- Ciudad (Domicilio)

**Información Adicional:**
- Número Patronal
- Teléfonos
- Actividad o Giro del Negocio

**Funcionalidad:**
- Botón "Guardar Cambios" al final del formulario
- Validación en tiempo real
- Actualización automática del contexto de empresa
- Feedback visual al guardar

#### Pestaña 2: Firmantes en los balances
Sistema de gestión de firmantes para estados financieros:

**Diseño de Dos Columnas:**
- Columna izquierda: Nombres (6 filas)
- Columna derecha: Cargos (6 filas)
- Numeración automática (1-6)

**Firmantes Típicos:**
1. Representante Legal
2. Contador
3. Auditores Externos
4. Otros firmantes según necesidad

**Funcionalidad:**
- Campos editables en tiempo real
- Permite dejar filas vacías (solo se guardan las que tienen contenido)
- Botón "Guardar Firmantes" independiente
- Eliminación y re-inserción automática al guardar

#### Pestaña 3: Parámetros generales
Configuración general del sistema:

**Parámetros de Solo Lectura:**
- Moneda (MXN por defecto)
- Inicio del Ejercicio Fiscal (mes 1-12)
- RFC / Tax ID

**Parámetros Editables:**
- País (por defecto: El Salvador)

**Nota Informativa:**
Mensaje explicando que ciertos parámetros están bloqueados porque afectan cálculos históricos.

### 3. Lógica de Negocio

#### Carga de Datos
1. Al seleccionar una empresa, se cargan todos sus datos
2. Se fusionan los firmantes existentes con las 6 posiciones disponibles
3. Estado de carga muestra feedback al usuario

#### Guardado de Datos de Empresa
1. Actualiza todos los campos en la tabla `companies`
2. Actualiza el campo `updated_at` con timestamp
3. Recarga el contexto de empresa para actualizar el header
4. Muestra mensaje de éxito
5. Manejo de errores con mensajes claros

#### Guardado de Firmantes
1. Elimina todos los firmantes existentes de la empresa
2. Filtra solo las filas con contenido (nombre o cargo)
3. Inserta los nuevos firmantes con sus posiciones
4. Muestra mensaje de éxito
5. Manejo de errores con mensajes claros

### 4. Seguridad (RLS)

#### Políticas para `companies`
- Los usuarios solo pueden ver y editar empresas donde tienen asignación
- Las actualizaciones verifican membresía en `company_users`

#### Políticas para `balance_signers`
- **SELECT**: Ver firmantes de sus empresas
- **INSERT**: Solo admin y contador pueden agregar
- **UPDATE**: Solo admin y contador pueden modificar
- **DELETE**: Solo admin y contador pueden eliminar
- Todas las políticas verifican `company_users` con roles apropiados

### 5. Diseño y UX

#### Navegación por Pestañas
- Pestañas estilo SAP B1 en la parte superior
- Transición suave entre pestañas
- Resaltado de pestaña activa
- Diseño limpio y profesional

#### Formularios
- Labels descriptivos (usando terminología salvadoreña)
- Placeholders con ejemplos
- Inputs con focus states
- Radio buttons y checkboxes con estilo consistente
- Grid responsive (2 columnas donde tiene sentido)

#### Botones de Acción
- Iconos descriptivos (Save, Building2)
- Estados: normal, hover, disabled
- Feedback de carga ("Guardando...")
- Posicionados al final de cada sección

#### Colores y Estilos
- Esquema de colores neutro (slate)
- Bordes sutiles
- Sombras ligeras
- Focus rings para accesibilidad
- Backgrounds diferenciados para mensajes informativos

### 6. Validaciones y Restricciones

#### A Nivel de Base de Datos
- Check constraints para `taxpayer_type`
- Check constraints para `order_index` (1-6)
- Unique constraint para (company_id, order_index)
- Referencias foráneas con ON DELETE CASCADE

#### A Nivel de Aplicación
- Validación de empresa seleccionada
- Trim de espacios en firmantes antes de guardar
- Filtrado de filas vacías en firmantes
- Manejo de errores con try-catch

### 7. Compatibilidad con SAP B1

#### Similitudes Implementadas
✅ Sistema de pestañas idéntico
✅ Campos de información fiscal (NRC, NIT)
✅ Tipos de contribuyente con radio buttons
✅ Agente de retención como checkbox separado
✅ Sección de firmantes con tabla de 6 filas
✅ Separación entre datos de empresa y parámetros
✅ Campos de ubicación completos
✅ Actividad económica

#### Diferencias (Mejoras)
- Interfaz más moderna y limpia
- Guardado independiente por sección
- Feedback inmediato al usuario
- Responsive design
- Mejor manejo de errores

## Flujo de Uso Típico

### Configuración Inicial de Empresa
1. Usuario accede a "Configuración"
2. Por defecto se muestra pestaña "Datos de la empresa"
3. Completa información fiscal (NRC, NIT)
4. Selecciona tipo de contribuyente
5. Marca si es agente de retención
6. Completa dirección completa
7. Agrega teléfonos y actividad económica
8. Presiona "Guardar Cambios"

### Configuración de Firmantes
1. Usuario cambia a pestaña "Firmantes en los balances"
2. Ingresa nombres y cargos de firmantes
3. Por ejemplo:
   - Fila 1: LETICIA CONCEPCION ESCOBAR REYES | REPRESENTANTE LEGAL
   - Fila 2: CARLOS ERNESTO ALVARADO HERNANDEZ | CONTADOR
   - Fila 3: PRICEWATERHOUSECOOPERS EL SALVADOR | AUDITORES EXTERNOS
4. Deja vacías las filas no necesarias
5. Presiona "Guardar Firmantes"

### Revisión de Parámetros
1. Usuario cambia a pestaña "Parámetros generales"
2. Revisa moneda y ejercicio fiscal (solo lectura)
3. Puede modificar país si es necesario

## Casos de Uso por País

### El Salvador (Implementado)
- NRC: Número de Registro de Comercio
- NIT: Número de Identificación Tributaria
- Agente de Retención y Percepción
- Tipos: Micro, Pequeño, Mediano, Grande

### México (Adaptable)
Mismos campos pueden usarse como:
- NRC → RFC
- NIT → RFC con homoclave
- Similar clasificación de contribuyentes

### Otros Países LATAM
Los campos son suficientemente genéricos para adaptarse a:
- RUT (Chile, Uruguay)
- CUIT (Argentina)
- RUC (Perú, Ecuador)
- CNPJ (Brasil)

## Archivos Modificados

### Base de Datos
- `supabase/migrations/[timestamp]_add_extended_company_fields_and_signers.sql`

### Frontend
- `src/components/modules/Settings.tsx` (reescrito completamente)

## Próximos Pasos Recomendados

1. **Validación de Formatos**: Agregar validación específica para NRC, NIT (formato salvadoreño)
2. **Catálogos**: Implementar catálogos para municipios y departamentos de El Salvador
3. **Logos**: Agregar funcionalidad para subir logo de empresa
4. **Exportación**: Usar datos de firmantes en reportes PDF
5. **Múltiples Direcciones**: Permitir dirección fiscal vs dirección operativa
6. **Contactos**: Sección adicional para contactos de la empresa
7. **Documentos**: Adjuntar documentos legales (escrituras, poderes, etc.)

## Notas Técnicas

### Performance
- Carga lazy de datos (solo cuando se selecciona empresa)
- Guardado optimizado (solo campos modificados conceptualmente)
- Índices en `company_id` para queries rápidas

### Mantenibilidad
- Componente modular con interfaces TypeScript
- Funciones helper separadas (updateCompanyField, updateSigner)
- Código limpio y comentado
- Nombres descriptivos de variables

### Extensibilidad
- Fácil agregar nuevas pestañas
- Campos adicionales solo requieren modificar interfaz y migración
- Sistema de firmantes puede extenderse a más de 6
- Estructura preparada para múltiples idiomas
