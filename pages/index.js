import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

// Shein-style home page: a single search bar pinned at the top, then every
// in-stock product in one full-bleed grid. No hero section, no category
// labels/headings - per explicit request, categories were removed entirely
// from the storefront, so this page is now the only product-browsing
// surface that exists.
export default function Home() {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => {
        const inStock = data.filter(p => p.inStock !== false);
        setAllItems(inStock);
        setItems(inStock);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setItems(allItems);
      return;
    }
    const q = searchQuery.toLowerCase();
    setItems(allItems.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    ));
  }, [searchQuery, allItems]);

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-zelux-navy min-h-screen">
        <div className="sticky top-16 z-30 bg-zelux-navy/95 backdrop-blur-md border-b border-zelux-gray-mid/30 py-4 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zelux-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ZELUX..."
              className="w-full bg-zelux-navy-card border border-zelux-gray-mid/40 rounded-full pl-11 pr-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(12)].map((_, i) => <div key={i} className="shimmer-bg rounded-xl aspect-[3/4]"></div>)}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-zelux-gray text-sm py-20">
              {searchQuery ? `No products found matching "${searchQuery}".` : 'No products available yet.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
