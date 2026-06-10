# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/migrations ./migrations
COPY --from=builder /usr/src/app/scripts ./scripts

EXPOSE 3000

ENV NODE_ENV=production

# Run migrations and then start the NestJS production server
CMD ["sh", "-c", "node scripts/migrate.js up && node dist/main"]
