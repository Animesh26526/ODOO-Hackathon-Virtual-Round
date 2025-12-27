# GearGuard — Backend

This repository contains the GearGuard backend (Express + Prisma + MySQL). It provides REST APIs for Equipment, Teams, and Maintenance Requests used by the frontend (Next.js).

Quick summary
- Runtime: Node.js
- Framework: Express
- ORM: Prisma (MySQL)
- Auth: JWT (Bearer tokens)

Prerequisites
- Node.js (v18+ recommended)
- MySQL server (local or remote)

Environment (.env)
Create a `.env` file in `backend/` (do NOT commit it). Example values are in `.env.example`.

Recommended DATABASE setup (MySQL / run as admin/root in MySQL Workbench or mysql CLI):
```sql
CREATE DATABASE gearguard_dev;
CREATE USER 'gearuser'@'localhost' IDENTIFIED BY 'StrongPasswordHere';
GRANT ALL PRIVILEGES ON gearguard_dev.* TO 'gearuser'@'localhost';
-- additional privileges required for Prisma shadow DB and migrations
GRANT CREATE, DROP, INDEX, ALTER, REFERENCES ON *.* TO 'gearuser'@'localhost';
FLUSH PRIVILEGES;
```

Generating a strong JWT secret (PowerShell):
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Copy the output into `JWT_SECRET` in your `.env`.

Install dependencies
```bash
cd backend
npm install
```

Prisma + DB setup (run from `backend`)
```bash
# generate client (optional, done automatically by migrate)
npx prisma generate --schema prisma/schema.prisma

# apply migrations (this will use DATABASE_URL from .env)
npx prisma migrate dev --schema prisma/schema.prisma --name init

# seed the database
node prisma/seed.js
```

Run the development server
```bash
npm run dev
# server listens on PORT (default 3001). Health: http://localhost:3001/health
```

API overview (base URL: `http://localhost:3001/api`)
- Auth
  - POST `/auth/register` { name, email, password } → creates user
  - POST `/auth/login` { email, password } → returns { token, user }

- Equipment
  - GET `/equipment` → list
  - GET `/equipment/:id` → details
  - POST `/equipment` (Admin/Manager) → create
  - GET `/equipment/:id/requests` → requests for a machine
  - GET `/equipment/:id/autofill` → returns { teamId, technicianId, category }
  - GET `/equipment/:id/open-requests-count` → smart-button count

- Requests
  - POST `/requests` (authenticated) → create request (type: CORRECTIVE|PREVENTIVE)
  - GET `/requests` (authenticated) → list (filters: type, status, teamId, page)
  - PATCH `/requests/:id/assign` (Manager/Admin) → assign technician `{ technicianId }`
  - PATCH `/requests/:id/status` (Technician/Manager/Admin) → change status `{ status }`
    - Server enforces allowed transitions; moving to `SCRAP` marks equipment scrapped and creates a log.

- Teams
  - CRUD and member management under `/teams` (Admin/Manager only)

Auth integration (frontend notes)
- After login, the backend returns a `token`. Frontend must include this header on protected calls:
  `Authorization: Bearer <token>`
- CORS is enabled. Default backend base URL: `http://localhost:3001` (adjust in frontend config).

Calendar integration
- Frontend should call `/api/requests?type=PREVENTIVE&from=YYYY-MM-DD&to=YYYY-MM-DD` (note: `from`/`to` can be added if needed — currently filters include `type`, `status`, and `teamId`).

Notes & recommendations
- Replace `JWT_SECRET` with a secure random value and store secrets in a vault for production.
- Add server-side validation (express-validator or Zod) in production.
- Add background worker or cron for overdue detection/notifications.
- Add integration tests for the main flows (Breakdown & Preventive).

If you run into DB permission errors during `prisma migrate`, ensure the DB user has `CREATE` and `REFERENCES` privileges (Prisma creates a shadow DB during migrations).

Contact / onboarding steps for frontend team
1. Point API base to `http://localhost:3001/api` during local development.
2. Use `/auth/login` to obtain a token; include `Authorization` header for protected endpoints.
3. For drag/drop Kanban, call `PATCH /requests/:id/status` to update state.
4. For calendar views, fetch preventive requests and display `scheduledDate`.

That's it — if you want, I can add a Postman collection or OpenAPI spec next.
