# ── Backend Node.js Environment (Render Web Service) ──
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate the client
# (DIRECT_URL / DATABASE_URL must be available as build args if using db-based generation)
COPY prisma ./prisma/
COPY prisma.config.js ./

# Generate Prisma Client (no DB connection required for generate)
RUN npx prisma generate

# Copy application source
COPY src ./src/

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Migrations are run as a Render pre-deploy command, NOT here.
# Reason: the build container may not have network access to Supabase,
# and running migrations in CMD would block every container restart.
CMD ["node", "src/app.js"]
