import { upsertUser } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const user = await upsertUser(email, name);
    res.json({ success: true, user });
  } catch (err) {
    console.error('register-user error', err);
    res.status(500).json({ error: err.message });
  }
}
