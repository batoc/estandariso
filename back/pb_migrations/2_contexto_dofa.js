/// <reference path="../pb_data/types.d.ts" />

// ISO 9001 - 4.1 Contexto de la Organización: DOFA + Estrategias
migrate((app) => {

  // ============================================
  // ÁREAS / CATEGORÍAS (editables por el usuario)
  // ============================================
  const areas_contexto = new Collection({
    type: "base",
    name: "areas_contexto",
    fields: [
      { name: "nombre", type: "text", required: true },
      { name: "descripcion", type: "text" },
      { name: "color", type: "text" },
      { name: "orden", type: "number" },
      { name: "activa", type: "bool" },
    ],
  })
  app.save(areas_contexto)

  // Insertar áreas genéricas por defecto
  const areasDefault = [
    { nombre: "Dirección Estratégica", color: "#1e40af", orden: 1 },
    { nombre: "Comercial", color: "#059669", orden: 2 },
    { nombre: "Operaciones", color: "#d97706", orden: 3 },
    { nombre: "Tecnología / TI", color: "#7c3aed", orden: 4 },
    { nombre: "Talento Humano", color: "#dc2626", orden: 5 },
    { nombre: "Financiera", color: "#0891b2", orden: 6 },
    { nombre: "Legal / Normativo", color: "#be185d", orden: 7 },
    { nombre: "Calidad / SGC", color: "#65a30d", orden: 8 },
  ]
  const areasCol = app.findCollectionByNameOrId("areas_contexto")
  for (const a of areasDefault) {
    const rec = new Record(areasCol)
    rec.set("nombre", a.nombre)
    rec.set("color", a.color)
    rec.set("orden", a.orden)
    rec.set("activa", true)
    app.save(rec)
  }

  // ============================================
  // ELEMENTOS DOFA (brainstorm libre)
  // ============================================
  const dofa_elementos = new Collection({
    type: "base",
    name: "dofa_elementos",
    fields: [
      { name: "tipo_dofa", type: "select", values: ["debilidad", "oportunidad", "fortaleza", "amenaza"], maxSelect: 1, required: true },
      { name: "descripcion", type: "text", required: true },
      { name: "area_id", type: "relation", collectionId: areasCol.id, maxSelect: 1, cascadeDelete: false },
      { name: "identificado_por", type: "text" },
      { name: "fecha_identificacion", type: "date" },
      { name: "contexto", type: "select", values: ["interno", "externo"], maxSelect: 1 },
      { name: "consolidado", type: "bool" },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(dofa_elementos)

  // ============================================
  // ESTRATEGIAS DE CONTEXTO (consolidado + canvas)
  // ============================================
  const estrategias_contexto = new Collection({
    type: "base",
    name: "estrategias_contexto",
    fields: [
      { name: "titulo", type: "text", required: true },
      { name: "descripcion", type: "text", required: true },
      // Tipo de estrategia DOFA cruzada
      { name: "tipo_estrategia", type: "select", values: ["FO", "FA", "DO", "DA"], maxSelect: 1, required: true },
      // Elementos DOFA que originan esta estrategia (relación múltiple)
      { name: "elementos_dofa", type: "relation", collectionId: dofa_elementos.id, maxSelect: 50, cascadeDelete: false },
      // Clasificación para el Canvas
      { name: "pilar_estrategico", type: "select", values: ["eficiencia_integral", "experiencia_cliente", "cultura_innovadora", "gestion_talento_humano"], maxSelect: 1, required: true },
      { name: "tipo_proyecto", type: "select", values: ["mejoramiento", "extension", "transformacion"], maxSelect: 1, required: true },
      { name: "nivel_recursos", type: "select", values: ["alto", "bajo"], maxSelect: 1, required: true },
      { name: "dificultad_implementacion", type: "select", values: ["alta", "media", "baja"], maxSelect: 1, required: true },
      // Metas y seguimiento
      { name: "responsable", type: "text" },
      { name: "fecha_inicio", type: "date" },
      { name: "fecha_meta", type: "date" },
      { name: "estado", type: "select", values: ["propuesta", "aprobada", "en_ejecucion", "completada", "cancelada"], maxSelect: 1, required: true },
      { name: "porcentaje_avance", type: "number" },
      { name: "observaciones", type: "text" },
    ],
  })
  app.save(estrategias_contexto)

  // Reglas públicas
  const collections = [areas_contexto, dofa_elementos, estrategias_contexto]
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
  const names = ["estrategias_contexto", "dofa_elementos", "areas_contexto"]
  for (const name of names) {
    try {
      const col = app.findCollectionByNameOrId(name)
      app.delete(col)
    } catch {}
  }
})
