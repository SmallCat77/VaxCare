# VaxCare Code Scan & Improvement Notes

## Changes applied
1. **Removed hard-coded database/JWT example credentials.** The backend `.env.example` now uses placeholders and documents local PostgreSQL configuration.
2. **Made JWT signing configuration fail-safe.** The backend now refuses to start if `JWT_SECRET` is missing or shorter than 32 characters. Generate a secret with the command in the README.
3. **Restricted CORS.** The API now permits only origins listed in `CORS_ORIGIN` (defaults to the local Vite dev origin). Set this to the real frontend URL when deploying.
4. **Limited JSON request size** to 1 MB.
5. **Reduced resident data exposure.** The schedules endpoint now returns only the signed-in resident's own schedules for resident accounts; staff can still see all schedules.
6. **Rewrote setup documentation** to match the current React/Vite + Express/PostgreSQL stack and explain environment setup and deployment cautions.

## Important items still worth addressing before real use
- Resident login is based on resident ID + date of birth, which is not strong authentication. Use a stronger verification flow and rate-limit login attempts before handling real data.
- Add server-side rate limiting, request validation for every endpoint, and audit logs for sensitive record access/changes.
- Review authorization on every endpoint and ensure residents cannot infer or access other residents' data through related routes.
- Avoid `ssl: { rejectUnauthorized: false }` for production PostgreSQL connections; configure certificate verification according to the database provider.
- Add automated tests for auth, role permissions, resident data isolation, inventory updates, and scheduling.
- Use HTTPS, backups, least-privilege database credentials, and synthetic resident data for demos.

## Validation status
This was a static code/configuration scan and targeted edits. A full production build was not run in this environment because dependencies were not installed and package installation was not performed. Run `npm install` and `npm run build` locally, then resolve any reported compiler/build errors before deployment.
