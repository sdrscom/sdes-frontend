import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const COOKIE_NAME = 'sdes_cms_session';

// 'admin' manages everything; 'appointments' only sees site-visit bookings.
export const ROLES = {
  admin: 'Administrator',
  appointments: 'Appointments officer',
};

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
    sql: 'SELECT id, username, password_hash, role FROM admin_users WHERE username = ?',
    args: [username],
  });
  const user = result.rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return { id: user.id, username: user.username, role: user.role };
}

// The role is read from the database on every request (not trusted from the
// cookie), so a role change or removed user takes effect immediately.
async function loadSessionUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
  const result = await db.execute({
    sql: 'SELECT id, username, role FROM admin_users WHERE id = ?',
    args: [payload.sub],
  });
  const row = result.rows[0];
  return row ? { sub: row.id, id: row.id, username: row.username, role: row.role } : null;
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

// Allows signed-in users whose role is one of `roles`.
export function requireRole(...roles) {
  return (req, res, next) => {
    loadSessionUser(req)
      .then((user) => {
        if (!user) return res.status(401).json({ error: 'Not authenticated' });
        if (!roles.includes(user.role)) {
          return res.status(403).json({ error: "Your account doesn't have access to this section" });
        }
        req.user = user;
        next();
      })
      .catch(next);
  };
}

// Default guard for admin routes: administrators only.
export const requireAuth = requireRole('admin');

export function getSessionUser(req) {
  return loadSessionUser(req);
}
