import { upsertUser, checkRateLimit } from '../../lib/redis';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  if (req.headers['x-real-ip']) return req.headers['x-real-ip'];
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const ip = getClientIp(req);
  try {
    const rateCheck = await checkRateLimit(ip, 'register-user', 10);
    if (rateCheck.blocked) return res.status(403).json({ error: 'Access denied.' });
    if (!rateCheck.allowed) return res.status(429).json({ error: 'Too many requests. Please slow down.' });

    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const user = await upsertUser(email, name);
    res.json({ success: true, user });
  } catch (err) {
    console.error('register-user error', err);
    res.status(500).json({ error: err.message });
  }
}
