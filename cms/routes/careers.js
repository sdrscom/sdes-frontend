import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, uploadToBlob, deleteFromBlob } from '../upload.js';

const router = Router();

function toPublicShape(row) {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    location_type: row.location_type,
    country_city: row.country_city,
    job_type: row.job_type,
    experience_level: row.experience_level,
    salary_range: row.salary_range,
    description: row.description,
    requirements: row.requirements,
    is_featured: row.is_featured,
    publishedAt: row.published_at,
  };
}

// ---- Public (Strapi-shaped) ----
router.get('/api/job-postings', async (req, res) => {
  const locale = req.query.locale || 'en';
  const result = await db.execute({
    sql: 'SELECT * FROM job_postings WHERE locale = ? ORDER BY published_at DESC',
    args: [locale],
  });
  res.json({ data: result.rows.map(toPublicShape) });
});

router.post('/api/job-applications', upload.single('files.resume'), async (req, res) => {
  try {
    const raw = req.body.data;
    if (!raw) return res.status(400).json({ error: 'data is required' });
    const payload = JSON.parse(raw);

    const resumeUrl = await uploadToBlob(req.file, 'resumes');

    await db.execute({
      sql: `INSERT INTO job_applications
            (job_posting_id, first_name, last_name, email, phone, portfolio_url, cover_note, resume_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        payload.job_posting || null,
        payload.first_name || null,
        payload.last_name || null,
        payload.email || null,
        payload.phone || null,
        payload.portfolio_url || null,
        payload.cover_note || null,
        resumeUrl,
      ],
    });

    res.status(201).json({ data: { ok: true } });
  } catch (err) {
    console.error('[cms] job application submit failed:', err);
    res.status(400).json({ error: 'Invalid submission' });
  }
});

// ---- Admin: job postings ----
router.get('/admin/api/jobs', requireAuth, async (req, res) => {
  const result = await db.execute('SELECT * FROM job_postings ORDER BY published_at DESC');
  res.json({ data: result.rows.map(toPublicShape) });
});

router.post('/admin/api/jobs', requireAuth, async (req, res) => {
  const {
    title, department, locationType, countryCity, jobType, experienceLevel,
    salaryRange, description, requirements, isFeatured, locale, publishedAt,
  } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  await db.execute({
    sql: `INSERT INTO job_postings
          (locale, title, department, location_type, country_city, job_type, experience_level,
           salary_range, description, requirements, is_featured, published_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      locale || 'en', title, department || null, locationType || null, countryCity || null,
      jobType || null, experienceLevel || null, salaryRange || null, description || null,
      requirements || null, isFeatured ? 1 : 0, publishedAt || new Date().toISOString(),
    ],
  });

  res.status(201).json({ ok: true });
});

router.put('/admin/api/jobs/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const existing = await db.execute({ sql: 'SELECT * FROM job_postings WHERE id = ?', args: [id] });
  const row = existing.rows[0];
  if (!row) return res.status(404).json({ error: 'Not found' });

  const {
    title, department, locationType, countryCity, jobType, experienceLevel,
    salaryRange, description, requirements, isFeatured, locale, publishedAt,
  } = req.body;

  await db.execute({
    sql: `UPDATE job_postings SET
            title = ?, department = ?, location_type = ?, country_city = ?, job_type = ?,
            experience_level = ?, salary_range = ?, description = ?, requirements = ?,
            is_featured = ?, locale = ?, published_at = ?, updated_at = datetime('now')
          WHERE id = ?`,
    args: [
      title ?? row.title,
      department ?? row.department,
      locationType ?? row.location_type,
      countryCity ?? row.country_city,
      jobType ?? row.job_type,
      experienceLevel ?? row.experience_level,
      salaryRange ?? row.salary_range,
      description ?? row.description,
      requirements ?? row.requirements,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : row.is_featured,
      locale ?? row.locale,
      publishedAt ?? row.published_at,
      id,
    ],
  });

  res.json({ ok: true });
});

router.delete('/admin/api/jobs/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  await db.execute({ sql: 'DELETE FROM job_postings WHERE id = ?', args: [id] });
  res.json({ ok: true });
});

// ---- Admin: applications (read-only + delete) ----
router.get('/admin/api/applications', requireAuth, async (req, res) => {
  const result = await db.execute(`
    SELECT ja.*, jp.title AS job_title
    FROM job_applications ja
    LEFT JOIN job_postings jp ON jp.id = ja.job_posting_id
    ORDER BY ja.created_at DESC
  `);
  res.json({ data: result.rows });
});

router.delete('/admin/api/applications/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const existing = await db.execute({ sql: 'SELECT resume_url FROM job_applications WHERE id = ?', args: [id] });
  const row = existing.rows[0];
  if (row) await deleteFromBlob(row.resume_url);

  await db.execute({ sql: 'DELETE FROM job_applications WHERE id = ?', args: [id] });
  res.json({ ok: true });
});

export default router;
