import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => {
        const inStock = data.filter(p => p.inStock !== false && !p.isDigital);
        setAllItems(inStock);
        setItems(inStock);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(allItems.map(p => p.category).filter(Boolean)))];

  useEffect(() => {
    let filtered = allItems;
    if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      );
    }
    setItems(filtered);
  }, [searchQuery, allItems, activeCategory]);

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-zelux-navy min-h-screen">

        {/* ── TOP SEARCH BAR (Amazon-style) ── */}
        <div className="bg-zelux-navy-light border-b border-zelux-gray-mid/20 sticky top-16 z-30">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zelux-gray pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-zelux-navy-card border border-zelux-gray-mid/40 rounded-lg pl-11 pr-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors placeholder-zelux-gray/50"
              />
            </div>
          </div>
        </div>

        {/* ── TRUST BAR ── */}
        <div className="bg-zelux-cyan/5 border-b border-zelux-cyan/10">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {[
              { icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', label: 'Shipping Only $5.99' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure Payment' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: '30-Day Returns' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Fast Delivery' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-1.5 text-[11px] text-zelux-cyan/80 font-medium">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                </svg>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORY TABS ── */}
        {!loading && categories.length > 1 && (
          <div className="border-b border-zelux-gray-mid/20 bg-zelux-navy">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-zelux-cyan text-zelux-navy'
                      : 'text-zelux-gray hover:text-zelux-white border border-zelux-gray-mid/30 hover:border-zelux-gray-mid/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUCT GRID ── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          {!loading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zelux-gray">
                {searchQuery
                  ? <><span className="text-zelux-white font-medium">{items.length}</span> results for "<span className="text-zelux-cyan">{searchQuery}</span>"</>
                  : <><span className="text-zelux-white font-medium">{items.length}</span> products</>
                }
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(15)].map((_, i) => <div key={i} className="shimmer-bg rounded-xl aspect-[3/4]" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zelux-gray text-sm">
                {searchQuery ? `No results for "${searchQuery}"` : 'No products yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
