/// <reference path="../pb_data/types.d.ts" />

// ISO 9001 - Initial Collections Migration
migrate((app) => {
  // ============================================
  // REVISIONES (Revisión por la Dirección - 9.3)
  // ============================================
  const revisiones = new Collection({
    name: "revisiones",
    type: "base",
    fields: [
      { name: "titulo", type: "text", required: true },
      { name: "fecha_revision", type: "date", required: true },
      { name: "responsable", type: "text", required: true },
      { name: "participantes", type: "json" },
      { name: "estado", type: "select", options: { values: ["abierta", "en_seguimiento", "cerrada"] }, required: true },
      // Entradas 9.3.2
      { name: "analisis_acciones_previas", type: "text" },
      { name: "analisis_cambios_externos", type: "text" },
      { name: "analisis_cambios_internos", type: "text" },
      { name: "analisis_clientes", type: "text" },
      { name: "analisis_objetivos", type: "text" },
      { name: "analisis_procesos", type: "text" },
      { name: "analisis_no_conformidades", type: "text" },
      { name: "analisis_seguimiento_medicion", type: "text" },
      { name: "analisis_auditorias", type: "text" },
      { name: "analisis_proveedores", type: "text" },
      { name: "analisis_recursos", type: "text" },
      { name: "analisis_riesgos", type: "text" },
      { name: "analisis_oportunidades", type: "text" },
      { name: "oportunidades_mejora_identificadas", type: "text" },
      // Salidas 9.3.3
      { name: "decisiones_mejora", type: "text" },
      { name: "decisiones_sgc", type: "text" },
      { name: "necesidades_recursos", type: "text" },
      { name: "conclusiones_generales", type: "text" },
      { name: "porcentaje_cumplimiento", type: "number" },
    ],
  })
  app.save(revisiones)

  // ============================================
  // COMPROMISOS (Acciones de revisiones)
  // ============================================
  const compromisos = new Collection({
    name: "compromisos",
    type: "base",
    fields: [
      { name: "revision_id", type: "relation", options: { collectionId: revisiones.id, maxSelect: 1 } },
      { name: "codigo_compromiso", type: "text" },
      { name: "tipo_salida", type: "select", options: { values: ["mejora", "cambio_sgc", "recursos"] }, required: true },
      { name: "categoria_especifica", type: "text" },
      { name: "descripcion", type: "text", required: true },
      { name: "objetivo", type: "text" },
      { name: "alcance", type: "text" },
      { name: "relacionado_con", type: "text" },
      { name: "origen_entrada", type: "text" },
      { name: "responsable", type: "text", required: true },
      { name: "cargo_responsable", type: "text" },
      { name: "area_responsable", type: "text" },
      { name: "equipo_trabajo", type: "json" },
      { name: "plan_accion", type: "text" },
      { name: "actividades", type: "json" },
      { name: "hitos", type: "json" },
      { name: "fecha_compromiso", type: "date", required: true },
      { name: "fecha_limite", type: "date", required: true },
      { name: "fecha_cumplimiento", type: "date" },
      { name: "estado", type: "select", options: { values: ["pendiente", "en_proceso", "completado", "vencido", "cancelado"] }, required: true },
      { name: "prioridad", type: "select", options: { values: ["alta", "media", "baja"] }, required: true },
      { name: "porcentaje_avance", type: "number" },
      { name: "fecha_ultimo_seguimiento", type: "date" },
      { name: "reporte_avance", type: "text" },
      { name: "obstaculos_identificados", type: "text" },
      { name: "riesgos_cumplimiento", type: "text" },
      { name: "acciones_mitigacion", type: "text" },
      { name: "criterios_aceptacion", type: "text" },
      { name: "recursos_necesarios", type: "text" },
      { name: "recursos_humanos", type: "text" },
      { name: "recursos_tecnicos", type: "text" },
      { name: "recursos_financieros", type: "text" },
      { name: "presupuesto_estimado", type: "number" },
      { name: "presupuesto_aprobado", type: "number" },
      { name: "evidencias", type: "json" },
      { name: "observaciones", type: "text" },
      { name: "verificado_por", type: "text" },
      { name: "fecha_verificacion", type: "date" },
      { name: "resultado_verificacion", type: "text" },
      { name: "eficaz", type: "bool" },
      { name: "beneficios_esperados", type: "text" },
      { name: "beneficios_obtenidos", type: "text" },
      { name: "impacto_sgc", type: "text" },
      { name: "requiere_extension", type: "bool" },
      { name: "justificacion_extension", type: "text" },
      { name: "nueva_fecha_limite", type: "date" },
      { name: "aprobado_extension_por", type: "text" },
      { name: "fecha_cierre_real", type: "date" },
      { name: "lecciones_aprendidas", type: "text" },
      { name: "seguimiento_detallado", type: "text" },
    ],
  })
  app.save(compromisos)

  // ============================================
  // AUDITORÍAS (9.3.2.c.6)
  // ============================================
  const auditorias = new Collection({
    name: "auditorias",
    type: "base",
    fields: [
      { name: "fecha_auditoria", type: "date", required: true },
      { name: "tipo", type: "select", options: { values: ["interna", "externa", "certificacion"] }, required: true },
      { name: "proceso_auditado", type: "text", required: true },
      { name: "auditor_lider", type: "text", required: true },
      { name: "hallazgos_totales", type: "number" },
      { name: "conformidades", type: "number" },
      { name: "no_conformidades_mayores", type: "number" },
      { name: "no_conformidades_menores", type: "number" },
      { name: "observaciones_count", type: "number" },
      { name: "estado_general", type: "select", options: { values: ["satisfactorio", "requiere_mejoras", "critico"] } },
      { name: "resumen", type: "text" },
      { name: "archivo_informe", type: "text" },
    ],
  })
  app.save(auditorias)

  // ============================================
  // QUEJAS Y RECLAMOS (9.3.2.c.1)
  // ============================================
  const quejas_reclamos = new Collection({
    name: "quejas_reclamos",
    type: "base",
    fields: [
      { name: "fecha_recepcion", type: "date", required: true },
      { name: "tipo", type: "select", options: { values: ["queja", "reclamo", "sugerencia", "felicitacion"] }, required: true },
      { name: "cliente", type: "text", required: true },
      { name: "producto_servicio", type: "text" },
      { name: "descripcion", type: "text", required: true },
      { name: "estado", type: "select", options: { values: ["abierta", "en_analisis", "resuelta", "cerrada"] }, required: true },
      { name: "fecha_resolucion", type: "date" },
      { name: "satisfaccion_resolucion", type: "number" },
      { name: "acciones_tomadas", type: "text" },
    ],
  })
  app.save(quejas_reclamos)

  // ============================================
  // INDICADORES / KPIs (9.3.2.c.2 / c.5)
  // ============================================
  const indicadores = new Collection({
    name: "indicadores",
    type: "base",
    fields: [
      { name: "periodo", type: "text", required: true },
      { name: "nombre_indicador", type: "text", required: true },
      { name: "categoria", type: "text" },
      { name: "valor_actual", type: "number" },
      { name: "valor_meta", type: "number" },
      { name: "unidad_medida", type: "text" },
      { name: "cumplimiento", type: "number" },
      { name: "tendencia", type: "select", options: { values: ["mejora", "estable", "deterioro"] } },
      { name: "responsable", type: "text" },
    ],
  })
  app.save(indicadores)

  // ============================================
  // NO CONFORMIDADES (9.3.2.c.4)
  // ============================================
  const no_conformidades = new Collection({
    name: "no_conformidades",
    type: "base",
    fields: [
      { name: "fecha_deteccion", type: "date", required: true },
      { name: "tipo", type: "select", options: { values: ["producto", "proceso", "sistema"] }, required: true },
      { name: "severidad", type: "select", options: { values: ["mayor", "menor", "critica"] } },
      { name: "proceso_afectado", type: "text" },
      { name: "descripcion", type: "text", required: true },
      { name: "causa_raiz", type: "text" },
      { name: "accion_correctiva", type: "text" },
      { name: "responsable", type: "text", required: true },
      { name: "fecha_cierre", type: "date" },
      { name: "estado", type: "select", options: { values: ["abierta", "en_analisis", "en_implementacion", "cerrada"] }, required: true },
      { name: "eficacia_verificada", type: "bool" },
    ],
  })
  app.save(no_conformidades)

  // ============================================
  // PROVEEDORES (9.3.2.c.7)
  // ============================================
  const proveedores = new Collection({
    name: "proveedores",
    type: "base",
    fields: [
      { name: "nombre_proveedor", type: "text", required: true },
      { name: "categoria", type: "text" },
      { name: "calificacion_actual", type: "number" },
      { name: "fecha_evaluacion", type: "date" },
      { name: "criterios_evaluacion", type: "json" },
      { name: "estado", type: "select", options: { values: ["aprobado", "condicional", "no_aprobado"] } },
      { name: "incidentes_totales", type: "number" },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(proveedores)

  // ============================================
  // OBJETIVOS DE CALIDAD (9.3.2.c.2)
  // ============================================
  const objetivos_calidad = new Collection({
    name: "objetivos_calidad",
    type: "base",
    fields: [
      { name: "periodo", type: "text" },
      { name: "objetivo", type: "text", required: true },
      { name: "area_responsable", type: "text" },
      { name: "responsable", type: "text" },
      { name: "fecha_inicio", type: "date" },
      { name: "fecha_meta", type: "date" },
      { name: "estado", type: "select", options: { values: ["activo", "completado", "cancelado", "retrasado"] }, required: true },
      { name: "indicador_medicion", type: "text" },
      { name: "valor_inicial", type: "number" },
      { name: "valor_actual", type: "number" },
      { name: "valor_meta", type: "number" },
      { name: "unidad_medida", type: "text" },
      { name: "porcentaje_avance", type: "number" },
      { name: "ultimo_seguimiento", type: "text" },
      { name: "observaciones", type: "text" },
      { name: "riesgos_identificados", type: "text" },
      { name: "acciones_mitigacion", type: "text" },
    ],
  })
  app.save(objetivos_calidad)

  // ============================================
  // GESTIÓN DE CAMBIOS (9.3.2.b)
  // ============================================
  const gestion_cambios = new Collection({
    name: "gestion_cambios",
    type: "base",
    fields: [
      { name: "fecha_registro", type: "date", required: true },
      { name: "tipo", type: "select", options: { values: ["externo", "interno"] }, required: true },
      { name: "categoria", type: "select", options: { values: ["economico", "legal", "tecnologico", "competitivo", "social", "organizacional", "operacional"] } },
      { name: "descripcion", type: "text", required: true },
      { name: "impacto_sgc", type: "select", options: { values: ["alto", "medio", "bajo"] } },
      { name: "oportunidad_amenaza", type: "select", options: { values: ["oportunidad", "amenaza", "neutral"] } },
      { name: "partes_interesadas_afectadas", type: "json" },
      { name: "procesos_impactados", type: "json" },
      { name: "acciones_tomadas", type: "text" },
      { name: "responsable", type: "text" },
      { name: "estado", type: "select", options: { values: ["activo", "mitigado", "cerrado"] }, required: true },
    ],
  })
  app.save(gestion_cambios)

  // ============================================
  // ENCUESTAS DE SATISFACCIÓN (9.3.2.c.1)
  // ============================================
  const encuestas_satisfaccion = new Collection({
    name: "encuestas_satisfaccion",
    type: "base",
    fields: [
      { name: "fecha_encuesta", type: "date", required: true },
      { name: "cliente", type: "text", required: true },
      { name: "tipo_servicio", type: "text" },
      { name: "calificacion_general", type: "number" },
      { name: "calificacion_calidad", type: "number" },
      { name: "calificacion_atencion", type: "number" },
      { name: "calificacion_tiempos", type: "number" },
      { name: "comentarios", type: "text" },
      { name: "recomendaria", type: "bool" },
      { name: "areas_mejora", type: "text" },
    ],
  })
  app.save(encuestas_satisfaccion)

  // ============================================
  // INSPECCIONES Y VERIFICACIÓN (9.3.2.c.3)
  // ============================================
  const inspecciones_verificacion = new Collection({
    name: "inspecciones_verificacion",
    type: "base",
    fields: [
      { name: "fecha_inspeccion", type: "date", required: true },
      { name: "tipo_inspeccion", type: "select", options: { values: ["producto", "proceso", "instalacion", "equipo"] }, required: true },
      { name: "area_proceso", type: "text" },
      { name: "inspector", type: "text", required: true },
      { name: "criterios_verificacion", type: "text" },
      { name: "resultado", type: "select", options: { values: ["conforme", "no_conforme", "con_observaciones"] } },
      { name: "hallazgos", type: "text" },
      { name: "acciones_requeridas", type: "text" },
      { name: "fecha_seguimiento", type: "date" },
      { name: "estado", type: "select", options: { values: ["abierta", "en_seguimiento", "cerrada"] }, required: true },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(inspecciones_verificacion)

  // ============================================
  // RIESGOS Y OPORTUNIDADES (9.3.2.e / 6.1)
  // ============================================
  const riesgos_oportunidades = new Collection({
    name: "riesgos_oportunidades",
    type: "base",
    fields: [
      { name: "fecha_identificacion", type: "date", required: true },
      { name: "tipo", type: "select", options: { values: ["riesgo", "oportunidad"] }, required: true },
      { name: "categoria", type: "select", options: { values: ["operacional", "estrategico", "financiero", "cumplimiento", "reputacional"] } },
      { name: "descripcion", type: "text", required: true },
      { name: "proceso_relacionado", type: "text" },
      { name: "probabilidad", type: "number" },
      { name: "impacto", type: "number" },
      { name: "nivel_riesgo", type: "number" },
      { name: "acciones_planificadas", type: "text" },
      { name: "responsable", type: "text" },
      { name: "fecha_implementacion", type: "date" },
      { name: "estado", type: "select", options: { values: ["identificado", "en_tratamiento", "mitigado", "cerrado"] }, required: true },
      { name: "eficacia_acciones", type: "text" },
      { name: "fecha_revision", type: "date" },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(riesgos_oportunidades)

  // ============================================
  // OPORTUNIDADES DE MEJORA (10.3)
  // ============================================
  const oportunidades_mejora = new Collection({
    name: "oportunidades_mejora",
    type: "base",
    fields: [
      { name: "fecha_identificacion", type: "date", required: true },
      { name: "titulo", type: "text", required: true },
      { name: "descripcion", type: "text", required: true },
      { name: "area_proceso", type: "text" },
      { name: "tipo_mejora", type: "select", options: { values: ["correctiva", "preventiva", "innovacion", "optimizacion"] } },
      { name: "beneficio_esperado", type: "text" },
      { name: "responsable", type: "text" },
      { name: "prioridad", type: "select", options: { values: ["alta", "media", "baja"] } },
      { name: "estado", type: "select", options: { values: ["propuesta", "en_evaluacion", "aprobada", "en_implementacion", "implementada", "cerrada"] }, required: true },
      { name: "fecha_implementacion", type: "date" },
      { name: "resultado_obtenido", type: "text" },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(oportunidades_mejora)

  // ============================================
  // RECURSOS (9.3.2.d)
  // ============================================
  const recursos = new Collection({
    name: "recursos",
    type: "base",
    fields: [
      { name: "tipo_recurso", type: "select", options: { values: ["humano", "infraestructura", "tecnologico", "financiero", "informacion"] }, required: true },
      { name: "nombre_recurso", type: "text", required: true },
      { name: "area", type: "text" },
      { name: "estado_actual", type: "select", options: { values: ["disponible", "insuficiente", "adecuado", "requiere_mejora"] } },
      { name: "cantidad_actual", type: "text" },
      { name: "capacidad_utilizada", type: "number" },
      { name: "necesidad_adicional", type: "bool" },
      { name: "cantidad_requerida", type: "text" },
      { name: "justificacion", type: "text" },
      { name: "prioridad", type: "select", options: { values: ["alta", "media", "baja"] } },
      { name: "fecha_evaluacion", type: "date" },
      { name: "responsable", type: "text" },
      { name: "costo_estimado", type: "number" },
      { name: "estado_solicitud", type: "select", options: { values: ["pendiente", "aprobado", "rechazado", "en_proceso"] } },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(recursos)

  // ============================================
  // AUDITORÍAS DE PROVEEDORES
  // ============================================
  const auditorias_proveedores = new Collection({
    name: "auditorias_proveedores",
    type: "base",
    fields: [
      { name: "proveedor_id", type: "relation", options: { collectionId: proveedores.id, maxSelect: 1 } },
      { name: "fecha_auditoria", type: "date", required: true },
      { name: "tipo_auditoria", type: "select", options: { values: ["inicial", "seguimiento", "recertificacion"] } },
      { name: "auditor", type: "text" },
      { name: "resultado", type: "select", options: { values: ["aprobado", "condicional", "rechazado"] } },
      { name: "hallazgos", type: "text" },
      { name: "acciones_correctivas", type: "text" },
      { name: "fecha_seguimiento", type: "date" },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(auditorias_proveedores)

  // Set API rules to allow public read/write (adjust as needed for auth)
  const collections = [
    revisiones, compromisos, auditorias, quejas_reclamos, indicadores,
    no_conformidades, proveedores, objetivos_calidad, gestion_cambios,
    encuestas_satisfaccion, inspecciones_verificacion, riesgos_oportunidades,
    oportunidades_mejora, recursos, auditorias_proveedores
  ]

  for (const col of collections) {
    col.listRule = ""
    col.viewRule = ""
    col.createRule = ""
    col.updateRule = ""
    col.deleteRule = ""
    app.save(col)
  }
}, (app) => {
  // Revert
  const names = [
    "auditorias_proveedores", "recursos", "oportunidades_mejora",
    "riesgos_oportunidades", "inspecciones_verificacion", "encuestas_satisfaccion",
    "gestion_cambios", "objetivos_calidad", "proveedores", "no_conformidades",
    "indicadores", "quejas_reclamos", "auditorias", "compromisos", "revisiones"
  ]
  for (const name of names) {
    const col = app.findCollectionByNameOrId(name)
    app.delete(col)
  }
})
