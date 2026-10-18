// Copies the site's built-in text (src/locales/translations.ts) into
// content/defaults.json so the CMS can show defaults and "reset to default".
// Re-run after changing translations.ts:  npm run sync-defaults
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(__dirname, '../../src/locales/translations.ts');
const target = path.resolve(__dirname, '../content/defaults.json');

// Node 22.18+/23.6+ strips TypeScript types natively.
const { translations } = await import(pathToFileURL(source).href);

writeFileSync(target, JSON.stringify({ en: translations.en, ar: translations.ar }, null, 2) + '\n');
console.log(`[cms] Wrote ${path.relative(process.cwd(), target)}`);
