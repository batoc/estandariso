// ============================================
// SISTEMA DE GESTIÓN DE CALIDAD ISO 9001
// Tipos TypeScript para toda la aplicación
// ============================================

// ============================================
// REVISIÓN POR LA DIRECCIÓN
// ============================================
export interface Revision {
  id: string;
  created: string;
  updated: string;
  
  // Información General
  titulo: string;
  fecha_revision: string;
  responsable: string;
  participantes?: string[];
  estado: 'abierta' | 'en_seguimiento' | 'cerrada';
  
  // ENTRADAS: Análisis de la Alta Dirección (9.3.2)
  // a) Estado de acciones previas
  analisis_acciones_previas?: string;
  
  // b) Cambios externos e internos
  analisis_cambios_externos?: string;
  analisis_cambios_internos?: string;
  
  // c) Información sobre desempeño y eficacia
  analisis_clientes?: string; // c.1) Satisfacción del cliente
  analisis_objetivos?: string; // c.2) Logro de objetivos
  analisis_procesos?: string; // c.3) Desempeño de procesos
  analisis_no_conformidades?: string; // c.4) No conformidades
  analisis_seguimiento_medicion?: string; // c.5) Seguimiento y medición
  analisis_auditorias?: string; // c.6) Auditorías
  analisis_proveedores?: string; // c.7) Proveedores externos
  
  // d) Adecuación de recursos
  analisis_recursos?: string;
  
  // e) Eficacia de acciones para riesgos y oportunidades
  analisis_riesgos?: string;
  analisis_oportunidades?: string;
  
  // f) Oportunidades de mejora
  oportunidades_mejora_identificadas?: string;
  
  // SALIDAS: Decisiones (9.3.3)
  decisiones_mejora?: string; // a) Oportunidades de mejora
  decisiones_sgc?: string; // b) Cambios en el SGC
  necesidades_recursos?: string; // c) Necesidades de recursos
  conclusiones_generales?: string;
  
  // Metadata
  porcentaje_cumplimiento: number;
}

export type NuevaRevision = Omit<Revision, 'id' | 'created' | 'updated'>;
export type ActualizarRevision = Partial<NuevaRevision>;

// ============================================
// COMPROMISOS (Acciones de revisiones)
// ============================================
export interface Compromiso {
  id: string;
  revision_id: string;
  created: string;
  updated: string;
  
  // Identificación
  codigo_compromiso?: string;
  tipo_salida: 'mejora' | 'cambio_sgc' | 'recursos';
  categoria_especifica?: string;
  descripcion: string;
  objetivo?: string;
  alcance?: string;
  relacionado_con?: string;
  origen_entrada?: string;
  
  // Responsabilidad
  responsable: string;
  cargo_responsable?: string;
  area_responsable?: string;
  equipo_trabajo?: string[];
  
  // Planificación
  plan_accion?: string;
  actividades?: string[];
  hitos?: string[];
  fecha_compromiso: string;
  fecha_limite: string;
  fecha_cumplimiento?: string;
  
  // Estado y seguimiento
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'vencido' | 'cancelado';
  prioridad: 'alta' | 'media' | 'baja';
  porcentaje_avance: number;
  fecha_ultimo_seguimiento?: string;
  reporte_avance?: string;
  obstaculos_identificados?: string;
  riesgos_cumplimiento?: string;
  acciones_mitigacion?: string;
  criterios_aceptacion?: string;
  
  // Recursos
  recursos_necesarios?: string;
  recursos_humanos?: string;
  recursos_tecnicos?: string;
  recursos_financieros?: string;
  presupuesto_estimado?: number;
  presupuesto_aprobado?: number;
  
  // Evidencias
  evidencias?: string[];
  observaciones?: string;
  
  // Verificación y Cierre
  verificado_por?: string;
  fecha_verificacion?: string;
  resultado_verificacion?: string;
  eficaz?: boolean;
  beneficios_esperados?: string;
  beneficios_obtenidos?: string;
  impacto_sgc?: string;
  
  // Extensiones
  requiere_extension?: boolean;
  justificacion_extension?: string;
  nueva_fecha_limite?: string;
  aprobado_extension_por?: string;
  
  // Cierre
  fecha_cierre_real?: string;
  lecciones_aprendidas?: string;
  seguimiento_detallado?: string;
}

export type NuevoCompromiso = Omit<Compromiso, 'id' | 'created' | 'updated'>;

// ============================================
// MÓDULOS OPERATIVOS (ENTRADAS SGC)
// ============================================

// AUDITORÍAS (9.3.2.c.6)
export interface Auditoria {
  id: string;
  created: string;
  fecha_auditoria: string;
  tipo: 'interna' | 'externa' | 'certificacion';
  proceso_auditado: string;
  auditor_lider: string;
  hallazgos_totales: number;
  conformidades: number;
  no_conformidades_mayores: number;
  no_conformidades_menores: number;
  observaciones_count: number;
  estado_general: 'satisfactorio' | 'requiere_mejoras' | 'critico';
  resumen: string;
  archivo_informe?: string;
}

// QUEJAS Y RECLAMOS (9.3.2.c.1)
export interface QuejaReclamo {
  id: string;
  created: string;
  fecha_recepcion: string;
  tipo: 'queja' | 'reclamo' | 'sugerencia' | 'felicitacion';
  cliente: string;
  producto_servicio: string;
  descripcion: string;
  estado: 'abierta' | 'en_analisis' | 'resuelta' | 'cerrada';
  fecha_resolucion?: string;
  satisfaccion_resolucion?: number;
  acciones_tomadas?: string;
}

// INDICADORES (KPIs - 9.3.2.c.2)
export interface Indicador {
  id: string;
  created: string;
  periodo: string;
  nombre_indicador: string;
  categoria: string;
  valor_actual: number;
  valor_meta: number;
  unidad_medida: string;
  cumplimiento: number;
  tendencia: 'mejora' | 'estable' | 'deterioro';
  responsable: string;
}

// NO CONFORMIDADES (9.3.2.c.4)
export interface NoConformidad {
  id: string;
  created: string;
  fecha_deteccion: string;
  tipo: 'producto' | 'proceso' | 'sistema';
  severidad: 'mayor' | 'menor' | 'critica';
  proceso_afectado: string;
  descripcion: string;
  causa_raiz?: string;
  accion_correctiva?: string;
  responsable: string;
  fecha_cierre?: string;
  estado: 'abierta' | 'en_analisis' | 'en_implementacion' | 'cerrada';
  eficacia_verificada: boolean;
}

// PROVEEDORES (9.3.2.c.7)
export interface Proveedor {
  id: string;
  created: string;
  nombre_proveedor: string;
  categoria: string;
  calificacion_actual: number;
  fecha_evaluacion: string;
  criterios_evaluacion: {
    calidad: number;
    entrega: number;
    precio: number;
    servicio: number;
  };
  estado: 'aprobado' | 'condicional' | 'no_aprobado';
  incidentes_totales: number;
  observaciones?: string;
}

// OBJETIVOS DE CALIDAD (9.3.2.c.2)
export interface ObjetivoCalidad {
  id: string;
  created: string;
  updated: string;
  
  periodo: string;
  objetivo: string;
  area_responsable?: string;
  responsable?: string;
  fecha_inicio?: string;
  fecha_meta?: string;
  estado: 'activo' | 'completado' | 'cancelado' | 'retrasado';
  
  // Métricas
  indicador_medicion?: string;
  valor_inicial?: number;
  valor_actual?: number;
  valor_meta?: number;
  unidad_medida?: string;
  porcentaje_avance?: number;
  
  // Seguimiento
  ultimo_seguimiento?: string;
  observaciones?: string;
  riesgos_identificados?: string;
  acciones_mitigacion?: string;
}

// CONTEXTO ORGANIZACIONAL (9.3.2.b)
export interface ContextoOrganizacional {
  id: string;
  created: string;
  updated: string;
  
  fecha_registro: string;
  tipo: 'externo' | 'interno';
  categoria: 'economico' | 'legal' | 'tecnologico' | 'competitivo' | 'social' | 'organizacional' | 'operacional';
  
  descripcion: string;
  impacto_sgc: 'alto' | 'medio' | 'bajo';
  oportunidad_amenaza: 'oportunidad' | 'amenaza' | 'neutral';
  
  // Análisis
  partes_interesadas_afectadas?: string[];
  procesos_impactados?: string[];
  acciones_tomadas?: string;
  responsable?: string;
  estado: 'activo' | 'mitigado' | 'cerrado';
}

// RIESGOS Y OPORTUNIDADES (9.3.2.e)
export interface RiesgoOportunidad {
  id: string;
  created: string;
  updated: string;
  
  fecha_identificacion: string;
  tipo: 'riesgo' | 'oportunidad';
  categoria: 'operacional' | 'estrategico' | 'financiero' | 'cumplimiento' | 'reputacional';
  
  descripcion: string;
  proceso_relacionado?: string;
  
  // Evaluación de Riesgo
  probabilidad?: number; // 1-5
  impacto?: number; // 1-5
  nivel_riesgo?: number; // probabilidad x impacto
  
  // Plan de Acción
  acciones_planificadas?: string;
  responsable?: string;
  fecha_implementacion?: string;
  
  // Seguimiento
  estado: 'identificado' | 'en_tratamiento' | 'mitigado' | 'cerrado';
  eficacia_acciones?: string;
  fecha_revision?: string;
  observaciones?: string;
}

// RECURSOS (9.3.2.d)
export interface Recurso {
  id: string;
  created: string;
  updated: string;
  
  tipo_recurso: 'humano' | 'infraestructura' | 'tecnologico' | 'financiero' | 'informacion';
  nombre_recurso: string;
  area?: string;
  
  // Estado actual
  estado_actual: 'disponible' | 'insuficiente' | 'adecuado' | 'requiere_mejora';
  cantidad_actual?: string;
  capacidad_utilizada?: number;
  
  // Necesidades
  necesidad_adicional: boolean;
  cantidad_requerida?: string;
  justificacion?: string;
  prioridad: 'alta' | 'media' | 'baja';
  
  // Seguimiento
  fecha_evaluacion?: string;
  responsable?: string;
  costo_estimado?: number;
  estado_solicitud?: 'pendiente' | 'aprobado' | 'rechazado' | 'en_proceso';
  observaciones?: string;
}

// SEGUIMIENTO Y MEDICIÓN (9.3.2.c.5)
export interface SeguimientoMedicion {
  id: string;
  created: string;
  updated: string;
  
  fecha_medicion: string;
  tipo_medicion: 'producto' | 'proceso' | 'satisfaccion_cliente' | 'sistema';
  nombre_medicion: string;
  metodo_medicion?: string;
  
  // Resultados
  resultado_obtenido?: string;
  valor_numerico?: number;
  unidad_medida?: string;
  cumple_criterio?: boolean;
  
  // Análisis
  desviaciones_encontradas?: string;
  causas_analisis?: string;
  acciones_tomadas?: string;
  
  responsable?: string;
  proceso_relacionado?: string;
  observaciones?: string;
}

// DESEMPEÑO DE PROCESOS (9.3.2.c.3)
export interface DesempenoProceso {
  id: string;
  created: string;
  updated: string;
  
  periodo: string;
  nombre_proceso: string;
  responsable_proceso?: string;
  
  // Desempeño
  eficacia?: number;
  eficiencia?: number;
  productos_conformes?: number;
  productos_no_conformes?: number;
  porcentaje_conformidad?: number;
  
  // Capacidad
  tiempo_ciclo_promedio?: number;
  unidad_tiempo?: string;
  capacidad_instalada?: number;
  capacidad_utilizada?: number;
  
  // Análisis
  tendencia: 'mejora' | 'estable' | 'deterioro';
  problemas_identificados?: string;
  mejoras_implementadas?: string;
  objetivos_cumplidos?: boolean;
  observaciones?: string;
}

// PARTES INTERESADAS
export interface ParteInteresada {
  id: string;
  created: string;
  updated: string;
  
  nombre: string;
  tipo: 'cliente' | 'proveedor' | 'empleado' | 'regulador' | 'accionista' | 'comunidad';
  
  // Necesidades y Expectativas
  necesidades_expectativas?: string;
  requisitos_aplicables?: string;
  
  // Comunicación
  metodo_comunicacion?: string;
  frecuencia_comunicacion?: string;
  ultimo_contacto?: string;
  nivel_satisfaccion?: number;
  
  // Impacto
  nivel_influencia: 'alto' | 'medio' | 'bajo';
  nivel_interes: 'alto' | 'medio' | 'bajo';
  
  responsable_relacion?: string;
  observaciones?: string;
}

// ============================================
// EVIDENCIAS Y DOCUMENTOS
// ============================================
export interface Evidencia {
  id: string;
  revision_id?: number;
  compromiso_id?: number;
  created: string;
  nombre_archivo: string;
  tipo_archivo?: string;
  url_archivo?: string;
  categoria: 'entrada' | 'salida' | 'acta' | 'presentacion' | 'evidencia_compromiso' | 'otro';
  descripcion?: string;
  subido_por?: string;
  fecha_subida: string;
}

export type NuevaEvidencia = Omit<Evidencia, 'id' | 'created'>;

// ============================================
// TIPOS AUXILIARES
// ============================================

// ARCHIVO SUBIDO (para componentes de upload)
export interface ArchivoSubido {
  nombre: string;
  url: string;
  tamano: number;
  fecha: string;
  tipo?: string;
}

// RESUMEN COMPLETO PARA DASHBOARD Y REVISIONES
export interface ResumenEntradas {
  auditorias: Auditoria[];
  quejas_reclamos: QuejaReclamo[];
  indicadores: Indicador[];
  no_conformidades: NoConformidad[];
  proveedores: Proveedor[];
  objetivos_calidad: ObjetivoCalidad[];
  contexto_organizacional: ContextoOrganizacional[];
  riesgos_oportunidades: RiesgoOportunidad[];
  recursos: Recurso[];
  seguimiento_medicion: SeguimientoMedicion[];
  desempeno_procesos: DesempenoProceso[];
  partes_interesadas: ParteInteresada[];
}

// ============================================
// 4.1 CONTEXTO DE LA ORGANIZACIÓN - DOFA
// ============================================

export interface AreaContexto {
  id: string;
  created: string;
  updated: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
  activa: boolean;
  link_daruma?: string;
}

export interface DofaElemento {
  id: string;
  created: string;
  updated: string;
  tipo_dofa: 'debilidad' | 'oportunidad' | 'fortaleza' | 'amenaza';
  descripcion: string;
  area_id?: string;
  expand?: { area_id?: AreaContexto; identificado_por_id?: Colaborador };
  identificado_por?: string;
  identificado_por_id?: string;
  fecha_identificacion?: string;
  contexto?: 'interno' | 'externo';
  consolidado?: boolean;
  observaciones?: string;
}

export type PilarEstrategicoKey = 'eficiencia_integral' | 'experiencia_cliente' | 'cultura_innovadora' | 'gestion_talento_humano';
export type PilarEstrategico = PilarEstrategicoKey; // backward compat alias
export type TipoProyecto = 'mejoramiento' | 'extension' | 'transformacion';
export type NivelRecursos = 'alto' | 'medio' | 'bajo';
export type DificultadImplementacion = 'alta' | 'media' | 'baja';

export interface EstrategiaContexto {
  id: string;
  created: string;
  updated: string;
  titulo: string;
  descripcion: string;
  tipo_estrategia: 'FO' | 'FA' | 'DO' | 'DA';
  elementos_dofa?: string[];
  expand?: { elementos_dofa?: DofaElemento[] };
  pilar_estrategico: PilarEstrategico;
  tipo_proyecto: TipoProyecto;
  nivel_recursos: NivelRecursos;
  dificultad_implementacion: DificultadImplementacion;
  responsable?: string;
  responsable_id?: string;
  area_responsable?: string;
  fecha_inicio?: string;
  fecha_meta?: string;
  estado: 'propuesta' | 'aprobada' | 'en_ejecucion' | 'completada' | 'cancelada';
  porcentaje_avance?: number;
  observaciones?: string;
}

// ============================================
// ORGANIZACIÓN (Direccionamiento Estratégico)
// ============================================
export interface Organizacion {
  id: string;
  created: string;
  updated: string;
  nombre_empresa: string;
  proposito_superior?: string;
  objetivo_estrategico?: string;
  resumen_estrategia?: string;
  mision?: string;
  vision?: string;
  fecha_vigencia?: string;
  valores?: string[];
  logo_url?: string;
}

// ============================================
// PILARES ESTRATÉGICOS (registro editable)
// ============================================
export interface PilarEstrategicoRecord {
  id: string;
  created: string;
  updated: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  orden?: number;
  activo: boolean;
}

// ============================================
// COLABORADORES
// ============================================
export type RolArea = 'director' | 'coordinador' | 'analista' | 'operativo' | 'pasante';
export type Permiso = 'admin' | 'edicion' | 'consulta' | 'cargue';

export interface Colaborador {
  id: string;
  created: string;
  updated: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  area_id?: string;
  expand?: { area_id?: AreaContexto };
  rol_area?: RolArea;
  permisos?: Permiso[];
  activo: boolean;
  fecha_ingreso?: string;
  foto_url?: string;
}
