# 多阶段构建：镜像内含构建后的前端 + Node API，单容器对外一个 HTTPS URL（由平台终止 TLS）
FROM node:20-bookworm-slim AS web-build
WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
RUN npm ci --prefix client
COPY client ./client
RUN npm run build --prefix client

FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
RUN npm ci --prefix server --omit=dev
COPY server ./server
COPY --from=web-build /app/client/dist ./client/dist
ENV NODE_ENV=production
EXPOSE 3001
WORKDIR /app/server
CMD ["node", "src/index.js"]
