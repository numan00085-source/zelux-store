import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

const categoryLabels = { apparel: 'Apparel', footwear: 'Footwear', electronics: 'Electronics', all: 'All Products' };

export default function CollectionPage() {
  const router = useRouter();
  const { category } = router.query;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => {
        const filtered = category === 'all' ? data : data.filter(p => p.category === category);
        setItems(filtered.filter(p => p.inStock !== false));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="bg-gray-50 py-16 text-center">
          <p className="text-xs tracking-widest uppercase text-yellow-600 mb-3">Collection</p>
          <h1 className="font-display text-5xl font-light">{categoryLabels[category] || category}</h1>
          <p className="text-sm text-gray-500 mt-3">{loading ? '...' : `${items.length} pieces`}</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          {loading ? (
            <p className="text-center text-gray-400 text-sm">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">No products found in this collection yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
