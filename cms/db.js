import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initSchema() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT UNIQUE NOT NULL,
      locale TEXT NOT NULL DEFAULT 'en',
      title TEXT NOT NULL,
      slug TEXT,
      content TEXT,
      author TEXT,
      image_url TEXT,
      published_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS gallery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      caption TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS job_postings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      locale TEXT NOT NULL DEFAULT 'en',
      title TEXT NOT NULL,
      department TEXT,
      location_type TEXT,
      country_city TEXT,
      job_type TEXT,
      experience_level TEXT,
      salary_range TEXT,
      description TEXT,
      requirements TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_posting_id INTEGER,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      portfolio_url TEXT,
      cover_note TEXT,
      resume_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // One row per edited page section and language ('all' for page media).
    // `data` is the full JSON of that section; missing rows mean "use default".
    `CREATE TABLE IF NOT EXISTS page_content (
      locale TEXT NOT NULL,
      section TEXT NOT NULL,
      data TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (locale, section)
    )`,
    `CREATE TABLE IF NOT EXISTS page_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      snapshot TEXT NOT NULL,
      note TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      filename TEXT,
      mime TEXT,
      size INTEGER,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Site visit bookings from the website. Documents are private blobs,
    // served only through the authenticated admin API.
    `CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      full_name TEXT NOT NULL,
      company_name TEXT NOT NULL,
      id_type TEXT NOT NULL,
      id_number TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      visit_time TEXT,
      purpose TEXT,
      vehicle_plate TEXT NOT NULL,
      id_document_url TEXT,
      vehicle_registration_url TEXT,
      notes TEXT,
      admin_notes TEXT,
      locale TEXT DEFAULT 'en',
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
  ]);

  // Columns added after the first release; SQLite has no ADD COLUMN IF NOT EXISTS.
  const userColumns = await db.execute('PRAGMA table_info(admin_users)');
  if (!userColumns.rows.some((c) => c.name === 'role')) {
    await db.execute("ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'");
  }
}
