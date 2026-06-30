import { getAllProducts } from '../lib/redis';
import { seedProducts } from '../lib/products';

const SITE_URL = 'https://www.zeluxus.com';

// Escapes the 5 characters that are special in XML - required because
// product names/descriptions are free text that could contain "&", "<",
// quotes, etc. An unescaped "&" alone is enough to make the whole feed
// invalid XML, which Google would then reject outright rather than just
// skip the one bad product.
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildFeedXml(products) {
  const items = products.map(p => {
    const link = `${SITE_URL}/products/${p.slug}`;
    const imageLink = p.images?.[0] || '';
    const availability = p.inStock !== false ? 'in stock' : 'out of stock';
    // condition/brand are required-or-recommended by Google's spec; every
    // product here is a new, ZELUX-branded item, so these are constant
    // rather than per-product fields that don't exist in our data model.
    return `  <item>
    <g:id>${escapeXml(p.id)}</g:id>
    <title>${escapeXml(p.name)}</title>
    <description>${escapeXml(p.description || p.name)}</description>
    <link>${escapeXml(link)}</link>
    <g:image_link>${escapeXml(imageLink)}</g:image_link>
    <g:availability>${availability}</g:availability>
    <g:price>${Number(p.price).toFixed(2)} USD</g:price>
    <g:brand>ZELUX</g:brand>
    <g:condition>new</g:condition>
  </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>ZELUX Product Feed</title>
  <link>${SITE_URL}</link>
  <description>ZELUX - premium streetwear, footwear, and electronics</description>
${items}
</channel>
</rss>`;
}

// This is a page (not an API route) specifically so it's served at a clean
// path Google Merchant Center can fetch directly via Scheduled Fetch -
// same reasoning and pattern as sitemap.xml.js. getServerSideProps makes
// this genuinely dynamic (live prices/stock from Redis on every fetch),
// not a stale snapshot frozen at build time - confirmed safe to use this
// pattern here since the home page's separate static optimization (no
// getServerSideProps there) doesn't put the whole site in static-export
// mode; next.config.js has no output:'export' set.
export default function ProductFeed() {
  return null;
}

export async function getServerSideProps({ res }) {
  let products = [];
  try {
    products = await getAllProducts();
    if (!products) products = seedProducts;
  } catch (err) {
    console.error('product-feed: failed to load products, falling back to seed data', err);
    products = seedProducts;
  }

  // Google Shopping only wants sellable products - excluding anything
  // explicitly out of stock would be wrong (out-of-stock items can still
  // legitimately appear with availability="out of stock"), but a product
  // missing a price or image is genuinely unsubmittable, so those are
  // filtered out rather than sent as malformed <item> entries.
  // Digital Assets are excluded from this feed - Google Shopping/Merchant
  // Center's product feed is built around shippable physical goods
  // (shipping settings, GTIN, condition, etc.), and submitting a digital
  // download as a regular product risks disapproval or a mismatched
  // shopping experience for searchers expecting a shipped item.
  //
  // Temporarily excluding any product whose name suggests a kids'
  // camera/video-monitoring device (e.g. "Adults/Kids Smart Video Walkie
  // Talkie with HD Dual Camera") - Pinterest rejected the merchant account
  // citing "prohibited products" without naming which one specifically,
  // and this is the most plausible candidate given Pinterest's strict
  // child-safety review for any camera/video device marketed toward kids.
  // This is a precaution pending Pinterest's appeal outcome, not a
  // confirmed violation - matched by name pattern rather than a hardcoded
  // product ID, since IDs aren't stable (they were just migrated to UUIDs)
  // and a name-based match also catches any future product with the same
  // red flag without needing code changes each time.
  const PINTEREST_SENSITIVE_NAME_PATTERN = /kids?.{0,20}(camera|video)|.{0,20}(camera|video).{0,20}kids?/i;
  const validProducts = products.filter(p =>
    p.price && p.images?.[0] && !p.isDigital && !PINTEREST_SENSITIVE_NAME_PATTERN.test(p.name || '')
  );

  res.setHeader('Content-Type', 'text/xml');
  res.write(buildFeedXml(validProducts));
  res.end();

  return { props: {} };
}
