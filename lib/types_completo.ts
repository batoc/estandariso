// ============================================
// SISTEMA DE GESTIÓN DE CALIDAD ISO 9001:2015
// Tipos TypeScript Completos - Cláusula 9.3
// Revisión por la Dirección
// ============================================

// ============================================
// MÓDULOS DE ENTRADAS (9.3.2)
// ============================================

// 9.3.2.b) GESTIÓN DE CAMBIOS
export interface GestionCambio {
  id: number;
  created_at: string;
  updated_at: string;
  
  fecha_identificacion: string;
  tipo_cambio: 'externo' | 'interno';
  categoria?: 'normativo' | 'mercado' | 'tecnologico' | 'organizacional' | 'competitivo' | 'economico' | 'social';
  
  descripcion_cambio: string;
  origen?: string;
  impacto_sgc?: 'alto' | 'medio' | 'bajo';
  
  procesos_afectados?: string[];
  partes_interesadas_afectadas?: string[];
  analisis_impacto?: string;
  
  acciones_requeridas?: string;
  responsable?: string;
  fecha_implementacion?: string;
  
  estado: 'identificado' | 'en_analisis' | 'en_implementacion' | 'implementado' | 'cerrado';
  evidencias?: string[];
  observaciones?: string;
}

// 9.3.2.c.1) ENCUESTAS DE SATISFACCIÓN
export interface EncuestaSatisfaccion {
  id: number;
  created_at: string;
  updated_at: string;
  
  fecha_encuesta: string;
  periodo?: string;
  cliente: string;
  tipo_cliente?: 'distribuidor' | 'usuario_final' | 'corporativo' | 'gobierno';
  
  metodo_aplicacion?: 'online' | 'telefonica' | 'presencial' | 'email';
  
  // Resultados (escala 1-5)
  calidad_producto?: number;
  servicio_atencion?: number;
  tiempos_entrega?: number;
  precio_valor?: number;
  comunicacion?: number;
  resolucion_problemas?: number;
  
  satisfaccion_general?: number;
  nps_score?: number; // Net Promoter Score
  
  comentarios?: string;
  areas_mejora_identificadas?: string;
  responsable_seguimiento?: string;
  acciones_tomadas?: string;
  estado: 'pendiente' | 'en_analisis' | 'con_acciones' | 'cerrada';
}

// 9.3.2.c.1) QUEJAS Y RECLAMOS (PQRS)
export interface QuejaReclamo {
  id: number;
  created_at: string;
  updated_at: string;
  
  fecha_recepcion: string;
  tipo: 'queja' | 'reclamo' | 'peticion' | 'sugerencia' | 'felicitacion';
  canal_recepcion?: 'email' | 'telefono' | 'presencial' | 'web' | 'redes_sociales';
  
  cliente: string;
  contacto?: string;
  
  producto_servicio?: string;
  descripcion: string;
  
  clasificacion_gravedad?: 'baja' | 'media' | 'alta' | 'critica';
  
  responsable_atencion?: string;
  fecha_respuesta?: string;
  respuesta_cliente?: string;
  
  acciones_tomadas?: string;
  
  estado: 'abierta' | 'en_analisis' | 'en_resolucion' | 'resuelta' | 'cerrada';
  fecha_resolucion?: string;
  satisfaccion_resolucion?: number; // 1-5
  
  requiere_accion_correctiva?: boolean;
  nc_generada_id?: number;
  
  observaciones?: string;
}

// 9.3.2.c.2) OBJETIVOS DE CALIDAD
export interface ObjetivoCalidad {
  id: number;
  created_at: string;
  updated_at: string;
  
  periodo: string;
  codigo_objetivo?: string;
  
  objetivo: string;
  alineacion_estrategica?: string;
  proceso_relacionado?: string;
  area_responsable?: string;
  responsable: string;
  
  fecha_inicio: string;
  fecha_meta: string;
  
  indicador_medicion: string;
  frecuencia_medicion?: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  
  valor_inicial?: number;
  valor_actual?: number;
  valor_meta?: number;
  unidad_medida?: string;
  
  porcentaje_avance?: number;
  estado: 'activo' | 'en_riesgo' | 'completado' | 'no_cumplido' | 'cancelado';
  
  fecha_ultima_medicion?: string;
  tendencia?: 'favorable' | 'estable' | 'desfavorable';
  desviaciones?: string;
  causas_desviacion?: string;
  acciones_correctivas?: string;
  
  recursos_asignados?: string;
  riesgos_identificados?: string;
  
  observaciones?: string;
  lecciones_aprendidas?: string;
}

// 9.3.2.c.3) INSPECCIONES Y VERIFICACIÓN
export interface InspeccionVerificacion {
  id: number;
  created_at: string;
  updated_at: string;
  
  fecha_inspeccion: string;
  tipo_inspeccion?: 'producto' | 'proceso' | 'instalaciones' | 'documentacion';
  
  proceso_inspeccionado?: string;
  area?: string;
  lote_producto?: string;
  turno?: string;
  
  inspector: string;
  rol_inspector?: 'calidad' | 'produccion' | 'supervisor' | 'externo';
  acompanantes?: string[];
  
  criterios_evaluacion?: string;
  norma_aplicable?: string;
  
  items_inspeccionados?: number;
  items_conformes?: number;
  items_no_conformes?: number;
  porcentaje_conformidad?: number;
  
  resultado_general?: 'conforme' | 'conforme_con_observaciones' | 'no_conforme';
  
  hallazgos?: string;
  observaciones_menor?: string;
  no_conformidades_detectadas?: string;
  
  acciones_inmediatas?: string;
  requiere_accion_correctiva?: boolean;
  nc_generada_id?: number;
  
  evidencias_fotograficas?: string[];
  documentos_adjuntos?: string[];
  
  fecha_seguimiento?: string;
  estado_seguimiento?: 'pendiente' | 'en_proceso' | 'cerrado';
  
  observaciones?: string;
}

// 9.3.2.c.4) NO CONFORMIDADES
export interface NoConformidad {
  id: number;
  created_at: string;
  updated_at: string;
  
  codigo_nc?: string;
  fecha_deteccion: string;
  fecha_ocurrencia?: string;
  
  origen?: 'auditoria_interna' | 'auditoria_externa' | 'inspeccion' | 'cliente' | 'proceso';
  origen_id?: number;
  
  tipo?: 'producto' | 'proceso' | 'sistema' | 'servicio';
  severidad?: 'critica' | 'mayor' | 'menor';
  
  proceso_afectado?: string;
  descripcion: string;
  evidencia_objetiva?: string;
  
  causa_inmediata?: string;
  causa_raiz?: string;
  metodologia_analisis?: string;
  
  accion_contencion?: string;
  fecha_contencion?: string;
  
  accion_correctiva?: string;
  plan_accion?: string;
  recursos_necesarios?: string;
  
  reportado_por?: string;
  responsable_analisis?: string;
  responsable_accion?: string;
  area_responsable?: string;
  
  fecha_compromiso_cierre?: string;
  fecha_cierre?: string;
  
  verificacion_eficacia?: string;
  metodo_verificacion?: string;
  fecha_verificacion?: string;
  verificado_por?: string;
  eficacia_verificada?: boolean;
  
  estado: 'abierta' | 'en_analisis' | 'en_implementacion' | 'en_verificacion' | 'cerrada' | 'reabierta';
  
  // Recurrencia
  es_recurrente?: boolean;
  nc_relacionadas?: string[];
  frecuencia_ocurrencia?: number;
  
  costo_estimado?: number;
  
  observaciones?: string;
  lecciones_aprendidas?: string;
}

// 9.3.2.c.5) INDICADORES (KPIs)
export interface Indicador {
  id: number;
  created_at: string;
  updated_at: string;
  
  periodo: string;
  nombre_indicador: string;
  categoria?: string;
  proceso_relacionado?: string;
  
  valor_actual: number;
  valor_meta: number;
  unidad_medida: string;
  
  cumplimiento?: number;
  tendencia?: 'mejora' | 'estable' | 'deterioro';
  
  responsable?: string;
  frecuencia_medicion?: string;
  
  observaciones?: string;
}

// 9.3.2.c.6) AUDITORÍAS
export interface Auditoria {
  id: number;
  created_at: string;
  updated_at: string;
  
  fecha_auditoria: string;
  codigo_auditoria?: string;
  
  tipo: 'interna' | 'externa' | 'certificacion' | 'seguimiento';
  alcance?: string;
  norma_referencia?: string;
  
  proceso_auditado?: string;
  area_auditada?: string;
  
  auditor_lider: string;
  equipo_auditor?: string[];
  
  hallazgos_totales?: number;
  conformidades?: number;
  no_conformidades_mayores?: number;
  no_conformidades_menores?: number;
  observaciones_count?: number;
  oportunidades_mejora?: number;
  
  calificacion_general?: number;
  estado_general?: 'satisfactorio' | 'aceptable' | 'requiere_mejoras' | 'critico';
  
  resumen?: string;
  conclusiones?: string;
  
  plan_accion_acordado?: string;
  fecha_seguimiento?: string;
  
  archivo_informe?: string;
  evidencias?: string[];
  
  estado: 'planificada' | 'en_ejecucion' | 'finalizada' | 'en_seguimiento' | 'cerrada';
  observaciones?: string;
}

// 9.3.2.c.7) PROVEEDORES
export interface Proveedor {
  id: number;
  created_at: string;
  updated_at: string;
  
  nombre_proveedor: string;
  nit_identificacion?: string;
  contacto_principal?: string;
  email?: string;
  telefono?: string;
  
  categoria?: string;
  productos_servicios?: string;
  
  fecha_evaluacion: string;
  metodo_evaluacion?: string;
  
  calificacion_actual: number;
  
  criterios_evaluacion?: {
    calidad?: number;
    entrega?: number;
    precio?: number;
    servicio?: number;
    documentacion?: number;
  };
  
  estado: 'aprobado' | 'aprobado_condicional' | 'en_evaluacion' | 'suspendido' | 'rechazado';
  
  incidentes_totales?: number;
  fecha_ultimo_incidente?: string;
  
  requiere_auditoria?: boolean;
  fecha_proxima_evaluacion?: string;
  
  observaciones?: string;
  fortalezas?: string;
  oportunidades_mejora?: string;
}

// AUDITORÍAS A PROVEEDORES
export interface AuditoriaProveedor {
  id: number;
  created_at: string;
  updated_at: string;
  
  proveedor_id: number;
  
  fecha_auditoria: string;
  tipo_auditoria?: 'documental' | 'in_situ' | 'seguimiento' | 'especial';
  alcance?: string;
  
  auditor_lider?: string;
  equipo_auditor?: string[];
  
  normas_evaluadas?: string[];
  criterios_especificos?: string;
  
  hallazgos_totales?: number;
  conformidades?: number;
  no_conformidades_mayores?: number;
  no_conformidades_menores?: number;
  observaciones_count?: number;
  oportunidades_mejora?: number;
  
  calificacion_auditoria?: number;
  resultado_general?: 'satisfactorio' | 'aceptable' | 'requiere_mejoras' | 'no_satisfactorio';
  
  hallazgos_criticos?: string;
  
  acciones_correctivas_solicitadas?: string;
  fecha_compromiso_proveedor?: string;
  
  fecha_seguimiento?: string;
  estado_seguimiento?: 'pendiente' | 'en_proceso' | 'cerrado';
  acciones_cerradas?: number;
  acciones_pendientes?: number;
  
  afecta_calificacion?: boolean;
  
  informe_auditoria_url?: string;
  evidencias?: string[];
  
  observaciones?: string;
  recomendaciones?: string;
}

// 9.3.2.d) RECURSOS
export interface Recurso {
  id: number;
  created_at: string;
  updated_at: string;
  
  tipo_recurso: 'humano' | 'infraestructura' | 'tecnologico' | 'financiero' | 'informacion' | 'ambiente_trabajo';
  categoria?: string;
  
  nombre_recurso: string;
  codigo_recurso?: string;
  ubicacion?: string;
  area_asignada?: string;
  
  estado_actual?: 'disponible' | 'insuficiente' | 'adecuado' | 'requiere_actualizacion' | 'obsoleto';
  cantidad_actual?: string;
  capacidad_disponible?: number;
  capacidad_utilizada?: number;
  porcentaje_uso?: number;
  
  fecha_evaluacion?: string;
  evaluado_por?: string;
  criterios_evaluacion?: string;
  cumple_requisitos?: boolean;
  
  necesidad_adicional?: boolean;
  tipo_necesidad?: 'incremento_cantidad' | 'actualizacion' | 'reemplazo' | 'mantenimiento' | 'capacitacion';
  cantidad_requerida?: string;
  descripcion_necesidad?: string;
  justificacion: string;
  
  impacto_no_disponibilidad?: 'critico' | 'alto' | 'medio' | 'bajo';
  procesos_afectados?: string[];
  
  prioridad?: 'critica' | 'alta' | 'media' | 'baja';
  urgencia?: 'inmediata' | 'corto_plazo' | 'mediano_plazo' | 'largo_plazo';
  
  costo_estimado?: number;
  fuente_financiamiento?: string;
  presupuesto_aprobado?: boolean;
  
  estado_solicitud: 'identificado' | 'solicitado' | 'aprobado' | 'rechazado' | 'en_adquisicion' | 'implementado';
  fecha_solicitud?: string;
  fecha_aprobacion?: string;
  aprobado_por?: string;
  
  fecha_implementacion_prevista?: string;
  fecha_implementacion_real?: string;
  
  proveedor_seleccionado?: string;
  
  observaciones?: string;
  seguimiento?: string;
}

// 9.3.2.e) RIESGOS Y OPORTUNIDADES
export interface RiesgoOportunidad {
  id: number;
  created_at: string;
  updated_at: string;
  
  codigo?: string;
  fecha_identificacion: string;
  tipo: 'riesgo' | 'oportunidad';
  
  categoria?: 'estrategico' | 'operacional' | 'financiero' | 'cumplimiento' | 'reputacional' | 'tecnologico';
  origen?: string;
  
  descripcion: string;
  causa_origen?: string;
  proceso_relacionado?: string;
  contexto?: string;
  
  probabilidad?: number; // 1-5
  impacto?: number; // 1-5
  nivel_riesgo?: number; // probabilidad x impacto
  clasificacion_nivel?: 'bajo' | 'medio' | 'alto' | 'critico';
  
  partes_interesadas?: string[];
  
  estrategia?: string; // evitar, reducir, transferir, aceptar | explotar, mejorar, compartir
  
  acciones_planificadas: string;
  controles_existentes?: string;
  controles_adicionales?: string;
  
  responsable: string;
  area_responsable?: string;
  
  recursos_necesarios?: string;
  costo_estimado?: number;
  
  fecha_implementacion?: string;
  plazo_implementacion?: string;
  
  indicadores_seguimiento?: string;
  frecuencia_revision?: 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'continua';
  
  fecha_ultima_revision?: string;
  estado_implementacion?: 'identificado' | 'planificado' | 'en_implementacion' | 'implementado' | 'en_seguimiento';
  
  fecha_evaluacion_eficacia?: string;
  evaluado_por?: string;
  eficacia_acciones?: 'muy_eficaz' | 'eficaz' | 'parcialmente_eficaz' | 'no_eficaz';
  
  nivel_riesgo_residual?: number;
  
  riesgo_materializado?: boolean;
  fecha_materializacion?: string;
  descripcion_materializacion?: string;
  impacto_real?: string;
  acciones_contingencia?: string;
  
  oportunidad_aprovechada?: boolean;
  beneficios_obtenidos?: string;
  
  estado: 'activo' | 'en_tratamiento' | 'controlado' | 'cerrado' | 'materializado';
  
  evidencias?: string[];
  observaciones?: string;
  lecciones_aprendidas?: string;
}

// 9.3.2.f) OPORTUNIDADES DE MEJORA
export interface OportunidadMejora {
  id: number;
  created_at: string;
  updated_at: string;
  
  codigo_om?: string;
  fecha_identificacion: string;
  
  origen?: 'auditoria' | 'revision_direccion' | 'iniciativa_propia' | 'sugerencia_personal' | 'cliente' | 'benchmarking';
  origen_id?: number;
  
  titulo: string;
  descripcion_situacion_actual: string;
  descripcion_mejora_propuesta: string;
  
  proceso_afectado?: string;
  area_responsable?: string;
  
  beneficios_esperados?: string;
  impacto_esperado?: 'alto' | 'medio' | 'bajo';
  tipo_beneficio?: string[];
  
  analisis_viabilidad?: string;
  factibilidad_tecnica?: 'alta' | 'media' | 'baja';
  factibilidad_economica?: 'alta' | 'media' | 'baja';
  
  recursos_necesarios?: string;
  costo_estimado?: number;
  retorno_inversion_estimado?: string;
  
  prioridad?: 'critica' | 'alta' | 'media' | 'baja';
  urgencia?: string;
  
  propuesta_por?: string;
  responsable_implementacion?: string;
  
  fecha_aprobacion?: string;
  aprobada_por?: string;
  
  plan_implementacion?: string;
  fecha_inicio_prevista?: string;
  fecha_fin_prevista?: string;
  
  fecha_inicio_real?: string;
  fecha_fin_real?: string;
  
  estado: 'propuesta' | 'en_evaluacion' | 'aprobada' | 'rechazada' | 'en_implementacion' | 'implementada' | 'cancelada';
  porcentaje_avance?: number;
  
  fecha_verificacion?: string;
  verificada_por?: string;
  resultados_obtenidos?: string;
  beneficios_reales?: string;
  
  eficaz?: boolean;
  requiere_estandarizacion?: boolean;
  documentacion_actualizada?: boolean;
  
  observaciones?: string;
  lecciones_aprendidas?: string;
}

// ============================================
// REVISIÓN POR LA DIRECCIÓN
// ============================================

export interface Revision {
  id: number;
  created_at: string;
  updated_at: string;
  
  // Información General
  codigo_revision?: string;
  titulo: string;
  fecha_revision: string;
  hora_inicio?: string;
  hora_fin?: string;
  lugar?: string;
  
  responsable: string;
  cargo_responsable?: string;
  participantes?: string[];
  invitados_especiales?: string[];
  
  estado: 'planificada' | 'en_curso' | 'finalizada' | 'en_seguimiento' | 'cerrada';
  
  // === ENTRADAS (9.3.2) ===
  
  // a) Estado de acciones de revisiones previas
  revision_previa_id?: number;
  analisis_compromisos_previos?: string;
  porcentaje_cumplimiento_previo?: number;
  compromisos_pendientes_analisis?: string;
  
  // b) Cambios en cuestiones externas e internas
  analisis_cambios_externos?: string;
  analisis_cambios_internos?: string;
  sintesis_gestion_cambios?: string;
  
  // c) Información sobre desempeño y eficacia del SGC
  
  // c.1) Satisfacción del cliente y retroalimentación
  analisis_satisfaccion_cliente?: string;
  analisis_pqrs?: string;
  analisis_partes_interesadas?: string;
  sintesis_voz_cliente?: string;
  
  // c.2) Grado de logro de objetivos de calidad
  analisis_objetivos_calidad?: string;
  porcentaje_cumplimiento_objetivos?: number;
  objetivos_criticos_analisis?: string;
  
  // c.3) Desempeño de procesos y conformidad
  analisis_inspecciones?: string;
  analisis_conformidad_productos?: string;
  analisis_desempeno_procesos?: string;
  
  // c.4) No conformidades y acciones correctivas
  analisis_no_conformidades?: string;
  analisis_recurrencias?: string;
  eficacia_acciones_correctivas?: string;
  
  // c.5) Resultados de seguimiento y medición (KPIs)
  analisis_indicadores?: string;
  kpis_criticos_analisis?: string;
  tendencias_identificadas?: string;
  
  // c.6) Resultados de auditorías
  analisis_auditorias?: string;
  analisis_hallazgos_auditoria?: string;
  estado_acciones_auditoria?: string;
  
  // c.7) Desempeño de proveedores externos
  analisis_proveedores?: string;
  proveedores_criticos_analisis?: string;
  acciones_proveedores_pendientes?: string;
  
  // d) Adecuación de recursos
  analisis_recursos?: string;
  necesidades_criticas_recursos?: string;
  analisis_brechas_recursos?: string;
  
  // e) Eficacia de acciones para riesgos y oportunidades
  analisis_riesgos?: string;
  riesgos_materializados_analisis?: string;
  analisis_oportunidades?: string;
  oportunidades_aprovechadas_analisis?: string;
  eficacia_gestion_riesgos?: string;
  
  // f) Oportunidades de mejora
  analisis_mejoras?: string;
  mejoras_implementadas_periodo?: string;
  nuevas_mejoras_identificadas?: string;
  
  // === SALIDAS (9.3.3) ===
  
  // a) Oportunidades de mejora (SALIDA)
  decisiones_mejora?: string;
  sintesis_mejoras_acordadas?: string;
  
  // b) Cambios en el SGC
  decisiones_cambios_sgc?: string;
  cambios_politica?: boolean;
  cambios_objetivos?: boolean;
  cambios_procesos?: boolean;
  cambios_documentacion?: boolean;
  sintesis_cambios_sgc?: string;
  
  // c) Necesidades de recursos
  decisiones_recursos?: string;
  sintesis_recursos_aprobados?: string;
  
  // Conclusiones generales
  conclusiones_generales: string;
  fortalezas_identificadas?: string;
  debilidades_identificadas?: string;
  conveniencia_sgc?: string;
  adecuacion_sgc?: string;
  eficacia_sgc?: string;
  alineacion_estrategica?: string;
  
  decisiones_estrategicas?: string;
  
  // Seguimiento
  fecha_proxima_revision?: string;
  temas_proxima_revision?: string;
  
  // Compromisos generados
  total_compromisos?: number;
  compromisos_mejora?: number;
  compromisos_cambios_sgc?: number;
  compromisos_recursos?: number;
  
  // Evidencias
  acta_revision_url?: string;
  presentaciones_url?: string[];
  evidencias_url?: string[];
  
  // Metadata
  porcentaje_cumplimiento?: number;
  carpeta_drive?: string;
  carpeta_onedrive?: string;
  
  observaciones?: string;
  elaborado_por?: string;
  revisado_por?: string;
  aprobado_por?: string;
}

// ============================================
// COMPROMISOS
// ============================================

export interface Compromiso {
  id: number;
  revision_id: number;
  created_at: string;
  updated_at: string;
  
  codigo_compromiso?: string;
  
  tipo_salida: 'mejora' | 'cambio_sgc' | 'recursos';
  categoria_especifica?: string;
  
  descripcion: string;
  objetivo?: string;
  alcance?: string;
  
  relacionado_con?: string;
  origen_entrada?: string;
  
  responsable: string;
  cargo_responsable?: string;
  area_responsable?: string;
  equipo_trabajo?: string[];
  
  plan_accion?: string;
  actividades?: string[];
  hitos?: string[];
  
  fecha_compromiso: string;
  fecha_limite: string;
  fecha_cumplimiento?: string;
  
  recursos_necesarios?: string;
  recursos_humanos?: string;
  recursos_tecnicos?: string;
  recursos_financieros?: string;
  presupuesto_estimado?: number;
  presupuesto_aprobado?: number;
  
  estado: 'pendiente' | 'en_proceso' | 'en_pausa' | 'completado' | 'vencido' | 'cancelado';
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  
  porcentaje_avance: number;
  fecha_ultimo_seguimiento?: string;
  reporte_avance?: string;
  
  obstaculos_identificados?: string;
  riesgos_cumplimiento?: string;
  acciones_mitigacion?: string;
  
  criterios_aceptacion?: string;
  evidencias?: string[];
  
  verificado_por?: string;
  fecha_verificacion?: string;
  resultado_verificacion?: string;
  eficaz?: boolean;
  
  beneficios_esperados?: string;
  beneficios_obtenidos?: string;
  impacto_sgc?: string;
  
  requiere_extension?: boolean;
  justificacion_extension?: string;
  nueva_fecha_limite?: string;
  aprobado_extension_por?: string;
  
  fecha_cierre_real?: string;
  lecciones_aprendidas?: string;
  
  observaciones?: string;
  seguimiento_detallado?: string;
}

// ============================================
// EVIDENCIAS
// ============================================

export interface Evidencia {
  id: number;
  created_at: string;
  
  revision_id?: number;
  compromiso_id?: number;
  modulo_origen?: string;
  registro_origen_id?: number;
  
  nombre_archivo: string;
  tipo_archivo?: string;
  tamano_bytes?: number;
  
  url_drive?: string;
  url_onedrive?: string;
  url_local?: string;
  
  categoria: 'entrada' | 'analisis' | 'salida' | 'acta' | 'presentacion' | 'evidencia_compromiso' | 'soporte' | 'otro';
  tipo_documento?: 'informe' | 'registro' | 'acta' | 'presentacion' | 'fotografia' | 'video' | 'certificado' | 'otro';
  
  descripcion?: string;
  fecha_documento?: string;
  
  version?: string;
  confidencial?: boolean;
  
  subido_por?: string;
  aprobado_por?: string;
  fecha_aprobacion?: string;
  
  observaciones?: string;
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface ResumenEntradas {
  gestion_cambios: GestionCambio[];
  encuestas_satisfaccion: EncuestaSatisfaccion[];
  quejas_reclamos: QuejaReclamo[];
  objetivos_calidad: ObjetivoCalidad[];
  inspecciones_verificacion: InspeccionVerificacion[];
  no_conformidades: NoConformidad[];
  indicadores: Indicador[];
  auditorias: Auditoria[];
  proveedores: Proveedor[];
  auditorias_proveedores: AuditoriaProveedor[];
  recursos: Recurso[];
  riesgos_oportunidades: RiesgoOportunidad[];
  oportunidades_mejora: OportunidadMejora[];
}

export interface EstadisticasModulo {
  total: number;
  pendientes?: number;
  en_proceso?: number;
  completados?: number;
  criticos?: number;
}

export interface DashboardResumen {
  revisiones_activas: number;
  compromisos_pendientes: number;
  compromisos_vencidos: number;
  nc_abiertas: number;
  auditorias_pendientes: number;
  objetivos_en_riesgo: number;
}

// Tipos para creación (sin id, created_at, updated_at)
export type NuevaRevision = Omit<Revision, 'id' | 'created_at' | 'updated_at'>;
export type NuevoCompromiso = Omit<Compromiso, 'id' | 'created_at' | 'updated_at'>;
export type NuevaEvidencia = Omit<Evidencia, 'id' | 'created_at'>;
export type NuevoObjetivoCalidad = Omit<ObjetivoCalidad, 'id' | 'created_at' | 'updated_at'>;
export type NuevaNoConformidad = Omit<NoConformidad, 'id' | 'created_at' | 'updated_at'>;
export type NuevaAuditoria = Omit<Auditoria, 'id' | 'created_at' | 'updated_at'>;
export type NuevoProveedor = Omit<Proveedor, 'id' | 'created_at' | 'updated_at'>;
export type NuevoIndicador = Omit<Indicador, 'id' | 'created_at' | 'updated_at'>;
export type NuevaQuejaReclamo = Omit<QuejaReclamo, 'id' | 'created_at' | 'updated_at'>;
export type NuevaEncuestaSatisfaccion = Omit<EncuestaSatisfaccion, 'id' | 'created_at' | 'updated_at'>;
export type NuevaInspeccionVerificacion = Omit<InspeccionVerificacion, 'id' | 'created_at' | 'updated_at'>;
export type NuevoGestionCambio = Omit<GestionCambio, 'id' | 'created_at' | 'updated_at'>;
export type NuevoRecurso = Omit<Recurso, 'id' | 'created_at' | 'updated_at'>;
export type NuevoRiesgoOportunidad = Omit<RiesgoOportunidad, 'id' | 'created_at' | 'updated_at'>;
export type NuevaOportunidadMejora = Omit<OportunidadMejora, 'id' | 'created_at' | 'updated_at'>;
