# Guía de Uso - Sistema Contable Multi-Empresa

## 🚀 Inicio Rápido

### Paso 1: Registro de Usuario
1. Abre la aplicación
2. Haz clic en "¿No tienes cuenta? Regístrate"
3. Ingresa tu email y contraseña
4. Haz clic en "Registrarse"

### Paso 2: Obtener tu User ID
Después de registrarte, necesitas tu User ID para crear empresas. Hay dos formas:

#### Opción A: Desde Supabase Dashboard
1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Ve a "Authentication" → "Users"
3. Copia tu UUID (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

#### Opción B: Consulta SQL
Ejecuta esta consulta en el SQL Editor de Supabase:
```sql
-- Ver todos los usuarios registrados
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

### Paso 3: Crear tu Primera Empresa
1. Inicia sesión con tu usuario
2. Ve al módulo "Empresas" en el menú lateral
3. Haz clic en "Nueva Empresa"
4. Completa los datos:
   - **Nombre**: Nombre de tu empresa
   - **RFC**: RFC fiscal
   - **Dirección**: Dirección completa (opcional)
   - **Mes Inicio Fiscal**: Mes de inicio del ejercicio (1-12)
   - **Moneda**: MXN, USD, EUR
5. Haz clic en "Crear Empresa"
6. ¡Listo! Automáticamente serás asignado como **Admin** de esa empresa

### Paso 4: Configurar el Catálogo Contable
1. Ve al módulo "Catálogo Contable"
2. Haz clic en "Nueva Cuenta"
3. Los tipos de cuenta ya están creados automáticamente:
   - **ACTIVO** (Deudora)
   - **PASIVO** (Acreedora)
   - **CAPITAL** (Acreedora)
   - **INGRESOS** (Acreedora)
   - **EGRESOS** (Deudora)
   - **COSTOS** (Deudora)

#### Ejemplo de Catálogo Básico NIF:
```
1000 - ACTIVO
  1100 - Activo Circulante
    1101 - Bancos (cuenta de detalle ✓)
    1102 - Clientes (cuenta de detalle ✓)
    1103 - Inventarios (cuenta de detalle ✓)
  1200 - Activo No Circulante
    1201 - Equipo de Oficina (cuenta de detalle ✓)

2000 - PASIVO
  2100 - Pasivo Circulante
    2101 - Proveedores (cuenta de detalle ✓)
    2102 - IVA por Pagar (cuenta de detalle ✓)

3000 - CAPITAL
  3100 - Capital Contable
    3101 - Capital Social (cuenta de detalle ✓)
    3102 - Utilidades Retenidas (cuenta de detalle ✓)

4000 - INGRESOS
  4100 - Ingresos por Ventas
    4101 - Ventas (cuenta de detalle ✓)

5000 - EGRESOS
  5100 - Gastos de Operación
    5101 - Sueldos y Salarios (cuenta de detalle ✓)
    5102 - Renta (cuenta de detalle ✓)
```

**Nota**: Solo las cuentas marcadas como "cuenta de detalle" pueden usarse en asientos contables.

---

## 👥 Gestión Multi-Empresa

### ¿Cómo funciona la separación de empresas?

1. **Cada usuario puede pertenecer a MÚLTIPLES empresas**
2. **Cada usuario tiene un ROL en cada empresa**:
   - **Admin**: Puede gestionar usuarios y toda la configuración
   - **Contador**: Puede hacer operaciones contables
   - **Visor**: Solo puede ver reportes

3. **Los datos están COMPLETAMENTE SEPARADOS**:
   - Un usuario solo ve las empresas donde está asignado
   - No puede ver ni acceder a datos de otras empresas
   - La seguridad está garantizada por Row Level Security (RLS)

### Asignar Usuarios a una Empresa

1. Ve al módulo "Empresas"
2. Haz clic en "Gestionar Usuarios" en la empresa deseada
3. En el campo "ID del usuario", ingresa el UUID del usuario
4. Selecciona el rol (Admin, Contador, Visor)
5. Haz clic en "Asignar Usuario"

**Nota**: Por ahora debes ingresar el UUID manualmente. Para obtenerlo:
```sql
-- Buscar usuario por email
SELECT id, email FROM auth.users WHERE email = 'usuario@ejemplo.com';
```

---

## 📊 Flujo de Trabajo Contable

### 1. Registrar una Póliza Contable
1. Ve a "Pólizas/Asientos"
2. Clic en "Nueva Póliza"
3. Completa:
   - Número de póliza (ej: P-001)
   - Fecha
   - Tipo (Diario, Ingresos, Egresos, Ajuste)
   - Descripción
4. Agrega las líneas del asiento:
   - Selecciona la cuenta
   - Ingresa monto en Debe o Haber
   - Descripción (opcional)
5. Verifica que esté balanceada (Debe = Haber)
6. Haz clic en "Guardar Póliza"

### 2. Generar Reportes
1. Ve a "Reportes"
2. Selecciona el tipo:
   - **Balanza de Comprobación**: Movimientos y saldos de todas las cuentas
   - **Balance General**: Posición financiera (Activo, Pasivo, Capital)
   - **Estado de Resultados**: Ingresos vs Egresos
3. Define el rango de fechas
4. Haz clic en "Generar"

### 3. Gestionar Cuentas por Cobrar (CxC)
1. Primero registra los clientes en el módulo "Clientes"
2. Ve a "Cuentas por Cobrar"
3. Las facturas se pueden registrar manualmente en la BD o mediante importación

### 4. Gestionar Cuentas por Pagar (CxP)
1. Primero registra los proveedores en el módulo "Proveedores"
2. Ve a "Cuentas por Pagar"
3. Las facturas se registran de forma similar a CxC

### 5. Control de Activo Fijo
1. Ve a "Activo Fijo"
2. Registra bienes con:
   - Fecha de adquisición
   - Costo
   - Vida útil
   - Método de depreciación (Línea Recta o Saldo Decreciente)

### 6. Control de Inventario
1. Ve a "Inventario"
2. Registra artículos con:
   - Código
   - Nombre
   - Unidad de medida
   - Método de costeo (Promedio, PEPS, UEPS)

---

## 🔒 Seguridad

### Row Level Security (RLS)
- Todas las tablas tienen RLS habilitado
- Los usuarios SOLO pueden acceder a datos de sus empresas asignadas
- No es posible ver o modificar datos de otras empresas
- La validación se hace a nivel de base de datos

### Roles y Permisos
| Rol | Permisos |
|-----|----------|
| **Admin** | Todo: crear cuentas, pólizas, asignar usuarios, configuración |
| **Contador** | Crear/editar: cuentas, pólizas, clientes, proveedores, reportes |
| **Visor** | Solo visualizar: reportes y consultas |

---

## 🎯 Cumplimiento NIF

El sistema está diseñado para cumplir con las Normas de Información Financiera:

✅ **NIF A-1**: Estructura básica de estados financieros
✅ **NIF A-2**: Postulados básicos (devengación, consistencia)
✅ **NIF A-3**: Necesidades de los usuarios
✅ **NIF B-1**: Cambios contables y correcciones de errores
✅ **NIF B-3**: Estado de resultado integral
✅ **NIF B-6**: Estado de situación financiera (Balance General)

---

## 💡 Consejos

1. **Siempre balancea las pólizas**: El sistema NO permite guardar pólizas desbalanceadas
2. **Usa cuentas de detalle**: Solo las cuentas marcadas como "detalle" pueden usarse en pólizas
3. **Estructura jerárquica**: Crea cuentas padre antes de crear subcuentas
4. **Documenta bien**: Usa descripciones claras en pólizas y movimientos
5. **Reportes periódicos**: Genera balanza al cierre de cada mes
6. **Respaldos**: Exporta tus reportes regularmente

---

## 📞 Soporte

Si necesitas ayuda adicional:
1. Revisa los mensajes de error en pantalla
2. Verifica que tu usuario esté asignado a la empresa
3. Confirma que las cuentas sean de detalle para usarlas en pólizas
4. Revisa los datos en Supabase Dashboard

---

## 🚀 Próximos Pasos

Una vez que domines lo básico:
1. Configura tu catálogo completo según tu industria
2. Registra tus clientes y proveedores
3. Captura tus pólizas de apertura
4. Comienza con las operaciones diarias
5. Genera reportes mensuales
6. Prepara estados financieros

¡Éxito con tu contabilidad! 📊
