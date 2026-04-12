# Nexo 部署指南

## 构建前端

```bash
cd client
npm ci
npm run build
```

产物在 `client/dist/`，为静态文件，可由任意静态服务器或 CDN 托管。

## 运行后端

```bash
cd server
npm ci
npm start
```

默认监听 `PORT=3001`，可通过环境变量修改。

### 数据库路径

默认 SQLite 文件：`server/data/nexo.db`。自定义：

```bash
set NEXO_DB_PATH=D:\data\nexo.db
node src/index.js
```

（Linux/macOS 使用 `export NEXO_DB_PATH=...`。）

## 一体化部署（同机）

1. 构建前端后将 `client/dist` 目录复制到服务器。
2. 使用 Express 静态中间件托管 `dist`（需在 `app.js` 中增加 `express.static`，本仓库为开发分离结构，生产可合并或交给 Nginx）。
3. Nginx 示例：前端 `root` 指向 `dist`；`location /api { proxy_pass http://127.0.0.1:3001; }`。

## HTTPS 与域名

- 生产环境建议全站 HTTPS，由 Nginx/Caddy 终止 TLS。
- 支付与登录类能力上线前必须替换演示身份与模拟支付逻辑。

## 健康检查

负载均衡可探测 `GET /api/health`，期望 `200` 且 `{"ok":true}`。

## 云上一键部署（推荐给面试官一个链接）

仓库已支持 **单服务同域部署**：先 `npm run build` 生成 `client/dist`，再启动 `server` 后，同一端口同时提供静态前端与 `/api/*`，前端请求相对路径 `/api/...`，无需配置 `VITE_` 跨域。

### 方式 A：Render（Docker，免费档可用）

1. 将代码推送到 **GitHub / GitLab**（勿提交 `.env`、真实密钥）。
2. 打开 [Render](https://render.com) → **New** → **Blueprint** → 选择本仓库，识别 `render.yaml` 后部署。
3. 或使用 **New Web Service** → 选 Docker，Root Directory 留空，Dockerfile 路径 `Dockerfile`。
4. 部署完成后使用平台提供的 `https://xxx.onrender.com` 分享给面试官即可。

说明：免费实例冷启动约数十秒；SQLite 在默认路径下，**实例重启后演示数据会按种子重新初始化**（作业演示足够，勿存真实用户数据）。

### 方式 B：本机 / VPS 验证生产形态

```bash
npm run build
npm start --prefix server
```

浏览器访问 `http://localhost:3001`（或 `PORT` 所设端口）。

### 安全提示（演示项目）

- 不向仓库提交密钥；平台仅注入 `PORT` 等必要环境变量即可。
- 当前为演示登录与模拟支付，**勿接入真实支付或生产用户数据**。
- 需要限制访问来源时，可在平台侧配置 IP 允许列表或使用私有预览链接（视平台功能而定）。
