import { getOrderByTrackingNumber } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { tracking } = req.query;
  if (!tracking) return res.status(400).json({ error: 'Tracking number required.' });

  try {
    const order = await getOrderByTrackingNumber(tracking.trim().toUpperCase());
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    // Only return what's needed for the receipt - no sensitive data beyond what customer already knows
    res.json({
      trackingNumber: order.trackingNumber,
      productName: order.productName,
      itemsSummary: order.itemsSummary,
      total: order.total,
      status: order.status,
      address: order.address,
      customerEmail: order.customerEmail,
      createdAt: order.createdAt,
      isDigitalOrder: order.isDigitalOrder,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
