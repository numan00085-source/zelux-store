import { recordVisit } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await recordVisit();
    res.json({ success: true });
  } catch (err) {
    console.error('record pageview error', err);
    // Fail soft - a missed pageview count is not worth surfacing an error to
    // the visitor or blocking anything else on the page.
    res.json({ success: false });
  }
}
