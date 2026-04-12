import { Router } from 'express';
import { db } from '../db.js';
import { requireUserId } from '../middleware.js';

export const couponsRouter = Router();

/** GET /api/coupons/mine 我的优惠券 */
couponsRouter.get('/mine', requireUserId, (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, uc.used FROM user_coupons uc
       JOIN coupons c ON c.id = uc.coupon_id
       WHERE uc.user_id = ?`
    )
    .all(req.userId);
  res.json({
    list: rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      discountType: r.discount_type,
      discountValue: r.discount_value,
      minAmount: r.min_amount,
      validFrom: r.valid_from,
      validTo: r.valid_to,
      used: Boolean(r.used),
    })),
  });
});
