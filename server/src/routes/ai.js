import { Router } from 'express';
import { db } from '../db.js';
import { requireUserId } from '../middleware.js';

export const aiRouter = Router();

/**
 * 演示版 AI：基于数据库低价航班与规则生成建议，可替换为真实模型服务。
 */
aiRouter.post('/price-trend', (req, res) => {
  const { depCity, arrCity, depDate } = req.body;
  const minRow = db
    .prepare(
      `SELECT MIN(price) AS minP FROM flights WHERE dep_city = ? AND arr_city = ? AND date(dep_time) = date(?)`
    )
    .get(depCity || '北京', arrCity || '上海', depDate || '2026-04-15');
  const minP = minRow?.minP;
  if (minP == null) {
    return res.json({
      suggestion: 'wait',
      summary: '该日期暂无历史样本，建议扩大日期范围或开启低价监控。',
      confidence: 0.4,
    });
  }
  const avg = db
    .prepare(`SELECT AVG(price) AS a FROM flights WHERE dep_city = ? AND arr_city = ?`)
    .get(depCity || '北京', arrCity || '上海');
  const avgP = avg?.a || minP;
  const buyNow = minP <= avgP * 0.95;
  res.json({
    suggestion: buyNow ? 'buy_now' : 'wait',
    summary: buyNow
      ? `当前可查最低价约 ¥${minP}，低于近期均价，倾向「当前入手」。`
      : `当前最低价约 ¥${minP}，略高于近期均价，可继续等待或设置目标价提醒。`,
    confidence: 0.72,
    referenceMin: minP,
    referenceAvg: Math.round(avgP),
  });
});

aiRouter.post('/trip-recommend', requireUserId, (req, res) => {
  const prefs = req.body || {};
  const budget = Number(prefs.budget) || 800;
  const rows = db
    .prepare('SELECT * FROM flights WHERE price <= ? ORDER BY price ASC LIMIT 5')
    .all(budget);
  res.json({
    title: '为您匹配的性价比行程',
    trips: rows.map((f) => ({
      type: f.is_direct ? '直飞' : '组合/中转',
      summary: `${f.dep_city} → ${f.arr_city} · ${f.airline} ${f.flight_no}`,
      price: f.price,
      flightId: f.id,
      highlights: [f.baggage_info, f.meal_info].filter(Boolean),
    })),
  });
});

aiRouter.post('/dest-inspiration', (req, res) => {
  const { budget = 600, maxHours = 4 } = req.body;
  const rows = db
    .prepare('SELECT DISTINCT arr_city, MIN(price) AS p FROM flights GROUP BY arr_city HAVING p <= ? ORDER BY p ASC LIMIT 8')
    .all(Number(budget));
  res.json({
    destinations: rows.map((r) => ({
      city: r.arr_city,
      fromPrice: r.p,
      reason: `全网样本中「${r.arr_city}」近期起价较低，适合预算 ¥${budget} 内出行。`,
    })),
    note: `演示数据：最长直飞/中转耗时约束 maxHours=${maxHours} 可在接入实时数据后由模型强化。`,
  });
});

aiRouter.post('/combo-optimize', (req, res) => {
  const { depCity, arrCity } = req.body;
  if (!depCity || !arrCity) {
    return res.status(400).json({ error: '请提供出发地与目的地' });
  }
  const direct = db
    .prepare(
      `SELECT * FROM flights WHERE dep_city = ? AND arr_city = ? AND is_direct = 1 ORDER BY price ASC LIMIT 2`
    )
    .all(depCity, arrCity);
  const transfer = db
    .prepare(
      `SELECT * FROM flights WHERE dep_city = ? AND arr_city = ? AND is_direct = 0 ORDER BY price ASC LIMIT 2`
    )
    .all(depCity, arrCity);
  res.json({
    options: [
      ...direct.map((f) => ({ kind: '直飞', totalPrice: f.price, legs: [f.id], saveHint: '省时省心' })),
      ...transfer.map((f) => ({
        kind: '中转/联程',
        totalPrice: f.price,
        legs: [f.id],
        saveHint: f.transfer_info || '可能更低价，注意中转时长',
      })),
    ],
  });
});
