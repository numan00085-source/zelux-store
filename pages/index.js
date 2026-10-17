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
        // Digital Assets have their own dedicated page (/digital-assets) -
        // excluded here so the main storefront grid stays physical-products-
        // only, rather than mixing an e-book in among apparel/footwear/etc.
        const inStock = data.filter(p => p.inStock !== false && !p.isDigital);
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

        {/* Trust bar */}
        <div className="border-b border-zelux-gray-mid/20 bg-zelux-navy-light/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {[
              { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Worldwide Delivery' },
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure Checkout' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: 'Easy Returns' },
              { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', label: 'Premium Quality' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 text-[11px] text-zelux-gray tracking-wide">
                <svg className="w-3.5 h-3.5 text-zelux-cyan flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon}/></svg>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          {!loading && items.length > 0 && (
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-light text-zelux-white">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              </h2>
              <span className="text-xs text-zelux-gray tracking-wide">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>
          )}
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
