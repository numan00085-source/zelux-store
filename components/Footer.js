import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SOCIAL_PLATFORMS } from '../lib/socialPlatforms';

const DEFAULTS = {
  footerTagline: 'Luxury redefined for the modern era. Curated fashion and technology for those who refuse to settle.',
  footerSupportText: 'All customer support is handled exclusively via Instagram.',
  socialUsernames: { instagram: 'zelux.us', tiktok: '', youtube: '', linkedin: '', pinterest: '' },
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
          <div className="mt-4 flex items-center gap-3">
            {SOCIAL_PLATFORMS.filter(p => s.socialUsernames?.[p.key]?.trim()).map(p => (
              <a
                key={p.key}
                href={p.buildUrl(s.socialUsernames[p.key].trim())}
                target="_blank"
                rel="noreferrer"
                title={p.label}
                className="text-zelux-cyan hover:text-zelux-cyan-light transition-colors duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d={p.icon} /></svg>
              </a>
            ))}
          </div>
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
            <li><Link href="/about" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">About ZELUX</Link></li>
            <li><Link href="/profile" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">My Profile</Link></li>
            <li><Link href="/profile" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">My Orders</Link></li>
            <li><Link href="/wishlist" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">Wishlist</Link></li>
            <li><Link href="/receipt" className="text-sm text-zelux-gray hover:text-zelux-cyan transition-colors duration-300">ZELUX Receipt</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase text-zelux-gray mb-4">Support</h4>
          <p className="text-sm text-zelux-gray leading-relaxed mb-3">{s.footerSupportText}</p>
          {s.socialUsernames?.instagram?.trim() && (
            <a href={`https://instagram.com/${s.socialUsernames.instagram.trim()}`} target="_blank" rel="noreferrer" className="text-zelux-cyan text-sm hover:text-zelux-cyan-light transition-colors duration-300">@{s.socialUsernames.instagram.trim()} &rarr;</a>
          )}
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase text-zelux-gray mb-4">Chat</h4>
          <p className="text-sm text-zelux-gray leading-relaxed mb-3">Get instant help from our support team.</p>
          <Link href="/support" className="inline-block text-zelux-cyan text-sm hover:text-zelux-cyan-light transition-colors duration-300">Support Chat &rarr;</Link>
        </div>
      </div>
      <div className="border-t border-zelux-gray-mid/30 py-6 text-center">
        <p className="text-xs text-zelux-gray tracking-wider">&copy; {new Date().getFullYear()} ZELUX. All rights reserved. | zeluxus.com</p>
        <Link href="/returns-policy" className="text-xs text-zelux-gray hover:text-zelux-cyan tracking-wider transition-colors duration-300 mt-2 inline-block">Returns Policy</Link>
      </div>
    </footer>
  );
}
