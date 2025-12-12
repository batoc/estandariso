-- ============================================
-- DATOS DE DEMOSTRACIÓN MÍNIMOS
-- Sistema de Gestión de Calidad ISO 9001:2015
-- Revisión por la Dirección - Cláusula 9.3
-- ============================================

-- Nota: Datos mínimos para demostrar funcionalidad
-- El usuario puede agregar más registros según necesite

-- ============================================
-- 9.3.2.b) GESTIÓN DE CAMBIOS
-- ============================================

INSERT INTO gestion_cambios (
  fecha_identificacion, tipo_cambio, categoria,
  descripcion_cambio, origen, impacto_sgc,
  procesos_afectados, analisis_impacto,
  acciones_requeridas, responsable, estado
) VALUES 
(
  '2024-11-15',
  'externo',
  'normativo',
  'Nueva versión de normativa de seguridad en productos eléctricos - Decreto 2024-XXX',
  'Ministerio de Comercio',
  'alto',
  ARRAY['Diseño', 'Producción', 'Calidad'],
  'Requiere actualización de procedimientos de pruebas eléctricas y certificación de productos',
  'Actualizar procedimientos de ensayo, capacitar personal técnico, renovar certificaciones',
  'Gerente de Calidad',
  'en_implementacion'
),
(
  '2024-12-01',
  'interno',
  'organizacional',
  'Implementación de nueva línea de producción automatizada',
  'Junta Directiva - Plan Estratégico 2025',
  'medio',
  ARRAY['Producción', 'Mantenimiento', 'RRHH'],
  'Requiere capacitación del personal y actualización de instructivos de trabajo',
  'Desarrollar programas de capacitación, actualizar documentación técnica',
  'Gerente de Producción',
  'identificado'
);

-- ============================================
-- 9.3.2.c.1) ENCUESTAS DE SATISFACCIÓN
-- ============================================

INSERT INTO encuestas_satisfaccion (
  fecha_encuesta, periodo, cliente, tipo_cliente,
  metodo_aplicacion,
  calidad_producto, servicio_atencion, tiempos_entrega, 
  precio_valor, comunicacion, resolucion_problemas,
  satisfaccion_general, nps_score,
  comentarios, estado
) VALUES 
(
  '2024-11-20',
  'Q4-2024',
  'Distribuidora ElectroNorte S.A.',
  'distribuidor',
  'online',
  4.5, 4.8, 4.2, 4.0, 4.5, 4.3,
  4.4, 75,
  'Excelente calidad de producto. Mejorar tiempos de entrega en temporada alta.',
  'con_acciones'
),
(
  '2024-12-05',
  'Nov-2024',
  'Constructora MegaObras Ltda.',
  'corporativo',
  'presencial',
  4.8, 5.0, 4.9, 4.2, 4.7, 4.8,
  4.7, 90,
  'Muy satisfechos con el servicio. Valoramos el acompañamiento técnico.',
  'cerrada'
);

-- ============================================
-- 9.3.2.c.2) OBJETIVOS DE CALIDAD
-- ============================================

INSERT INTO objetivos_calidad (
  periodo, codigo_objetivo,
  objetivo, alineacion_estrategica, proceso_relacionado,
  area_responsable, responsable,
  fecha_inicio, fecha_meta,
  indicador_medicion, frecuencia_medicion,
  valor_inicial, valor_actual, valor_meta, unidad_medida,
  porcentaje_avance, estado, tendencia
) VALUES 
(
  '2024',
  'OC-001-2024',
  'Reducir tasa de no conformidades en productos terminados',
  'Mejora de la calidad del producto - Pilar estratégico de Excelencia Operacional',
  'Control de Calidad',
  'Calidad',
  'Coord. Control de Calidad',
  '2024-01-01',
  '2024-12-31',
  'Porcentaje de productos no conformes detectados en inspección final',
  'mensual',
  3.2, 1.8, 2.0, '%',
  110, 'completado', 'favorable'
),
(
  '2024',
  'OC-002-2024',
  'Incrementar satisfacción del cliente',
  'Enfoque al cliente - Pilar estratégico de Crecimiento Sostenible',
  'Servicio al Cliente',
  'Comercial',
  'Gerente Comercial',
  '2024-01-01',
  '2024-12-31',
  'Índice promedio de satisfacción en encuestas',
  'trimestral',
  4.1, 4.5, 4.6, 'puntos (1-5)',
  85, 'activo', 'favorable'
);

-- ============================================
-- 9.3.2.c.3) INSPECCIONES Y VERIFICACIÓN
-- ============================================

INSERT INTO inspecciones_verificacion (
  fecha_inspeccion, tipo_inspeccion,
  proceso_inspeccionado, area, lote_producto,
  inspector, rol_inspector,
  criterios_evaluacion,
  items_inspeccionados, items_conformes, items_no_conformes,
  porcentaje_conformidad, resultado_general,
  hallazgos, requiere_accion_correctiva, estado_seguimiento
) VALUES 
(
  '2024-11-25',
  'producto',
  'Línea de Ensamble Final',
  'Producción - Línea 2',
  'LOTE-2024-1125',
  'Inspector QA - María López',
  'calidad',
  'Inspección visual, pruebas eléctricas, dimensionales según especificación técnica ET-001',
  100, 97, 3,
  97.0, 'conforme_con_observaciones',
  'Detectadas 3 unidades con acabado superficial deficiente. No afecta funcionalidad.',
  false, 'cerrado'
),
(
  '2024-12-08',
  'proceso',
  'Proceso de Soldadura',
  'Producción - Línea 1',
  NULL,
  'Ingeniero de Calidad - Carlos Ruiz',
  'calidad',
  'Verificación de parámetros de soldadura según procedimiento PS-003',
  50, 48, 2,
  96.0, 'conforme_con_observaciones',
  'Dos puntos de soldadura con temperatura ligeramente fuera de rango especificado.',
  true, 'en_proceso'
);

-- ============================================
-- 9.3.2.c.4) NO CONFORMIDADES (con recurrencia)
-- ============================================

INSERT INTO no_conformidades (
  codigo_nc, fecha_deteccion, origen, tipo, severidad,
  proceso_afectado, descripcion, evidencia_objetiva,
  causa_raiz, accion_correctiva,
  reportado_por, responsable_accion, area_responsable,
  fecha_compromiso_cierre, estado,
  es_recurrente, frecuencia_ocurrencia
) VALUES 
(
  'NC-2024-008',
  '2024-11-10',
  'inspeccion',
  'producto',
  'menor',
  'Empaque',
  'Etiquetas con información de lote ilegible en 5 unidades',
  'Inspección final detectó etiquetas con impresión borrosa, número de lote no identificable',
  'Desgaste del rodillo de impresión en etiquetadora automática',
  'Reemplazar rodillo de impresión y establecer mantenimiento preventivo cada 10,000 impresiones',
  'Inspector de Calidad - Ana Gómez',
  'Supervisor de Empaque',
  'Empaque',
  '2024-12-15',
  'en_implementacion',
  false, 1
),
(
  'NC-2024-012',
  '2024-12-01',
  'cliente',
  'producto',
  'mayor',
  'Ensamble Final',
  'Cliente reporta conector eléctrico defectuoso en 3 unidades del mismo lote',
  'Lote LOT-2024-1120: 3 unidades con pin de conexión suelto, cliente: Distribuidora Sur',
  'Torque de apriete en ensamble de conector no verificado adecuadamente por operador nuevo',
  'Reforzar capacitación en procedimiento de ensamble, implementar verificación por pares primeros 30 días',
  'Servicio al Cliente - Laura Díaz',
  'Supervisor de Línea',
  'Producción',
  '2024-12-20',
  'en_analisis',
  true, 3
);

-- ============================================
-- 9.3.2.c.7) AUDITORÍAS A PROVEEDORES
-- ============================================

INSERT INTO auditorias_proveedores (
  proveedor_id, fecha_auditoria, tipo_auditoria, alcance,
  auditor_lider, equipo_auditor,
  normas_evaluadas,
  hallazgos_totales, conformidades, no_conformidades_mayores, 
  no_conformidades_menores, observaciones_count,
  calificacion_auditoria, resultado_general,
  hallazgos_criticos, estado_seguimiento,
  acciones_cerradas, acciones_pendientes
) VALUES 
(
  1, -- Asume que hay un proveedor con id=1
  '2024-10-15',
  'in_situ',
  'Sistema de gestión de calidad para suministro de componentes electrónicos',
  'Auditor Líder - Ing. Roberto Martínez',
  ARRAY['Ing. Sandra Pérez', 'Tec. Miguel Torres'],
  ARRAY['ISO 9001:2015', 'IPC-A-610'],
  12, 8, 1, 3, 2,
  82, 'aceptable',
  'NC Mayor: Control de lotes no documentado adecuadamente. Riesgo de trazabilidad.',
  'en_proceso',
  3, 1
);

-- ============================================
-- 9.3.2.d) RECURSOS
-- ============================================

INSERT INTO recursos (
  tipo_recurso, categoria,
  nombre_recurso, codigo_recurso, ubicacion, area_asignada,
  estado_actual, cantidad_actual,
  fecha_evaluacion, evaluado_por, cumple_requisitos,
  necesidad_adicional, tipo_necesidad, descripcion_necesidad,
  justificacion, impacto_no_disponibilidad, prioridad,
  costo_estimado, estado_solicitud
) VALUES 
(
  'tecnologico',
  'equipamiento_medicion',
  'Multímetro de precisión para línea QA',
  'EQ-QA-003',
  'Laboratorio de Calidad',
  'Calidad',
  'requiere_actualizacion',
  '2 unidades',
  '2024-11-30',
  'Coord. Laboratorio',
  false,
  true,
  'reemplazo',
  'Requiere 2 multímetros digitales de mayor precisión para cumplir nuevos requisitos normativos',
  'Decreto 2024-XXX exige precisión de ±0.1% en mediciones eléctricas. Equipos actuales: ±0.5%',
  'alto',
  'alta',
  3200000,
  'aprobado'
),
(
  'humano',
  'personal_tecnico',
  'Técnico especialista en soldadura certificado',
  'RRHH-2024-015',
  'Producción',
  'Producción',
  'insuficiente',
  '1 técnico certificado',
  '2024-12-01',
  'Jefe de Producción',
  false,
  true,
  'incremento_cantidad',
  'Contratar 1 técnico adicional certificado en soldadura especializada',
  'Nueva línea automatizada requiere personal certificado. Carga actual excede capacidad.',
  'medio',
  'media',
  45000000,
  'solicitado'
);

-- ============================================
-- 9.3.2.e) RIESGOS Y OPORTUNIDADES
-- ============================================

INSERT INTO riesgos_oportunidades (
  codigo, fecha_identificacion, tipo,
  categoria, descripcion, causa_origen,
  proceso_relacionado,
  probabilidad, impacto, nivel_riesgo, clasificacion_nivel,
  estrategia, acciones_planificadas, controles_existentes,
  responsable, area_responsable,
  fecha_implementacion, estado_implementacion,
  eficacia_acciones, nivel_riesgo_residual,
  riesgo_materializado, estado
) VALUES 
(
  'R-2024-003',
  '2024-09-15',
  'riesgo',
  'operacional',
  'Dependencia de proveedor único para componente crítico',
  'Componente electrónico especializado solo disponible con un proveedor nacional',
  'Abastecimiento',
  4, 4, 16, 'alto',
  'reducir',
  'Calificar proveedor alternativo internacional. Incrementar stock de seguridad a 3 meses.',
  'Contrato con proveedor actual, stock 1 mes',
  'Coord. Compras',
  'Logística',
  '2024-11-01',
  'implementado',
  'eficaz',
  6,
  false, 'controlado'
),
(
  'O-2024-002',
  '2024-10-20',
  'oportunidad',
  'estrategico',
  'Alianza estratégica con distribuidor regional para expansión a 3 países',
  'Distribuidor líder en Centroamérica interesado en productos',
  'Comercial',
  4, 5, 20, 'alto',
  'explotar',
  'Desarrollar plan de exportación. Certificar productos bajo normas internacionales. Capacitar equipo comercial.',
  'Producto cumple estándares internacionales',
  'Gerente Comercial',
  'Comercial',
  '2025-02-01',
  'planificado',
  NULL,
  NULL,
  false, 'activo'
);

-- ============================================
-- 9.3.2.f) OPORTUNIDADES DE MEJORA
-- ============================================

INSERT INTO oportunidades_mejora (
  codigo_om, fecha_identificacion,
  origen, titulo, descripcion_situacion_actual,
  descripcion_mejora_propuesta,
  proceso_afectado, area_responsable,
  beneficios_esperados, impacto_esperado,
  analisis_viabilidad, factibilidad_tecnica, factibilidad_economica,
  costo_estimado, prioridad,
  propuesta_por, responsable_implementacion,
  estado
) VALUES 
(
  'OM-2024-005',
  '2024-11-05',
  'auditoria',
  'Digitalización de registros de inspección',
  'Actualmente registros de inspección se llevan en formatos papel. Proceso lento y propenso a errores de transcripción.',
  'Implementar aplicación móvil/tablet para registro digital en línea de producción con sincronización automática a sistema central',
  'Control de Calidad',
  'Calidad',
  'Reducción 70% tiempo de registro. Eliminación errores transcripción. Trazabilidad en tiempo real. Reducción uso papel.',
  'alto',
  'Factible técnicamente. Existen soluciones comerciales y capacidad interna de desarrollo.',
  'alta',
  'alta',
  8500000,
  'alta',
  'Auditor Interno',
  'Jefe de Calidad',
  'aprobada'
),
(
  'OM-2024-007',
  '2024-12-02',
  'iniciativa_propia',
  'Programa de mantenimiento predictivo',
  'Mantenimiento actual es preventivo programado. Paradas no planificadas afectan producción.',
  'Implementar sensores IoT en equipos críticos para monitoreo de condición y mantenimiento predictivo',
  'Mantenimiento',
  'Mantenimiento',
  'Reducción 40% paradas no planificadas. Optimización costos de mantenimiento. Aumento vida útil equipos.',
  'alto',
  'Requiere inversión en sensores y software. ROI estimado 18 meses.',
  'alta',
  'media',
  25000000,
  'media',
  'Jefe de Mantenimiento',
  'Gerente de Operaciones',
  'en_evaluacion'
);

-- ============================================
-- REVISIÓN POR LA DIRECCIÓN - EJEMPLO
-- ============================================

INSERT INTO revisiones (
  codigo_revision, titulo, fecha_revision,
  hora_inicio, hora_fin, lugar,
  responsable, cargo_responsable, participantes,
  estado,
  
  -- Análisis de entradas (ejemplos mínimos)
  analisis_cambios_externos,
  analisis_cambios_internos,
  analisis_satisfaccion_cliente,
  analisis_objetivos_calidad,
  analisis_no_conformidades,
  analisis_proveedores,
  analisis_recursos,
  analisis_riesgos,
  analisis_mejoras,
  
  -- Conclusiones
  conclusiones_generales,
  conveniencia_sgc,
  adecuacion_sgc,
  eficacia_sgc,
  
  -- Salidas
  decisiones_mejora,
  decisiones_cambios_sgc,
  decisiones_recursos,
  
  fecha_proxima_revision
) VALUES 
(
  'RD-2024-Q4',
  'Revisión por la Dirección - Cuarto Trimestre 2024',
  '2024-12-15',
  '09:00', '13:00',
  'Sala de Juntas - Edificio Administrativo',
  'Gerente General',
  'Gerente General',
  ARRAY['Gerente de Calidad', 'Gerente de Producción', 'Gerente Comercial', 'Jefe de Compras', 'Coord. RRHH'],
  'planificada',
  
  'Se identificaron 2 cambios normativos importantes que requieren ajustes en procesos de certificación. Cambio en normativa de seguridad eléctrica en implementación.',
  'Nueva línea de producción automatizada requiere actualización de procedimientos y capacitación. Proceso en fase inicial.',
  'Satisfacción general de clientes en 4.5/5.0. NPS de 82 puntos. Áreas de mejora: tiempos de entrega en temporada alta.',
  'Objetivo de reducción de NC superado (meta 2%, logrado 1.8%). Satisfacción de cliente en 4.5 vs meta 4.6 (92% avance).',
  'Se gestionaron 12 NC en el trimestre. 2 NC recurrentes requieren análisis de causa raíz más profundo. Eficacia de acciones correctivas: 85%.',
  'Evaluación de proveedor crítico resultó en calificación "aceptable". 1 NC mayor pendiente de cierre. Seguimiento programado.',
  'Se identificaron necesidades críticas: equipos de medición de precisión (aprobado) y personal técnico certificado (en evaluación).',
  'Riesgo de proveedor único mitigado exitosamente. Oportunidad de expansión regional identificada y en planificación.',
  '7 oportunidades de mejora identificadas en el periodo. 2 aprobadas para implementación (digitalización registros y mantenimiento predictivo).',
  
  'El SGC demuestra eficacia general satisfactoria con cumplimiento de objetivos clave. Se identifican oportunidades de mejora en gestión de proveedores y reducción de recurrencias.',
  'Conveniente',
  'Adecuado con ajustes menores',
  'Eficaz - Cumple objetivos organizacionales',
  
  'Implementar digitalización de registros de inspección. Desarrollar programa de mantenimiento predictivo. Profundizar análisis de NC recurrentes.',
  'Actualizar procedimientos para nueva línea automatizada. Revisar política de calidad para incluir expansión regional.',
  'Aprobar adquisición de equipos de medición de precisión. Evaluar contratación de técnico certificado en soldadura.',
  
  '2025-03-15'
);

-- ============================================
-- COMPROMISOS DE LA REVISIÓN - EJEMPLO
-- ============================================

INSERT INTO compromisos (
  revision_id, codigo_compromiso, tipo_salida,
  descripcion, objetivo,
  responsable, cargo_responsable, area_responsable,
  fecha_compromiso, fecha_limite,
  estado, prioridad, porcentaje_avance,
  presupuesto_estimado
) VALUES 
(
  1, -- Asume revision_id = 1
  'C-RD-2024-Q4-001',
  'mejora',
  'Implementar sistema digital de registro de inspecciones en línea de producción',
  'Reducir tiempo de registro en 70% y eliminar errores de transcripción',
  'Jefe de Calidad',
  'Jefe de Departamento',
  'Calidad',
  '2024-12-15',
  '2025-03-31',
  'pendiente',
  'alta',
  0,
  8500000
),
(
  1,
  'C-RD-2024-Q4-002',
  'recursos',
  'Adquirir e implementar multímetros de precisión para cumplimiento normativo',
  'Garantizar cumplimiento de requisitos de medición según nueva normativa',
  'Coord. Laboratorio',
  'Coordinador',
  'Calidad',
  '2024-12-15',
  '2025-01-31',
  'pendiente',
  'critica',
  0,
  3200000
),
(
  1,
  'C-RD-2024-Q4-003',
  'cambio_sgc',
  'Actualizar procedimientos de producción para línea automatizada',
  'Documentar nuevos procesos y capacitar personal operativo',
  'Gerente de Producción',
  'Gerente de Área',
  'Producción',
  '2024-12-15',
  '2025-02-28',
  'pendiente',
  'alta',
  0,
  NULL
);

-- ============================================
-- EVIDENCIAS - EJEMPLO
-- ============================================

INSERT INTO evidencias (
  revision_id, categoria, tipo_documento,
  nombre_archivo, descripcion,
  fecha_documento, subido_por
) VALUES 
(
  1,
  'entrada',
  'informe',
  'Informe_Satisfaccion_Cliente_Q4_2024.pdf',
  'Consolidado de encuestas de satisfacción del cuarto trimestre',
  '2024-12-10',
  'Gerente Comercial'
),
(
  1,
  'entrada',
  'informe',
  'Analisis_NC_Recurrentes_2024.pdf',
  'Análisis de no conformidades recurrentes y planes de acción',
  '2024-12-12',
  'Gerente de Calidad'
);

-- ============================================
-- MENSAJE FINAL
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'DATOS DE DEMOSTRACIÓN INSERTADOS EXITOSAMENTE';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Registros creados (MÍNIMOS para demostración):';
  RAISE NOTICE '- Gestión de Cambios: 2 registros';
  RAISE NOTICE '- Encuestas de Satisfacción: 2 registros';
  RAISE NOTICE '- Objetivos de Calidad: 2 registros';
  RAISE NOTICE '- Inspecciones/Verificación: 2 registros';
  RAISE NOTICE '- No Conformidades: 2 registros';
  RAISE NOTICE '- Auditorías Proveedores: 1 registro';
  RAISE NOTICE '- Recursos: 2 registros';
  RAISE NOTICE '- Riesgos y Oportunidades: 2 registros';
  RAISE NOTICE '- Oportunidades de Mejora: 2 registros';
  RAISE NOTICE '- Revisiones: 1 registro';
  RAISE NOTICE '- Compromisos: 3 registros';
  RAISE NOTICE '- Evidencias: 2 registros';
  RAISE NOTICE '';
  RAISE NOTICE 'El sistema está listo para que agregues más registros';
  RAISE NOTICE 'según tus necesidades operativas.';
  RAISE NOTICE '==============================================';
END $$;
