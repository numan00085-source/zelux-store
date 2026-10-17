import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (!searchQuery.trim()) { setItems(allItems); return; }
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

        {/* ─── HERO ─── */}
        <div className="relative overflow-hidden">
          {/* bg glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-zelux-cyan/5 blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center relative">
            <p className="text-[10px] tracking-[0.35em] text-zelux-cyan/80 uppercase mb-5">Premium Drops · Worldwide Shipping</p>
            <h1 className="font-display text-5xl sm:text-7xl font-light text-zelux-white mb-5 leading-[1.1]">
              Shop Smarter.<br />
              <span className="text-zelux-cyan">Live Better.</span>
            </h1>
            <p className="text-sm text-zelux-gray max-w-sm mx-auto mb-8 leading-relaxed">
              Curated tech, lifestyle & fashion — secure checkout, easy returns, fast delivery.
            </p>

            {/* Search bar inside hero */}
            <div className="max-w-lg mx-auto relative mb-8">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zelux-gray pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-zelux-navy-card border border-zelux-gray-mid/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors"
              />
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="#products" className="bg-zelux-gold text-zelux-navy px-8 py-3 rounded-xl text-xs tracking-widest uppercase font-bold hover:brightness-105 transition-all shadow-md">
                Shop Now
              </a>
              <a href="/digital-assets" className="border border-zelux-gray-mid/50 text-zelux-gray px-8 py-3 rounded-xl text-xs tracking-widest uppercase hover:border-zelux-cyan/50 hover:text-zelux-cyan transition-all">
                Digital Products
              </a>
            </div>
          </div>
        </div>

        {/* ─── TRUST BAR ─── */}
        <div className="border-y border-zelux-gray-mid/20 bg-zelux-navy-light/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
            {[
              { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Worldwide Delivery' },
              { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Secure Checkout' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: 'Easy Returns' },
              { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', label: 'Premium Quality' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 text-[11px] text-zelux-gray tracking-wide">
                <svg className="w-3.5 h-3.5 text-zelux-cyan flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                </svg>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* ─── PRODUCT GRID ─── */}
        <div id="products" className="max-w-7xl mx-auto px-3 sm:px-6 py-8">
          {!loading && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-light text-zelux-white">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
              </h2>
              <span className="text-xs text-zelux-gray">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {[...Array(12)].map((_, i) => <div key={i} className="shimmer-bg rounded-xl aspect-[3/4]" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zelux-gray text-sm">
                {searchQuery ? `No results for "${searchQuery}"` : 'No products yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
