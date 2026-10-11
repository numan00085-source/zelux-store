// pages/api/reviews.js — GET all reviews for a product, POST new review
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function maskName(name) {
  if (!name) return 'Customer';
  const words = name.trim().split(/\s+/);
  // Show first 4 chars of first word, mask rest with **
  const first = words[0];
  const visible = first.slice(0, 4);
  const masked = first.length > 4 ? '**' : '';
  return visible + masked;
}

export default async function handler(req, res) {
  const { productId } = req.query;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  const key = `reviews:${productId}`;

  if (req.method === 'GET') {
    try {
      const raw = await redis.get(key);
      const reviews = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      return res.status(200).json(reviews);
    } catch (e) {
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const { name, rating, comment, orderId, adminKey } = req.body;

    // Admin can post without orderId check
    const isAdmin = adminKey === process.env.ADMIN_SECRET;

    if (!isAdmin && !orderId) {
      return res.status(403).json({ error: 'Order required to review' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating 1-5 required' });
    }
    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({ error: 'Comment required' });
    }

    try {
      const raw = await redis.get(key);
      const reviews = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];

      const newReview = {
        id: Date.now().toString(),
        name: maskName(name || 'Customer'),
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        comment: comment.trim().slice(0, 500),
        date: new Date().toISOString().split('T')[0],
        verified: !isAdmin,
      };

      reviews.unshift(newReview);
      await redis.set(key, JSON.stringify(reviews));

      return res.status(200).json({ success: true, review: newReview });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save review' });
    }
  }

  if (req.method === 'DELETE') {
    // Admin only — delete a review
    const { reviewId, adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      const raw = await redis.get(key);
      const reviews = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      const filtered = reviews.filter(r => r.id !== reviewId);
      await redis.set(key, JSON.stringify(filtered));
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
