-- Script de instrucciones para ejecutar el schema completo
-- Orden de ejecución sugerido

-- PASO 1: Ejecutar schema completo
-- Archivo: schema_completo_funcional.sql
-- Este script crea todas las tablas, funciones, triggers, índices y políticas RLS

-- PASO 2: Ejecutar datos de demostración
-- Archivo: datos_demo_minimo.sql
-- Inserta datos mínimos en los módulos nuevos (2 registros por tabla aproximadamente)

-- PASO 3: Ejecutar datos para módulos existentes
-- Archivo: datos_modulos_existentes.sql
-- Inserta datos en auditorias, quejas_reclamos, indicadores, proveedores

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================

-- 1. Las tablas auditorias, quejas_reclamos, indicadores, proveedores
--    probablemente ya existen en tu base de datos.
--    Si es así, el schema_completo_funcional.sql NO las recrea.

-- 2. Orden de ejecución CRÍTICO para evitar errores de FK:
--    a) Schema (crea estructura)
--    b) Datos demo (inserta datos en tablas nuevas)
--    c) Datos módulos existentes (complementa tablas que ya existían)

-- 3. Si aparece error "relation already exists":
--    - Es normal para tablas que ya existen
--    - Puedes ignorar o comentar esas secciones del schema

-- 4. Si aparece error de FK en compromisos:
--    - Asegúrate de que existe al menos 1 revisión
--    - El script datos_demo_minimo.sql crea la revisión automáticamente

-- ============================================
-- VERIFICACIÓN POST-EJECUCIÓN:
-- ============================================

-- Verificar que todas las tablas existen:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar conteo de registros:
SELECT 
  (SELECT COUNT(*) FROM gestion_cambios) as cambios,
  (SELECT COUNT(*) FROM encuestas_satisfaccion) as encuestas,
  (SELECT COUNT(*) FROM objetivos_calidad) as objetivos,
  (SELECT COUNT(*) FROM inspecciones_verificacion) as inspecciones,
  (SELECT COUNT(*) FROM no_conformidades) as nc,
  (SELECT COUNT(*) FROM recursos) as recursos,
  (SELECT COUNT(*) FROM riesgos_oportunidades) as riesgos,
  (SELECT COUNT(*) FROM oportunidades_mejora) as om,
  (SELECT COUNT(*) FROM auditorias) as auditorias,
  (SELECT COUNT(*) FROM quejas_reclamos) as quejas,
  (SELECT COUNT(*) FROM indicadores) as indicadores,
  (SELECT COUNT(*) FROM proveedores) as proveedores,
  (SELECT COUNT(*) FROM auditorias_proveedores) as aud_prov,
  (SELECT COUNT(*) FROM revisiones) as revisiones,
  (SELECT COUNT(*) FROM compromisos) as compromisos,
  (SELECT COUNT(*) FROM evidencias) as evidencias;

-- ============================================
-- MÓDULOS CON PÁGINAS CRUD CREADAS:
-- ============================================

-- ✅ /cambios - Gestión de Cambios
-- ✅ /encuestas - Encuestas de Satisfacción  
-- ✅ /objetivos - Objetivos de Calidad
-- ✅ /quejas - Quejas y Reclamos (ya existía)
-- ✅ /indicadores - KPIs (ya existía)
-- ✅ /auditorias - Auditorías (ya existía)
-- ✅ /no-conformidades - No Conformidades (ya existía)
-- ✅ /proveedores - Proveedores (ya existía)
-- ✅ /compromisos - Compromisos (ya existía)

-- 🔄 PENDIENTES (en creación):
-- - /inspecciones - Inspecciones y Verificación
-- - /recursos - Recursos
-- - /riesgos - Riesgos y Oportunidades
-- - /mejoras - Oportunidades de Mejora

-- ============================================
-- DASHBOARD - Botones de acceso
-- ============================================

-- Actualizar dashboard para incluir todos los módulos
-- Archivo: app/dashboard/page.tsx
