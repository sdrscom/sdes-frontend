import { Router } from 'express';
import { verifyLogin, issueSessionCookie, clearSessionCookie, getSessionUser } from '../auth.js';

const router = Router();

router.post('/admin/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' });

  const user = await verifyLogin(username, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  issueSessionCookie(res, user);
  res.json({ ok: true, user });
});

router.post('/admin/api/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/admin/api/me', async (req, res, next) => {
  try {
    const user = await getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
