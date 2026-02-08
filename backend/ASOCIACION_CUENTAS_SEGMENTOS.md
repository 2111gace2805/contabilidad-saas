# Asociación de Cuentas con Segmentos

## Introducción

El sistema de catálogo contable flexible permite estructurar las cuentas mediante **segmentos** que definen la longitud y organización de los códigos contables. Este documento explica cómo se asocian las cuentas con los segmentos.

---

## Modelo de Asociación

### Relación Indirecta

Las cuentas NO se asocian directamente con un segmento específico. En su lugar:

1. **Los segmentos** definen la estructura de codificación para un **tipo de cuenta**
2. **Las cuentas** pertenecen a un **tipo de cuenta**
3. Por lo tanto, las cuentas heredan la estructura de segmentos de su tipo

```
Tipo de Cuenta (ACTIVO)
    ↓
Segmentos (define estructura)
    - Nivel 1: Clasificación General (1 dígito)
    - Nivel 2: Rubros de Agrupación (2 dígitos)
    - Nivel 3: Mayor (2 dígitos)
    - Nivel 4: Sub Cuenta (6 dígitos)
    ↓
Cuentas (usan la estructura)
    - 1-01-01-000001 "Bancos"
    - 1-01-02-000001 "Clientes"
```

---

## Configuración Estándar

### Paso 1: Crear Tipos de Cuenta

Los tipos de cuenta se crean automáticamente al crear una empresa:

- **ACTIVO** (Naturaleza: Deudora)
- **PASIVO** (Naturaleza: Acreedora)
- **CAPITAL** (Naturaleza: Acreedora)
- **INGRESOS** (Naturaleza: Acreedora)
- **EGRESOS** (Naturaleza: Deudora)
- **COSTOS** (Naturaleza: Deudora)

### Paso 2: Definir Segmentos por Tipo

En el módulo **"Config. Catálogo"**, creas segmentos para cada tipo de cuenta:

#### Ejemplo para ACTIVO:

| Nivel | Nombre | Descripción | Dígitos | Ejemplo |
|-------|---------|-------------|---------|---------|
| 1 | Clasificación General | Tipo de cuenta principal | 1 | 1 |
| 2 | Rubros de Agrupación | Activo Circulante/No Circulante | 2 | 01 |
| 3 | Mayor | Disponibilidades/Derechos | 2 | 01 |
| 4 | Sub Cuenta | Cuenta específica | 6 | 000001 |
| 5 | Detalle | Cuenta analítica (opcional) | 8 | 00000001 |
| 6 | Sub-detalle | Máximo nivel (opcional) | 10 | 0000000001 |

#### Ejemplo para INGRESOS:

| Nivel | Nombre | Descripción | Dígitos | Ejemplo |
|-------|---------|-------------|---------|---------|
| 1 | Clasificación General | Tipo de cuenta principal | 1 | 4 |
| 2 | Categoría Ingresos | Ventas/Servicios/Otros | 2 | 01 |
| 3 | Sub-categoría | Por producto/línea | 2 | 01 |
| 4 | Detalle | Cuenta específica | 4 | 0001 |

### Paso 3: Crear Cuentas usando la Estructura

Una vez definidos los segmentos, creas cuentas en **"Catálogo Contable"**:

#### Ejemplo de cuenta ACTIVO:

```
Código: 1-01-01-000001
Nombre: Bancos - Santander Cta. Cheques
Tipo: ACTIVO
Cuenta de Detalle: Sí

Desglose del código:
- 1        → Nivel 1: ACTIVO
- 01       → Nivel 2: Activo Circulante
- 01       → Nivel 3: Disponibilidades
- 000001   → Nivel 4: Bancos Santander
```

#### Ejemplo de cuenta INGRESOS:

```
Código: 4-01-01-0001
Nombre: Ventas Producto A
Tipo: INGRESOS
Cuenta de Detalle: Sí

Desglose del código:
- 4        → Nivel 1: INGRESOS
- 01       → Nivel 2: Ventas
- 01       → Nivel 3: Producto A
- 0001     → Nivel 4: Cuenta específica
```

---

## Cómo Funcionan los Segmentos

### 1. Los Segmentos Son Plantillas

Los segmentos definen **cómo se debe estructurar el código**, pero no son cuentas en sí mismos:

- ✅ **Correcto**: Segmento "Activo Circulante" define que usa 2 dígitos en nivel 2
- ❌ **Incorrecto**: El segmento NO es una cuenta, es solo una definición de estructura

### 2. Flexibilidad por Tipo de Cuenta

Cada tipo de cuenta puede tener su propia estructura de segmentos:

```
ACTIVO:    1-01-01-000001      (4 niveles, 11 dígitos)
PASIVO:    2-01-01-000001      (4 niveles, 11 dígitos)
INGRESOS:  4-01-01-0001        (4 niveles, 8 dígitos)
```

### 3. Verificación al Crear Cuentas

Cuando creas una cuenta en **"Catálogo Contable"**:

1. Seleccionas un **Tipo de Cuenta**
2. El sistema muestra los **segmentos disponibles** para ese tipo
3. Introduces el código siguiendo la estructura de segmentos
4. La cuenta se crea con esa estructura

---

## Ayuda Visual en la Aplicación

### En el Módulo "Catálogo Contable"

Al crear una cuenta, ahora verás:

1. **Botón "Ver estructura de segmentos"**: Muestra los segmentos disponibles
2. **Panel informativo**: Lista todos los niveles con sus longitudes
3. **Ejemplo visual**: Te guía sobre cómo construir el código

#### Ejemplo de la ayuda visual:

```
Estructura de Segmentos Disponibles:

1. Clasificación General (1 dígitos)
   Tipo de cuenta principal

2. Rubros de Agrupación (2 dígitos)
   Activo Circulante o No Circulante

3. Mayor (2 dígitos)
   Disponibilidades, Derechos, etc.

4. Sub Cuenta (6 dígitos)
   Cuenta específica de movimientos
```

---

## Casos de Uso

### Caso 1: Empresa Pequeña

**Estructura Simple (3 niveles):**

```
Tipo: 1 dígito
Mayor: 2 dígitos
Detalle: 4 dígitos

Ejemplos:
- 1-01-0001 "Caja General"
- 1-02-0001 "Bancos Santander"
- 4-01-0001 "Ventas Mostrador"
```

### Caso 2: Empresa Mediana

**Estructura Estándar (4 niveles):**

```
Tipo: 1 dígito
Rubro: 2 dígitos
Mayor: 2 dígitos
Detalle: 6 dígitos

Ejemplos:
- 1-01-01-000001 "Caja General"
- 1-01-02-000001 "Bancos Santander"
- 2-01-01-000001 "Proveedores Nacionales"
```

### Caso 3: Empresa Grande

**Estructura Compleja (6 niveles):**

```
Tipo: 1 dígito
Rubro: 2 dígitos
Mayor: 2 dígitos
Sub-cuenta: 6 dígitos
Detalle: 8 dígitos
Analítica: 10 dígitos

Ejemplos:
- 1-01-01-000001-00000001-0000000001 "Banco Santander Sucursal Centro"
- 4-01-01-000001-00000001-0000000001 "Ventas Producto A - Región Norte"
```

---

## Configuración Recomendada

### Para Comenzar

Si estás iniciando tu catálogo contable:

1. **Ve a "Config. Catálogo"**
2. **Define 4 niveles básicos** para cada tipo de cuenta:
   - Nivel 1: Tipo (1 dígito)
   - Nivel 2: Rubro (2 dígitos)
   - Nivel 3: Mayor (2 dígitos)
   - Nivel 4: Detalle (4-6 dígitos)

3. **Prueba con algunas cuentas** en "Catálogo Contable"
4. **Ajusta según necesidad** agregando más niveles si es necesario

### Ejemplo de Configuración Inicial

Ejecuta el script `INICIALIZAR_SEGMENTOS.sql` que crea automáticamente:

- 6 niveles de segmentos
- Estructura flexible
- Compatible con NIF
- Listo para usar

---

## Preguntas Frecuentes

### ¿Puedo cambiar los segmentos después de crear cuentas?

Sí, pero ten cuidado:
- ✅ Agregar nuevos segmentos: Sin problema
- ⚠️ Modificar segmentos existentes: Puede afectar la consistencia
- ❌ Eliminar segmentos: No recomendado si ya hay cuentas

### ¿Las cuentas deben seguir estrictamente los segmentos?

Recomendado: Sí, para mantener consistencia
Obligatorio: No, puedes usar cualquier código que necesites

### ¿Puedo tener diferentes estructuras para diferentes empresas?

¡Sí! Cada empresa tiene su propia configuración de segmentos completamente independiente.

### ¿Qué pasa si no configuro segmentos?

Puedes crear cuentas libremente con cualquier código. Los segmentos son una guía, no un requisito obligatorio.

---

## Resumen

1. **Segmentos = Plantilla de estructura** (no son cuentas)
2. **Cuentas = Registros reales** que usan la estructura de segmentos
3. **Asociación indirecta** mediante el tipo de cuenta
4. **Flexible y parametrizable** para cualquier necesidad
5. **Ayuda visual** disponible al crear cuentas

¡Tu catálogo, tu estructura! 🎯
