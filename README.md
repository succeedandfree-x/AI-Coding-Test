# FLYVIO

> 特价机票智能发现平台 — 从搜索、比价、监控到下单、支付的完整出行闭环

FLYVIO 是一个全栈机票预订演示应用，覆盖「查询 → 列表 → 详情 → 乘机人 → 下单 → 支付 → 订单管理」完整主流程，并集成低价监控、优惠券系统与 AI 智能推荐模块。项目采用前后端分离架构，前端 React + Vite，后端 Node.js + Express + SQLite，开箱即可运行。

---

## 功能亮点

| 模块 | 能力 |
|------|------|
| **航班搜索** | 出发/到达城市、日期、仅直飞、航司、舱位、时段多维度筛选；按价格/起飞时间/飞行时长排序 |
| **航班详情** | 航班号、航司、起降机场与航站楼、飞行时长、行李额、退改规则、餐食、中转信息 |
| **订单流程** | 多乘机人、联系手机、优惠券抵扣 → 创建订单 → 模拟支付 → 查看/取消订单 |
| **优惠券** | 新客立减券（满额可用），下单时自动校验与抵扣 |
| **低价监控** | 创建航线+日期区间+目标价监控；支持暂停/恢复/删除 |
| **AI 智能推荐** | 价格趋势分析（买入/观望建议）、行程推荐、目的地灵感、航段组合优化 |
| **用户体系** | 手机号登录/注册、用户偏好设置（舱位偏好、预算上限） |
| **响应式设计** | 移动优先，CSS 变量驱动的定制设计系统，适配手机/平板/桌面 |

---

## 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3 | UI 框架 |
| React Router DOM | 6.28 | 客户端路由（底部 4 Tab） |
| Vite | 5.4 | 构建工具与开发服务器 |
| TypeScript | 5.6 | 类型安全 |
| CSS Variables | — | 主题与设计令牌（无第三方 UI 库） |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | 4.21 | HTTP 服务与路由 |
| better-sqlite3 | 11.6 | 嵌入式数据库（WAL 模式） |
| uuid | 10.0 | 唯一 ID 生成 |
| cors | 2.8 | 跨域支持 |

### 开发 & 部署

| 技术 | 用途 |
|------|------|
| concurrently | 一条命令同时启动前后端 |
| Supertest | API 集成测试 |
| Docker | 容器化部署 |
| Render | 云平台一键部署（免费档可用） |

---

## 架构概览

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│  ┌───────────────────────────────────────────┐  │
│  │            React SPA (Vite)               │  │
│  │  ┌─────┐ ┌──────┐ ┌──────┐ ┌───────┐    │  │
│  │  │ Home│ │Search│ │Orders│ │Profile│    │  │
│  │  └──┬──┘ └──┬───┘ └──┬───┘ └──┬────┘    │  │
│  │     └───────┴────────┴────────┘          │  │
│  │            UserContext                    │  │
│  │            react-router-dom               │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼─────────────────────────────┘
                  │ /api/* (JSON)
                  ▼
┌─────────────────────────────────────────────────┐
│              Node.js + Express                  │
│  ┌─────────────────────────────────────────┐   │
│  │  /api/flights    /api/orders            │   │
│  │  /api/users      /api/coupons           │   │
│  │  /api/monitors   /api/ai                │   │
│  └──────────────┬──────────────────────────┘   │
│                 ▼                               │
│  ┌──────────────────────────────────────────┐  │
│  │  SQLite (better-sqlite3, WAL mode)       │  │
│  │  users · flights · orders · coupons      │  │
│  │  user_coupons · price_monitors           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

- **开发态**：前端 Vite（5173）通过代理访问后端（3001），前后端独立热更新
- **生产态**：`npm run build` 生成 `client/dist`，Express 同端口托管静态文件与 API，零 CORS 配置

---

## 仓库结构

```
Flyvio/
├── client/                       # 前端
│   ├── src/
│   │   ├── pages/                # 页面组件
│   │   │   ├── Home.tsx          # 首页 — 特价、热门航线、AI 推荐
│   │   │   ├── Search.tsx        # 航班搜索 — 多条件筛选
│   │   │   ├── FlightList.tsx    # 航班列表 — 排序与筛选
│   │   │   ├── FlightDetail.tsx  # 航班详情 — 行李/退改/中转
│   │   │   ├── Pay.tsx           # 支付页 — 优惠券与模拟支付
│   │   │   ├── Orders.tsx        # 订单列表 — 按状态筛选
│   │   │   ├── OrderDetail.tsx   # 订单详情 — 完整信息
│   │   │   ├── Monitors.tsx      # 低价监控 — 创建与管理
│   │   │   └── Profile.tsx       # 个人中心 — 偏好与 AI 功能
│   │   ├── components/           # 通用组件
│   │   │   ├── Layout.tsx        # 页面布局容器
│   │   │   ├── TabBar.tsx        # 底部导航栏（4 Tab）
│   │   │   ├── TopNav.tsx        # 顶部导航栏
│   │   │   ├── PcNavBar.tsx      # 桌面端侧边导航
│   │   │   ├── HomeSmartModules.tsx  # 首页 AI 智能模块
│   │   │   ├── HotRouteFlightCard.tsx # 热门航线卡片
│   │   │   └── AiChatDock.tsx    # AI 对话浮窗
│   │   ├── context/
│   │   │   └── UserContext.tsx   # 全局用户状态
│   │   ├── api.ts                # API 客户端封装
│   │   ├── main.tsx              # 入口
│   │   └── styles/
│   │       └── global.css        # 全局样式与设计令牌
│   ├── public/                   # 静态资源
│   └── dist/                     # 构建产物（gitignore）
│
├── server/                       # 后端
│   ├── src/
│   │   ├── routes/               # 路由处理器（按领域拆分）
│   │   │   ├── flights.js        # 航班查询与详情
│   │   │   ├── orders.js         # 订单创建/支付/取消
│   │   │   ├── users.js          # 注册/登录/偏好
│   │   │   ├── coupons.js        # 优惠券查询
│   │   │   ├── monitors.js       # 低价监控 CRUD
│   │   │   └── ai.js             # AI 演示接口
│   │   ├── middleware.js         # 身份校验中间件
│   │   ├── db.js                 # 数据库初始化 + 种子数据
│   │   ├── app.js                # Express 应用（可测试）
│   │   └── index.js              # 服务启动入口
│   ├── data/                     # SQLite 数据文件（运行时生成）
│   └── tests/
│       ├── api.test.js           # API 集成测试
│       └── setup-env.js          # 测试环境变量注入
│
├── docs/                         # 文档
│   ├── ARCHITECTURE.md           # 系统架构详述
│   ├── API.md                    # API 接口参考
│   └── DEPLOY.md                 # 部署指南
│
├── Dockerfile                    # Docker 镜像定义
├── render.yaml                   # Render 部署蓝图
├── package.json                  # 根目录脚本（concurrently）
└── README.md                     # 本文件
```

---

## 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18 | 20+ |
| npm | 9 | 10+ |

> **Windows 用户**：若 `npm install` 遇到全局缓存目录权限问题，可指定本地缓存路径：
> ```bash
> npm install --cache ./.npm-cache
> ```

---

## 快速启动

### 方式 A：一条命令同时启动前后端（推荐）

```bash
cd Flyvio
npm install --cache ./.npm-cache
npm run dev
```

终端应显示 **api** 与 **web** 两个进程，浏览器访问：

- **http://localhost:5173**

### 方式 B：分别启动前后端

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

看到 `VITE v... ready in ...` 后访问 **http://localhost:5173**。

> **注意**：5173 是前端开发服务端口，若只启动后端（3001），浏览器访问 5173 会连接被拒绝。

---

## 演示账号

在「我的」页面使用手机号 **13800000000** 登录，对应种子数据中的演示用户，预置：

- 一张未使用的「新客立减」优惠券（满 ¥300 减 ¥50）
- 偏好设置：经济舱，预算上限 ¥800

---

## 数据库

### 模型关系

```
┌──────────┐       ┌──────────────────┐       ┌──────────┐
│  users   │──1:N──│   user_coupons   │──N:1──│  coupons │
│          │       │  (user_id,       │       │          │
│          │       │   coupon_id,     │       │          │
│          │       │   used)          │       │          │
└────┬─────┘       └──────────────────┘       └──────────┘
     │
     │ 1:N
     │
┌────┴─────┐       ┌──────────────────┐
│  orders  │       │ price_monitors   │
│          │       │                  │
│ flight_  │       │ dep_city         │
│ ids_json │       │ arr_city         │
│ passen-  │       │ date range       │
│ gers_    │       │ target_price     │
│ json     │       └──────────────────┘
└──────────┘
                ┌──────────────────┐
                │    flights       │
                │ airline, flight_ │
                │ no, route,       │
                │ price, stock,    │
                │ baggage, refund  │
                └──────────────────┘
```

### 表结构

| 表 | 核心字段 | 说明 |
|----|---------|------|
| `users` | id, phone, nickname, preferences_json | 用户信息与偏好（JSON 字段存储舱位/预算） |
| `flights` | id, airline, flight_no, dep/arr_city, price, stock, ... | 航班快照数据，含行李/退改/餐食/中转等展示字段 |
| `orders` | id, user_id, flight_ids_json, passengers_json, total_amount, status | 订单记录，状态机：pending → paid / cancelled |
| `coupons` | id, code, title, discount_type, discount_value, min_amount | 券模板（支持 fixed / percent 两种类型） |
| `user_coupons` | user_id, coupon_id, used | 用户持有券关系表 |
| `price_monitors` | id, user_id, dep/arr_city, date range, target_price, active | 低价监控配置 |

### 种子数据

首次启动自动初始化 5 条演示航班（北京→上海、上海→广州、上海→成都），1 张优惠券，1 个演示用户。后续启动不会覆盖已有数据。

---

## API 概览

基础路径：`/api`（开发态 Vite 代理为同源，生产态同端口无跨域）

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `GET` | `/flights` | 航班搜索（depCity, arrCity, depDate, directOnly, sort, airline, cabin, timeSlot） |
| `GET` | `/flights/today-specials` | 今日特价 |
| `GET` | `/flights/hot-routes` | 热门航线 |
| `GET` | `/flights/:id` | 航班详情 |
| `POST` | `/users/login` | 登录/注册 `{ phone }` |

### 需认证接口（请求头 `X-User-Id`）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/users/me` | 当前用户信息 |
| `PUT` | `/users/preferences` | 更新偏好 |
| `POST` | `/orders` | 创建订单 |
| `GET` | `/orders` | 订单列表（?status=pending/paid/cancelled） |
| `GET` | `/orders/:id` | 订单详情 |
| `POST` | `/orders/:id/pay` | 模拟支付 |
| `POST` | `/orders/:id/cancel` | 取消订单（回补库存） |
| `GET` | `/coupons/mine` | 我的优惠券 |
| `GET` | `/monitors` | 监控列表 |
| `POST` | `/monitors` | 创建监控 |
| `PATCH` | `/monitors/:id` | 更新监控 |
| `DELETE` | `/monitors/:id` | 删除监控 |

### AI 演示接口（需 `X-User-Id`）

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/ai/price-trend` | 价格趋势 → buy_now / wait 建议 |
| `POST` | `/ai/trip-recommend` | 基于预算的行程推荐 |
| `POST` | `/ai/dest-inspiration` | 低价目的地灵感 |
| `POST` | `/ai/combo-optimize` | 航段组合优化 |

> 完整 API 文档见 [docs/API.md](docs/API.md)

---

## 测试

```bash
cd server
npm test
```

- 测试使用内存数据库（`FLYVIO_DB_PATH=:memory:`），通过 `--import ./tests/setup-env.js` 在应用加载前注入
- 不影响开发数据，无需额外配置
- 基于 Node.js 内置 `node --test` 运行器 + Supertest

---

## 部署

### 环境变量

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `PORT` | `3001` | 服务监听端口 |
| `HOST` | `0.0.0.0` | 监听地址 |
| `NODE_ENV` | `development` | 运行环境 |
| `FLYVIO_DB_PATH` | `server/data/flyvio.db` | SQLite 数据库路径（设为 `:memory:` 使用内存数据库） |
| `FLYVIO_STATIC_DIR` | `client/dist` | 前端静态文件目录 |

### 本地生产验证

```bash
npm run build          # 构建前端 → client/dist/
npm start --prefix server   # 启动后端（自动托管前端静态文件）
# 访问 http://localhost:3001
```

### Docker

```bash
docker build -t flyvio .
docker run -p 3001:3001 flyvio
```

### Render 一键部署

1. 将代码推送到 GitHub / GitLab
2. 登录 [Render](https://render.com) → **New** → **Blueprint** → 选择本仓库
3. 自动识别 `render.yaml` 配置并部署
4. 获得公开访问链接（如 `https://xxx.onrender.com`）

> Render 免费实例冷启动约数十秒；实例重启后种子数据会重新初始化。

> 完整部署文档见 [docs/DEPLOY.md](docs/DEPLOY.md)

---

## 设计系统

项目使用 CSS 自定义属性构建轻量设计系统，无需第三方 UI 库：

```css
:root {
  --flyvio-cream: #e8f2fc;        /* 页面底色 */
  --flyvio-blue: #1e5a8e;         /* 主强调色 */
  --flyvio-yellow: #f4c14b;       /* 辅助强调色 */
  --flyvio-green: #1a8a5c;        /* 成功/确认色 */
  --flyvio-ink: #1a1f2e;          /* 正文色 */
  --flyvio-card: #ffffff;          /* 卡片色 */
  --flyvio-radius: 16px;           /* 统一圆角 */
  --flyvio-shadow: 0 8px 32px rgba(30, 90, 142, 0.08);  /* 卡片阴影 */
}
```

- 移动优先响应式布局，`clamp()` 流式间距
- 安全区域适配（`env(safe-area-inset-bottom)`）
- 桌面端自动切换为侧边导航布局

---

## 项目脚本

| 命令 | 作用域 | 说明 |
|------|--------|------|
| `npm run dev` | 根目录 | 同时启动前端 + 后端（concurrently） |
| `npm run dev:server` | 根目录 | 仅启动后端 |
| `npm run dev:client` | 根目录 | 仅启动前端 |
| `npm run build` | 根目录 | 构建前端 |
| `npm start` | 根目录 | 生产模式启动后端 |
| `npm run dev` | server/ | 后端开发模式（--watch 热重启） |
| `npm test` | server/ | 运行 API 集成测试 |
| `npm run dev` | client/ | 前端开发模式（Vite HMR） |
| `npm run build` | client/ | 构建前端产物 |
| `npm run preview` | client/ | 预览构建产物 |

---

## 与生产系统的差距

本项目的核心定位是**全栈能力演示**，以下方面与真实生产系统存在差异：

| 领域 | 当前状态 | 生产化方向 |
|------|---------|-----------|
| 航班数据 | 种子演示数据，静态 | 对接 OTA 供应商 API，实时价格同步 |
| 身份认证 | `X-User-Id` 请求头（演示级） | JWT / OAuth 2.0，Refresh Token |
| 支付 | 模拟成功，无真实扣款 | 对接微信/支付宝 SDK，Webhook 验签 |
| AI 模块 | 规则 + 聚合统计 | 独立推理服务或外部模型 API |
| 数据库 | SQLite（单文件，适合演示） | PostgreSQL + 搜索引擎，队列增量更新 |
| 监控通知 | 仅存储配置 | 定时任务扫描 + 短信/推送通知 |
| 合规出票 | 无 | 供应商对接 + 法务流程 + 售后工单 |

---

## 文档索引

| 文档 | 内容 |
|------|------|
| [系统架构](docs/ARCHITECTURE.md) | 前后端分离架构、数据模型、AI 模块、扩展建议 |
| [API 参考](docs/API.md) | 完整接口说明、参数、错误格式 |
| [部署指南](docs/DEPLOY.md) | 构建、部署、HTTPS、云平台配置 |

---

## License

Private — 仅供演示与学习用途
