# Preguntas Frecuentes - Sistema Contable Multi-Empresa

## 🏢 Gestión de Empresas

### P: ¿Cómo creo una nueva empresa?
**R:**
1. Inicia sesión en el sistema
2. Ve al módulo **"Empresas"** en el menú lateral
3. Haz clic en **"Nueva Empresa"**
4. Completa los datos (Nombre, RFC, Inicio Fiscal, Moneda)
5. Haz clic en **"Crear Empresa"**
6. ¡Automáticamente serás ADMIN de esa empresa!

### P: ¿Qué pasa cuando creo una empresa?
**R:**
- Se crea la empresa en la BD
- Eres automáticamente asignado como **ADMIN**
- Los 6 tipos de cuenta se crean automáticamente (ACTIVO, PASIVO, CAPITAL, INGRESOS, EGRESOS, COSTOS)
- Puedes empezar a configurar tu catálogo contable

### P: ¿Un usuario puede tener múltiples empresas?
**R:** ✅ SÍ ABSOLUTAMENTE
- Un mismo usuario puede estar en 5, 10, 50 empresas
- Cada empresa es independiente
- El usuario ve solo las empresas donde está asignado
- Puede cambiar de empresa con el selector en el header

### P: ¿Cuál es la diferencia entre los roles?
**R:**

| Rol | Crear Empresas | Crear Cuentas | Registrar Pólizas | Ver Reportes | Asignar Usuarios |
|-----|---|---|---|---|---|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Contador** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Visor** | ❌ | ❌ | ❌ | ✅ | ❌ |

### P: ¿Los datos de Empresa 1 se pueden ver desde Empresa 2?
**R:** ❌ NO, JAMÁS
- Cada empresa está 100% aislada
- Las políticas RLS (Row Level Security) previenen acceso cruzado
- Un usuario de Empresa 1 NO puede ver datos de Empresa 2 aunque tenga acceso a ambas

---

## 📊 Catálogo Contable

### P: ¿Cómo personalizo el catálogo para mi empresa?
**R:**
Tienes 3 módulos:

1. **"Config. Catálogo"** → Crea SEGMENTOS personalizados
   - Define tu estructura (Activo Circulante, Pasivo Fijo, etc.)
   - Ordena cómo se muestran en reportes
   - Puede ser jerárquico

2. **"Catálogo Contable"** → Crea CUENTAS de detalle
   - 1101 - Bancos
   - 1102 - Clientes
   - Marca "es cuenta de detalle" para usarlas en pólizas

3. **Estructura = Segmentos + Cuentas**

### P: ¿Cada empresa puede tener su propia estructura?
**R:** ✅ SÍ, COMPLETAMENTE
- Empresa A puede tener segmentos: Circulante/No Circulante
- Empresa B puede tener segmentos: Operacional/Financiero
- Empresa C puede tener su propio sistema
- No hay limitación, es totalmente configurable

### P: ¿Puedo cambiar la estructura después de empezar a registrar pólizas?
**R:** ✅ SÍ, con cuidado
- ✅ Puedo agregar NUEVOS segmentos/cuentas
- ✅ Puedo renombrar existentes
- ⚠️ No elimines cuentas que ya tienen movimientos
- ⚠️ Si necesitas cambiar código: renombra y crea nuevo

### P: ¿Qué son "cuentas de detalle"?
**R:**
- Son cuentas donde efectivamente se registran MOVIMIENTOS
- Solo las marcadas como "detalle" aparecen en los asientos contables
- Las cuentas padre sirven para agrupar en reportes
- En pólizas solo ves "cuentas de detalle"

---

## 🔐 Seguridad y Acceso

### P: ¿Cómo agrego un usuario a mi empresa?
**R:**
1. Ve a **"Empresas"**
2. Busca tu empresa y haz clic en **"Gestionar Usuarios"**
3. En "Asignar Nuevo Usuario":
   - Pega el UUID del usuario
   - Selecciona su rol (Admin, Contador, Visor)
   - Clic en **"Asignar Usuario"**

### P: ¿Cómo obtengo el UUID de un usuario?
**R:**
- El usuario se registra primero
- Entra a **Supabase Dashboard** → **Authentication** → **Users**
- Copia el UUID (ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
- Pégalo en el campo de asignar usuario

### P: ¿Qué pasa si comparto mi empresa con alguien?
**R:**
- Ese usuario ve SOLO tu empresa (las que comparta contigo)
- No ve tus otras empresas ni tú ves las suyas
- Respeta el rol que le asignaste (puede o no editar)
- Si lo quitas como usuario: pierde acceso inmediatamente

### P: ¿Cómo elimino un usuario de una empresa?
**R:**
- Actualmente debe hacerse directamente en Supabase
- Ve a la tabla `company_users` y borra la fila
- El usuario pierde acceso inmediatamente

---

## 📝 Pólizas y Operaciones

### P: ¿Debo crear las cuentas ANTES de hacer pólizas?
**R:** ✅ SÍ OBLIGATORIAMENTE
- Primero: Configura segmentos
- Segundo: Crea cuentas de detalle
- Tercero: Registra pólizas

### P: ¿Una póliza debe estar balanceada?
**R:** ✅ SÍ, SIEMPRE
- El sistema NO permite guardar pólizas desbalanceadas
- Debe = Haber, exactamente
- Si hay diferencia: el botón "Guardar" estará deshabilitado

### P: ¿Puedo editar/eliminar pólizas?
**R:** ⚠️ NO ACTUALMENTE
- Las pólizas se crean una sola vez
- Si comete error: anula la póliza (campo status = void)
- Luego crea una nueva póliza con los datos correctos
- Esto mantiene la auditoría y trazabilidad

---

## 📊 Reportes

### P: ¿Los reportes respetan mi estructura de segmentos?
**R:** ✅ SÍ
- Balance General agrupa por TUS segmentos
- Estado de Resultados respeta TU estructura
- Balanza de Comprobación lista TODAS tus cuentas

### P: ¿Puedo exportar reportes?
**R:** 📋 Ahora mismo
- Los reportes se muestran en pantalla
- Puedes copiar/capturar pantalla
- Próximamente: exportar a Excel/PDF (planeado)

### P: ¿Los reportes incluyen múltiples periodos?
**R:** 📅 SÍ
- Selecciona rango de fechas
- Ej: 1 Enero - 31 Diciembre
- Los reportes calculan sobre ese período

---

## 🛠️ Técnico/Configuración

### P: ¿Necesito conocer SQL?
**R:** NO EN LA MAYORÍA DE CASOS
- La interfaz es suficiente para operaciones normales
- Solo necesitas SQL si:
  - Necesitas inicializar tipos de cuenta (script incluido)
  - Quieres hacer consultas especiales
  - Administrador de Supabase (muy avanzado)

### P: ¿Dónde está el botón para inicializar tipos de cuenta?
**R:**
- No hay botón (se hace automáticamente)
- Si no aparecen: ejecuta `INICIALIZAR_TIPOS_CUENTA.sql`
- Script está incluido en la carpeta del proyecto

### P: ¿Dónde almacenamos los datos?
**R:**
- Base de datos: **Supabase PostgreSQL**
- Acceso: https://supabase.com/dashboard
- Backups: Supabase hace automáticamente
- Seguridad: Todas las conexiones usan SSL/TLS

---

## 🚀 Casos de Uso

### Caso 1: Contador con Múltiples Clientes
```
Usuario: contador@empresa.com
├─ Empresa Cliente A (rol: Contador)
├─ Empresa Cliente B (rol: Contador)
└─ Empresa Cliente C (rol: Contador)

Cada cliente ve SOLO su información
El contador ve todas pero separadas
```

### Caso 2: Cadena de Tiendas
```
Empresa Matriz con estructura:
├─ Tienda 1 (como segmento contable)
├─ Tienda 2 (como segmento contable)
└─ Tienda 3 (como segmento contable)

O crear 3 empresas separadas en el sistema
```

### Caso 3: Empresa con Sucursales
```
Opción 1: Una empresa con segmentos por sucursal
Opción 2: Una empresa separada por sucursal
Depende del requerimiento de consolidación
```

---

## ❓ No encuentro lo que busco

1. Revisa el archivo **GUIA_USO.md** (guía general)
2. Revisa **CATALOGO_FLEXIBLE.md** (solo catálogo)
3. Revisa **INICIALIZAR_TIPOS_CUENTA.sql** (si hay problemas técnicos)
4. Verifica error en consola (F12 → Console)
5. Revisa logs en Supabase Dashboard

---

## 📞 Soporte

**Problemas comunes:**

| Problema | Solución |
|----------|----------|
| No puedo crear empresa | Revisa permisos RLS, intenta nuevamente |
| No veo tipos de cuenta | Ejecuta INICIALIZAR_TIPOS_CUENTA.sql |
| No puedo guardar póliza | Verifica que esté balanceada |
| Usuario no aparece en empresa | Verifica que el UUID es correcto |
| No veo empresas de otro usuario | Ese usuario no ha sido asignado a esa empresa |

---

¡Éxito con tu sistema contable! 📊✨
