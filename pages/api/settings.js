import { getRedis } from '../../lib/redis';

const SETTINGS_KEY = 'zelux:settings';

const DEFAULTS = {
  heroTitle: 'ZELUX',
  heroSubtitle: 'Est. 2024 - Luxury Redefined',
  announcementText: 'Free Shipping on Orders Over $150 - Worldwide Delivery - Secure Checkout - New Arrivals Weekly',
  accentColor: '#3FD8F2',
  instagramHandle: '@zelux.us',
  instagramUrl: 'https://instagram.com/zelux.us',
  footerTagline: 'Luxury redefined for the modern era. Curated fashion and technology for those who refuse to settle.',
  footerSupportText: 'All customer support is handled exclusively via Instagram.',
  freeShippingThreshold: 150,
  shippingFee: 9.99,
  navLinkApparel: 'Apparel',
  navLinkFootwear: 'Footwear',
  navLinkElectronics: 'Electronics',
  siteTitle: 'ZELUX - Luxury Redefined',
  metaDescription: 'Premium fashion and electronics, curated for those who refuse to settle.',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently updating our store. Please check back shortly.',
  heroImages: [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=90',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=90',
    'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&q=90',
  ],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const redis = getRedis();
    const data = await redis.get(SETTINGS_KEY);
    const saved = data ? JSON.parse(data) : {};
    res.json({ ...DEFAULTS, ...saved });
  } catch (err) {
    res.json(DEFAULTS);
  }
}
