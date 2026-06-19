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
      <main className="pt-16 bg-zelux-navy min-h-screen">
        <div className="bg-zelux-navy-light border-b border-zelux-gray-mid/30 py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-zelux-cyan/5 rounded-full blur-3xl"></div>
          <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3 relative">Collection</p>
          <h1 className="font-display text-5xl font-light text-zelux-white relative glow-text">{categoryLabels[category] || category}</h1>
          <p className="text-sm text-zelux-gray mt-3 relative">{loading ? '...' : `${items.length} pieces`}</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="shimmer-bg rounded-xl aspect-[3/4]"></div>)}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-zelux-gray text-sm py-12">No products found in this collection yet.</p>
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
