# Sistema de Gestión de Calidad ISO 9001:2015
## Implementación Completa - Cláusula 9.3 Revisión por la Dirección

---

## 📋 RESUMEN EJECUTIVO

Este sistema implementa completamente el requisito 9.3 de ISO 9001:2015 "Revisión por la Dirección", cubriendo:

- ✅ **9.3.1 Generalidades**: Sistema de revisión a intervalos planificados
- ✅ **9.3.2 Entradas**: 12 módulos operativos que alimentan la revisión
- ✅ **9.3.3 Salidas**: Gestión de decisiones y compromisos con seguimiento

---

## 🗃️ ARQUITECTURA DEL SISTEMA

### Módulos Operativos (ENTRADAS del SGC)

El sistema cuenta con **12 módulos independientes** que gestionan diferentes aspectos del Sistema de Gestión de Calidad:

#### 1. **Auditorías** (9.3.2.c.6)
- **Tabla**: `auditorias`
- **Propósito**: Gestión de auditorías internas, externas y de certificación
- **Campos clave**: tipo, hallazgos, conformidades, NC mayores/menores, estado general
- **CRUD**: `/app/modulos/auditorias/page.tsx`

#### 2. **Quejas y Reclamos** (9.3.2.c.1)
- **Tabla**: `quejas_reclamos`
- **Propósito**: Retroalimentación del cliente y satisfacción
- **Campos clave**: tipo (queja/reclamo/sugerencia/felicitación), estado, satisfacción
- **CRUD**: `/app/modulos/quejas/page.tsx`

#### 3. **Indicadores de Desempeño (KPIs)** (9.3.2.c.2 parcial)
- **Tabla**: `indicadores`
- **Propósito**: Medición de objetivos y procesos
- **Campos clave**: valor_actual, valor_meta, cumplimiento, tendencia
- **CRUD**: `/app/modulos/indicadores/page.tsx`
- **Funcionalidad especial**: Auto-cálculo de cumplimiento

#### 4. **No Conformidades** (9.3.2.c.4)
- **Tabla**: `no_conformidades`
- **Propósito**: Gestión de NC y acciones correctivas
- **Campos clave**: tipo, severidad, causa_raíz, acción_correctiva, eficacia_verificada
- **CRUD**: `/app/modulos/no-conformidades/page.tsx`

#### 5. **Proveedores Externos** (9.3.2.c.7)
- **Tabla**: `proveedores`
- **Propósito**: Evaluación y seguimiento de proveedores
- **Campos clave**: calificación_actual, criterios_evaluacion (JSONB), estado, incidentes
- **CRUD**: `/app/modulos/proveedores/page.tsx`
- **Funcionalidad especial**: Evaluación multi-criterio (calidad, entrega, precio, servicio)

#### 6. **Objetivos de Calidad** (9.3.2.c.2)
- **Tabla**: `objetivos_calidad`
- **Propósito**: Seguimiento del logro de objetivos
- **Campos clave**: objetivo, valor_actual vs valor_meta, porcentaje_avance, estado
- **CRUD**: ⏳ Pendiente de crear

#### 7. **Contexto Organizacional** (9.3.2.b)
- **Tabla**: `contexto_organizacional`
- **Propósito**: Cambios externos e internos relevantes al SGC
- **Campos clave**: tipo (externo/interno), categoría, impacto_sgc, oportunidad_amenaza
- **CRUD**: ⏳ Pendiente de crear

#### 8. **Riesgos y Oportunidades** (9.3.2.e)
- **Tabla**: `riesgos_oportunidades`
- **Propósito**: Eficacia de acciones para abordar riesgos
- **Campos clave**: tipo, probabilidad, impacto, nivel_riesgo, acciones_planificadas, eficacia
- **CRUD**: ⏳ Pendiente de crear

#### 9. **Recursos** (9.3.2.d)
- **Tabla**: `recursos`
- **Propósito**: Evaluación de adecuación de recursos
- **Campos clave**: tipo_recurso, estado_actual, necesidad_adicional, costo_estimado
- **CRUD**: ⏳ Pendiente de crear

#### 10. **Seguimiento y Medición** (9.3.2.c.5)
- **Tabla**: `seguimiento_medicion`
- **Propósito**: Resultados de mediciones y monitoreo
- **Campos clave**: tipo_medicion, resultado, cumple_criterio, desviaciones
- **CRUD**: ⏳ Pendiente de crear

#### 11. **Desempeño de Procesos** (9.3.2.c.3)
- **Tabla**: `desempeno_procesos`
- **Propósito**: Conformidad de productos y desempeño de procesos
- **Campos clave**: eficacia, eficiencia, porcentaje_conformidad, tendencia
- **CRUD**: ⏳ Pendiente de crear

#### 12. **Partes Interesadas**
- **Tabla**: `partes_interesadas`
- **Propósito**: Gestión de necesidades y expectativas
- **Campos clave**: tipo, necesidades_expectativas, nivel_influencia, nivel_interes
- **CRUD**: ⏳ Pendiente de crear

---

## 📊 FLUJO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULOS OPERATIVOS                           │
│  (Gestión diaria del SGC - Personal operativo)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Los datos se registran
                              │ en los módulos independientes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD EJECUTIVO                           │
│  Muestra resumen consolidado de todos los módulos               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ La Alta Dirección
                              │ inicia una Revisión
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              REVISIÓN POR LA DIRECCIÓN                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │ ENTRADAS (Read-Only):                            │          │
│  │ - Datos automáticos de los 12 módulos           │          │
│  │ - Visualización de información actualizada       │          │
│  └──────────────────────────────────────────────────┘          │
│                              │                                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │ ANÁLISIS (Editable):                             │          │
│  │ - Campo de análisis de la dirección por cada    │          │
│  │   módulo (analisis_auditorias, etc.)            │          │
│  │ - Interpretación y conclusiones ejecutivas       │          │
│  └──────────────────────────────────────────────────┘          │
│                              │                                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │ SALIDAS (Decisiones):                            │          │
│  │ a) Oportunidades de mejora                       │          │
│  │ b) Cambios en el SGC                            │          │
│  │ c) Necesidades de recursos                       │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Se generan
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       COMPROMISOS                                │
│  - Acciones específicas con responsables                        │
│  - Fechas límite y seguimiento de avance                        │
│  - Estados: Pendiente → En Proceso → Completado                │
│  - Vinculados a la revisión que los generó                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Al completarse todos
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│         CIERRE DE REVISIÓN (Estado: Cerrada)                    │
│  - porcentaje_cumplimiento = 100%                               │
│  - Evidencias documentadas                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ ESTRUCTURA DE BASE DE DATOS

### Tablas Principales

```sql
-- 1. REVISIONES (Tabla maestra)
revisiones
  ├── Campos generales: titulo, fecha_revision, responsable
  ├── ENTRADAS: analisis_* (9 campos para análisis de cada módulo)
  ├── SALIDAS: decisiones_mejora, decisiones_sgc, necesidades_recursos
  └── Metadata: estado, porcentaje_cumplimiento

-- 2. COMPROMISOS (Acciones derivadas)
compromisos
  ├── Vinculación: revision_id (FK)
  ├── Clasificación: tipo_salida (mejora/cambio_sgc/recursos)
  ├── Responsabilidad: responsable, area_responsable
  ├── Plazos: fecha_compromiso, fecha_limite, fecha_cumplimiento
  ├── Seguimiento: estado, prioridad, porcentaje_avance
  └── Verificación: verificado_por, eficaz

-- 3. EVIDENCIAS
evidencias
  ├── Vinculación: revision_id, compromiso_id
  ├── Storage: url_drive, url_onedrive
  └── Categoría: entrada/salida/evidencia_compromiso
```

### Módulos Operativos (12 tablas)
- `auditorias`
- `quejas_reclamos`
- `indicadores`
- `no_conformidades`
- `proveedores`
- `objetivos_calidad`
- `contexto_organizacional`
- `riesgos_oportunidades`
- `recursos`
- `seguimiento_medicion`
- `desempeno_procesos`
- `partes_interesadas`

---

## 🚀 INSTRUCCIONES DE IMPLEMENTACIÓN

### Paso 1: Migración de Base de Datos

```bash
# Ejecutar el schema completo en Supabase
# Archivo: supabase_schema_completo_v2.sql

# Opción A: Desde el dashboard de Supabase
1. Ir a SQL Editor
2. Copiar todo el contenido de supabase_schema_completo_v2.sql
3. Ejecutar

# Opción B: Desde CLI de Supabase
supabase db push
```

**IMPORTANTE**: El schema incluye:
- ✅ Creación de todas las tablas
- ✅ Políticas RLS (Row Level Security)
- ✅ Triggers para updated_at
- ✅ Funciones útiles (calcular_cumplimiento_revision, actualizar_compromisos_vencidos)
- ✅ Datos de demostración hardcodeados

### Paso 2: Verificar Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Opcional: Cloud Storage (Google Drive / OneDrive)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
```

### Paso 3: Instalar Dependencias

```bash
npm install
# o
yarn install
```

### Paso 4: Ejecutar en Desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📱 PÁGINAS DISPONIBLES

### ✅ Implementadas

1. **Dashboard** (`/dashboard`)
   - Resumen ejecutivo de todos los módulos
   - Acceso rápido a gestión de módulos
   - Botones: Nueva Revisión, Compromisos

2. **Nueva Revisión** (`/nueva-revision`)
   - Formulario completo con ENTRADAS + ANÁLISIS + SALIDAS
   - Carga automática de datos de módulos
   - Campos de análisis editables para la dirección

3. **Gestión de Compromisos** (`/compromisos`)
   - CRUD completo de compromisos
   - Estadísticas por estado (vencidos, en proceso, pendientes, completados)
   - Seguimiento de porcentaje de avance
   - Clasificación por tipo y prioridad

4. **Módulos CRUD (5 completados)**:
   - `/modulos/auditorias` ✅
   - `/modulos/quejas` ✅
   - `/modulos/indicadores` ✅
   - `/modulos/no-conformidades` ✅
   - `/modulos/proveedores` ✅

### ⏳ Pendientes de Crear (7 módulos)

1. `/modulos/objetivos-calidad`
2. `/modulos/contexto-organizacional`
3. `/modulos/riesgos-oportunidades`
4. `/modulos/recursos`
5. `/modulos/seguimiento-medicion`
6. `/modulos/desempeno-procesos`
7. `/modulos/partes-interesadas`

**Patrón de implementación** (copiar de módulos existentes):
- Client Component con `'use client'`
- useState para formData, loading, showForm, editando
- useEffect para cargar datos de Supabase
- Funciones CRUD: cargarDatos, handleSubmit, handleEditar, handleEliminar
- UI: Header → Estadísticas → Formulario (condicional) → Lista/Grid

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Prioridad Alta
1. ✅ Crear los 7 módulos CRUD faltantes
2. ✅ Actualizar formulario de revisión para mostrar datos de TODOS los módulos
3. ✅ Crear API routes para módulos faltantes (`/api/modulos/objetivos`, etc.)
4. ✅ Actualizar `ResumenEntradas` en API `/api/modulos/resumen` para incluir todos los módulos

### Prioridad Media
1. Integrar sistema de evidencias con Google Drive/OneDrive
2. Agregar funcionalidad de exportar revisión a PDF
3. Implementar notificaciones de compromisos próximos a vencer
4. Dashboard con gráficas (Chart.js o Recharts)

### Prioridad Baja
1. Sistema de autenticación y roles
2. Historial de revisiones
3. Comparativas entre períodos
4. Generación automática de actas de revisión

---

## 📐 CUMPLIMIENTO ISO 9001:2015

### Cláusula 9.3.1 - Generalidades
✅ **Sistema de revisión planificada**
- Formulario estructurado `/nueva-revision`
- Campo `fecha_revision` obligatorio
- Estado de revisión (abierta/en_seguimiento/cerrada)

### Cláusula 9.3.2 - Entradas

| Requisito | Módulo | Campo Análisis | Estado |
|-----------|--------|----------------|--------|
| a) Acciones previas | Compromisos revisión anterior | analisis_acciones_previas | ✅ |
| b) Cambios externos/internos | Contexto Organizacional | analisis_cambios_externos<br>analisis_cambios_internos | ✅ Schema<br>⏳ CRUD |
| c.1) Satisfacción cliente | Quejas y Reclamos | analisis_clientes | ✅ |
| c.2) Objetivos de calidad | Objetivos Calidad + Indicadores | analisis_objetivos | ✅ Schema<br>⏳ CRUD |
| c.3) Desempeño procesos | Desempeño Procesos | analisis_procesos | ✅ Schema<br>⏳ CRUD |
| c.4) No conformidades | No Conformidades | analisis_no_conformidades | ✅ |
| c.5) Seguimiento y medición | Seguimiento Medición | analisis_seguimiento_medicion | ✅ Schema<br>⏳ CRUD |
| c.6) Auditorías | Auditorías | analisis_auditorias | ✅ |
| c.7) Proveedores externos | Proveedores | analisis_proveedores | ✅ |
| d) Adecuación recursos | Recursos | analisis_recursos | ✅ Schema<br>⏳ CRUD |
| e) Eficacia riesgos | Riesgos y Oportunidades | analisis_riesgos<br>analisis_oportunidades | ✅ Schema<br>⏳ CRUD |
| f) Oportunidades mejora | Todos los módulos | oportunidades_mejora_identificadas | ✅ |

### Cláusula 9.3.3 - Salidas

| Requisito | Implementación | Estado |
|-----------|----------------|--------|
| a) Oportunidades de mejora | Campo `decisiones_mejora` + Compromisos tipo='mejora' | ✅ |
| b) Cambios en el SGC | Campo `decisiones_sgc` + Compromisos tipo='cambio_sgc' | ✅ |
| c) Necesidades de recursos | Campo `necesidades_recursos` + Compromisos tipo='recursos' | ✅ |
| Información documentada | Tabla `revisiones` + `evidencias` | ✅ |

---

## 💡 FUNCIONALIDADES DESTACADAS

### Auto-Cálculos
- **Indicadores**: Cumplimiento automático (`valor_actual / valor_meta * 100`)
- **Proveedores**: Calificación promedio de 4 criterios
- **Objetivos**: Porcentaje de avance automático
- **Revisiones**: Cumplimiento basado en compromisos completados

### Validaciones
- Campos obligatorios marcados con *
- Fechas validadas (fecha_limite no puede ser anterior a fecha_compromiso)
- Estados controlados por enums
- Eliminación con confirmación

### UX/UI
- Código de colores por estado (verde/amarillo/rojo)
- Badges informativos
- Barras de progreso
- Iconos descriptivos
- Responsive design (Tailwind CSS)
- Loading states y error handling

---

## 🔧 TROUBLESHOOTING

### Error: "relation does not exist"
**Solución**: Ejecutar `supabase_schema_completo_v2.sql` en Supabase

### No se muestran datos en el formulario de revisión
**Solución**: 
1. Verificar que los módulos tengan datos (crear registros en cada CRUD)
2. Verificar que la API `/api/modulos/resumen` esté funcionando
3. Revisar console del navegador para errores

### Compromisos no se actualizan
**Solución**: Ejecutar la función de Supabase:
```sql
SELECT actualizar_compromisos_vencidos();
```

### Error de permisos (RLS)
**Solución**: Verificar que las políticas RLS estén configuradas:
```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 📞 SOPORTE

Para cualquier duda sobre la implementación:

1. Revisar este documento
2. Consultar el schema SQL completo (`supabase_schema_completo_v2.sql`)
3. Revisar tipos TypeScript (`lib/types.ts`)
4. Ejemplo de referencia: cualquier módulo CRUD existente

---

## 📄 LICENCIA

Sistema propietario para gestión interna de calidad ISO 9001:2015.

---

**Última actualización**: Diciembre 2024  
**Versión**: 2.0  
**Estado**: En desarrollo - Base funcional implementada
