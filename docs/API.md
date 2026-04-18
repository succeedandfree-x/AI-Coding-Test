# FLYVIO API 摘要

基础路径：`http://localhost:3001/api`（前端开发态通过 Vite 代理为同源 `/api`）。

## 通用

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |

## 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/users/register` | 注册 `{ phone, nickname? }` |
| POST | `/users/login` | 登录或自动创建 `{ phone }` |
| GET | `/users/me` | 需头 `X-User-Id` |
| PUT | `/users/preferences` | 需头 `X-User-Id`，body 为偏好 JSON 对象 |

## 航班

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/flights` | 查询：`depCity`,`arrCity`,`depDate`,`directOnly`,`sort`(price\|departure\|duration),`airline`,`cabin`,`timeSlot` |
| GET | `/flights/today-specials` | 今日特价列表（演示：低价前 8 条） |
| GET | `/flights/hot-routes` | 热门航线静态配置 |
| GET | `/flights/:id` | 航班详情 |

## 订单（均需 `X-User-Id`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/orders` | 创建 `{ flightIds[], passengers[], contactPhone, couponId? }` |
| GET | `/orders` | `?status=pending\|paid\|cancelled` |
| GET | `/orders/:id` | 详情 |
| POST | `/orders/:id/pay` | 模拟支付 `{ paymentMethod }` |
| POST | `/orders/:id/cancel` | 取消待支付订单并回补库存 |

## 优惠券（需 `X-User-Id`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/coupons/mine` | 我的优惠券 |

## 低价监控（需 `X-User-Id`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/monitors` | 列表 |
| POST | `/monitors` | 创建 `{ depCity, arrCity, depDateStart, depDateEnd, targetPrice }` |
| PATCH | `/monitors/:id` | 更新 `targetPrice` / `active` / 日期 |
| DELETE | `/monitors/:id` | 删除 |

## AI（演示）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/ai/price-trend` | `{ depCity, arrCity, depDate }` → 建议 buy_now / wait |
| POST | `/ai/trip-recommend` | 需 `X-User-Id`，`{ budget? }` |
| POST | `/ai/dest-inspiration` | `{ budget?, maxHours? }` |
| POST | `/ai/combo-optimize` | `{ depCity, arrCity }` |

## 错误格式

HTTP 4xx/5xx 时 body 多为 `{ "error": "消息" }`。
