import { getAllProducts, saveAllProducts } from '../../lib/redis';
import { seedProducts } from '../../lib/products';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      let products = await getAllProducts();
      if (!products) {
        // First run: seed Redis with the original static catalog
        products = seedProducts;
        await saveAllProducts(products);
      }
      return res.status(200).json(products);
    }
    res.status(405).end();
  } catch (err) {
    console.error('products-list error', err);
    // Fallback to seed data if Redis is unreachable, so the storefront still works
    return res.status(200).json(seedProducts);
  }
}
