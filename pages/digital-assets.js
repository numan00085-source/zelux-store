import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

// Same search-bar-plus-grid layout as the main storefront (pages/index.js),
// but filtered to ONLY digital products - these have no physical shipping,
// just a download link delivered manually after purchase (see Stripe
// webhook / admin order detail for how that's tracked).
export default function DigitalAssets() {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => {
        const digital = data.filter(p => p.inStock !== false && p.isDigital);
        setAllItems(digital);
        setItems(digital);
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
      (p.description && p.description.toLowerCase().includes(q))
    ));
  }, [searchQuery, allItems]);

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-zelux-navy min-h-screen">
        <div className="bg-zelux-navy-light border-b border-zelux-gray-mid/30 py-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-zelux-cyan/5 rounded-full blur-3xl"></div>
          <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3 relative">ZELUX</p>
          <h1 className="font-display text-4xl font-light text-zelux-white relative glow-text">Digital Assets</h1>
          <p className="text-sm text-zelux-gray mt-3 relative max-w-md mx-auto px-4">
            Instant-access digital goods - delivered directly to your inbox after checkout.
          </p>
        </div>

        <div className="sticky top-16 z-30 bg-zelux-navy/95 backdrop-blur-md border-b border-zelux-gray-mid/30 py-4 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zelux-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search digital assets..."
              className="w-full bg-zelux-navy-card border border-zelux-gray-mid/40 rounded-full pl-11 pr-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="shimmer-bg rounded-xl aspect-[3/4]"></div>)}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-zelux-gray text-sm py-20">
              {searchQuery ? `No digital assets found matching "${searchQuery}".` : 'No digital assets available yet.'}
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
