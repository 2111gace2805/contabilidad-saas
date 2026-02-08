# Estructura del Menú Reorganizado

## Descripción General

El menú lateral ha sido reorganizado en 5 secciones lógicas para mejorar la navegación y claridad del sistema.

## Secciones del Menú

### 1. **GENERAL**
Funciones principales y gestión de empresas.

| Módulo | Descripción |
|--------|-------------|
| Panel | Dashboard principal con resumen de información |
| Empresas | Gestión de empresas del usuario |

### 2. **CONTABILIDAD**
Módulos core del sistema contable (siempre activos).

| Módulo | Descripción |
|--------|-------------|
| Catálogo Contable | Gestión del plan de cuentas |
| Pólizas/Asientos | Registro de partidas contables |
| Reportes | Estados financieros y reportes contables |

### 3. **OPERACIONES**
Módulos operacionales que pueden activarse/desactivarse según las necesidades de la empresa.

| Módulo | Descripción | Activable |
|--------|-------------|-----------|
| Cuentas por Cobrar | Gestión de facturas y cobros | ✅ |
| Cuentas por Pagar | Gestión de facturas y pagos | ✅ |
| Tesorería | Control de caja, bancos y flujo de efectivo | ✅ |
| Activo Fijo | Gestión y depreciación de activos | ✅ |
| Inventario | Control de existencias | ✅ |
| Clientes | Catálogo de clientes | ✅ |
| Proveedores | Catálogo de proveedores | ✅ |

### 4. **ADMINISTRACIÓN**
Configuración y parámetros del sistema contable.

| Módulo | Descripción |
|--------|-------------|
| Tipos de Cuenta | Clasificación de cuentas (Activo, Pasivo, etc.) |
| Config. Catálogo | Estructura de segmentos del catálogo flexible |
| Períodos Contables | Apertura y cierre de períodos fiscales |
| Gestión de Módulos | Activación/desactivación de módulos |

### 5. **SISTEMA**
Configuraciones generales de la empresa.

| Módulo | Descripción |
|--------|-------------|
| Configuración | Datos de empresa, firmantes y parámetros generales |

## Gestión de Módulos

### Nuevo Módulo: Gestión de Módulos

Ubicación: **Administración > Gestión de Módulos**

Este nuevo módulo permite activar o desactivar módulos operacionales según las necesidades de cada empresa.

#### Características

**Módulos Siempre Activos:**
- Panel
- Empresas
- Catálogo Contable
- Pólizas/Asientos
- Reportes
- Toda la sección de Administración
- Configuración

**Módulos Activables:**
- Cuentas por Cobrar
- Cuentas por Pagar
- Tesorería
- Activo Fijo
- Inventario
- Clientes
- Proveedores

#### Funcionalidad

1. **Vista de Módulos**
   - Organización en dos categorías: Operacionales y Administrativos
   - Cada módulo muestra:
     - Icono identificativo
     - Nombre del módulo
     - Descripción breve
     - Switch de activación/desactivación

2. **Estados Visuales**
   - **Activo**: Fondo blanco, borde normal, switch verde
   - **Inactivo**: Fondo gris claro, borde tenue, switch gris

3. **Persistencia**
   - Configuración guardada por empresa en tabla `company_modules`
   - Cambios se aplican al guardar con botón "Guardar Configuración"

4. **Efecto en el Menú**
   - Módulos desactivados NO aparecen en el menú lateral
   - Ayuda a mantener el menú limpio y enfocado
   - Cada empresa puede tener su propia configuración

#### Base de Datos

**Tabla: `company_modules`**

```sql
CREATE TABLE company_modules (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies(id),
  module_id text NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, module_id)
);
```

**Políticas RLS:**
- Los usuarios solo pueden ver/modificar módulos de sus empresas
- Protección mediante `company_users`

## Beneficios de la Reorganización

### 1. Claridad Organizacional
- Agrupación lógica por función
- Fácil identificación de módulos
- Reducción de sobrecarga cognitiva

### 2. Navegación Mejorada
- Separadores visuales entre secciones
- Títulos de sección descriptivos
- Estructura jerárquica clara

### 3. Flexibilidad
- Empresas solo ven los módulos que necesitan
- Menú más limpio y enfocado
- Fácil expansión futura

### 4. Profesionalismo
- Organización tipo ERP empresarial
- Interfaz limpia y moderna
- Experiencia de usuario mejorada

## Diseño Visual

### Elementos del Menú

**Títulos de Sección:**
- Texto en mayúsculas
- Color gris claro (`text-slate-400`)
- Tamaño pequeño (`text-xs`)
- Espaciado superior para separación

**Separadores:**
- Línea horizontal entre secciones
- Color gris oscuro (`border-slate-700`)
- Solo visible cuando el menú está expandido

**Items del Menú:**
- Icono a la izquierda
- Texto descriptivo
- Fondo oscuro al estar activo
- Hover effect suave

**Modo Colapsado:**
- Solo iconos visibles
- Tooltips al hacer hover
- Sin títulos de sección
- Sin separadores

## Casos de Uso

### Empresa Pequeña (Solo Contabilidad Básica)

**Módulos Activos:**
- General: Panel, Empresas
- Contabilidad: Catálogo, Pólizas, Reportes
- Administración: Todos
- Sistema: Configuración

**Módulos Desactivados:**
- Todas las operaciones (CxC, CxP, Tesorería, etc.)

### Empresa Mediana (Contabilidad + CxC/CxP)

**Módulos Activos:**
- General: Panel, Empresas
- Contabilidad: Catálogo, Pólizas, Reportes
- Operaciones: CxC, CxP, Clientes, Proveedores
- Administración: Todos
- Sistema: Configuración

**Módulos Desactivados:**
- Tesorería, Activo Fijo, Inventario

### Empresa Grande (ERP Completo)

**Módulos Activos:**
- Todos los módulos disponibles

**Módulos Desactivados:**
- Ninguno

## Mantenimiento y Expansión

### Agregar Nuevos Módulos

Para agregar un nuevo módulo al sistema:

1. **Actualizar `Sidebar.tsx`:**
```typescript
{
  title: 'Sección',
  items: [
    {
      id: 'nuevo-modulo',
      label: 'Nuevo Módulo',
      icon: IconName
    }
  ]
}
```

2. **Crear componente del módulo:**
```typescript
// src/components/modules/NuevoModulo.tsx
export function NuevoModulo() {
  // Implementación
}
```

3. **Actualizar `App.tsx`:**
```typescript
import { NuevoModulo } from './components/modules/NuevoModulo';

// En el switch:
case 'nuevo-modulo':
  return <NuevoModulo />;
```

4. **Si es activable, agregar a `ModuleManagement.tsx`:**
```typescript
const availableModules = [
  {
    id: 'nuevo-modulo',
    name: 'Nuevo Módulo',
    description: 'Descripción del módulo',
    icon: IconName,
    category: 'operational' // o 'administrative'
  }
];
```

### Modificar Secciones

Las secciones se definen en `menuSections` en `Sidebar.tsx`:

```typescript
const menuSections = [
  {
    title: 'Nombre de Sección',
    items: [
      // Módulos de la sección
    ]
  }
];
```

## Notas Técnicas

### Persistencia de Estado

**Colapso del Menú:**
- Guardado en `localStorage` como `sidebarCollapsed`
- Valor: `'true'` o `'false'`

**Pin del Menú:**
- Guardado en `localStorage` como `sidebarPinned`
- Valor: `'true'` o `'false'`
- Por defecto: `true` (fijado)

**Configuración de Módulos:**
- Guardada en base de datos por empresa
- Tabla: `company_modules`
- Cargada al iniciar sesión

### Rendimiento

**Optimizaciones:**
- Uso de `map()` para renderizado eficiente
- Estado local para interacciones rápidas
- Persistencia diferida (solo al guardar)

**Carga Inicial:**
- Módulos core siempre disponibles
- Configuración cargada en background
- Fallback a "todos activos" si hay error

## Conclusión

La reorganización del menú proporciona:

✅ Mejor organización y claridad
✅ Navegación más intuitiva
✅ Flexibilidad por empresa
✅ Aspecto profesional tipo ERP
✅ Base para crecimiento futuro

El nuevo módulo de **Gestión de Módulos** permite a cada empresa personalizar su experiencia, mostrando solo las funciones que realmente utiliza.
