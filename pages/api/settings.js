import { getRedis } from '../../lib/redis';

const SETTINGS_KEY = 'zelux:settings';

const DEFAULTS = {
  heroTitle: 'ZELUX',
  heroSubtitle: 'Est. 2024 - Luxury Redefined',
  announcementText: 'Free Shipping on Orders Over {shippingThreshold} - Worldwide Delivery - Secure Checkout - New Arrivals Weekly',
  accentColor: '#3FD8F2',
  // Each platform stores ONLY the username - the profile URL is built from
  // a per-platform template (see lib/socialPlatforms.js), so the admin
  // never has to construct or paste a full URL, just type a handle. An
  // empty string means that platform is not connected and won't render
  // anywhere on the storefront.
  socialUsernames: {
    instagram: 'zelux.us',
    tiktok: '',
    youtube: '',
    linkedin: '',
    pinterest: '',
  },
  footerTagline: 'Luxury redefined for the modern era. Curated fashion and technology for those who refuse to settle.',
  footerSupportText: 'All customer support is handled exclusively via Instagram.',
  freeShippingThreshold: 150,
  shippingFee: 9.99,
  navLinkApparel: 'Apparel',
  navLinkFootwear: 'Footwear',
  navLinkElectronics: 'Electronics',
  siteTitle: 'ZELUX - Luxury Redefined',
  metaDescription: 'Premium fashion and electronics, curated for those who refuse to settle.',
  // Payment Gateways
  stripeEnabled: true,
  stripePublishableKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  squareEnabled: false,
  squareAppId: '',
  squareAccessToken: '',
  squareLocationId: '',
  squareEnvironment: 'production',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently updating our store. Please check back shortly.',
  // Flash Sale
  flashSaleEnabled: false,
  flashSaleMessage: '🔥 Flash Sale — Limited Time Only!',
  flashSaleEndsAt: '',
  flashSaleDiscount: '20% OFF Everything',
  // Email Popup
  emailPopupEnabled: true,
  emailPopupTitle: 'Get 10% Off Your First Order',
  emailPopupSubtitle: 'Join the ZELUX community and be first to know about new drops.',
  // FOMO
  fomoEnabled: true,
  // About Page
  founderName: 'Numan Salclox',
  founderTitle: 'Founder & CEO, ZELUX',
  founderBio: "ZELUX was founded with a clear intention: to build a brand that respects both the customer's taste and their budget. The idea was simple — source the best products available, present them honestly, and deliver them reliably.",
  founderBio2: "Every product decision, every design detail, and every customer interaction at ZELUX reflects that original intention. We're not here to move units. We're here to build something worth standing behind.",
  aboutMission: 'ZELUX is a premium e-commerce brand based in the United States, built around a single belief — that the clothes you wear, the shoes you walk in, and the products around you should reflect who you are, not what you could afford to compromise on.',
  aboutMission2: "We source every item in our catalog with the same scrutiny we'd apply if we were buying for ourselves. If it doesn't meet the standard, it doesn't make the cut.",
  // FAQ — stored as JSON string
  faqData: '',
  heroImages: [
  "https://picsum.photos/seed/zelux-apparel-1/1200/800",
  "https://picsum.photos/seed/zelux-apparel-2/1200/800",
  "https://picsum.photos/seed/zelux-apparel-3/1200/800",
  "https://picsum.photos/seed/zelux-apparel-4/1200/800",
  "https://picsum.photos/seed/zelux-apparel-5/1200/800",
  "https://picsum.photos/seed/zelux-apparel-6/1200/800",
  "https://picsum.photos/seed/zelux-apparel-7/1200/800",
  "https://picsum.photos/seed/zelux-apparel-8/1200/800",
  "https://picsum.photos/seed/zelux-apparel-9/1200/800",
  "https://picsum.photos/seed/zelux-apparel-10/1200/800",
  "https://picsum.photos/seed/zelux-apparel-11/1200/800",
  "https://picsum.photos/seed/zelux-apparel-12/1200/800",
  "https://picsum.photos/seed/zelux-apparel-13/1200/800",
  "https://picsum.photos/seed/zelux-apparel-14/1200/800",
  "https://picsum.photos/seed/zelux-apparel-15/1200/800",
  "https://picsum.photos/seed/zelux-apparel-16/1200/800",
  "https://picsum.photos/seed/zelux-apparel-17/1200/800",
  "https://picsum.photos/seed/zelux-apparel-18/1200/800",
  "https://picsum.photos/seed/zelux-apparel-19/1200/800",
  "https://picsum.photos/seed/zelux-apparel-20/1200/800",
  "https://picsum.photos/seed/zelux-footwear-1/1200/800",
  "https://picsum.photos/seed/zelux-footwear-2/1200/800",
  "https://picsum.photos/seed/zelux-footwear-3/1200/800",
  "https://picsum.photos/seed/zelux-footwear-4/1200/800",
  "https://picsum.photos/seed/zelux-footwear-5/1200/800",
  "https://picsum.photos/seed/zelux-footwear-6/1200/800",
  "https://picsum.photos/seed/zelux-footwear-7/1200/800",
  "https://picsum.photos/seed/zelux-footwear-8/1200/800",
  "https://picsum.photos/seed/zelux-footwear-9/1200/800",
  "https://picsum.photos/seed/zelux-footwear-10/1200/800",
  "https://picsum.photos/seed/zelux-footwear-11/1200/800",
  "https://picsum.photos/seed/zelux-footwear-12/1200/800",
  "https://picsum.photos/seed/zelux-footwear-13/1200/800",
  "https://picsum.photos/seed/zelux-footwear-14/1200/800",
  "https://picsum.photos/seed/zelux-footwear-15/1200/800",
  "https://picsum.photos/seed/zelux-tech-1/1200/800",
  "https://picsum.photos/seed/zelux-tech-2/1200/800",
  "https://picsum.photos/seed/zelux-tech-3/1200/800",
  "https://picsum.photos/seed/zelux-tech-4/1200/800",
  "https://picsum.photos/seed/zelux-tech-5/1200/800",
  "https://picsum.photos/seed/zelux-tech-6/1200/800",
  "https://picsum.photos/seed/zelux-tech-7/1200/800",
  "https://picsum.photos/seed/zelux-tech-8/1200/800",
  "https://picsum.photos/seed/zelux-tech-9/1200/800",
  "https://picsum.photos/seed/zelux-tech-10/1200/800",
  "https://picsum.photos/seed/zelux-tech-11/1200/800",
  "https://picsum.photos/seed/zelux-tech-12/1200/800",
  "https://picsum.photos/seed/zelux-tech-13/1200/800",
  "https://picsum.photos/seed/zelux-tech-14/1200/800",
  "https://picsum.photos/seed/zelux-tech-15/1200/800",
  "https://picsum.photos/seed/zelux-tech-16/1200/800",
  "https://picsum.photos/seed/zelux-tech-17/1200/800",
  "https://picsum.photos/seed/zelux-tech-18/1200/800",
  "https://picsum.photos/seed/zelux-tech-19/1200/800",
  "https://picsum.photos/seed/zelux-tech-20/1200/800",
  "https://picsum.photos/seed/zelux-sports-1/1200/800",
  "https://picsum.photos/seed/zelux-sports-2/1200/800",
  "https://picsum.photos/seed/zelux-sports-3/1200/800",
  "https://picsum.photos/seed/zelux-sports-4/1200/800",
  "https://picsum.photos/seed/zelux-sports-5/1200/800",
  "https://picsum.photos/seed/zelux-sports-6/1200/800",
  "https://picsum.photos/seed/zelux-sports-7/1200/800",
  "https://picsum.photos/seed/zelux-sports-8/1200/800",
  "https://picsum.photos/seed/zelux-sports-9/1200/800",
  "https://picsum.photos/seed/zelux-sports-10/1200/800",
  "https://picsum.photos/seed/zelux-sports-11/1200/800",
  "https://picsum.photos/seed/zelux-sports-12/1200/800",
  "https://picsum.photos/seed/zelux-sports-13/1200/800",
  "https://picsum.photos/seed/zelux-sports-14/1200/800",
  "https://picsum.photos/seed/zelux-sports-15/1200/800",
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
