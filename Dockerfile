# ---- Build stage ----
FROM oven/bun:latest AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- Production stage ----
FROM oven/bun:latest
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/package.json ./package.json
RUN mkdir -p /app/data
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "server.ts"]
