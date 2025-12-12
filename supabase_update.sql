-- Actualización de la tabla 'revisiones' para ISO 9001:2015
-- Ejecuta esto en Supabase SQL Editor

-- Agregar nuevos campos según la norma ISO 9001:2015 Cláusula 9.3
ALTER TABLE revisiones
ADD COLUMN IF NOT EXISTS participantes TEXT,
ADD COLUMN IF NOT EXISTS resultados_auditorias TEXT,
ADD COLUMN IF NOT EXISTS retroalimentacion_cliente TEXT,
ADD COLUMN IF NOT EXISTS desempeno_procesos TEXT,
ADD COLUMN IF NOT EXISTS estado_acciones_previas TEXT,
ADD COLUMN IF NOT EXISTS cambios_externos TEXT,
ADD COLUMN IF NOT EXISTS desempeno_proveedores TEXT,
ADD COLUMN IF NOT EXISTS adecuacion_recursos TEXT,
ADD COLUMN IF NOT EXISTS eficacia_acciones_riesgos TEXT,
ADD COLUMN IF NOT EXISTS oportunidades_mejora TEXT,
ADD COLUMN IF NOT EXISTS mejora_sgc TEXT,
ADD COLUMN IF NOT EXISTS mejora_productos TEXT,
ADD COLUMN IF NOT EXISTS necesidades_recursos TEXT,
ADD COLUMN IF NOT EXISTS acciones_seguimiento TEXT,
ADD COLUMN IF NOT EXISTS archivos_adjuntos TEXT,
ADD COLUMN IF NOT EXISTS carpeta_drive TEXT;

-- Agregar comentarios para documentación
COMMENT ON COLUMN revisiones.participantes IS 'Lista de asistentes a la revisión';
COMMENT ON COLUMN revisiones.resultados_auditorias IS 'ENTRADA a) - Resultados de auditorías internas y externas';
COMMENT ON COLUMN revisiones.retroalimentacion_cliente IS 'ENTRADA b) - Retroalimentación del cliente';
COMMENT ON COLUMN revisiones.desempeno_procesos IS 'ENTRADA c) - Desempeño de procesos y conformidad del producto/servicio';
COMMENT ON COLUMN revisiones.estado_acciones_previas IS 'ENTRADA d) - Estado de acciones de revisiones previas';
COMMENT ON COLUMN revisiones.cambios_externos IS 'ENTRADA e) - Cambios en cuestiones externas e internas';
COMMENT ON COLUMN revisiones.desempeno_proveedores IS 'ENTRADA f) - Información sobre desempeño de proveedores';
COMMENT ON COLUMN revisiones.adecuacion_recursos IS 'ENTRADA g) - Adecuación de los recursos';
COMMENT ON COLUMN revisiones.eficacia_acciones_riesgos IS 'ENTRADA h) - Eficacia de acciones frente a riesgos y oportunidades';
COMMENT ON COLUMN revisiones.oportunidades_mejora IS 'ENTRADA i) - Oportunidades de mejora';
COMMENT ON COLUMN revisiones.mejora_sgc IS 'SALIDA a) - Oportunidades de mejora del SGC';
COMMENT ON COLUMN revisiones.mejora_productos IS 'SALIDA b) - Cambios necesarios en productos y servicios';
COMMENT ON COLUMN revisiones.necesidades_recursos IS 'SALIDA c) - Necesidades de recursos';
COMMENT ON COLUMN revisiones.acciones_seguimiento IS 'Plan de acción y seguimiento derivado de la revisión';
COMMENT ON COLUMN revisiones.archivos_adjuntos IS 'JSON array con archivos adjuntos de OneDrive';
COMMENT ON COLUMN revisiones.carpeta_drive IS 'URL de la carpeta de OneDrive para esta revisión';

-- Verificar que los cambios se aplicaron correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'revisiones'
ORDER BY ordinal_position;
