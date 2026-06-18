import { useState } from 'react';
import Link from 'next/link';
import { useCartStore, useWishlistStore, useAuthStore } from '../lib/store';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useCartStore(s => s.cart);
  const user = useAuthStore(s => s.user);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2">
            <span className="block w-5 h-px bg-black mb-1"></span>
            <span className="block w-5 h-px bg-black mb-1"></span>
            <span className="block w-3 h-px bg-black"></span>
          </button>
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/collections/apparel" className="text-xs tracking-widest uppercase text-gray-600 hover:text-black transition-colors">Apparel</Link>
            <Link href="/collections/footwear" className="text-xs tracking-widest uppercase text-gray-600 hover:text-black transition-colors">Footwear</Link>
            <Link href="/collections/electronics" className="text-xs tracking-widest uppercase text-gray-600 hover:text-black transition-colors">Electronics</Link>
          </div>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="font-display text-2xl font-light tracking-widest-xl text-black">ZELUX</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link href={user ? "/profile" : "/login"} className="hidden sm:block">
            <svg className="w-5 h-5 text-gray-700 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
          <Link href="/wishlist" className="hidden sm:block relative">
            <svg className="w-5 h-5 text-gray-700 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <Link href="/cart" className="relative">
            <svg className="w-5 h-5 text-gray-700 hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-6 flex flex-col gap-4">
          <Link href="/collections/apparel" className="text-xs tracking-widest uppercase text-gray-600" onClick={() => setMenuOpen(false)}>Apparel</Link>
          <Link href="/collections/footwear" className="text-xs tracking-widest uppercase text-gray-600" onClick={() => setMenuOpen(false)}>Footwear</Link>
          <Link href="/collections/electronics" className="text-xs tracking-widest uppercase text-gray-600" onClick={() => setMenuOpen(false)}>Electronics</Link>
          <Link href={user ? "/profile" : "/login"} className="text-xs tracking-widest uppercase text-gray-600" onClick={() => setMenuOpen(false)}>Account</Link>
        </div>
      )}
    </nav>
  );
}
