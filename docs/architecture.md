# VaxCare Architecture

This document describes the structure of the VaxCare monorepo.

## Workspace Structure
- \`apps/frontend\`: React + Vite frontend application.
- \`apps/backend\`: Node.js + Express backend application (transitioning to MySQL/Sequelize).
- \`packages/shared\`: Future shared types and logic.
- \`docs\`: Project documentation.
- \`scripts\`: Maintenance and CI/CD scripts.

## Key Changes
- Migrated from a monolithic root setup to an npm workspaces setup.
- Legacy PostgreSQL code is safely isolated in \`apps/api/src/legacy/postgresql\`.
- All development scripts are centrally managed in the root \`package.json\`.
