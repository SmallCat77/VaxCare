# Multi-stage production Dockerfile for VaxCare Backend on Fly.io
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace package definitions
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN npm ci

# Copy backend source code and tsconfig
COPY apps/backend ./apps/backend

# Build TypeScript to dist
RUN npm run build --workspace=@vaxcare/backend

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled files from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

EXPOSE 8080

WORKDIR /app/apps/backend
CMD ["node", "dist/server.js"]
