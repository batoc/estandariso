# EstandarISO - Sistema de Gestión ISO 9001

Plataforma integral para la Revisión por la Dirección y gestión de calidad ISO 9001:2015.

## Estructura del Proyecto

```
estandariso/
├── front/          # Frontend - Next.js 16 + React 19 + Tailwind CSS
│   ├── app/        # Rutas y páginas
│   ├── components/ # Componentes reutilizables
│   ├── lib/        # Utilidades (PocketBase client, types)
│   └── public/     # Archivos estáticos
├── back/           # Backend - PocketBase
│   ├── pocketbase  # Binario de PocketBase
│   ├── pb_migrations/ # Migraciones de colecciones
│   └── pb_data/    # Datos (no se sube a git)
└── deploy/         # Scripts de despliegue
```

## Desarrollo Local

### Backend (PocketBase)
```bash
cd back
./pocketbase serve
```
PocketBase estará disponible en `http://127.0.0.1:8090`.
Admin UI: `http://127.0.0.1:8090/_/`

### Frontend (Next.js)
```bash
cd front
npm install
npm run dev
```
Frontend estará disponible en `http://localhost:3000`.

## Despliegue

El proyecto se despliega automáticamente al hacer push a `main` usando GitHub Actions.

**Servidor:** Hetzner CPX11 - 178.156.250.64

## Módulos ISO 9001:2015 (Cláusula 9.3)

- **Compromisos Previos** (9.3.2.a)
- **Gestión de Cambios** (9.3.2.b)
- **Satisfacción del Cliente** (9.3.2.c.1)
- **PQRS** (9.3.2.c.1)
- **Objetivos de Calidad** (9.3.2.c.2)
- **Inspecciones** (9.3.2.c.3)
- **No Conformidades** (9.3.2.c.4)
- **Indicadores / KPIs** (9.3.2.c.5)
- **Auditorías** (9.3.2.c.6)
- **Proveedores** (9.3.2.c.7)
- **Recursos** (9.3.2.d)
- **Riesgos y Oportunidades** (6.1)
- **Mejora Continua** (10.3)
