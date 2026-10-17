import { getAllProducts, saveAllProducts } from '../../lib/redis';
import { seedProducts } from '../../lib/products';

// All write methods (POST, PUT, DELETE) require this secret header so only
// the admin panel (which knows ADMIN_SECRET) can modify the product catalog.
function isAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false; // must be set in Vercel env vars
  return req.headers['x-admin-secret'] === secret;
}

export default async function handler(req, res) {
  try {
    // ── GET: public, no auth needed ─────────────────────────────────────
    if (req.method === 'GET') {
      let products = await getAllProducts();
      if (!products) {
        products = seedProducts;
        await saveAllProducts(products);
      }
      return res.status(200).json(products);
    }

    // ── All write methods require admin secret ───────────────────────────
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let products = await getAllProducts();
    if (!products) products = [...seedProducts];

    // ── POST: add new product ────────────────────────────────────────────
    if (req.method === 'POST') {
      const newProduct = { ...req.body, id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      products.unshift(newProduct);
      await saveAllProducts(products);
      return res.status(201).json(newProduct);
    }

    // ── PUT: update existing product ─────────────────────────────────────
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      products[idx] = { ...products[idx], ...updates, id };
      await saveAllProducts(products);
      return res.status(200).json(products[idx]);
    }

    // ── PATCH: toggle inStock ─────────────────────────────────────────────
    if (req.method === 'PATCH') {
      const { id, inStock } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const idx = products.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Product not found' });
      products[idx] = { ...products[idx], inStock };
      await saveAllProducts(products);
      return res.status(200).json(products[idx]);
    }

    // ── DELETE: remove product ───────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const filtered = products.filter(p => p.id !== id);
      await saveAllProducts(filtered);
      return res.status(200).json({ ok: true });
    }

    res.status(405).end();
  } catch (err) {
    console.error('products-list error', err);
    if (req.method === 'GET') return res.status(200).json(seedProducts);
    return res.status(500).json({ error: err.message });
  }
}
