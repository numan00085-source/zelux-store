import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCartStore, useWishlistStore } from '../../lib/store';

export default function ProductPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 2800); };
  const addToCart = useCartStore(s => s.addToCart);
  const toggle = useWishlistStore(s => s.toggle);
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product?.id));

  useEffect(() => {
    if (!slug) return;
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => { const found = data.find(p => p.slug === slug); setProduct(found || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 80 && product?.images?.length > 1) {
      setImgIdx(prev => dx < 0 ? Math.min(prev + 1, product.images.length - 1) : Math.max(prev - 1, 0));
    }
    touchStartX.current = null; touchStartY.current = null;
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="pt-32 min-h-[60vh] flex items-center justify-center bg-zelux-navy">
        <div className="w-8 h-8 border-2 border-zelux-cyan/30 border-t-zelux-cyan rounded-full animate-spin"></div>
      </div>
    </>
  );
  if (!product) return (
    <>
      <Navbar />
      <div className="pt-32 text-center text-zelux-gray bg-zelux-navy min-h-[60vh]">Product not found.</div>
    </>
  );

  const imgs = product.images || [];
  const isApparel = product.category === 'apparel' || product.category === 'footwear';
  const variantOptions = isApparel ? product.sizes : product.variants;
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  const handleAddToCart = () => {
    const missing = [];
    if (variantOptions?.length > 0 && !selectedVariant) missing.push(isApparel ? 'size' : 'variant');
    if (product.colors?.length > 0 && !selectedColor) missing.push('color');
    if (missing.length > 0) { showToast(`Please select a ${missing.join(' and ')} before adding to cart`); return; }
    const cartItem = { ...product };
    if (product.customizable && (customName || customNumber)) cartItem.customization = { name: customName, number: customNumber };
    addToCart(cartItem, [selectedVariant, selectedColor].filter(Boolean).join(' / ') || 'Standard', qty);
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-zelux-navy min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

            {/* Image section */}
            <div className="animate-fade-in">
              {/* Mobile swiper */}
              <div className="relative overflow-hidden rounded-2xl bg-zelux-navy-card border border-zelux-gray-mid/30 aspect-square cursor-zoom-in"
                onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={() => setLightbox(true)}>
                <img src={imgs[imgIdx]} alt={product.name}
                  className="w-full h-full object-cover transition-all duration-400"
                  style={{transform: 'translateZ(0)'}} />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zelux-navy/30 via-transparent to-transparent pointer-events-none"></div>

                {/* Badges */}
                {product.badge && <span className="absolute top-4 left-4 bg-zelux-cyan text-zelux-navy text-[10px] px-3 py-1.5 rounded-full tracking-wider font-semibold shadow-glow-sm z-10">{product.badge}</span>}
                {discount && <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] px-2.5 py-1.5 rounded-full font-semibold z-10">-{discount}%</span>}

                {/* Arrow buttons — desktop */}
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => Math.max(i-1,0))} className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zelux-navy/80 backdrop-blur items-center justify-center text-zelux-white hover:text-zelux-cyan transition-all border border-zelux-gray-mid/40 z-10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button onClick={() => setImgIdx(i => Math.min(i+1,imgs.length-1))} className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-zelux-navy/80 backdrop-blur items-center justify-center text-zelux-white hover:text-zelux-cyan transition-all border border-zelux-gray-mid/40 z-10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {imgs.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {imgs.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className={`rounded-full transition-all duration-300 ${imgIdx === i ? 'w-6 h-2 bg-zelux-cyan' : 'w-2 h-2 bg-white/40'}`}></button>
                    ))}
                  </div>
                )}

                {/* Swipe hint — mobile only, first image */}
                {imgs.length > 1 && imgIdx === 0 && (
                  <div className="sm:hidden absolute bottom-10 left-0 right-0 flex justify-center z-10">
                    <span className="text-[10px] text-white/50 tracking-widest uppercase flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18"/></svg>
                      Swipe
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {imgs.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imgs.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-16 h-16 overflow-hidden rounded-xl border-2 transition-all duration-200 ${imgIdx === i ? 'border-zelux-cyan scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex flex-col animate-fade-in-up">
              <p className="text-xs tracking-widest uppercase text-zelux-gray mb-2">{product.category}</p>
              {product.badge && <span className="inline-block bg-zelux-cyan text-zelux-navy text-xs px-3 py-1 rounded-full tracking-wider font-semibold w-fit mb-3 shadow-glow-sm">{product.badge}</span>}
              <h1 className="font-display text-3xl sm:text-4xl font-light mb-4 text-zelux-white leading-tight">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-semibold text-zelux-cyan">${product.price}</span>
                {product.originalPrice && <span className="text-lg text-zelux-gray line-through">${product.originalPrice}</span>}
                {discount && <span className="text-sm font-semibold text-green-400">Save {discount}%</span>}
              </div>

              {product.isDigital && (
                <div className="flex items-center gap-2 text-xs text-zelux-cyan mb-4 bg-zelux-cyan/10 border border-zelux-cyan/30 rounded-full px-4 py-2 w-fit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Digital — delivered to your email
                </div>
              )}

              <p className="text-sm text-zelux-gray leading-relaxed mb-6">{product.description}</p>

              {/* Size selector */}
              {variantOptions?.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase text-zelux-gray mb-3">{isApparel ? 'Select Size' : 'Select Variant'}</p>
                  <div className="flex flex-wrap gap-2">
                    {variantOptions.map(v => (
                      <button key={v} onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 text-xs rounded-xl border tracking-wider transition-all duration-200 ${selectedVariant === v ? 'bg-zelux-cyan text-zelux-navy border-zelux-cyan shadow-glow-sm font-semibold' : 'bg-zelux-navy-card text-zelux-white border-zelux-gray-mid/40 hover:border-zelux-cyan/50 active:scale-95'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color selector */}
              {product.colors?.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs tracking-widest uppercase text-zelux-gray mb-3">Select Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(c => (
                      <button key={c} onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2.5 text-xs rounded-xl border tracking-wider transition-all duration-200 ${selectedColor === c ? 'bg-zelux-cyan text-zelux-navy border-zelux-cyan shadow-glow-sm font-semibold' : 'bg-zelux-navy-card text-zelux-white border-zelux-gray-mid/40 hover:border-zelux-cyan/50 active:scale-95'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization */}
              {product.customizable && (
                <div className="mb-5 bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-5">
                  <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">Customize (Optional)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-zelux-gray block mb-1.5">Name</label>
                      <input value={customName} onChange={e => setCustomName(e.target.value.slice(0,20))} className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-xl px-3 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan" placeholder="e.g. RONALDO" />
                    </div>
                    <div>
                      <label className="text-[11px] text-zelux-gray block mb-1.5">Number</label>
                      <input value={customNumber} onChange={e => setCustomNumber(e.target.value.replace(/[^0-9]/g,'').slice(0,2))} className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-xl px-3 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan" placeholder="e.g. 7" />
                    </div>
                  </div>
                </div>
              )}

              {/* Qty + wishlist + share */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-zelux-gray-mid/40 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1,qty-1))} className="w-11 h-11 flex items-center justify-center text-zelux-gray hover:text-zelux-cyan hover:bg-zelux-cyan/10 transition-all text-lg">&minus;</button>
                  <span className="w-10 text-center text-sm text-zelux-white font-medium">{qty}</span>
                  <button onClick={() => setQty(qty+1)} className="w-11 h-11 flex items-center justify-center text-zelux-gray hover:text-zelux-cyan hover:bg-zelux-cyan/10 transition-all text-lg">+</button>
                </div>
                <button onClick={() => toggle(product)} className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 ${isWishlisted ? 'bg-zelux-cyan border-zelux-cyan text-zelux-navy' : 'border-zelux-gray-mid/40 text-zelux-gray hover:border-zelux-cyan/50 hover:text-zelux-cyan'}`}>
                  <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link copied'); }}
                  className="w-11 h-11 rounded-xl border border-zelux-gray-mid/40 text-zelux-gray hover:border-zelux-cyan/50 hover:text-zelux-cyan flex items-center justify-center transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                </button>
              </div>

              {/* Add to cart */}
              {product.inStock === false ? (
                <button disabled className="w-full py-4 text-xs tracking-widest uppercase font-medium bg-zelux-gray-light text-zelux-gray rounded-2xl cursor-not-allowed">Out of Stock</button>
              ) : (
                <button onClick={handleAddToCart}
                  className={`btn-glow w-full py-4 text-sm tracking-widest uppercase font-semibold rounded-2xl transition-all duration-300 active:scale-98 ${added ? 'bg-emerald-500 text-white shadow-none' : 'bg-zelux-cyan text-zelux-navy hover:shadow-glow-lg hover:scale-[1.02]'}`}>
                  {added ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
              )}

              {/* Trust signals */}
              <div className="flex gap-4 mt-4 flex-wrap">
                {['Free shipping over $30','Secure checkout','Worldwide delivery'].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-[11px] text-zelux-gray">
                    <svg className="w-3 h-3 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    {t}
                  </div>
                ))}
              </div>

              {/* Product details */}
              {product.details?.length > 0 && (
                <div className="mt-8 border-t border-zelux-gray-mid/30 pt-6">
                  <h3 className="text-xs tracking-widest uppercase mb-4 text-zelux-cyan">Product Details</h3>
                  <ul className="space-y-2">
                    {product.details.map(d => <li key={d} className="text-sm text-zelux-gray flex items-start gap-2"><span className="text-zelux-cyan mt-0.5">&middot;</span>{d}</li>)}
                  </ul>
                </div>
              )}

              {/* Specs */}
              {product.specs && (
                <div className="mt-6">
                  <h3 className="text-xs tracking-widest uppercase mb-4 text-zelux-cyan">Specifications</h3>
                  {Object.entries(product.specs).map(([k,v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-zelux-gray-mid/20">
                      <span className="text-xs text-zelux-gray">{k}</span>
                      <span className="text-xs font-medium text-zelux-white">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-[200] animate-fade-in-up flex justify-center">
          <div className="flex items-center gap-3 bg-zelux-navy-card border border-zelux-cyan/40 rounded-full pl-4 pr-5 py-3 shadow-glow-sm backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-zelux-cyan/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span className="text-sm text-zelux-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <Footer />

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          {imgs.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => Math.max(i-1,0)); }}
                className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={e => { e.stopPropagation(); setImgIdx(i => Math.min(i+1,imgs.length-1)); }}
                className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </>
          )}
          <img src={imgs[imgIdx]} alt={product.name}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()} />
          {imgs.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {imgs.map((_,i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                  className={`rounded-full transition-all ${imgIdx===i ? 'w-6 h-2 bg-zelux-cyan' : 'w-2 h-2 bg-white/40'}`}></button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
