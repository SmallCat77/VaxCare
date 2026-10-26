# VaxCare — Barangay Vaccination Management System

VaxCare is a web-based vaccination and resident-management system built with React, Vite, TypeScript, Express, and PostgreSQL. It includes staff and resident sign-in, resident profiles, vaccination records, appointments, vaccine inventory, notifications, and reports.

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 14 or newer
- Git (optional, for version control)

## 1. Configure the database

Create a PostgreSQL database named `vaxcare`, then run the schema and optional demo data from the project root:

```bash
createdb vaxcare
psql -U postgres -d vaxcare -f apps/backend/src/legacy/postgresql/schema.sql
psql -U postgres -d vaxcare -f apps/backend/src/legacy/postgresql/seed.sql
```

If your PostgreSQL username, password, or database name differs, update the backend environment variables accordingly.

## 2. Configure environment variables

Copy `apps/backend/.env.example` to `apps/backend/.env`. Set your own database credentials and generate a unique JWT secret of at least 32 characters:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put the generated value in `JWT_SECRET`. Never commit `.env` files or share real database credentials. If you use `DATABASE_URL`, set it to your own PostgreSQL connection string and leave the individual `DB_*` values unused.

Copy `apps/frontend/.env.example` to `apps/frontend/.env`. For local development, `VITE_API_URL=http://localhost:4000/api` is the default. Set `CORS_ORIGIN` in the backend environment to the frontend origin; multiple origins can be comma-separated.

## 3. Install and run

From the project root:

```bash
npm install
npm run dev
```

Or start the apps separately:

```bash
npm run dev:backend
npm run dev:frontend
```

The frontend runs on Vite's local development URL (usually `http://localhost:5173`) and the API defaults to `http://localhost:4000`. Check `http://localhost:4000/api/health` to verify that the API process is responding.

Build both workspaces with:

```bash
npm run build
```

## 4. Demo accounts

If you loaded the included demo seed file, its staff accounts can be used for local testing. Check `apps/backend/src/legacy/postgresql/seed.sql` for the exact credentials before logging in. Resident sign-in uses a resident ID and date of birth for the seeded sample records.

**Important:** demo credentials and resident date-of-birth login are for demonstration only. Before real deployment, use stronger resident authentication, rate-limit login endpoints, enable HTTPS, configure database backups, and review access controls and privacy obligations for resident health data.

## Security notes

- The backend refuses to start if `JWT_SECRET` is missing or shorter than 32 characters.
- CORS is restricted to the configured `CORS_ORIGIN` list.
- JSON request bodies are limited to 1 MB.
- Resident accounts receive only their own schedules from the schedules endpoint.
- Use synthetic data for demos. Do not put real resident health information into a public or untrusted deployment.
