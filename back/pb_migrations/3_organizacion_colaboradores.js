/// <reference path="../pb_data/types.d.ts" />

// ISO 9001 - Organización: Direccionamiento, Pilares, Colaboradores
migrate((app) => {

  // ============================================
  // ORGANIZACIÓN (Direccionamiento Estratégico)
  // Single record — strategic direction info
  // ============================================
  const organizacion = new Collection({
    type: "base",
    name: "organizacion",
    fields: [
      { name: "nombre_empresa", type: "text", required: true },
      { name: "proposito_superior", type: "text" },
      { name: "objetivo_estrategico", type: "text" },
      { name: "resumen_estrategia", type: "text" },
      { name: "mision", type: "text" },
      { name: "vision", type: "text" },
      { name: "valores", type: "json" },
      { name: "logo_url", type: "text" },
    ],
  })
  app.save(organizacion)

  // ============================================
  // PILARES ESTRATÉGICOS (editables)
  // ============================================
  const pilares_estrategicos = new Collection({
    type: "base",
    name: "pilares_estrategicos",
    fields: [
      { name: "nombre", type: "text", required: true },
      { name: "descripcion", type: "text" },
      { name: "color", type: "text" },
      { name: "icono", type: "text" },
      { name: "orden", type: "number" },
      { name: "activo", type: "bool" },
    ],
  })
  app.save(pilares_estrategicos)

  // Insert default pilares
  const pilaresDefault = [
    { nombre: "Eficiencia Integral", descripcion: "Optimizamos los procesos que afectan directamente la calidad del servicio para garantizar una correcta eficiencia, manteniendo siempre un compromiso con la integridad.", color: "#1e40af", orden: 1 },
    { nombre: "Experiencia del Cliente", descripcion: "Ofrecemos un servicio con alta experiencia y personalización garantizando la satisfacción y lealtad de los clientes.", color: "#059669", orden: 2 },
    { nombre: "Cultura Innovadora", descripcion: "Promovemos una mentalidad innovadora que aporte a la transformación de nuestros clientes.", color: "#7c3aed", orden: 3 },
    { nombre: "Gestión Integral del Talento Humano", descripcion: "Construimos un equipo comprometido con los valores y objetivos de la organización.", color: "#dc2626", orden: 4 },
  ]
  const pilaresCol = app.findCollectionByNameOrId("pilares_estrategicos")
  for (const p of pilaresDefault) {
    const rec = new Record(pilaresCol)
    rec.set("nombre", p.nombre)
    rec.set("descripcion", p.descripcion)
    rec.set("color", p.color)
    rec.set("orden", p.orden)
    rec.set("activo", true)
    app.save(rec)
  }

  // ============================================
  // COLABORADORES
  // ============================================
  const areasCol = app.findCollectionByNameOrId("areas_contexto")

  const colaboradores = new Collection({
    type: "base",
    name: "colaboradores",
    fields: [
      { name: "nombre", type: "text", required: true },
      { name: "apellido", type: "text" },
      { name: "email", type: "email" },
      { name: "telefono", type: "text" },
      { name: "cargo", type: "text" },
      { name: "area_id", type: "relation", collectionId: areasCol.id, maxSelect: 1, cascadeDelete: false },
      { name: "rol_area", type: "select", values: ["director", "coordinador", "analista", "operativo", "pasante"], maxSelect: 1 },
      { name: "permisos", type: "select", values: ["admin", "edicion", "consulta", "cargue"], maxSelect: 4 },
      { name: "activo", type: "bool" },
      { name: "fecha_ingreso", type: "date" },
      { name: "foto_url", type: "text" },
    ],
  })
  app.save(colaboradores)

  // Update estrategias_contexto: add area_responsable relation + update nivel_recursos to include "medio"
  const estrategiasCol = app.findCollectionByNameOrId("estrategias_contexto")
  // Add area_responsable and colaborador responsable relation fields
  estrategiasCol.fields.add(new RelationField({
    name: "area_responsable",
    collectionId: areasCol.id,
    maxSelect: 1,
    cascadeDelete: false,
  }))
  estrategiasCol.fields.add(new RelationField({
    name: "responsable_id",
    collectionId: colaboradores.id,
    maxSelect: 1,
    cascadeDelete: false,
  }))
  // Update nivel_recursos to add "medio"
  const nivelField = estrategiasCol.fields.getByName("nivel_recursos")
  nivelField.values = ["alto", "medio", "bajo"]
  app.save(estrategiasCol)

  // Update dofa_elementos: add colaborador relation
  const dofaCol = app.findCollectionByNameOrId("dofa_elementos")
  dofaCol.fields.add(new RelationField({
    name: "identificado_por_id",
    collectionId: colaboradores.id,
    maxSelect: 1,
    cascadeDelete: false,
  }))
  app.save(dofaCol)

  // Set API rules
  const collections = [organizacion, pilares_estrategicos, colaboradores]
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
  const names = ["colaboradores", "pilares_estrategicos", "organizacion"]
  for (const name of names) {
    try {
      const col = app.findCollectionByNameOrId(name)
      app.delete(col)
    } catch {}
  }
})
