/// <reference path="../pb_data/types.d.ts" />

// Add fecha_vigencia to organizacion (covers mission, vision, purpose, objectives, and pillars)
// Add link_daruma to areas_contexto
migrate((app) => {

  // organizacion: add fecha_vigencia (optional date)
  const orgCol = app.findCollectionByNameOrId("organizacion")
  orgCol.fields.add(new DateField({
    name: "fecha_vigencia",
    required: false,
  }))
  app.save(orgCol)

  // areas_contexto: add link_daruma (optional URL text)
  const areasCol = app.findCollectionByNameOrId("areas_contexto")
  areasCol.fields.add(new TextField({
    name: "link_daruma",
    required: false,
    min: 0,
    max: 500,
  }))
  app.save(areasCol)

}, (app) => {
  // Rollback
  const orgCol = app.findCollectionByNameOrId("organizacion")
  orgCol.fields.removeByName("fecha_vigencia")
  app.save(orgCol)

  const areasCol = app.findCollectionByNameOrId("areas_contexto")
  areasCol.fields.removeByName("link_daruma")
  app.save(areasCol)
})
