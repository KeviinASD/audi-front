# Módulo de Equipos y Laboratorios

Este módulo permite la gestión de los equipos (máquinas) y los laboratorios donde se encuentran ubicados.

## Endpoints Frontend (Store)

Los siguientes métodos están implementados en `useEquiposStore`:

### Equipos
- `fetchEquipos()`: Obtiene la lista de todos los equipos registrados. `GET /api/equipos`
- `updateEquipo(id, data)`: Actualiza la información de un equipo (ej. asignación de lab). `PATCH /api/equipos/:id`

### Laboratorios
- `fetchLaboratorios()`: Obtiene la lista de laboratorios. `GET /api/laboratorios`
- `createLaboratorio(data)`: Registra un nuevo laboratorio. `POST /api/laboratorios`
- `updateLaboratorio(id, data)`: Actualiza datos de un laboratorio existente. `PATCH /api/laboratorios/:id`

## Estructura de Archivos
- `interfaces/`: Definiciones de TypeScript para Equipment y Laboratory.
- `schemas/`: Validaciones con Zod para formularios.
- `store/`: Estado global con Zustand.
- `pages/`: Vistas principales (`EquiposPage`, `LabsPage`).
- `components/`: Componentes reutilizables organizados por submódulo.
