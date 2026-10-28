# VaxCare — Barangay Vaccination Management System

VaxCare is a centralized web application designed to help Barangay Health Workers (BHWs) and health administrators manage resident profiles, vaccination records, appointment schedules, vaccine inventory, operational notifications, and health analytics. It also provides a Resident Portal for residents to look up their personal vaccination history and check local vaccine availability.

## Technology Stack

- **Monorepo:** npm workspaces (`apps/frontend`, `apps/backend`)
- **Frontend:** React 18, Vite 6, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v7
- **Backend:** Node.js, Express 4, TypeScript, node-postgres (`pg`), bcryptjs, jsonwebtoken, dotenv, cors
- **Database:** PostgreSQL

## Project Structure

```text
vaxcare-workspace/
├── apps/
│   ├── backend/                     # Node.js + Express API
│   │   ├── src/
│   │   │   ├── controllers/         # Request handlers (residents, stock, vaccinations, users, etc.)
│   │   │   ├── legacy/postgresql/   # Database schema (schema.sql), seed data (seed.sql), pool.ts
│   │   │   ├── middleware/          # JWT auth, role validation, error handling
│   │   │   ├── routes/              # Express API route declarations
│   │   │   ├── services/            # Low-stock notification & resident status recalculation
│   │   │   └── server.ts            # API server entry point (port 4000)
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/                    # React + Vite application
│       ├── src/
│       │   ├── components/          # Reusable UI primitives and charts
│       │   ├── layouts/             # AppLayout with role-scoped navigation
│       │   ├── lib/                 # API client, TypeScript interfaces, utilities
│       │   ├── pages/               # Functional views (Dashboard, Residents, Vaccinations, etc.)
│       │   ├── App.tsx              # Application routing and state management
│       │   └── main.tsx             # Frontend entry point
│       ├── .env.example
│       ├── package.json
│       └── vite.config.ts
├── docs/                            # Architecture and system documentation
├── package.json                     # Monorepo scripts (dev, build)
└── README.md
```

## System Requirements & Prerequisites

- **Node.js:** v20.x or newer
- **npm:** v10.x or newer
- **PostgreSQL**
- **Operating System:** Windows, macOS, or Linux

---

## Getting Started (Windows Setup Guide)

### 1. Database Setup

1. Open PowerShell or Command Prompt. Ensure PostgreSQL is running.
2. Create the `vaxcare` database:
   ```powershell
   createdb -U postgres vaxcare
   ```
3. Initialize the schema and demo dataset using `psql`:
   ```powershell
   psql -U postgres -d vaxcare -f apps/backend/src/legacy/postgresql/schema.sql
   psql -U postgres -d vaxcare -f apps/backend/src/legacy/postgresql/seed.sql
   ```
   *(Enter your PostgreSQL password when prompted. If your database user differs from `postgres`, replace the `-U` flag value accordingly.)*

### 2. Configure Environment Variables

#### Backend (`apps/backend/.env`)
Copy `apps/backend/.env.example` to `apps/backend/.env`:
```powershell
copy apps\backend\.env.example apps\backend\.env
```
Open `apps/backend/.env` and update the values with your local settings:
- `PORT=4000`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=your_postgres_password_here`
- `DB_NAME=vaxcare`
- `JWT_SECRET=your_long_random_secret_at_least_32_characters_here`
- `CORS_ORIGIN=http://localhost:5173`

*(To generate a cryptographically strong 32+ character JWT secret, run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)*

#### Frontend (`apps/frontend/.env`)
Copy `apps/frontend/.env.example` to `apps/frontend/.env`:
```powershell
copy apps\frontend\.env.example apps\frontend\.env
```
Ensure `VITE_API_URL` points to your backend API:
- `VITE_API_URL=http://localhost:4000/api`

### 3. Install Dependencies & Run

From the root project folder:

```powershell
# Install all dependencies across monorepo workspaces
npm install

# Start both backend and frontend concurrently
npm run dev
```

Alternatively, start them in separate terminals:
```powershell
# Terminal 1: Backend API (runs on http://localhost:4000)
npm run dev:backend

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run dev:frontend
```

### 4. Build for Production

To build both the frontend and backend workspaces:
```powershell
npm run build
```

---

## User Roles & Access Control

VaxCare enforces role-based access control (RBAC) across both API routes and client views:

| Role | Target Users | Allowed Modules & Actions |
|---|---|---|
| **Admin** | Barangay Health Officer / System Admin | Complete system access: Dashboard, Residents, Vaccinations, Schedules, Inventory, Reports, Notifications, Advanced Tools (Timeline, Family Dashboard, Priority Patients, Certificate, Batches), and **Staff Management** (`/users`). |
| **Worker** | Registered Nurses (RN), Barangay Health Workers | Operational clinical modules: Register residents, record vaccinations, manage appointment schedules, view inventory & restock, view reports & notifications. Excluded from Staff Management. |
| **Resident** | Barangay Residents | Self-service portal access only (`/portal`). Can view their own vaccination history, scheduled appointments, and clinic vaccine availability. Cannot view other residents' data or administrative pages. |

---

## Demo Accounts Notice

Demo accounts are defined in `apps/backend/src/legacy/postgresql/seed.sql` for local testing and must be changed before any deployment.
- **Important:** Never use default demo credentials or sample resident records in a public or production environment. Before deployment, implement strong authentication, rate-limit login endpoints, enable HTTPS, configure automated database backups, and enforce strict access controls.

---

## Project Status & Known Limitations

VaxCare is currently in active development as a capstone project. The following technical notes reflect the current state of implementation:
1. **Atomic Stock Deduction:** Database transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) with `FOR UPDATE` inventory locking and low-stock notification deduplication are implemented in code. Live runtime validation is pending execution against an active local PostgreSQL service.
2. **Staff Management Navigation:** Admin-only Staff Management is integrated in the sidebar navigation with frontend route guards and backend role-authorization enforcement.
3. **Automated Test Coverage:** Automated unit and end-to-end test suites are currently in development. Verification currently relies on static TypeScript type checks (`tsc`), linter checks, and production builds (`vite build`).
4. **Data Privacy (RA 10173):** Demonstration deployments must utilize synthetic sample data only. Never input real personal or health records into unhardened demo environments.
