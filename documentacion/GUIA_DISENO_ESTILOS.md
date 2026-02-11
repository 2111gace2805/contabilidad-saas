# Guía de Diseño y Estilos del Sistema

## Tecnologías Utilizadas

### 1. Tailwind CSS v3.4.1
Framework CSS utility-first que permite crear diseños personalizados sin escribir CSS tradicional.

```json
"tailwindcss": "^3.4.1"
```

### 2. Lucide React v0.344.0
Biblioteca de iconos modernos y limpios.

```json
"lucide-react": "^0.344.0"
```

### 3. PostCSS y Autoprefixer
Procesadores CSS para compatibilidad entre navegadores.

```json
"postcss": "^8.4.35",
"autoprefixer": "^10.4.18"
```

## Sin Plantillas Externas

**IMPORTANTE:** Este proyecto NO utiliza ninguna librería de componentes UI como:
- ❌ Shadcn/ui
- ❌ Material-UI
- ❌ Ant Design
- ❌ Chakra UI
- ❌ Bootstrap

Todos los componentes están construidos desde cero usando Tailwind CSS puro.

## Paleta de Colores

### Colores Principales (Slate)
```css
slate-50   - Fondos muy claros
slate-100  - Fondos claros, headers secundarios
slate-200  - Bordes y divisores
slate-300  - Bordes de inputs, elementos deshabilitados
slate-400  - Texto secundario
slate-500  - Texto y elementos con énfasis medio
slate-600  - Texto importante
slate-700  - Hover states, elementos activos
slate-800  - Headers principales, sidebar, botones primarios
slate-900  - Texto muy oscuro, énfasis máximo
```

### Colores de Estado
```css
red-500    - Errores, negativos
red-600    - Hover de botones de error
green-500  - Éxitos, positivos
green-600  - Hover de botones de éxito
blue-500   - Información, enlaces
blue-600   - Hover de botones informativos
yellow-500 - Advertencias
amber-500  - Alertas importantes
```

### Colores Semánticos
```css
white      - Fondos de tarjetas y contenido principal
transparent - Elementos sin fondo
```

## Sistema de Espaciado

Basado en múltiplos de 4px (0.25rem):

```css
p-1  = 4px    gap-1  = 4px    m-1  = 4px
p-2  = 8px    gap-2  = 8px    m-2  = 8px
p-3  = 12px   gap-3  = 12px   m-3  = 12px
p-4  = 16px   gap-4  = 16px   m-4  = 16px
p-5  = 20px   gap-5  = 20px   m-5  = 20px
p-6  = 24px   gap-6  = 24px   m-6  = 24px
p-8  = 32px   gap-8  = 32px   m-8  = 32px
```

### Ejemplos de Uso
```jsx
// Padding uniforme
className="p-4"

// Padding horizontal y vertical
className="px-6 py-4"

// Gap en flexbox/grid
className="flex gap-4"
```

## Componentes de Diseño

### Botones

#### Botón Primario
```jsx
<button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
  Guardar
</button>
```

#### Botón Secundario
```jsx
<button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
  Cancelar
</button>
```

#### Botón de Peligro
```jsx
<button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
  Eliminar
</button>
```

#### Botón de Éxito
```jsx
<button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
  Confirmar
</button>
```

### Tarjetas

#### Tarjeta Básica
```jsx
<div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
  Contenido
</div>
```

#### Tarjeta con Header
```jsx
<div className="bg-white border border-slate-200 rounded-lg shadow-sm">
  <div className="border-b border-slate-200 px-6 py-4">
    <h3 className="text-lg font-semibold text-slate-800">Título</h3>
  </div>
  <div className="p-6">
    Contenido
  </div>
</div>
```

### Inputs y Formularios

#### Input de Texto
```jsx
<input
  type="text"
  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
  placeholder="Ingrese texto"
/>
```

#### Select / Dropdown
```jsx
<select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none">
  <option>Opción 1</option>
  <option>Opción 2</option>
</select>
```

#### Textarea
```jsx
<textarea
  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none"
  rows={4}
/>
```

#### Label
```jsx
<label className="block text-sm font-medium text-slate-700 mb-2">
  Nombre del Campo
</label>
```

### Tablas

```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-slate-50 border-b border-slate-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
          Columna 1
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
          Columna 2
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-slate-200">
      <tr className="hover:bg-slate-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
          Dato 1
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
          Dato 2
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges / Etiquetas de Estado

```jsx
// Estado activo
<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
  Activo
</span>

// Estado inactivo
<span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
  Inactivo
</span>

// Estado pendiente
<span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
  Pendiente
</span>

// Estado anulado
<span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
  Anulado
</span>
```

### Modales

```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <h3 className="text-lg font-semibold text-slate-800">Título del Modal</h3>
      <button className="text-slate-400 hover:text-slate-600">
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-6">
      Contenido del modal
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
      <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
        Cancelar
      </button>
      <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
        Confirmar
      </button>
    </div>
  </div>
</div>
```

### Alertas

```jsx
// Alerta de éxito
<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
  Operación realizada con éxito
</div>

// Alerta de error
<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
  Ha ocurrido un error
</div>

// Alerta de advertencia
<div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
  Tenga precaución
</div>

// Alerta de información
<div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
  Información importante
</div>
```

## Tipografía

### Tamaños de Texto
```css
text-xs    - 12px (etiquetas pequeñas)
text-sm    - 14px (texto secundario)
text-base  - 16px (texto normal)
text-lg    - 18px (subtítulos)
text-xl    - 20px (títulos de sección)
text-2xl   - 24px (títulos principales)
text-3xl   - 30px (títulos de página)
```

### Pesos de Fuente
```css
font-normal   - 400 (texto normal)
font-medium   - 500 (énfasis medio)
font-semibold - 600 (subtítulos)
font-bold     - 700 (títulos importantes)
```

### Ejemplos
```jsx
// Título principal de página
<h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

// Título de sección
<h2 className="text-xl font-semibold text-slate-800">Estadísticas</h2>

// Subtítulo
<h3 className="text-lg font-semibold text-slate-800">Detalle</h3>

// Texto normal
<p className="text-base text-slate-700">Descripción del contenido</p>

// Texto secundario
<span className="text-sm text-slate-500">Información adicional</span>
```

## Iconos (Lucide React)

### Importación
```tsx
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Save,
  X,
  Edit,
  Trash2
} from 'lucide-react';
```

### Uso
```jsx
// Icono básico
<FileText className="w-5 h-5 text-slate-600" />

// Icono en botón
<button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg">
  <Save className="w-4 h-4" />
  Guardar
</button>

// Icono grande
<TrendingUp className="w-8 h-8 text-green-500" />
```

## Layout y Estructura

### Sidebar + Contenido Principal
```jsx
<div className="flex h-screen bg-slate-50">
  {/* Sidebar */}
  <aside className="w-64 bg-slate-800 text-white">
    Menú lateral
  </aside>

  {/* Main Content */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header */}
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      Header
    </header>

    {/* Content Area */}
    <main className="flex-1 overflow-y-auto p-6">
      Contenido principal
    </main>
  </div>
</div>
```

### Grid de Tarjetas
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Tarjetas */}
</div>
```

### Flexbox Centrado
```jsx
<div className="flex items-center justify-center min-h-screen">
  Contenido centrado
</div>
```

## Efectos y Transiciones

### Hover States
```jsx
className="hover:bg-slate-700 transition-colors"
className="hover:shadow-lg transition-shadow"
className="hover:scale-105 transition-transform"
```

### Focus States
```jsx
className="focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
```

### Transiciones
```jsx
className="transition-all duration-200"
className="transition-colors duration-150"
className="transition-transform duration-300"
```

## Sombras

```css
shadow-sm   - Sombra sutil (tarjetas)
shadow      - Sombra estándar
shadow-md   - Sombra media
shadow-lg   - Sombra grande (modales)
shadow-xl   - Sombra extra grande
shadow-2xl  - Sombra máxima
```

## Bordes Redondeados

```css
rounded      - 4px (pequeño)
rounded-md   - 6px (medio)
rounded-lg   - 8px (estándar)
rounded-xl   - 12px (grande)
rounded-2xl  - 16px (extra grande)
rounded-full - Completamente redondeado (círculos, pills)
```

## Responsive Design

### Breakpoints de Tailwind
```css
sm:  640px  - Tablets pequeñas
md:  768px  - Tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
2xl: 1536px - Pantallas grandes
```

### Ejemplos
```jsx
// Columnas responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Padding responsive
<div className="p-4 md:p-6 lg:p-8">

// Texto responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Ocultar en móvil
<div className="hidden md:block">

// Mostrar solo en móvil
<div className="block md:hidden">
```

## Principios de Diseño

### 1. Consistencia
- Usar siempre las mismas clases para elementos similares
- Mantener espaciado uniforme
- Respetar la jerarquía visual

### 2. Espaciado Coherente
- Usar múltiplos de 4px
- Mantener espaciado consistente entre elementos relacionados
- Usar más espacio para separar secciones distintas

### 3. Jerarquía Visual
- Títulos más grandes y oscuros
- Texto secundario más pequeño y gris
- Usar peso de fuente para énfasis

### 4. Colores Profesionales
- Preferir slate sobre grises puros
- Usar colores de estado semánticos (verde=éxito, rojo=error)
- Mantener buen contraste para accesibilidad

### 5. Accesibilidad
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande
- Usar focus visible en elementos interactivos
- Proporcionar estados hover claros

### 6. Performance
- Evitar animaciones complejas
- Usar `transition-colors` en lugar de `transition-all` cuando sea posible
- Optimizar imágenes e iconos

## Configuración de Tailwind

El archivo `tailwind.config.js` define:

```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## CSS Global

El archivo `src/index.css` contiene:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos base globales */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
               'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
               'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## Inspiración y Referencia

El diseño se inspira en:
- **SAP Business One** - Sistema ERP profesional
- **Modern Dashboard Design** - Diseños limpios y minimalistas
- **Banking Applications** - Interfaz seria y confiable
- **Material Design Principles** - Sin usar Material-UI directamente

## Herramientas de Desarrollo

### VS Code Extensions Recomendadas
- Tailwind CSS IntelliSense
- PostCSS Language Support
- ESLint

### Recursos Útiles
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)

---

**Nota Final:** Este sistema está construido 100% con Tailwind CSS y componentes personalizados. No hay dependencias de librerías UI externas, lo que proporciona máximo control y personalización.
