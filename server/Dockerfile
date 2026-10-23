# ── Backend Node.js Environment ──
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy application files and prisma schema
COPY prisma ./prisma/
RUN npx prisma generate

COPY src ./src/

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "src/app.js"]
