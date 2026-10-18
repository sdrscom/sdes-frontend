import multer from 'multer';
import { put, del } from '@vercel/blob';
import crypto from 'crypto';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// The Blob store is private-only, so uploads use access:'private' and are
// served back through our own /media proxy (see routes/media.js) rather than
// a direct public blob URL.
export async function uploadToBlob(file, folder) {
  if (!file) return null;
  const ext = file.originalname.includes('.') ? file.originalname.split('.').pop() : 'bin';
  const pathname = `${folder}/${crypto.randomUUID()}.${ext}`;
  await put(pathname, file.buffer, {
    access: 'private',
    contentType: file.mimetype,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return `/media/${pathname}`;
}

export async function deleteFromBlob(mediaPath) {
  if (!mediaPath) return;
  const pathname = mediaPath.replace(/^\/media\//, '');
  try {
    await del(pathname, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (err) {
    console.error('[cms] Failed to delete blob:', err.message);
  }
}
