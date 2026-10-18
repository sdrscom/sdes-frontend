import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, uploadToBlob, deleteFromBlob } from '../upload.js';

const router = Router();

function toPublicShape(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    caption: row.caption,
    image: row.image_url ? { url: row.image_url } : null,
  };
}

// ---- Public (Strapi-shaped) ----
router.get('/api/gallery-items', async (req, res) => {
  const result = await db.execute('SELECT * FROM gallery_items ORDER BY created_at DESC');
  res.json({ data: result.rows.map(toPublicShape) });
});

// ---- Admin ----
router.get('/admin/api/gallery', requireAuth, async (req, res) => {
  const result = await db.execute('SELECT * FROM gallery_items ORDER BY created_at DESC');
  res.json({ data: result.rows.map(toPublicShape) });
});

router.post('/admin/api/gallery', requireAuth, upload.single('image'), async (req, res) => {
  const { title, category, caption } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (!req.file) return res.status(400).json({ error: 'image is required' });

  const imageUrl = await uploadToBlob(req.file, 'gallery');

  await db.execute({
    sql: `INSERT INTO gallery_items (title, category, caption, image_url, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'))`,
    args: [title, category || null, caption || null, imageUrl],
  });

  res.status(201).json({ ok: true });
});

router.put('/admin/api/gallery/:id', requireAuth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, category, caption } = req.body;

  const existing = await db.execute({ sql: 'SELECT * FROM gallery_items WHERE id = ?', args: [id] });
  const row = existing.rows[0];
  if (!row) return res.status(404).json({ error: 'Not found' });

  let imageUrl = row.image_url;
  if (req.file) {
    await deleteFromBlob(row.image_url);
    imageUrl = await uploadToBlob(req.file, 'gallery');
  }

  await db.execute({
    sql: `UPDATE gallery_items SET title = ?, category = ?, caption = ?, image_url = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [title ?? row.title, category ?? row.category, caption ?? row.caption, imageUrl, id],
  });

  res.json({ ok: true });
});

router.delete('/admin/api/gallery/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const existing = await db.execute({ sql: 'SELECT image_url FROM gallery_items WHERE id = ?', args: [id] });
  const row = existing.rows[0];
  if (row) await deleteFromBlob(row.image_url);

  await db.execute({ sql: 'DELETE FROM gallery_items WHERE id = ?', args: [id] });
  res.json({ ok: true });
});

export default router;
