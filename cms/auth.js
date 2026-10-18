import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const COOKIE_NAME = 'sdes_cms_session';

export async function seedAdminUser() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  const existing = await db.execute({
    sql: 'SELECT id FROM admin_users WHERE username = ?',
    args: [username],
  });
  if (existing.rows.length > 0) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await db.execute({
    sql: 'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
    args: [username, passwordHash],
  });
  console.log(`[cms] Seeded admin user "${username}"`);
}

export async function verifyLogin(username, password) {
  const result = await db.execute({
    sql: 'SELECT id, username, password_hash FROM admin_users WHERE username = ?',
    args: [username],
  });
  const user = result.rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return { id: user.id, username: user.username };
}

export function issueSessionCookie(res, user) {
  const token = jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function getSessionUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
