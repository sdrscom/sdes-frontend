import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { initSchema } from './db.js';
import { seedAdminUser } from './auth.js';
import authRoutes from './routes/auth.js';
import newsRoutes from './routes/news.js';
import galleryRoutes from './routes/gallery.js';
import careersRoutes from './routes/careers.js';
import mediaRoutes from './routes/media.js';
import pagesRoutes from './routes/pages.js';
import usersRoutes from './routes/users.js';
import appointmentsRoutes from './routes/appointments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 4000;
// Behind Vercel's proxy: use the visitor's IP (for rate limiting), not the proxy's.
app.set('trust proxy', true);

// FRONTEND_ORIGIN may list several sites, comma-separated
// (e.g. "https://example.com,https://www.example.com").
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Create tables and the first admin once per process (per cold start on Vercel).
let ready;
app.use((req, res, next) => {
  ready ||= initSchema().then(seedAdminUser);
  ready.then(() => next(), (err) => {
    ready = undefined;
    next(err);
  });
});
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'admin')));

app.use(authRoutes);
app.use(newsRoutes);
app.use(galleryRoutes);
app.use(careersRoutes);
app.use(mediaRoutes);
app.use(pagesRoutes);
app.use(usersRoutes);
app.use(appointmentsRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error('[cms] error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// On Vercel the app is exported as a serverless function; locally it listens.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[cms] SDES CMS running on http://localhost:${port}`);
    console.log(`[cms] Admin panel at http://localhost:${port}/`);
  });
}

export default app;
