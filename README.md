# VaxCare — Barangay Vaccination Management System

VaxCare is a web-based vaccination and resident-management system built with React, Vite, TypeScript, Express, and PostgreSQL. It includes staff and resident sign-in, resident profiles, vaccination records, appointments, vaccine inventory, notifications, and reports.

**Target Architecture:**
* **Frontend:** React + Vite SPA deployed on **Vercel**
* **Backend:** Express API deployed on **Fly.io**

---

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 14 or newer
- Git
- Fly CLI (`flyctl`) for backend deployment
- Vercel CLI / Git integration for frontend deployment

---

## 1. Configure the Database

Create a PostgreSQL database named `vaxcare`, then run the schema and optional demo data from the project root:

```bash
createdb vaxcare
psql -U postgres -d vaxcare -f apps/backend/src/legacy/postgresql/schema.sql
psql -U postgres -d vaxcare -f apps/backend/src/legacy/postgresql/seed.sql
```

If your PostgreSQL username, password, or database name differs, update the backend environment variables accordingly.

---

## 2. Environment Variables & reCAPTCHA v3 Configuration

### Backend (Fly.io)

Copy `apps/backend/.env.example` to `apps/backend/.env`:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=change-me
DB_NAME=vaxcare

# Generate a 32+ character JWT secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=replace-with-a-unique-random-secret-at-least-32-characters-long

# CORS: Allowed frontend origins (comma-separated)
CORS_ALLOWED_ORIGINS=https://your-vaxcare-app.vercel.app,http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Defaults to false and MUST remain OFF (false) in production.
# Vercel preview environments use dynamic URLs (*.vercel.app) that cannot validate against production reCAPTCHA tokens.
ALLOW_VERCEL_PREVIEWS=false

# Rate limiting settings (keyed by real client IP via Fly-Client-IP / trust proxy = 1)
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10
REGISTER_RATE_LIMIT_WINDOW_MS=900000
REGISTER_RATE_LIMIT_MAX=20

# Google reCAPTCHA v3 Secret Key (Fly.io secrets in production; never commit)
RECAPTCHA_SECRET_KEY=your_recaptcha_v3_secret_key

# Minimum risk score threshold (0.0 = bot, 1.0 = human, default is 0.5)
RECAPTCHA_MIN_SCORE=0.5

# Expected frontend hostname (e.g. your-vaxcare-app.vercel.app). Leave empty in local dev to skip.
RECAPTCHA_EXPECTED_HOSTNAME=your-vaxcare-app.vercel.app
```

On Fly.io, set production secrets via the Fly CLI:
```bash
fly secrets set \
  JWT_SECRET="your-secure-random-secret-at-least-32-chars" \
  RECAPTCHA_SECRET_KEY="your-recaptcha-v3-secret-key" \
  RECAPTCHA_MIN_SCORE="0.5" \
  RECAPTCHA_EXPECTED_HOSTNAME="your-vaxcare-app.vercel.app" \
  CORS_ALLOWED_ORIGINS="https://your-vaxcare-app.vercel.app,http://localhost:5173" \
  ALLOW_VERCEL_PREVIEWS="false"
```

### Frontend (Vercel)

Copy `apps/frontend/.env.example` to `apps/frontend/.env`:

```env
# Local: http://localhost:4000/api | Production: https://vaxcare-backend.fly.dev/api
VITE_API_URL=http://localhost:4000/api

# Google reCAPTCHA v3 Site Key (public key for the frontend)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
```

On Vercel, set `VITE_API_URL` and `VITE_RECAPTCHA_SITE_KEY` under **Project Settings $\rightarrow$ Environment Variables**. *Note: Vite bakes environment variables into the static bundle at build time, so redeploying the frontend is required after changing them.*

---

## 3. Google reCAPTCHA v3 Architecture

VaxCare uses **Google reCAPTCHA v3** to invisibly protect authentication and resident registration against automated bots, brute force, and credential stuffing:

* **Submit-Time Execution:** Tokens are generated only when the user clicks "Sign In" or "Register" via `grecaptcha.ready(() => grecaptcha.execute(siteKey, { action }))`.
* **Action Names (strictly enforced):**
  * `login`: Staff authentication (`POST /api/auth/login`)
  * `resident_login`: Resident birthdate sign-in (`POST /api/auth/resident-login`)
  * `register`: Resident profile registration (`POST /api/residents`)
* **Server-Side Verification Pipeline:**
  1. **Rate Limiting:** Protects endpoints against request flooding before verification.
  2. **Token Extraction:** Reads `recaptchaToken` from request body (or headers). Rejects with 400 if missing.
  3. **Fly.io Client IP:** Extracts IP prioritizing `Fly-Client-IP`, falling back to `req.ip` via `app.set("trust proxy", 1)`.
  4. **Fail-Closed Verification:** POSTs to Google siteverify with a 5-second timeout; failures or network outages return 503.
  5. **Action Verification:** Strictly validates action (`login` on staff login, `resident_login` on resident login, `register` on resident registration). Mismatch returns 403.
  6. **Score Evaluation:** Validates score $\ge$ `RECAPTCHA_MIN_SCORE` (default `0.5`). Low scores return 403.
  7. **Hostname Enforcement:** Verifies token domain matches `RECAPTCHA_EXPECTED_HOSTNAME`.

> [!WARNING]
> **Vercel Preview Deployments Notice:**
> Vercel Preview environments generate dynamic, ephemeral URLs (e.g. `https://vaxcare-git-branch-team.vercel.app`).
> - They **will not work** with the development key (which is restricted to `localhost`).
> - They **will not work** with `RECAPTCHA_EXPECTED_HOSTNAME` set to the production domain.
> 
> Therefore, **captcha-protected flows are tested locally (using the localhost dev key) and on the production domain only**. `ALLOW_VERCEL_PREVIEWS` defaults to `false` and must remain **OFF in production**.

---

## 4. Google reCAPTCHA Registration (Key Generation)

1. Navigate to the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).
2. Click **Create** (+).
3. **Label:** e.g. `VaxCare Production`
4. **reCAPTCHA type:** Choose **Score based (v3)**.
5. **Domains:**
   * **Production Key:** Add your exact Vercel production domain (e.g. `your-vaxcare-app.vercel.app`). Do not add protocol (`https://`) or paths.
   * **Development Key:** Create a separate reCAPTCHA v3 key specifically for local development with domain `localhost`.
6. Submit and copy the generated **Site Key** and **Secret Key**.

---

## 5. Local Development & Testing

From the project root:

```bash
# Install dependencies
npm install

# Run automated reCAPTCHA v3 and rate limiting test suite (17 tests)
npm test

# Run frontend and backend concurrently
npm run dev
```

---

## 6. Production Deployment Steps (Deploy in order)

### Step 1: Deploy Backend to Fly.io
1. Navigate to `apps/backend/`.
2. Set Fly secrets:
   ```bash
   fly secrets set \
     JWT_SECRET="<your-unique-32-char-random-secret>" \
     RECAPTCHA_SECRET_KEY="<your-google-recaptcha-v3-secret-key>" \
     RECAPTCHA_MIN_SCORE="0.5" \
     RECAPTCHA_EXPECTED_HOSTNAME="your-vaxcare-app.vercel.app" \
     CORS_ALLOWED_ORIGINS="https://your-vaxcare-app.vercel.app" \
     ALLOW_VERCEL_PREVIEWS="false"
   ```
3. Deploy:
   ```bash
   fly deploy
   ```
4. Verify health check at `https://<your-backend-app>.fly.dev/api/health`.

### Step 2: Deploy Frontend to Vercel
1. Set `VITE_API_URL` to `https://<your-backend-app>.fly.dev/api`.
2. Set `VITE_RECAPTCHA_SITE_KEY` to your live production Site Key.
3. Deploy to production.
4. Verify end-to-end authentication and registration on `https://your-vaxcare-app.vercel.app`.
