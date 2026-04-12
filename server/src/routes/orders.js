import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { requireUserId } from '../middleware.js';

export const ordersRouter = Router();

ordersRouter.use(requireUserId);

/** POST /api/orders 创建订单 */
ordersRouter.post('/', (req, res) => {
  const { flightIds, passengers, contactPhone, couponId } = req.body;
  if (!Array.isArray(flightIds) || flightIds.length === 0) {
    return res.status(400).json({ error: '请选择航班' });
  }
  if (!Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ error: '请填写乘机人' });
  }
  if (!contactPhone) {
    return res.status(400).json({ error: '请填写联系人手机' });
  }

  let subtotal = 0;
  const flights = [];
  for (const fid of flightIds) {
    const f = db.prepare('SELECT * FROM flights WHERE id = ?').get(fid);
    if (!f) return res.status(400).json({ error: `航班不存在: ${fid}` });
    if (f.stock < passengers.length) {
      return res.status(400).json({ error: `${f.flight_no} 余票不足` });
    }
    subtotal += f.price * passengers.length;
    flights.push(f);
  }

  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponId) {
    const uc = db
      .prepare(
        `SELECT c.* FROM user_coupons uc JOIN coupons c ON c.id = uc.coupon_id
         WHERE uc.user_id = ? AND uc.coupon_id = ? AND uc.used = 0`
      )
      .get(req.userId, couponId);
    if (!uc) {
      return res.status(400).json({ error: '优惠券不可用' });
    }
    if (subtotal < (uc.min_amount || 0)) {
      return res.status(400).json({ error: '未满足优惠券使用门槛' });
    }
    if (uc.discount_type === 'fixed') {
      discountAmount = Math.min(uc.discount_value, subtotal);
    } else if (uc.discount_type === 'percent') {
      discountAmount = Math.round((subtotal * uc.discount_value) / 100);
    }
    appliedCoupon = uc.id;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);
  const orderId = uuidv4();

  const tx = db.transaction(() => {
    for (const fid of flightIds) {
      db.prepare('UPDATE flights SET stock = stock - ? WHERE id = ?').run(passengers.length, fid);
    }
    db.prepare(
      `INSERT INTO orders (id, user_id, flight_ids_json, passengers_json, contact_phone, total_amount, discount_amount, coupon_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(
      orderId,
      req.userId,
      JSON.stringify(flightIds),
      JSON.stringify(passengers),
      contactPhone,
      totalAmount,
      discountAmount,
      appliedCoupon
    );
    if (appliedCoupon) {
      db.prepare('UPDATE user_coupons SET used = 1 WHERE user_id = ? AND coupon_id = ?').run(req.userId, appliedCoupon);
    }
  });

  try {
    tx();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  res.status(201).json({
    id: orderId,
    totalAmount,
    discountAmount,
    status: 'pending',
  });
});

/** GET /api/orders */
ordersRouter.get('/', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM orders WHERE user_id = ?';
  const params = [req.userId];
  if (status && status !== 'all') {
    sql += ' AND status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...params);
  const enriched = rows.map((o) => {
    const ids = JSON.parse(o.flight_ids_json);
    const flightSummaries = ids.map((id) => {
      const f = db.prepare('SELECT id, airline, flight_no, dep_city, arr_city, dep_time, arr_time, price FROM flights WHERE id = ?').get(id);
      return f;
    });
    return {
      ...o,
      flightIds: ids,
      passengers: JSON.parse(o.passengers_json),
      flights: flightSummaries,
    };
  });
  res.json({ list: enriched });
});

/** GET /api/orders/:id */
ordersRouter.get('/:id', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!o) return res.status(404).json({ error: '订单不存在' });
  const ids = JSON.parse(o.flight_ids_json);
  const flights = ids.map((id) => db.prepare('SELECT * FROM flights WHERE id = ?').get(id));
  res.json({
    ...o,
    flightIds: ids,
    passengers: JSON.parse(o.passengers_json),
    flights,
  });
});

/** POST /api/orders/:id/pay */
ordersRouter.post('/:id/pay', (req, res) => {
  const { paymentMethod = 'wechat' } = req.body;
  const o = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!o) return res.status(404).json({ error: '订单不存在' });
  if (o.status !== 'pending') {
    return res.status(400).json({ error: '订单状态不可支付' });
  }
  db.prepare(
    `UPDATE orders SET status = 'paid', payment_method = ?, paid_at = datetime('now') WHERE id = ?`
  ).run(paymentMethod, o.id);
  res.json({ ok: true, status: 'paid' });
});

/** POST /api/orders/:id/cancel */
ordersRouter.post('/:id/cancel', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!o) return res.status(404).json({ error: '订单不存在' });
  if (o.status !== 'pending') {
    return res.status(400).json({ error: '仅待支付订单可取消' });
  }
  const ids = JSON.parse(o.flight_ids_json);
  const passengers = JSON.parse(o.passengers_json);
  const n = passengers.length;
  const tx = db.transaction(() => {
    for (const fid of ids) {
      db.prepare('UPDATE flights SET stock = stock + ? WHERE id = ?').run(n, fid);
    }
    db.prepare(`UPDATE orders SET status = 'cancelled' WHERE id = ?`).run(o.id);
  });
  tx();
  res.json({ ok: true, status: 'cancelled' });
});
