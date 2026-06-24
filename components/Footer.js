import { useState, useEffect } from 'react';
import Link from 'next/link';

const DEFAULTS = {
  footerTagline: 'Luxury redefined for the modern era. Curated fashion and technology for those who refuse to settle.',
  footerSupportText: 'All customer support is handled exclusively via Instagram.',
  instagramHandle: '@zelux.us',
  instagramUrl: 'https://instagram.com/zelux.us',
  navLinkApparel: 'Apparel',
  navLinkFootwear: 'Footwear',
  navLinkElectronics: 'Electronics',
};

export default function Footer() {
  const [s, setS] = useState(DEFAULTS);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => setS({ ...DEFAULTS, ...data })).catch(() => {});
  }, []);

  return (
    <footer className="bg-zelux-navy-light border-t border-zelux-gray-mid/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <span className="font-display text-2xl tracking-widest rainbow-text">ZELUX</span>
          <p className="mt-4 text-xs text-zelux-gray leading-relaxed">{s.footerTagline}</p>
          <a href={s.instagramUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-zelux-cyan tracking-wider hover:text-zelux-cyan-light transition-colors duration-300 group">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            {s.instagramHandle}
          </a>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase text-zelux-gray mb-4">Shop</h4>
          <ul className="space-y-3">
            <li><Link href="/" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">All Products</Link></li>
            <li><Link href="/wishlist" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">Wishlist</Link></li>
            <li><Link href="/cart" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase text-zelux-gray mb-4">Account</h4>
          <ul className="space-y-3">
            {['My Profile','My Orders','Wishlist','Track Order'].map(l => (
              <li key={l}><Link href="/profile" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase text-zelux-gray mb-4">Support</h4>
          <p className="text-sm text-zelux-gray leading-relaxed mb-3">{s.footerSupportText}</p>
          <a href={s.instagramUrl} target="_blank" rel="noreferrer" className="text-zelux-cyan text-sm hover:text-zelux-cyan-light transition-colors duration-300">{s.instagramHandle} &rarr;</a>
        </div>
      </div>
      <div className="border-t border-zelux-gray-mid/30 py-6 text-center">
        <p className="text-xs text-zelux-gray tracking-wider">&copy; {new Date().getFullYear()} ZELUX. All rights reserved. | zelux.us</p>
      </div>
    </footer>
  );
}
