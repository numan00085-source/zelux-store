import { getAllProducts } from '../lib/redis';
import { seedProducts } from '../lib/products';

const SITE_URL = 'https://www.zeluxus.com';

// Static, always-present pages. Cart/checkout/login/profile/order-success are
// deliberately excluded - they're either account-gated, transactional, or
// have no SEO value (nothing for Google to meaningfully index there).
// Category pages (apparel/footwear/electronics) were removed - the home
// page is now the single product-browsing surface, so this list no longer
// includes /collections/* entries.
const STATIC_PATHS = ['/'];

function buildSitemapXml(urls) {
  const urlEntries = urls
    .map(({ loc, priority }) => `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}

// This is a page (not an API route) specifically so it's served at the clean
// /sitemap.xml path Google expects, rather than /api/sitemap.xml.
export default function Sitemap() {
  // Next.js never actually renders this component - getServerSideProps below
  // sends the XML response directly and short-circuits rendering.
  return null;
}

export async function getServerSideProps({ res }) {
  let products = [];
  try {
    products = await getAllProducts();
    if (!products) products = seedProducts;
  } catch (err) {
    console.error('sitemap: failed to load products, falling back to seed data', err);
    products = seedProducts;
  }

  const urls = [
    ...STATIC_PATHS.map(path => ({ loc: `${SITE_URL}${path}`, priority: path === '/' ? '1.0' : '0.8' })),
    ...products.map(p => ({ loc: `${SITE_URL}/products/${p.slug}`, priority: '0.7' })),
  ];

  res.setHeader('Content-Type', 'text/xml');
  res.write(buildSitemapXml(urls));
  res.end();

  return { props: {} };
}
