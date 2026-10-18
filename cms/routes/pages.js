import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, uploadToBlob, deleteFromBlob } from '../upload.js';
import { PAGES, ITEM_TEMPLATES, findPage } from '../content/pages.js';
import defaults from '../content/defaults.json' with { type: 'json' };

const router = Router();
const LOCALES = ['en', 'ar'];
const MAX_REVISIONS = 30;

// Express 4 does not catch rejected promises from async handlers.
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const mediaSection = (slug) => `media.${slug}`;

// Main website address, for Preview links and default image thumbnails.
const frontendOrigin = () =>
  (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, '');

function parse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Current saved state of one page: { en: {section: data}, ar: {...}, media: {key: url} }
async function loadPageState(page) {
  const sectionKeys = page.sections.map((s) => s.key);
  const placeholders = sectionKeys.map(() => '?').join(',');
  const result = await db.execute({
    sql: `SELECT locale, section, data, updated_at, updated_by FROM page_content
          WHERE (locale IN ('en','ar') AND section IN (${placeholders}))
             OR (locale = 'all' AND section = ?)`,
    args: [...sectionKeys, mediaSection(page.slug)],
  });

  const state = { en: {}, ar: {}, media: {} };
  let lastUpdated = null;
  for (const row of result.rows) {
    const data = parse(row.data);
    if (data === null) continue;
    if (row.locale === 'all') state.media = data;
    else state[row.locale][row.section] = data;
    if (!lastUpdated || row.updated_at > lastUpdated.at) {
      lastUpdated = { at: row.updated_at, by: row.updated_by };
    }
  }
  return { state, lastUpdated };
}

async function writeSection(locale, section, data, username) {
  if (data === null) {
    await db.execute({ sql: 'DELETE FROM page_content WHERE locale = ? AND section = ?', args: [locale, section] });
    return;
  }
  await db.execute({
    sql: `INSERT INTO page_content (locale, section, data, updated_by, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT (locale, section) DO UPDATE SET
            data = excluded.data, updated_by = excluded.updated_by, updated_at = excluded.updated_at`,
    args: [locale, section, JSON.stringify(data), username],
  });
}

async function recordRevision(page, note, username) {
  const { state } = await loadPageState(page);
  await db.execute({
    sql: 'INSERT INTO page_revisions (page, snapshot, note, created_by) VALUES (?, ?, ?, ?)',
    args: [page.slug, JSON.stringify(state), note || null, username],
  });
  await db.execute({
    sql: `DELETE FROM page_revisions WHERE page = ? AND id NOT IN (
            SELECT id FROM page_revisions WHERE page = ? ORDER BY id DESC LIMIT ${MAX_REVISIONS})`,
    args: [page.slug, page.slug],
  });
}

// ---- Public ----
// Everything the site needs to override its built-in content, in one request.
router.get(
  '/api/site-content',
  wrap(async (req, res) => {
    const result = await db.execute('SELECT locale, section, data FROM page_content');
    const out = { en: {}, ar: {}, media: {} };
    for (const row of result.rows) {
      const data = parse(row.data);
      if (data === null) continue;
      if (row.locale === 'all') Object.assign(out.media, data);
      else if (LOCALES.includes(row.locale)) out[row.locale][row.section] = data;
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.json({ data: out });
  })
);

// ---- Admin ----
router.get(
  '/admin/api/pages',
  requireAuth,
  wrap(async (req, res) => {
    const pages = await Promise.all(
      PAGES.map(async (page) => {
        const { state, lastUpdated } = await loadPageState(page);
        const editedSections = new Set([...Object.keys(state.en), ...Object.keys(state.ar)]).size;
        return {
          slug: page.slug,
          title: page.title,
          path: page.path,
          sections: page.sections,
          mediaCount: (page.media || []).length,
          editedSections,
          editedMedia: Object.keys(state.media).length,
          lastUpdated,
        };
      })
    );
    res.json({ data: pages, frontendOrigin: frontendOrigin() });
  })
);

router.get(
  '/admin/api/pages/:slug',
  requireAuth,
  wrap(async (req, res) => {
    const page = findPage(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Unknown page' });

    const { state, lastUpdated } = await loadPageState(page);
    const pageDefaults = { en: {}, ar: {} };
    for (const locale of LOCALES) {
      for (const { key } of page.sections) pageDefaults[locale][key] = defaults[locale]?.[key] ?? {};
    }

    res.json({
      page,
      defaults: pageDefaults,
      saved: state,
      templates: ITEM_TEMPLATES,
      lastUpdated,
      frontendOrigin: frontendOrigin(),
    });
  })
);

// Body: { sections: { en: {key: data|null}, ar: {...} }, media: {key: url|null} | undefined, note }
// null resets that section / image to the site default.
router.put(
  '/admin/api/pages/:slug',
  requireAuth,
  wrap(async (req, res) => {
    const page = findPage(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Unknown page' });

    const { sections = {}, media, note } = req.body || {};
    const allowed = new Set(page.sections.map((s) => s.key));
    const username = req.user?.username || null;

    for (const locale of LOCALES) {
      for (const [key, data] of Object.entries(sections[locale] || {})) {
        if (!allowed.has(key)) return res.status(400).json({ error: `Section "${key}" is not on this page` });
        if (data !== null && (typeof data !== 'object' || Array.isArray(data))) {
          return res.status(400).json({ error: `Section "${key}" must be an object` });
        }
        await writeSection(locale, key, data, username);
      }
    }

    if (media && typeof media === 'object') {
      const slots = new Set((page.media || []).map((m) => m.key));
      const { state } = await loadPageState(page);
      const next = { ...state.media };
      for (const [key, url] of Object.entries(media)) {
        if (!slots.has(key)) return res.status(400).json({ error: `Unknown image slot "${key}"` });
        if (url) next[key] = String(url);
        else delete next[key];
      }
      await writeSection('all', mediaSection(page.slug), Object.keys(next).length ? next : null, username);
    }

    await recordRevision(page, note, username);
    res.json({ ok: true });
  })
);

router.get(
  '/admin/api/pages/:slug/revisions',
  requireAuth,
  wrap(async (req, res) => {
    const result = await db.execute({
      sql: 'SELECT id, note, created_by, created_at FROM page_revisions WHERE page = ? ORDER BY id DESC',
      args: [req.params.slug],
    });
    res.json({ data: result.rows });
  })
);

router.post(
  '/admin/api/pages/:slug/revisions/:id/restore',
  requireAuth,
  wrap(async (req, res) => {
    const page = findPage(req.params.slug);
    if (!page) return res.status(404).json({ error: 'Unknown page' });

    const result = await db.execute({
      sql: 'SELECT snapshot, created_at FROM page_revisions WHERE id = ? AND page = ?',
      args: [req.params.id, page.slug],
    });
    const snapshot = parse(result.rows[0]?.snapshot);
    if (!snapshot) return res.status(404).json({ error: 'Version not found' });

    const username = req.user?.username || null;
    for (const locale of LOCALES) {
      for (const { key } of page.sections) {
        await writeSection(locale, key, snapshot[locale]?.[key] ?? null, username);
      }
    }
    const media = snapshot.media || {};
    await writeSection('all', mediaSection(page.slug), Object.keys(media).length ? media : null, username);

    await recordRevision(page, `Restored version from ${result.rows[0].created_at}`, username);
    res.json({ ok: true });
  })
);

// ---- File library ----
router.get(
  '/admin/api/files',
  requireAuth,
  wrap(async (req, res) => {
    const result = await db.execute('SELECT * FROM media_files ORDER BY id DESC');
    res.json({ data: result.rows });
  })
);

router.post(
  '/admin/api/files',
  requireAuth,
  upload.single('file'),
  wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'file is required' });
    if (!/^(image|video)\//.test(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only images and videos can be uploaded' });
    }
    const url = await uploadToBlob(req.file, 'site');
    const result = await db.execute({
      sql: 'INSERT INTO media_files (url, filename, mime, size, created_by) VALUES (?, ?, ?, ?, ?) RETURNING *',
      args: [url, req.file.originalname, req.file.mimetype, req.file.size, req.user?.username || null],
    });
    res.status(201).json({ data: result.rows[0] });
  })
);

router.delete(
  '/admin/api/files/:id',
  requireAuth,
  wrap(async (req, res) => {
    const result = await db.execute({ sql: 'SELECT url FROM media_files WHERE id = ?', args: [req.params.id] });
    const row = result.rows[0];
    if (!row) return res.status(404).json({ error: 'Not found' });

    const inUse = await db.execute({
      sql: 'SELECT locale, section FROM page_content WHERE data LIKE ? LIMIT 1',
      args: [`%${row.url}%`],
    });
    if (inUse.rows.length && req.query.force !== '1') {
      return res.status(409).json({ error: 'This file is used on a page. Replace it there first.' });
    }

    await deleteFromBlob(row.url);
    await db.execute({ sql: 'DELETE FROM media_files WHERE id = ?', args: [req.params.id] });
    res.json({ ok: true });
  })
);

export default router;
