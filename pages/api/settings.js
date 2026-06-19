import { getRedis } from '../../lib/redis';

const SETTINGS_KEY = 'zelux:settings';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const redis = getRedis();
    const data = await redis.get(SETTINGS_KEY);
    const defaults = {
      heroTitle: 'ZELUX',
      heroSubtitle: 'Est. 2024 - Luxury Redefined',
      announcementText: 'Free Shipping on Orders Over $150 - Worldwide Delivery - Secure Checkout - New Arrivals Weekly',
      accentColor: '#3FD8F2',
      instagramHandle: '@zelux.us',
    };
    res.json(data ? JSON.parse(data) : defaults);
  } catch (err) {
    res.json({
      heroTitle: 'ZELUX',
      heroSubtitle: 'Est. 2024 - Luxury Redefined',
      announcementText: 'Free Shipping on Orders Over $150 - Worldwide Delivery - Secure Checkout - New Arrivals Weekly',
      accentColor: '#3FD8F2',
      instagramHandle: '@zelux.us',
    });
  }
}
