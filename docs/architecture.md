# VaxCare Architecture & System Design

This document describes the architecture, workspace structure, data flow, and security model of the VaxCare monorepo.

## 1. Monorepo Structure

VaxCare is structured as an npm workspaces monorepo:

- **`apps/frontend`**: React 18 single-page application built with Vite 6 and TypeScript. Uses Tailwind CSS for styling and Recharts for data visualization.
- **`apps/backend`**: REST API built with Node.js 20, Express 4, and TypeScript. Interfaces directly with PostgreSQL via the `pg` (node-postgres) driver.
- **`docs`**: Technical and system architecture documentation.

All workspace commands (`dev`, `build`) are orchestrated from the root `package.json` using `concurrently`.

---

## 2. Technology Stack & Runtime Environment

| Layer | Technologies |
|---|---|
| **Client (Frontend)** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router v7 |
| **Server (Backend)** | Node.js, Express 4, TypeScript, node-postgres (`pg` 8.12), bcryptjs, jsonwebtoken, dotenv, cors |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT) with 8-hour expiry; bcrypt password hashing (10 salt rounds) |
| **Concurrency & Integrity** | PostgreSQL transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) with row-level locking (`FOR UPDATE`) for stock deductions |

---

## 3. Database Architecture

The PostgreSQL schema is defined in `apps/backend/src/legacy/postgresql/schema.sql` and consists of six core entities. *(Note on directory naming: despite the directory name `apps/backend/src/legacy/postgresql`, its contents—`pool.ts`, `schema.sql`, and `seed.sql`—are actively imported by all backend controllers and services and constitute the active database layer, not dead code).*

1. **`users`**: Administrative and clinical staff accounts.
   - Fields: `id`, `username`, `password_hash`, `display_name`, `role` (`admin`, `worker`, `resident`), `avatar`, `title`, `created_at`.
2. **`residents`**: Registered community residents.
   - Fields: `id` (e.g. `R001`), `name`, `age`, `gender`, `birthdate`, `address`, `phone`, `purok`, `status` (`Fully Vaccinated`, `Partially Vaccinated`, `Unvaccinated`), `next_due`, `created_at`.
3. **`vaccinations`**: Recorded vaccine administrations.
   - Fields: `id`, `resident_id` (FK to `residents`), `vaccine`, `dose`, `date`, `worker`, `batch_no`, `site`, `created_at`.
4. **`medical_supplies`**: Vaccine and medical item inventory.
   - Fields: `id` (e.g. `VS001`), `name`, `category`, `quantity`, `min_stock`, `expiry_date`, `manufacturer`, `last_restocked`.
5. **`schedules`**: Resident appointment bookings.
   - Fields: `id` (e.g. `S001`), `resident_id` (FK to `residents`), `appointment_type`, `details`, `scheduled_date`, `status` (`Upcoming`, `Completed`, `Missed`, `Rescheduled`), `worker`, `purok`.
6. **`notifications`**: System alerts and inventory warnings.
   - Fields: `id`, `type` (`alert`, `info`, `warning`, `success`), `title`, `message`, `read`, `created_at`.

Database connection pooling is initialized in `apps/backend/src/legacy/postgresql/pool.ts` using either a unified `DATABASE_URL` or individual `DB_*` parameters.

---

## 4. API Routes & Endpoint Organization

Backend routes are declared under `apps/backend/src/routes`:

- **/api/auth**: Staff login (`POST /login`) and resident demographic authentication (`POST /resident-login`).
- **/api/residents**: Resident listing, profile details with nested vaccination records, registration, and updates.
- **/api/residents/:id/vaccinations**: Vaccine administration recording (with atomic inventory deduction and status recalculation) and resident vaccination history.
- **/api/stock**: Inventory listing and stock replenishment/adjustment.
- **/api/schedules**: Appointment scheduling, status updating (`Completed`, `Missed`), and role-scoped appointment listings.
- **/api/notifications**: System alert retrieval and marking alerts as read.
- **/api/analytics**: Monthly vaccination metrics and coverage trends.
- **/api/users**: Full CRUD management of staff accounts and password updates (restricted to administrators).

---

## 5. Security & Access Control Model

1. **Role-Based Access Control (RBAC):**
   - Handled via `requireAuth` and `requireRole("admin", ...)` middleware in `apps/backend/src/middleware/auth.ts`.
   - The frontend (`AppLayout.tsx` and `App.tsx`) conditionally renders navigation links and enforces route-level redirection guards based on authenticated user roles.
2. **Data Isolation:**
   - Resident accounts are scoped strictly to their own data via `requireSelfOrStaff()` middleware and SQL filtering in schedule and resident endpoints.
3. **Transactional Concurrency:**
   - Vaccine administration executes within a PostgreSQL transaction leasing a dedicated pool client. Row-level locks (`SELECT ... FOR UPDATE`) prevent inventory race conditions or overselling.
