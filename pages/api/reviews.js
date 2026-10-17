// pages/api/reviews.js — Product reviews API
import { getRedis, getAllOrders } from '../../lib/redis';

const ADMIN_KEY = process.env.ADMIN_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY || '';

function maskName(name) {
  if (!name) return 'Cust**';
  const clean = name.trim();
  if (clean.length <= 4) return clean + '**';
  return clean.slice(0, 4) + '**';
}

function reviewsKey(productId) {
  return `zelux:reviews:${productId}`;
}

export default async function handler(req, res) {
  // productId can come from query string (GET) or request body (POST/DELETE)
  const productId = req.query.productId || (req.body && req.body.productId);
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const redis = getRedis();

  // GET — return reviews for this product
  if (req.method === 'GET') {
    try {
      const data = await redis.get(reviewsKey(productId));
      const reviews = data ? JSON.parse(data) : [];
      return res.json(reviews);
    } catch (err) {
      return res.json([]);
    }
  }

  // POST — add a review
  if (req.method === 'POST') {
    const { name, rating, comment, orderId, adminKey } = req.body || {};

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const isAdmin = adminKey && adminKey === ADMIN_KEY;
    let verified = false;

    // Non-admin customers must have a delivered order
    if (!isAdmin) {
      if (!orderId) {
        return res.status(403).json({ error: 'Order ID required to leave a review' });
      }
      try {
        const orders = await getAllOrders();
        const order = orders.find(o => o.id === orderId || o.stripeSessionId === orderId);
        if (!order) {
          return res.status(403).json({ error: 'Order not found' });
        }
        // Check if latest status is Delivered
        const latestStatus = order.statusHistory
          ? order.statusHistory[order.statusHistory.length - 1]?.status
          : order.status;
        if (!latestStatus || latestStatus.toLowerCase() !== 'delivered') {
          return res.status(403).json({ error: 'Order must be delivered before leaving a review' });
        }
        verified = true;
      } catch (err) {
        return res.status(500).json({ error: 'Failed to verify order' });
      }
    }

    const stars = Math.min(5, Math.max(1, parseInt(rating) || 5));
    const reviewerName = isAdmin ? (name || 'Customer') : maskName(name);

    const review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: reviewerName,
      rating: stars,
      comment: comment.trim().slice(0, 500),
      verified,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      createdAt: new Date().toISOString(),
    };

    try {
      const data = await redis.get(reviewsKey(productId));
      const reviews = data ? JSON.parse(data) : [];
      reviews.unshift(review);
      await redis.set(reviewsKey(productId), JSON.stringify(reviews));
      return res.json({ success: true, review });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save review' });
    }
  }

  // DELETE — admin only
  if (req.method === 'DELETE') {
    const { reviewId, adminKey } = req.body || {};
    if (!adminKey || adminKey !== ADMIN_KEY) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (!reviewId) {
      return res.status(400).json({ error: 'reviewId required' });
    }
    try {
      const data = await redis.get(reviewsKey(productId));
      const reviews = data ? JSON.parse(data) : [];
      const filtered = reviews.filter(r => r.id !== reviewId);
      await redis.set(reviewsKey(productId), JSON.stringify(filtered));
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete review' });
    }
  }

  return res.status(405).end();
}
