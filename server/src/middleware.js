export function requireUserId(req, res, next) {
  const id = req.headers['x-user-id'] || req.query.userId;
  if (!id || typeof id !== 'string') {
    return res.status(401).json({ error: '缺少用户身份，请先登录或注册' });
  }
  req.userId = id;
  next();
}
