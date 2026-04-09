/// <reference path="../pb_data/types.d.ts" />

// Fix: Add created/updated autodate fields to all collections
// Fix: Change pilar_estrategico from select to relation
migrate((app) => {

  // Collections that need created/updated autodate fields
  const collectionNames = [
    "areas_contexto",
    "dofa_elementos",
    "estrategias_contexto",
    "colaboradores",
    "pilares_estrategicos",
    "organizacion",
  ]

  for (const name of collectionNames) {
    const col = app.findCollectionByNameOrId(name)

    // Add "created" autodate field
    col.fields.add(new AutodateField({
      name: "created",
      onCreate: true,
      onUpdate: false,
    }))

    // Add "updated" autodate field
    col.fields.add(new AutodateField({
      name: "updated",
      onCreate: true,
      onUpdate: true,
    }))

    app.save(col)
  }

  // Fix pilar_estrategico: change from select to relation
  const estrategiasCol = app.findCollectionByNameOrId("estrategias_contexto")
  const pilaresCol = app.findCollectionByNameOrId("pilares_estrategicos")

  // Remove old select field
  estrategiasCol.fields.removeByName("pilar_estrategico")

  // Add new relation field
  estrategiasCol.fields.add(new RelationField({
    name: "pilar_estrategico",
    collectionId: pilaresCol.id,
    maxSelect: 1,
    cascadeDelete: false,
  }))

  app.save(estrategiasCol)

}, (app) => {
  // Revert: remove autodate fields
  const collectionNames = [
    "areas_contexto",
    "dofa_elementos",
    "estrategias_contexto",
    "colaboradores",
    "pilares_estrategicos",
    "organizacion",
  ]

  for (const name of collectionNames) {
    try {
      const col = app.findCollectionByNameOrId(name)
      col.fields.removeByName("created")
      col.fields.removeByName("updated")
      app.save(col)
    } catch {}
  }

  // Revert pilar_estrategico to select
  try {
    const estrategiasCol = app.findCollectionByNameOrId("estrategias_contexto")
    estrategiasCol.fields.removeByName("pilar_estrategico")
    estrategiasCol.fields.add(new SelectField({
      name: "pilar_estrategico",
      values: ["eficiencia_integral", "experiencia_cliente", "cultura_innovadora", "gestion_talento_humano"],
      maxSelect: 1,
      required: true,
    }))
    app.save(estrategiasCol)
  } catch {}
})
