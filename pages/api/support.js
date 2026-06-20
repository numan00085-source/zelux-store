import { getSupportConversation, addSupportMessage, markSupportConversationRead, checkRateLimit } from '../../lib/redis';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  if (req.headers['x-real-ip']) return req.headers['x-real-ip'];
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { email } = req.query;
      if (!email) return res.status(400).json({ error: 'Email is required.' });
      const convo = await getSupportConversation(email);
      return res.json(convo);
    }

    if (req.method === 'POST') {
      const ip = getClientIp(req);
      const rateCheck = await checkRateLimit(ip, 'support-message', 20);
      if (rateCheck.blocked) return res.status(403).json({ error: 'Access denied.' });
      if (!rateCheck.allowed) return res.status(429).json({ error: 'Too many messages. Please slow down.' });

      const { email, text, imageUrl } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required.' });
      if (!text && !imageUrl) return res.status(400).json({ error: 'Message cannot be empty.' });

      const convo = await addSupportMessage(email, { sender: 'customer', text, imageUrl });
      return res.json(convo);
    }

    if (req.method === 'PATCH') {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required.' });
      const convo = await markSupportConversationRead(email, 'customer');
      return res.json(convo);
    }

    res.status(405).end();
  } catch (err) {
    console.error('support API error', err);
    res.status(500).json({ error: err.message });
  }
}
