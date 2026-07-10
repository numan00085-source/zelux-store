import Link from 'next/link';
import { useState, useRef } from 'react';
import { useWishlistStore } from '../lib/store';

export default function ProductCard({ product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const touchStartX = useRef(null);
  const toggle = useWishlistStore(s => s.toggle);
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product.id));
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;
  const imgs = product.images || [];

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40 && imgs.length > 1) {
      setImgIdx(dx < 0 ? Math.min(imgIdx + 1, imgs.length - 1) : Math.max(imgIdx - 1, 0));
    }
    touchStartX.current = null;
  };

  return (
    <div className="group relative card-lift">
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden bg-zelux-navy-light rounded-xl aspect-[3/4] border border-zelux-gray-mid/30 group-hover:border-zelux-cyan/50 transition-colors duration-300"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <img
            src={imgs[imgIdx] || imgs[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          {/* Hover second image on desktop */}
          {imgs[1] && (
            <img src={imgs[1]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zelux-navy/70 via-transparent to-transparent"></div>

          {/* Badges */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-zelux-cyan text-zelux-navy text-[10px] px-2.5 py-1 rounded-full tracking-wider font-semibold shadow-glow-sm z-10">{product.badge}</span>
          )}
          {discount && (
            <span className="absolute top-3 right-3 bg-red-500/90 text-white text-[10px] px-2 py-1 rounded-full font-semibold z-10">-{discount}%</span>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-zelux-navy/70 flex items-center justify-center z-10">
              <span className="text-zelux-gray text-xs tracking-widest uppercase border border-zelux-gray-mid px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Dot indicators for multiple images */}
          {imgs.length > 1 && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1 z-10">
              {imgs.map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${imgIdx === i ? 'bg-zelux-cyan w-3' : 'bg-white/40'}`}></span>
              ))}
            </div>
          )}

          {/* Price always visible at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zelux-cyan">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-zelux-gray/70 line-through">${product.originalPrice}</span>
              )}
            </div>
          </div>
        </div>

        {/* Product info below image */}
        <div className="mt-2.5 px-0.5">
          <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-0.5">{product.isDigital ? 'Digital' : product.category}</p>
          <h3 className="font-display text-base font-light text-zelux-white group-hover:text-zelux-cyan transition-colors duration-300 line-clamp-2 leading-snug">{product.name}</h3>
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={(e) => { e.preventDefault(); toggle(product); }}
        className="absolute top-3 right-3 w-8 h-8 bg-zelux-navy/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-zelux-gray-mid/40 z-20"
        style={{ display: discount ? 'none' : 'flex' }}
      >
        <svg className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-zelux-cyan fill-current' : 'text-zelux-gray'}`} fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}
