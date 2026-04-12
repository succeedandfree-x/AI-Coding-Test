import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { requireUserId } from '../middleware.js';

export const usersRouter = Router();

/** POST /api/users/register 注册 */
usersRouter.post('/register', (req, res) => {
  const { phone, nickname } = req.body;
  if (!phone) return res.status(400).json({ error: '请填写手机号' });
  const exists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (exists) {
    return res.status(400).json({ error: '手机号已注册' });
  }
  const id = uuidv4();
  db.prepare(
    `INSERT INTO users (id, phone, nickname, preferences_json) VALUES (?, ?, ?, '{}')`
  ).run(id, phone, nickname || '旅行者');
  res.status(201).json({ id, phone, nickname: nickname || '旅行者' });
});

/** POST /api/users/login 简单登录（演示：手机号即登录） */
usersRouter.post('/login', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: '请填写手机号' });
  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user) {
    const id = uuidv4();
    db.prepare(`INSERT INTO users (id, phone, nickname) VALUES (?, ?, ?)`).run(id, phone, '新用户');
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  res.json({
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
    preferences: JSON.parse(user.preferences_json || '{}'),
  });
});

/** GET /api/users/me */
usersRouter.get('/me', requireUserId, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({
    id: user.id,
    phone: user.phone,
    nickname: user.nickname,
    avatar_url: user.avatar_url,
    preferences: JSON.parse(user.preferences_json || '{}'),
  });
});

/** PUT /api/users/preferences */
usersRouter.put('/preferences', requireUserId, (req, res) => {
  const prefs = req.body;
  if (typeof prefs !== 'object' || prefs === null) {
    return res.status(400).json({ error: '偏好格式无效' });
  }
  db.prepare('UPDATE users SET preferences_json = ? WHERE id = ?').run(JSON.stringify(prefs), req.userId);
  res.json({ ok: true, preferences: prefs });
});
