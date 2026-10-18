import { Router } from 'express';
import { get } from '@vercel/blob';
import { Readable } from 'node:stream';

const router = Router();

// Streams private blobs (news/gallery images, resumes) back to the browser
// so the site can use plain <img src> / <a href> without exposing a blob
// token. The pathname is always one we generated ourselves at upload time.
router.get('/media/*', async (req, res) => {
  const pathname = req.params[0];
  try {
    const result = await get(pathname, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    if (!result || result.statusCode !== 200) return res.status(404).end();

    res.setHeader('Content-Type', result.blob.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    Readable.fromWeb(result.stream).pipe(res);
  } catch (err) {
    console.error('[cms] media proxy error:', err.message);
    res.status(404).end();
  }
});

export default router;
