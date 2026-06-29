import Link from 'next/link';
import { useState } from 'react';
import { useWishlistStore } from '../lib/store';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const toggle = useWishlistStore(s => s.toggle);
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product.id));
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="group relative card-lift" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden bg-zelux-navy-light rounded-xl aspect-[3/4] border border-zelux-gray-mid/30 group-hover:border-zelux-cyan/50 transition-colors duration-300">
          <img
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zelux-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {product.badge && (
            <span className="absolute top-3 left-3 bg-zelux-cyan text-zelux-navy text-[10px] px-2.5 py-1 rounded-full tracking-wider font-semibold shadow-glow-sm">{product.badge}</span>
          )}
          {discount && (
            <span className="absolute top-3 right-3 bg-red-500/90 text-white text-[10px] px-2 py-1 rounded-full font-semibold">-{discount}%</span>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-zelux-navy/70 flex items-center justify-center">
              <span className="text-zelux-gray text-xs tracking-widest uppercase border border-zelux-gray-mid px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1">{product.isDigital ? 'Digital' : product.category}</p>
          <h3 className="font-display text-lg font-light text-zelux-white group-hover:text-zelux-cyan transition-colors duration-300 truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-zelux-cyan">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-zelux-gray line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); toggle(product); }}
        className="absolute top-3 right-3 w-8 h-8 bg-zelux-navy/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-zelux-gray-mid/40"
        style={{ display: discount ? 'none' : 'flex' }}
      >
        <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-zelux-cyan fill-current' : 'text-zelux-gray'}`} fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
