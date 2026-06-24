import { getOrdersForCustomer } from '../../lib/redis';

// Customer-facing only - the admin panel is a separate Next.js project with
// its own API route and its own Redis client, so this route never needs to
// serve the "all orders" case. Requires an email and only ever returns that
// customer's own orders, fixing a real gap in the previous version where
// every signed-in user's browser received every other customer's name,
// address, and email, then filtered client-side after the fact.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'An email is required to look up orders.' });
    }
    const orders = await getOrdersForCustomer(email);
    res.json(orders);
  } catch (err) {
    console.error('orders fetch error', err);
    res.json([]);
  }
}
