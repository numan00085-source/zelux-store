// Offers API — stores promotional banners / discount codes in Redis.
// GET: public (storefront reads this to show the active offer banner).
// POST / DELETE: admin-only (requires x-admin-secret header).
import { getRedis } from '../../lib/redis';

const OFFERS_KEY = 'zelux:offers';

function isAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.headers['x-admin-secret'] === secret;
}

async function getOffers() {
  const redis = getRedis();
  const data = await redis.get(OFFERS_KEY);
  return data ? JSON.parse(data) : [];
}

async function saveOffers(offers) {
  const redis = getRedis();
  await redis.set(OFFERS_KEY, JSON.stringify(offers));
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const offers = await getOffers();
      return res.status(200).json(offers);
    }

    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // POST: create a new offer
    if (req.method === 'POST') {
      const offers = await getOffers();
      const offer = {
        id: `offer-${Date.now()}`,
        label: req.body.label || '',       // e.g. "🔥 SUMMER SALE"
        message: req.body.message || '',   // e.g. "Get 20% off all footwear"
        code: req.body.code || '',         // e.g. "SUMMER20" (optional)
        discount: req.body.discount || '', // e.g. "20%" (display only for now)
        color: req.body.color || 'cyan',   // 'cyan' | 'gold' | 'red' | 'green'
        active: true,
        createdAt: new Date().toISOString(),
        expiresAt: req.body.expiresAt || null,
      };
      offers.unshift(offer);
      await saveOffers(offers);
      return res.status(201).json(offer);
    }

    // PATCH: toggle active / update
    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body;
      const offers = await getOffers();
      const idx = offers.findIndex(o => o.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      offers[idx] = { ...offers[idx], ...updates };
      await saveOffers(offers);
      return res.status(200).json(offers[idx]);
    }

    // DELETE: remove offer
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const offers = await getOffers();
      await saveOffers(offers.filter(o => o.id !== id));
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error('offers error', err);
    return res.status(500).json({ error: err.message });
  }
}
