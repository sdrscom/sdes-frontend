import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const MIN_PASSWORD = 8;

router.get(
  '/admin/api/users',
  requireAuth,
  wrap(async (req, res) => {
    const result = await db.execute('SELECT id, username, created_at FROM admin_users ORDER BY id');
    res.json({ data: result.rows, currentUserId: req.user.sub });
  })
);

router.post(
  '/admin/api/users',
  requireAuth,
  wrap(async (req, res) => {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username) return res.status(400).json({ error: 'Username is required' });
    if (password.length < MIN_PASSWORD) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters` });
    }

    const existing = await db.execute({ sql: 'SELECT id FROM admin_users WHERE username = ?', args: [username] });
    if (existing.rows.length) return res.status(409).json({ error: 'That username is already taken' });

    await db.execute({
      sql: 'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      args: [username, await bcrypt.hash(password, 10)],
    });
    res.status(201).json({ ok: true });
  })
);

router.put(
  '/admin/api/users/:id/password',
  requireAuth,
  wrap(async (req, res) => {
    const password = String(req.body?.password || '');
    if (password.length < MIN_PASSWORD) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD} characters` });
    }
    const result = await db.execute({
      sql: 'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      args: [await bcrypt.hash(password, 10), req.params.id],
    });
    if (!result.rowsAffected) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  })
);

router.delete(
  '/admin/api/users/:id',
  requireAuth,
  wrap(async (req, res) => {
    if (Number(req.params.id) === Number(req.user.sub)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const count = await db.execute('SELECT COUNT(*) AS n FROM admin_users');
    if (Number(count.rows[0].n) <= 1) return res.status(400).json({ error: 'At least one user must remain' });

    await db.execute({ sql: 'DELETE FROM admin_users WHERE id = ?', args: [req.params.id] });
    res.json({ ok: true });
  })
);

router.get(
  '/admin/api/stats',
  requireAuth,
  wrap(async (req, res) => {
    const count = async (sql) => Number((await db.execute(sql)).rows[0].n);
    const [news, gallery, jobs, applications, files, editedSections] = await Promise.all([
      count('SELECT COUNT(*) AS n FROM news'),
      count('SELECT COUNT(*) AS n FROM gallery_items'),
      count('SELECT COUNT(*) AS n FROM job_postings'),
      count('SELECT COUNT(*) AS n FROM job_applications'),
      count('SELECT COUNT(*) AS n FROM media_files'),
      count("SELECT COUNT(*) AS n FROM page_content WHERE locale <> 'all'"),
    ]);
    const recent = await db.execute(
      'SELECT page, note, created_by, created_at FROM page_revisions ORDER BY id DESC LIMIT 8'
    );
    res.json({ news, gallery, jobs, applications, files, editedSections, recentEdits: recent.rows });
  })
);

export default router;
