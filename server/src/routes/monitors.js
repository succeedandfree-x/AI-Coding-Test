import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { requireUserId } from '../middleware.js';

export const monitorsRouter = Router();
monitorsRouter.use(requireUserId);

/** GET /api/monitors */
monitorsRouter.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM price_monitors WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId);
  res.json({ list: rows.map((r) => ({ ...r, active: Boolean(r.active) })) });
});

/** POST /api/monitors */
monitorsRouter.post('/', (req, res) => {
  const { depCity, arrCity, depDateStart, depDateEnd, targetPrice } = req.body;
  if (!depCity || !arrCity || !depDateStart || !depDateEnd || targetPrice == null) {
    return res.status(400).json({ error: '请填写完整监控条件' });
  }
  const id = uuidv4();
  db.prepare(
    `INSERT INTO price_monitors (id, user_id, dep_city, arr_city, dep_date_start, dep_date_end, target_price, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(id, req.userId, depCity, arrCity, depDateStart, depDateEnd, Number(targetPrice));
  const row = db.prepare('SELECT * FROM price_monitors WHERE id = ?').get(id);
  res.status(201).json({ ...row, active: Boolean(row.active) });
});

/** PATCH /api/monitors/:id */
monitorsRouter.patch('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM price_monitors WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: '监控任务不存在' });
  const { targetPrice, active, depDateStart, depDateEnd } = req.body;
  const updates = [];
  const params = [];
  if (targetPrice != null) {
    updates.push('target_price = ?');
    params.push(Number(targetPrice));
  }
  if (active != null) {
    updates.push('active = ?');
    params.push(active ? 1 : 0);
  }
  if (depDateStart) {
    updates.push('dep_date_start = ?');
    params.push(depDateStart);
  }
  if (depDateEnd) {
    updates.push('dep_date_end = ?');
    params.push(depDateEnd);
  }
  if (updates.length === 0) {
    return res.json({ ...row, active: Boolean(row.active) });
  }
  params.push(req.params.id);
  db.prepare(`UPDATE price_monitors SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const next = db.prepare('SELECT * FROM price_monitors WHERE id = ?').get(req.params.id);
  res.json({ ...next, active: Boolean(next.active) });
});

/** DELETE /api/monitors/:id */
monitorsRouter.delete('/:id', (req, res) => {
  const r = db.prepare('DELETE FROM price_monitors WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (r.changes === 0) return res.status(404).json({ error: '监控任务不存在' });
  res.json({ ok: true });
});
