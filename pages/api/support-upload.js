import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const filename = req.headers['x-filename'] || `upload-${Date.now()}.jpg`;
    const contentType = req.headers['content-type'] || 'image/jpeg';
    const fileBuffer = await buffer(req);

    if (fileBuffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 8MB.' });
    }

    const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!rawToken) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment variables.' });
    }
    const token = rawToken.trim().replace(/[\r\n\t]/g, '');

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');

    const blob = await put(`support/${Date.now()}-${safeFilename || 'photo.jpg'}`, fileBuffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
      token,
    });

    res.json({ url: blob.url });
  } catch (err) {
    console.error('support upload error', err);
    res.status(500).json({ error: err.message });
  }
}
