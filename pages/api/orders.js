import { getAllOrders } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error('orders fetch error', err);
    res.json([]);
  }
}
