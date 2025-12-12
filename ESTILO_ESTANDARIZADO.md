# Guía de Estilo Estandarizado - ISO 9001 Management System

## 📋 Resumen de Cambios

Se ha implementado un sistema de diseño estandarizado para mejorar la consistencia visual y la legibilidad en todos los módulos del sistema.

### ✅ Mejoras Implementadas

1. **Placeholders más visibles**: Color `#9ca3af` (gray-400) con opacidad 100%
2. **Diseño monocromático profesional**: Gray scale en lugar de colores vibrantes
3. **Clases CSS reutilizables**: Componentes estandarizados globalmente
4. **Espaciado consistente**: Reducción de padding excesivo

## 🎨 Clases CSS Globales (globals.css)

### Formularios
```css
.form-label        → Labels de formulario
.form-input        → Inputs de texto/número/fecha
.form-textarea     → Textareas
.form-select       → Select dropdowns
```

### Botones
```css
.btn-primary       → Botón principal (gray-900)
.btn-secondary     → Botón secundario (gray-200)
.btn-danger        → Botón de peligro (red-600)
```

### Tarjetas y Secciones
```css
.card              → Tarjetas blancas con borde
.section-header    → Encabezado de sección
.stat-card         → Tarjetas de estadísticas
```

### Tablas
```css
.table-standard    → Tabla completa estandarizada
```

### Badges
```css
.badge             → Badge base
.badge-success     → Verde (completado, aprobado)
.badge-warning     → Amarillo (pendiente, en progreso)
.badge-danger      → Rojo (crítico, rechazado)
.badge-info        → Azul (información)
.badge-gray        → Gris (neutral)
```

### Utilidades
```css
.stat-label        → Label de estadística
.stat-value        → Valor de estadística
.alert-info        → Alerta informativa
```

## 🔧 Patrón de Implementación

### Antes (Inconsistente)
```tsx
<div className="bg-white p-4 rounded-lg shadow">
  <label className="block text-sm font-medium text-gray-700 mb-2">Campo</label>
  <input className="w-full px-3 py-2 border rounded-lg" />
</div>
```

### Después (Estandarizado)
```tsx
<div className="card">
  <label className="form-label">Campo</label>
  <input className="form-input" />
</div>
```

## 📊 Estadísticas - Patrón Gray Scale

### Antes (Colorido)
```tsx
<div className="bg-blue-50 p-4 rounded-lg shadow">
  <div className="text-sm text-blue-600">Métrica</div>
  <div className="text-2xl font-bold text-blue-900">123</div>
</div>
```

### Después (Sobrio)
```tsx
<div className="stat-card">
  <div className="stat-label">Métrica</div>
  <div className="stat-value">123</div>
</div>
```

## 🎯 Módulos Actualizados

### ✅ Completados
- [x] `app/dashboard/page.tsx` - Dashboard principal
- [x] `app/cambios/page.tsx` - Gestión de Cambios
- [x] `app/nueva-revision/page.tsx` - Nueva Revisión
- [x] `app/globals.css` - Estilos globales

### ⏳ Pendientes de Estandarización
- [ ] `app/encuestas/page.tsx`
- [ ] `app/objetivos/page.tsx`
- [ ] `app/inspecciones/page.tsx`
- [ ] `app/recursos/page.tsx`
- [ ] `app/riesgos/page.tsx`
- [ ] `app/mejoras/page.tsx`
- [ ] `app/compromisos/page.tsx`
- [ ] `app/modulos/indicadores/page.tsx`
- [ ] `app/modulos/auditorias/page.tsx`
- [ ] `app/modulos/proveedores/page.tsx`
- [ ] `app/modulos/quejas/page.tsx`
- [ ] `app/modulos/no-conformidades/page.tsx`

## 📝 Checklist de Estandarización por Módulo

Para cada módulo CRUD, aplicar:

1. **Header**
   - [ ] Usar `section-header` class
   - [ ] Tamaño de título: `text-2xl font-semibold`
   - [ ] Subtítulo: `text-sm text-gray-600 mt-1`
   - [ ] Botón principal: `btn-primary`
   - [ ] Botón volver: `border border-gray-300 rounded hover:bg-gray-50`

2. **Estadísticas**
   - [ ] Grid: `grid grid-cols-N gap-4`
   - [ ] Tarjetas: `stat-card`
   - [ ] Labels: `stat-label`
   - [ ] Valores: `stat-value`
   - [ ] Eliminar colores de fondo (bg-blue-50, etc.)

3. **Filtros**
   - [ ] Contenedor: `card`
   - [ ] Labels: `form-label`
   - [ ] Selects: `form-select`

4. **Formularios**
   - [ ] Labels: `form-label`
   - [ ] Inputs: `form-input`
   - [ ] Textareas: `form-textarea`
   - [ ] Selects: `form-select`
   - [ ] Placeholders: Texto descriptivo claro

5. **Tablas**
   - [ ] Contenedor: `table-standard` (reemplaza clases inline)
   - [ ] Headers: Automático con .table-standard thead
   - [ ] Filas: Automático con .table-standard tbody tr

6. **Botones de Acción**
   - [ ] Guardar: `btn-primary`
   - [ ] Cancelar: `btn-secondary`
   - [ ] Eliminar: `btn-danger`

7. **Badges de Estado**
   - [ ] Success states: `badge badge-success`
   - [ ] Warning states: `badge badge-warning`
   - [ ] Danger states: `badge badge-danger`
   - [ ] Info states: `badge badge-info`
   - [ ] Neutral states: `badge badge-gray`

## 🎨 Paleta de Colores Permitida

### Colores Funcionales (Mantener)
- ✅ **Verde**: Estados positivos (completado, conforme, aprobado)
- ✅ **Amarillo**: Estados intermedios (en progreso, pendiente)
- ✅ **Rojo**: Estados negativos (crítico, rechazado, no conforme)
- ✅ **Azul**: Información neutral (solo en badges informativos)

### Colores a Eliminar
- ❌ Purple (morado)
- ❌ Orange (naranja)
- ❌ Indigo (índigo)
- ❌ Pink (rosa)
- ❌ Teal (turquesa)

### Escala Gray Principal
- `gray-50` - Fondos de página
- `gray-100` - Fondos de tarjetas secundarias
- `gray-200` - Botones secundarios
- `gray-300` - Bordes
- `gray-600` - Texto secundario
- `gray-700` - Texto labels
- `gray-900` - Texto principal y botones primarios
- `black` - Hover en botones primarios

## 🚀 Próximos Pasos

1. **Fase 1**: Aplicar estandarización a módulos críticos (encuestas, objetivos, recursos)
2. **Fase 2**: Actualizar módulos secundarios (indicadores, auditorías, proveedores)
3. **Fase 3**: Revisión visual completa y ajustes finos
4. **Fase 4**: Documentación de componentes reutilizables

## 💡 Beneficios

- ✅ **Consistencia visual** en toda la aplicación
- ✅ **Placeholders legibles** con mejor contraste
- ✅ **Mantenimiento simplificado** con clases reutilizables
- ✅ **Diseño profesional** sobrio y empresarial
- ✅ **Reducción de código** eliminando clases repetitivas
- ✅ **Accesibilidad mejorada** con contrastes adecuados

---

**Última actualización**: Diciembre 2024
**Estándar de diseño**: ISO 9001 Management System - Gray Scale Professional
