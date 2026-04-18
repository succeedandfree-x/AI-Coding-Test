import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { flightsRouter } from './routes/flights.js';
import { ordersRouter } from './routes/orders.js';
import { monitorsRouter } from './routes/monitors.js';
import { usersRouter } from './routes/users.js';
import { couponsRouter } from './routes/coupons.js';
import { aiRouter } from './routes/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..', '..');
const staticDir = process.env.FLYVIO_STATIC_DIR || path.join(repoRoot, 'client', 'dist');
const hasClient = existsSync(path.join(staticDir, 'index.html'));

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'flyvio-server' });
});

app.use('/api/flights', flightsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/monitors', monitorsRouter);
app.use('/api/users', usersRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/ai', aiRouter);

if (hasClient) {
  app.use(express.static(staticDir));
  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>FLYVIO API</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#0f1d2e;background:#f0f6fc}
    a{color:#0d4a7a}
    code{background:#edf5fc;padding:.15rem .4rem;border-radius:4px}
  </style>
</head>
<body>
  <h1>FLYVIO 后端服务</h1>
  <p>本端口提供 <strong>REST API</strong>。未检测到构建后的前端（<code>client/dist</code>），请本地运行前端或使用一体化部署。</p>
  <ul>
    <li>前端（开发）：<a href="http://localhost:5173">http://localhost:5173</a></li>
    <li>健康检查：<a href="/api/health"><code>/api/health</code></a></li>
  </ul>
  <p style="color:#5c6478;font-size:.9rem">API 说明见项目 <code>docs/API.md</code>。</p>
</body>
</html>`);
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || '服务器错误' });
});
