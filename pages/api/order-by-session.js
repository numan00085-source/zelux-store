import { getOrderBySessionId } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id is required.' });
  try {
    const order = await getOrderBySessionId(session_id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json({
      trackingNumber: order.trackingNumber,
      customerEmail: order.customerEmail,
      countryCode: order.countryCode || '',
      total: order.total,
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error('order-by-session error', err);
    res.status(500).json({ error: err.message });
  }
}
