# GearGuard — Maintenance System

Monorepo containing the backend (Node + Express + Prisma) and frontend (Vite + React + TypeScript) for the GearGuard equipment maintenance application.

This README gives quick setup and run steps for both parts (backend and frontend). For more frontend-specific notes, see `frontend/README.md`.

## Prerequisites
- Node.js (16+ recommended)
- npm
- MySQL (or compatible) for the Prisma-backed database

## Backend (server)

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment

- Create a `.env` in `backend` (or set env vars) with DB connection details. Example keys used by the project: `DATABASE_URL`, `PORT`.

3. Apply migrations and seed (Prisma)

```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev
npm run prisma:seed
```

4. Run the backend

```bash
npm run dev
```

The server listens on the configured `PORT` (default 3001). API endpoints are under `/api`.

## Frontend (client)

1. Install dependencies

```bash
cd frontend
npm install
```

2. Configure environment

- The frontend reads `VITE_API_URL` to reach the backend (defaults to `http://localhost:3001`).

3. Run the frontend

```bash
npm run dev
```

4. Notes

- After login the token is stored in `localStorage` under the `token` key.
- The Calendar supports scheduling preventive maintenance (creates PREVENTIVE requests with `scheduledDate`).
- The Kanban view may show client-side demo requests when a column is empty (for visual completeness).

## Common commands

- Start backend: `cd backend && npm run dev`
- Start frontend: `cd frontend && npm run dev`

## Development branch

- Recent work is on the `namraa` branch (scheduling modal, Kanban demo items, status normalization, login UI tweaks). Pushes were made to `origin/namraa`.

## Troubleshooting

- If frontend can't reach backend, set `VITE_API_URL` and restart the dev server.
- If you see unexpected status counts, ensure the backend returns status enum values (`NEW`, `IN_PROGRESS`, `REPAIRED`, `SCRAP`). The frontend normalizes comparisons to uppercase.

## Next steps / Suggestions

- Add endpoint and UI to edit `scheduledDate` on existing requests (PATCH) if you need rescheduling.
- Remove or toggle demo Kanban cards once you have enough real data.
