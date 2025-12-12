-- ============================================
-- DATOS PARA MÓDULOS EXISTENTES
-- Complemento para tablas ya creadas
-- ============================================

-- ============================================
-- AUDITORÍAS (tabla existente)
-- ============================================

INSERT INTO auditorias (
  fecha_auditoria, codigo_auditoria, tipo, alcance,
  norma_referencia, proceso_auditado, area_auditada,
  auditor_lider, equipo_auditor,
  hallazgos_totales, conformidades, no_conformidades_mayores,
  no_conformidades_menores, observaciones_count, oportunidades_mejora,
  calificacion_general, estado_general,
  resumen, estado
) VALUES 
(
  '2024-10-20',
  'AI-2024-004',
  'interna',
  'Sistema de Gestión de Calidad - Procesos de Producción y Control de Calidad',
  'ISO 9001:2015',
  'Producción y Control de Calidad',
  'Planta de Manufactura',
  'Auditor Interno Certificado - Ing. María González',
  ARRAY['Auditor - Carlos Ramírez', 'Observador - Técnico de Calidad'],
  15, 10, 1, 4, 3, 3,
  85, 'satisfactorio',
  'Auditoría interna del cuarto trimestre. SGC demuestra eficacia general. NC Mayor en trazabilidad de lotes. Se emitieron 3 oportunidades de mejora relacionadas con digitalización de registros.',
  'cerrada'
),
(
  '2024-11-15',
  'AE-2024-002',
  'externa',
  'Auditoría de seguimiento - Certificación ISO 9001',
  'ISO 9001:2015',
  'Sistema de Gestión Completo',
  'Todas las áreas',
  'Auditor Externo - Organismo Certificador XYZ',
  ARRAY['Auditor Senior', 'Auditor Junior'],
  8, 6, 0, 2, 2, 1,
  92, 'satisfactorio',
  'Auditoría de seguimiento para renovación de certificación. Sistema maduro y eficaz. 2 NC menores en control de documentos. Certificación recomendada.',
  'en_seguimiento'
);

-- ============================================
-- QUEJAS Y RECLAMOS (tabla existente)
-- ============================================

INSERT INTO quejas_reclamos (
  fecha_recepcion, tipo, canal_recepcion,
  cliente, contacto, producto_servicio,
  descripcion, clasificacion_gravedad,
  responsable_atencion, fecha_respuesta, respuesta_cliente,
  acciones_tomadas, estado, fecha_resolucion,
  satisfaccion_resolucion
) VALUES 
(
  '2024-11-18',
  'reclamo',
  'email',
  'Distribuidora ElectroSur Ltda.',
  'compras@electrosur.com - Coord. Adquisiciones',
  'Interruptores termomagnéticos Ref. ITM-20A',
  'Lote recibido con 8 unidades defectuosas de 100. Interruptores no accionan correctamente, quedan en posición intermedia.',
  'alta',
  'Jefe Servicio al Cliente',
  '2024-11-18',
  'Se contactó con cliente. Se ofreció reemplazo inmediato del lote completo y visita técnica para verificación.',
  'Lote reemplazado en 24h. Se realizó análisis de causa raíz: problema en ajuste de torque en línea de ensamble. NC generada. Personal reentrenado.',
  'cerrada',
  '2024-11-22',
  5
),
(
  '2024-12-03',
  'queja',
  'telefono',
  'Constructora MegaObras Ltda.',
  'Ing. Pedro Sánchez - Residente de Obra',
  'Entrega de cables eléctricos',
  'Retraso de 5 días en entrega comprometida para el 28-Nov. Afecta cronograma de obra.',
  'media',
  'Gerente Comercial',
  '2024-12-03',
  'Se explicó situación: demora en importación de materia prima por huelga portuaria. Se ofreció descuento 10% y prioridad en próximos pedidos.',
  'Cliente acepta justificación. Entrega realizada 05-Dic. Se implementó análisis de riesgo logístico para evitar recurrencia.',
  'resuelta',
  '2024-12-05',
  4
);

-- ============================================
-- INDICADORES (tabla existente)
-- ============================================

INSERT INTO indicadores (
  periodo, nombre_indicador, categoria, proceso_relacionado,
  valor_actual, valor_meta, unidad_medida,
  cumplimiento, tendencia, responsable,
  frecuencia_medicion, observaciones
) VALUES 
(
  'Nov-2024',
  'Tasa de productos conformes en inspección final',
  'Calidad de Producto',
  'Control de Calidad',
  98.2, 98.0, '%',
  100.2, 'mejora',
  'Jefe de Control de Calidad',
  'mensual',
  'Superación de meta. Mejora atribuida a capacitación en nuevos procedimientos.'
),
(
  'Nov-2024',
  'Cumplimiento de entregas a tiempo',
  'Servicio al Cliente',
  'Logística y Despachos',
  92.5, 95.0, '%',
  97.4, 'estable',
  'Jefe de Logística',
  'mensual',
  'Leve incumplimiento por eventos externos (huelga portuaria). Dentro de rango aceptable.'
),
(
  'Q4-2024',
  'Satisfacción del cliente (NPS)',
  'Satisfacción',
  'Servicio al Cliente',
  82, 80, 'puntos',
  102.5, 'mejora',
  'Gerente Comercial',
  'trimestral',
  'Excelente resultado. Incremento de promotores en 12% vs trimestre anterior.'
);

-- ============================================
-- PROVEEDORES (tabla existente)
-- ============================================

INSERT INTO proveedores (
  nombre_proveedor, nit_identificacion, contacto_principal,
  email, telefono,
  categoria, productos_servicios,
  fecha_evaluacion, metodo_evaluacion,
  calificacion_actual,
  criterios_evaluacion,
  estado, incidentes_totales, requiere_auditoria,
  fecha_proxima_evaluacion, observaciones
) VALUES 
(
  'Componentes Electrónicos Andinos S.A.',
  '900.123.456-7',
  'Gerente Comercial - Laura Martínez',
  'ventas@compelectronicos.com',
  '+57 1 234-5678',
  'Componentes Electrónicos',
  'Resistencias, capacitores, circuitos integrados, conectores',
  '2024-11-30',
  'Evaluación trimestral según criterios establecidos',
  88,
  '{"calidad": 90, "entrega": 92, "precio": 85, "servicio": 88, "documentacion": 85}',
  'aprobado',
  2,
  true,
  '2025-02-28',
  'Proveedor estratégico con buen desempeño. 2 incidentes menores de entrega en el año. Auditoría programada para Q1-2025.'
),
(
  'Plásticos Industriales del Norte Ltda.',
  '890.987.654-3',
  'Director de Ventas - Carlos Ruiz',
  'comercial@plasticosnorte.com',
  '+57 4 876-5432',
  'Materias Primas',
  'Resinas plásticas, materiales aislantes',
  '2024-10-15',
  'Evaluación semestral + Auditoría in-situ',
  82,
  '{"calidad": 85, "entrega": 78, "precio": 88, "servicio": 80, "documentacion": 79}',
  'aprobado_condicional',
  5,
  true,
  '2025-04-15',
  'Proveedor con área de mejora en cumplimiento de entregas. 1 NC Mayor pendiente de cierre (ver auditoria_proveedor_id). Plan de mejora en seguimiento.'
);

-- ============================================
-- MENSAJE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'DATOS MÓDULOS EXISTENTES INSERTADOS';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Registros agregados:';
  RAISE NOTICE '- Auditorías: 2 registros';
  RAISE NOTICE '- Quejas y Reclamos: 2 registros';
  RAISE NOTICE '- Indicadores (KPIs): 3 registros';
  RAISE NOTICE '- Proveedores: 2 registros';
  RAISE NOTICE '==============================================';
END $$;
