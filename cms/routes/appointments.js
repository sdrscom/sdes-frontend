import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { get } from '@vercel/blob';
import { Readable } from 'node:stream';
import { db } from '../db.js';
import { requireRole, requireAuth } from '../auth.js';
import { uploadToBlob, deleteFromBlob } from '../upload.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const canManage = requireRole('admin', 'appointments');

export const STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
const ID_TYPES = ['national_id', 'iqama', 'passport'];
const DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
// Vercel rejects request bodies over ~4.5 MB, so two documents must fit in that.
const MAX_DOC_BYTES = 2 * 1024 * 1024;

const FILE_FIELDS = {
  idDocument: 'id_document_url',
  vehicleRegistration: 'vehicle_registration_url',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOC_BYTES, files: 2, fields: 30 },
  fileFilter: (req, file, cb) => cb(null, DOC_TYPES.includes(file.mimetype)),
}).fields(Object.keys(FILE_FIELDS).map((name) => ({ name, maxCount: 1 })));

// Best-effort limits per IP (per server instance) over 10 minutes: 30 attempts,
// so a visitor fixing typos isn't locked out, and 5 accepted bookings.
const WINDOW_MS = 10 * 60 * 1000;
const attemptsByIp = new Map();
const bookingsByIp = new Map();
function recent(map, ip, record) {
  const now = Date.now();
  const hits = (map.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (record) hits.push(now);
  map.set(ip, hits);
  return hits.length;
}
const rateLimited = (ip) => recent(attemptsByIp, ip, true) > 30 || recent(bookingsByIp, ip, false) >= 5;

const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

function todayInRiyadh() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(new Date());
}

// Returns an error message, or null when the booking is valid.
function validate(b, files) {
  if (!b.fullName) return 'Full name is required';
  if (!b.companyName) return 'Company name is required';
  if (!ID_TYPES.includes(b.idType)) return 'ID type is required';
  if (!b.idNumber) return 'ID number is required';
  if (b.idType !== 'passport' && !/^[12]\d{9}$/.test(b.idNumber)) {
    return 'National ID / Iqama number must be 10 digits starting with 1 or 2';
  }
  if (b.idType === 'passport' && !/^[A-Z0-9]{5,20}$/i.test(b.idNumber)) return 'Passport number is not valid';
  if (!/^\+?[\d\s-]{8,20}$/.test(b.phone)) return 'A valid mobile number is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return 'A valid email address is required';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.visitDate) || Number.isNaN(Date.parse(b.visitDate))) {
    return 'Date of visit is required';
  }
  if (b.visitDate < todayInRiyadh()) return 'Date of visit cannot be in the past';
  if (!b.vehiclePlate) return 'Vehicle plate number is required';
  if (!b.consent) return 'Please confirm the information is accurate';
  if (!files.idDocument) return 'A copy of your ID is required (PDF, JPG or PNG, max 2 MB)';
  if (!files.vehicleRegistration) return 'The vehicle registration is required (PDF, JPG or PNG, max 2 MB)';
  return null;
}

async function newReference() {
  const date = todayInRiyadh().replace(/-/g, '').slice(2);
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < 5; i++) {
    const code = Array.from(crypto.randomBytes(4), (n) => alphabet[n % alphabet.length]).join('');
    const reference = `APT-${date}-${code}`;
    const taken = await db.execute({ sql: 'SELECT 1 FROM appointments WHERE reference = ?', args: [reference] });
    if (!taken.rows.length) return reference;
  }
  throw new Error('Could not generate a booking reference');
}

// ---- Public ----
router.post('/api/appointments', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      const tooBig = err.code === 'LIMIT_FILE_SIZE';
      return res.status(400).json({ error: tooBig ? 'Each document must be 2 MB or smaller' : 'Invalid upload' });
    }
    handleBooking(req, res).catch(next);
  });
});

async function handleBooking(req, res) {
  const body = req.body || {};
  // Honeypot: a hidden field real visitors never fill in.
  if (body.website) return res.status(201).json({ data: { reference: 'APT-RECEIVED' } });
  if (rateLimited(req.ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' });
  }

  const b = {
    fullName: clean(body.fullName, 120),
    companyName: clean(body.companyName, 160),
    idType: clean(body.idType, 20),
    idNumber: clean(body.idNumber, 20).replace(/\s/g, '').toUpperCase(),
    phone: clean(body.phone, 20),
    email: clean(body.email, 160).toLowerCase(),
    visitDate: clean(body.visitDate, 10),
    visitTime: clean(body.visitTime, 60),
    purpose: clean(body.purpose, 120),
    vehiclePlate: clean(body.vehiclePlate, 30).toUpperCase(),
    notes: clean(body.notes, 1000),
    locale: body.locale === 'ar' ? 'ar' : 'en',
    consent: body.consent === 'true' || body.consent === 'on',
  };
  const files = {
    idDocument: req.files?.idDocument?.[0],
    vehicleRegistration: req.files?.vehicleRegistration?.[0],
  };

  const error = validate(b, files);
  if (error) return res.status(400).json({ error });

  const reference = await newReference();
  const [idDocumentUrl, vehicleRegistrationUrl] = await Promise.all([
    uploadToBlob(files.idDocument, 'appointments'),
    uploadToBlob(files.vehicleRegistration, 'appointments'),
  ]);

  await db.execute({
    sql: `INSERT INTO appointments
          (reference, full_name, company_name, id_type, id_number, phone, email, visit_date, visit_time,
           purpose, vehicle_plate, id_document_url, vehicle_registration_url, notes, locale)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      reference, b.fullName, b.companyName, b.idType, b.idNumber, b.phone, b.email, b.visitDate,
      b.visitTime || null, b.purpose || null, b.vehiclePlate, idDocumentUrl, vehicleRegistrationUrl,
      b.notes || null, b.locale,
    ],
  });

  recent(bookingsByIp, req.ip, true);
  res.status(201).json({ data: { reference, visitDate: b.visitDate } });
}

// ---- Admin ----
router.get(
  '/admin/api/appointments',
  canManage,
  wrap(async (req, res) => {
    const result = await db.execute('SELECT * FROM appointments ORDER BY id DESC');
    res.json({ data: result.rows, statuses: STATUSES });
  })
);

// Streams a booking's document to signed-in staff only (never via public /media).
router.get(
  '/admin/api/appointments/:id/files/:kind',
  canManage,
  wrap(async (req, res) => {
    const column = { id: 'id_document_url', vehicle: 'vehicle_registration_url' }[req.params.kind];
    if (!column) return res.status(404).end();
    const row = (await db.execute({ sql: `SELECT ${column} AS url FROM appointments WHERE id = ?`, args: [req.params.id] })).rows[0];
    if (!row?.url) return res.status(404).end();

    const result = await get(row.url.replace(/^\/media\//, ''), {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!result || result.statusCode !== 200) return res.status(404).end();
    res.setHeader('Content-Type', result.blob.contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store');
    Readable.fromWeb(result.stream).pipe(res);
  })
);

router.put(
  '/admin/api/appointments/:id',
  canManage,
  wrap(async (req, res) => {
    const existing = (await db.execute({ sql: 'SELECT status FROM appointments WHERE id = ?', args: [req.params.id] })).rows[0];
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });

    const { status, adminNotes } = req.body || {};
    if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ error: 'Unknown status' });
    const statusChanged = status !== undefined && status !== existing.status;

    await db.execute({
      sql: `UPDATE appointments SET
              status = COALESCE(?, status),
              admin_notes = COALESCE(?, admin_notes),
              reviewed_by = CASE WHEN ? THEN ? ELSE reviewed_by END,
              reviewed_at = CASE WHEN ? THEN datetime('now') ELSE reviewed_at END,
              updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        status ?? null,
        adminNotes === undefined ? null : clean(adminNotes, 2000),
        statusChanged ? 1 : 0, req.user.username,
        statusChanged ? 1 : 0,
        req.params.id,
      ],
    });
    res.json({ ok: true });
  })
);

// Deleting removes personal data and documents permanently: administrators only.
router.delete(
  '/admin/api/appointments/:id',
  requireAuth,
  wrap(async (req, res) => {
    const row = (await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [req.params.id] })).rows[0];
    if (!row) return res.status(404).json({ error: 'Appointment not found' });
    await Promise.all(Object.values(FILE_FIELDS).map((col) => deleteFromBlob(row[col])));
    await db.execute({ sql: 'DELETE FROM appointments WHERE id = ?', args: [req.params.id] });
    res.json({ ok: true });
  })
);

export default router;
