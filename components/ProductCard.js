import Link from 'next/link';
import { useState } from 'react';
import { useWishlistStore } from '../lib/store';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const toggle = useWishlistStore(s => s.toggle);
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product.id));

  return (
    <div className="group relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
          <img
            src={hovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 tracking-wider">{product.badge}</span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">{product.category}</p>
          <h3 className="font-display text-lg font-light text-black">{product.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-medium">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => { e.preventDefault(); toggle(product); }}
        className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-black fill-current' : 'text-gray-600'}`} fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
