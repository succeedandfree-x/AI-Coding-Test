# Flyvio · 特价机票发现平台

全栈演示项目：淡蓝色底色 + 蓝/黄强调色，覆盖「查询 → 列表 → 详情/乘机人 → 下单 → 支付 → 订单」主流程，并提供低价监控、优惠券与 AI 演示接口（可替换为真实模型与 OTA 对接）。

## 仓库结构

| 目录 | 说明 |
|------|------|
| `client/` | React 18 + Vite 5 前端，开发态通过代理访问 `/api` |
| `server/` | Node.js + Express + better-sqlite3 后端与 SQLite 数据 |
| `docs/` | 架构说明、API 摘要、部署指南 |

## 环境要求

- Node.js 18+（推荐 20+）
- Windows 若遇 `npm install` 全局缓存目录无权限，可使用本地缓存：  
  `npm install --cache "e:\AIcoding\Nexo\.npm-cache"`（路径按本机调整）

## 快速启动

**5173 是前端开发服务端口**：若只启动了后端（3001），没有执行下面的 `client` 或根目录 `npm run dev`，浏览器访问 `http://localhost:5173` 会打不开（连接被拒绝）。

### 方式 A：一条命令同时起 API + 前端（推荐）

在仓库根目录执行（首次需安装根目录依赖以使用 `concurrently`）：

```bash
cd 根目录
npm install --cache ./.npm-cache
npm run dev
```

终端里应看到 **api** 与 **web** 两个进程；再用浏览器打开：

- [http://localhost:5173](http://localhost:5173) 或 [http://127.0.0.1:5173](http://127.0.0.1:5173)

### 方式 B：两个终端分别启动

**终端 1 — 后端（默认端口 3001）**

```bash
cd server
npm install --cache ../.npm-cache
npm run dev
```

**终端 2 — 前端（默认端口 5173）**

```bash
cd client
npm install --cache ../.npm-cache
npm run dev
```

看到 `VITE v... ready in ...` 且列出 `Local: http://localhost:5173/` 后再访问。

## 演示账号

在「我的」页使用手机号 **13800000000** 登录，与种子数据中的演示用户一致，含一张未使用的「新客立减」券（订单满额可用）。

## 测试

```bash
cd server
npm test
```

测试使用内存数据库（`NEXO_DB_PATH=:memory:`），通过 `node --import ./tests/setup-env.js` 在加载应用前注入。

## 文档

- [系统架构](docs/ARCHITECTURE.md)
- [API 摘要](docs/API.md)
- [部署指南](docs/DEPLOY.md)

## 说明（与真实生产系统的差距）

- 航班与价格为 **种子演示数据**，非实时 OTA；全渠道比价、合规出票、售后工单等需在对接供应商与法务流程后落地。
- AI 相关接口为 **规则 + 统计演示**，训练模型与特征工程需独立服务化接入。
- 支付为 **模拟成功**，未接真实微信/支付宝 SDK。
