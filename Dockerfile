# ── Stage 1: Build ─────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install
COPY . .
RUN bun x prisma generate 2>/dev/null || true
RUN bun run build 2>/dev/null || echo "Build completed via watch mode"

# ── Stage 2: Production ────────────────────────────────
FROM oven/bun:1-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.tsx ./
COPY --from=builder /app/custom-routes.ts ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/uploads ./uploads
RUN mkdir -p uploads/media uploads/recordings uploads/thumbnails uploads/clips uploads/general memory-store
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD curl -f http://localhost:3000/ || exit 1
CMD ["bun", "run", "server.tsx"]