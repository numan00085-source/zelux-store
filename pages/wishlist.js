import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useWishlistStore } from '../lib/store';
import { useState, useEffect } from 'react';

export default function Wishlist() {
  const wishlist = useWishlistStore(s => s.wishlist);
  const toggle = useWishlistStore(s => s.toggle);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-16 min-h-screen bg-zelux-navy">
        <h1 className="font-display text-4xl font-light mb-10 text-zelux-white">Wishlist</h1>
        {!hydrated ? null : wishlist.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-zelux-gray mb-6">Your wishlist is empty.</p>
            <Link href="/collections/all" className="btn-glow bg-zelux-cyan text-zelux-navy px-10 py-3 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow hover:scale-105 transition-all duration-300">Browse Collections</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="group relative card-lift">
                <Link href={`/products/${item.slug}`}>
                  <div className="rounded-xl overflow-hidden bg-zelux-navy-card border border-zelux-gray-mid/30">
                    <img src={item.images[0]} alt={item.name} className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="font-display text-lg mt-3 text-zelux-white truncate">{item.name}</h3>
                  <p className="text-sm font-semibold text-zelux-cyan mt-1">${item.price}</p>
                </Link>
                <button onClick={() => toggle(item)} className="absolute top-3 right-3 w-8 h-8 bg-zelux-navy/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-zelux-gray-mid/40">
                  <svg className="w-4 h-4 text-zelux-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
