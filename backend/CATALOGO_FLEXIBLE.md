# Catálogo Contable Flexible - Guía Completa

## Qué es el Catálogo Flexible

El sistema permite que **CADA EMPRESA** configure su propia estructura de catálogo contable sin limitaciones. No es un catálogo "canned" - es completamente personalizable según las necesidades específicas de tu negocio.

---

## 3 Capas del Catálogo

### 1️⃣ **Tipos de Cuenta** (Account Types)
Son las 6 categorías básicas según NIF:
- **ACTIVO** (deudora) - Afecta Balance General
- **PASIVO** (acreedora) - Afecta Balance General
- **CAPITAL** (acreedora) - Afecta Balance General
- **INGRESOS** (acreedora) - Afecta Estado de Resultados
- **EGRESOS** (deudora) - Afecta Estado de Resultados
- **COSTOS** (deudora) - Afecta Estado de Resultados

**Inicialización:**
- Se crean automáticamente cuando creas una empresa
- Si no aparecen, ejecuta el script `INICIALIZAR_TIPOS_CUENTA.sql`

---

### 2️⃣ **Segmentos Contables** (Accounting Segments)
Son **niveles estructurales** que definen cómo se organizan las cuentas contables.

**Estructura Básica de Segmentos (6 Niveles):**

1. **Nivel 1 - Clasificación General** (1 dígito)
   - Ejemplo: 1, 2, 3, 4, 5, 6

2. **Nivel 2 - Rubros de Agrupación** (2 dígitos)
   - Ejemplo: 01, 02, 03

3. **Nivel 3 - Mayor** (2 dígitos)
   - Ejemplo: 01, 02, 03

4. **Nivel 4 - Sub Cuenta** (6 dígitos)
   - Ejemplo: 000001, 000002

5. **Nivel 5 - Cuentas de Detalle** (8 dígitos)
   - Ejemplo: 00000001, 00000002

6. **Nivel 6 - Cuenta Analítica** (10 dígitos)
   - Ejemplo: 0000000001, 0000000002

**Ejemplo de Código Completo:**
- Nivel 1: `1` (Activo)
- Nivel 2: `01` (Circulante)
- Nivel 3: `01` (Disponibilidades)
- Nivel 4: `000001` (Bancos)
- Nivel 5: `00000001` (Banco Santander)
- Nivel 6: `0000000001` (Cuenta Cheques 12345)

**Características:**
- ✅ Completamente personalizable
- ✅ Cada empresa tiene su propia estructura
- ✅ Cada nivel define su longitud de dígitos
- ✅ Orden de presentación configurable
- ✅ Descripciones opcionales

**Inicialización:**
- Se pueden crear manualmente en "Config. Catálogo"
- O ejecutar el script `INICIALIZAR_SEGMENTOS.sql` para estructura básica

**Dónde se configuran:**
- Módulo: **"Config. Catálogo"**
- Ahí creas los segmentos y defines su estructura

---

### 3️⃣ **Cuentas Contables** (Accounts)
Son las **cuentas específicas** donde se registran los movimientos.

**Ejemplos:**
- 1101 - Bancos
- 1102 - Clientes
- 1103 - Inventarios
- 2101 - Proveedores
- 3101 - Capital Social

**Características:**
- Deben estar marcadas como "cuenta de detalle" para usarse en pólizas
- Se vinculan a un segmento (indirectamente por tipo)
- Solo las cuentas de detalle aparecen en los asientos

**Dónde se crean:**
- Módulo: **"Catálogo Contable"**
- Creas aquí DESPUÉS de configurar los segmentos

---

## Flujo Recomendado de Configuración

### Paso 1: Inicializar Tipos de Cuenta y Segmentos (Una sola vez)
```
1. Crea tu empresa en "Empresas"
2. Ve a Supabase SQL Editor
3. Ejecuta INICIALIZAR_TIPOS_CUENTA.sql
4. Ejecuta INICIALIZAR_SEGMENTOS.sql (opcional, para estructura básica)
5. Verifica que se crearon correctamente
```

### Paso 2: Configurar Segmentos (Config. Catálogo)
```
1. Ve a "Config. Catálogo"
2. Clic en "Nuevo Segmento"
3. Define tu estructura:
   - Segmentos Principales (nivel 1): ACTIVO, PASIVO, etc.
   - Subsegmentos (nivel 2): Circulante, No Circulante, etc.
4. Define orden de presentación (importante para reportes)
```

**Ejemplo: Estructura Minorista**

```
ACTIVO (Tipo)
├─ 1000 - Activo Circulante (Segmento)
│  ├─ 1100 - Disponibilidades (Subsegmento)
│  ├─ 1200 - Derechos Corto Plazo (Subsegmento)
│  └─ 1300 - Inventarios (Subsegmento)
└─ 2000 - Activo No Circulante (Segmento)
   ├─ 2100 - Propiedades (Subsegmento)
   └─ 2200 - Equipo (Subsegmento)

PASIVO (Tipo)
├─ 2000 - Pasivo Circulante (Segmento)
│  ├─ 2100 - Proveedores (Subsegmento)
│  └─ 2200 - Obligaciones Corto Plazo (Subsegmento)
└─ 3000 - Pasivo No Circulante (Segmento)
   └─ 3100 - Deudas Largo Plazo (Subsegmento)
```

### Paso 3: Crear Cuentas Detalle (Catálogo Contable)
```
1. Ve a "Catálogo Contable"
2. Clic en "Nueva Cuenta"
3. Para cada cuenta de detalle:
   - Código: 1101
   - Nombre: Bancos
   - Tipo: ACTIVO
   - Marca "Cuenta de detalle" ✓
```

---

## Ejemplos de Estructuras por Industria

### Estructura Estándar NIF Simple

```
ACTIVO
├─ 1100 Activo Circulante
│  ├─ 1101 Bancos
│  ├─ 1102 Clientes
│  └─ 1103 Inventarios
└─ 1200 Activo Fijo
   ├─ 1201 Equipo Oficina
   └─ 1202 Vehículos

PASIVO
├─ 2100 Pasivo Circulante
│  ├─ 2101 Proveedores
│  └─ 2102 Gastos por Pagar
└─ 2200 Pasivo Fijo
   └─ 2201 Préstamos LP

CAPITAL
├─ 3100 Capital
│  ├─ 3101 Capital Social
│  └─ 3102 Utilidades Acum.

INGRESOS
└─ 4100 Ventas
   ├─ 4101 Ventas Producto A
   └─ 4102 Ventas Servicio

EGRESOS
├─ 5100 Gastos Operación
│  ├─ 5101 Sueldos
│  └─ 5102 Renta
└─ 5200 Gastos Financieros
   └─ 5201 Intereses

COSTOS
└─ 6100 Costo de Ventas
   ├─ 6101 Material Directo
   └─ 6102 Mano Obra Directa
```

### Estructura Comercio Electrónico

```
ACTIVO
├─ Activo Circulante
│  ├─ Efectivo (Bancos, PayPal, Stripe)
│  ├─ Clientes por Cobrar
│  └─ Inventarios (SKU por categoría)
└─ Activo Fijo
   ├─ Servidores
   └─ Equipos Oficina

PASIVO
├─ Pasivo Circulante
│  ├─ Proveedores
│  ├─ Reembolsos Pendientes
│  └─ Impuestos por Pagar
└─ Pasivo Financiero
   └─ Créditos

CAPITAL
└─ Capital Social y Utilidades

INGRESOS
├─ Ventas Producto
├─ Ventas Digital
├─ Comisiones
└─ Otros Ingresos

EGRESOS
├─ Costo Logística
├─ Costo Hosting
├─ Marketing
└─ Comisiones Pago

COSTOS
└─ Costo Directo Inventario
```

### Estructura Servicios Profesionales

```
ACTIVO
├─ Activo Circulante
│  ├─ Bancos
│  ├─ Clientes (por tipo de cliente)
│  └─ Anticipo Impuestos
└─ Activo Fijo
   ├─ Equipos Computación
   └─ Muebles

PASIVO
├─ Obligaciones Laborales
├─ Impuestos por Pagar
└─ Otras Obligaciones

CAPITAL
└─ Capital y Ganancias

INGRESOS
├─ Honorarios Servicios
├─ Asesorías
└─ Capacitaciones

EGRESOS
├─ Gastos Personal
├─ Gastos Administrativos
└─ Gastos Comerciales
```

---

## Mejores Prácticas

### ✅ HACER:
1. **Usa códigos significativos**: 1000 para Activo, 2000 para Pasivo, etc.
2. **Agrupa por naturaleza**: Circulante/No Circulante, Operacional/Financiero
3. **Define orden claro**: Usa números secuenciales para orden de presentación
4. **Documenta segmentos**: Describe qué va en cada segmento
5. **Cuidado con profundidad**: Máximo 3-4 niveles de profundidad
6. **Estandariza dentro de la empresa**: Todas las sucursales usan misma estructura

### ❌ EVITAR:
1. Estructuras demasiado profundas (más de 4 niveles)
2. Cambios frecuentes de estructura (afecta continuidad)
3. Cuentas genéricas sin clasificación clara
4. Código sin patrón (1001, 5234, 9999 mezclados)
5. Olvida marcar cuentas como "detalle"

---

## Cambiar la Estructura Después de Operaciones

**⚠️ IMPORTANTE:**
- Puedes crear NUEVOS segmentos en cualquier momento
- Puedes agregar NUEVAS cuentas sin problema
- **EVITA eliminar** segmentos/cuentas que ya tienen movimientos
- Si necesitas cambiar código: renombra y crea nuevo

---

## Reportes y Estructura

Los reportes respetan tu estructura:

- **Balance General**: Agrupa por tu estructura de segmentos
- **Estado de Resultados**: Muestra ingresos - egresos respetando agrupaciones
- **Balanza de Comprobación**: Lista todas las cuentas con sus saldos

---

## Exportar/Importar Estructura

Para llevar la estructura a otra empresa:
1. Copia los segmentos de la empresa 1
2. Crea manualmente en empresa 2 (no hay importación automática aún)

---

¡Tu estructura, tu manera! 🎯
