import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, useAuthStore } from '../lib/store';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navLabels, setNavLabels] = useState({ navLinkApparel: 'Apparel', navLinkFootwear: 'Footwear', navLinkElectronics: 'Electronics' });
  const cart = useCartStore(s => s.cart);
  const user = useAuthStore(s => s.user);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    fetch('/api/settings').then(r => r.json()).then(setNavLabels).catch(() => {});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { key: 'apparel', label: navLabels.navLinkApparel },
    { key: 'footwear', label: navLabels.navLinkFootwear },
    { key: 'electronics', label: navLabels.navLinkElectronics },
    { key: 'all', label: 'Home Page' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zelux-navy/95 backdrop-blur-md shadow-glow-sm' : 'bg-zelux-navy/80 backdrop-blur-sm'} border-b border-zelux-gray-mid/40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 group">
            <span className="block w-5 h-px bg-zelux-cyan mb-1.5 transition-all group-hover:w-6"></span>
            <span className="block w-5 h-px bg-zelux-cyan mb-1.5"></span>
            <span className="block w-3 h-px bg-zelux-cyan transition-all group-hover:w-5"></span>
          </button>
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <Link key={item.key} href={`/collections/${item.key}`} className="nav-link text-xs tracking-widest uppercase text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group">
          <span className="font-display text-2xl font-light tracking-widest rainbow-text transition-all duration-300">ZELUX</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link href={user ? "/profile" : "/login"} className="hidden sm:block hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5 text-zelux-gray hover:text-zelux-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
          <Link href="/wishlist" className="hidden sm:block hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5 text-zelux-gray hover:text-zelux-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <Link href="/cart" className="relative hover:scale-110 transition-transform duration-200">
            <svg className="w-5 h-5 text-zelux-gray hover:text-zelux-cyan transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-zelux-cyan text-zelux-navy text-xs w-4 h-4 rounded-full flex items-center justify-center font-semibold shadow-glow-sm animate-scale-in">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-zelux-navy-light border-t border-zelux-gray-mid/40 px-4 py-6 flex flex-col gap-4 animate-fade-in">
          {navItems.map(item => (
            <Link key={item.key} href={`/collections/${item.key}`} className="text-xs tracking-widest uppercase text-zelux-gray hover:text-zelux-cyan transition-colors" onClick={() => setMenuOpen(false)}>{item.label}</Link>
          ))}
          <Link href={user ? "/profile" : "/login"} className="text-xs tracking-widest uppercase text-zelux-gray hover:text-zelux-cyan transition-colors" onClick={() => setMenuOpen(false)}>Account</Link>
        </div>
      )}
    </nav>
  );
}
