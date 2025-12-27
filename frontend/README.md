(The file `c:\Users\patel\Hackathon\maintenance-system\ODOO-Hackathon-Virtual-Round\frontend\README.md` exists, but is empty)
# Frontend — GearGuard Maintenance UI

This folder contains the React + TypeScript frontend for the GearGuard maintenance application (Vite).

Quick start
1. Install dependencies

```bash
cd frontend
npm install
```

2. Run the dev server

```bash
npm run dev
```

Environment
- The frontend expects an API base URL in `VITE_API_URL` (defaults to `http://localhost:3001`).
- Auth tokens are stored in `localStorage` under the `token` key.

Available scripts
- `npm run dev` — start Vite dev server
- `npm run build` — build production assets
- `npm run preview` — preview production build

Important files
- `src/services/api.ts` — central API wrapper and helpers (auth, equipment, requests, teams)
- `src/context/AuthContext.tsx` — authentication provider and permission helpers
- `src/pages` — main views (Login, Register, Dashboard, Requests, Calendar, Kanban, Equipment, Teams)
- `src/components` — shared UI components

Notes
- The Calendar includes a scheduling modal that creates PREVENTIVE requests with a `scheduledDate`.
- The Kanban board may inject client-side demo cards when a status column has no server data; this is for visual completeness and can be toggled or removed.
- If you see incorrect counts on the Requests page, ensure the backend returns status values that match the enums (NEW, IN_PROGRESS, REPAIRED, SCRAP). The frontend normalizes comparisons to uppercase.

Troubleshooting
- If the frontend cannot reach the API, set `VITE_API_URL` and restart the dev server: `export VITE_API_URL=http://localhost:3001` (Windows PowerShell: `setx VITE_API_URL "http://localhost:3001"`).
- If you encounter CORS or auth issues, ensure the backend is running and that the token is present in `localStorage` after login.

Contributing
- Create a feature branch and open a PR targeting `namraa` (current feature branch used during development).

Contact
- Ask the maintainer for backend seed and migration instructions if you need sample data.

