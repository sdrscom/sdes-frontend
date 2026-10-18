import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, uploadToBlob, deleteFromBlob } from '../upload.js';

const router = Router();

function toPublicShape(row) {
  return {
    id: row.id,
    documentId: row.document_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    author: row.author,
    image: row.image_url ? { url: row.image_url } : null,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  };
}

function toAdminShape(row) {
  return { ...toPublicShape(row), locale: row.locale };
}

// ---- Public (Strapi-shaped) ----
router.get('/api/news-collections', async (req, res) => {
  const locale = req.query.locale || 'en';
  const result = await db.execute({
    sql: 'SELECT * FROM news WHERE locale = ? ORDER BY published_at DESC',
    args: [locale],
  });
  res.json({ data: result.rows.map(toPublicShape) });
});

// ---- Admin ----
router.get('/admin/api/news', requireAuth, async (req, res) => {
  const result = await db.execute('SELECT * FROM news ORDER BY published_at DESC');
  res.json({ data: result.rows.map(toAdminShape) });
});

router.post('/admin/api/news', requireAuth, upload.single('image'), async (req, res) => {
  const { title, slug, content, author, locale, publishedAt } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const imageUrl = await uploadToBlob(req.file, 'news');
  const documentId = crypto.randomUUID();

  await db.execute({
    sql: `INSERT INTO news (document_id, locale, title, slug, content, author, image_url, published_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      documentId,
      locale || 'en',
      title,
      slug || null,
      content || null,
      author || null,
      imageUrl,
      publishedAt || new Date().toISOString(),
    ],
  });

  res.status(201).json({ ok: true, documentId });
});

router.put('/admin/api/news/:id', requireAuth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, slug, content, author, locale, publishedAt } = req.body;

  const existing = await db.execute({ sql: 'SELECT * FROM news WHERE id = ?', args: [id] });
  const row = existing.rows[0];
  if (!row) return res.status(404).json({ error: 'Not found' });

  let imageUrl = row.image_url;
  if (req.file) {
    await deleteFromBlob(row.image_url);
    imageUrl = await uploadToBlob(req.file, 'news');
  }

  await db.execute({
    sql: `UPDATE news SET title = ?, slug = ?, content = ?, author = ?, locale = ?, published_at = ?, image_url = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      title ?? row.title,
      slug ?? row.slug,
      content ?? row.content,
      author ?? row.author,
      locale ?? row.locale,
      publishedAt ?? row.published_at,
      imageUrl,
      id,
    ],
  });

  res.json({ ok: true });
});

router.delete('/admin/api/news/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const existing = await db.execute({ sql: 'SELECT image_url FROM news WHERE id = ?', args: [id] });
  const row = existing.rows[0];
  if (row) await deleteFromBlob(row.image_url);

  await db.execute({ sql: 'DELETE FROM news WHERE id = ?', args: [id] });
  res.json({ ok: true });
});

export default router;
