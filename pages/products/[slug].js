import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import AdSlot from '../../components/AdSlot';
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
  const [selectedImg, setSelectedImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore(s => s.addToCart);
  const toggle = useWishlistStore(s => s.toggle);
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product?.id));

  useEffect(() => {
    if (!slug) return;
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => {
        const found = data.find(p => p.slug === slug);
        setProduct(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

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

  const isApparel = product.category === 'apparel' || product.category === 'footwear';
  const variantOptions = isApparel ? product.sizes : product.variants;

  const handleAddToCart = () => {
    if (variantOptions && variantOptions.length > 0 && !selectedVariant) { alert('Please select a size or variant.'); return; }
    if (product.colors && product.colors.length > 0 && !selectedColor) { alert('Please select a color.'); return; }
    const cartItem = { ...product };
    if (product.customizable && (customName || customNumber)) {
      cartItem.customization = { name: customName, number: customNumber };
    }
    const variantLabel = [selectedVariant, selectedColor].filter(Boolean).join(' / ') || 'Standard';
    addToCart(cartItem, variantLabel, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-16 bg-zelux-navy min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="animate-fade-in">
            <div className="aspect-square overflow-hidden bg-zelux-navy-card rounded-2xl border border-zelux-gray-mid/30 cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
              <img src={product.images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} className={`w-16 h-16 overflow-hidden rounded-lg border-2 transition-colors duration-300 ${selectedImg === i ? 'border-zelux-cyan' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col animate-fade-in-up">
            <p className="text-xs tracking-widest uppercase text-zelux-gray mb-2">{product.category}</p>
            {product.badge && <span className="inline-block bg-zelux-cyan text-zelux-navy text-xs px-3 py-1 rounded-full tracking-wider font-semibold w-fit mb-3 shadow-glow-sm">{product.badge}</span>}
            <h1 className="font-display text-4xl font-light mb-4 text-zelux-white">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-semibold text-zelux-cyan">${product.price}</span>
              {product.originalPrice && <span className="text-lg text-zelux-gray line-through">${product.originalPrice}</span>}
            </div>
            <p className="text-sm text-zelux-gray leading-relaxed mb-8">{product.description}</p>
            {variantOptions && variantOptions.length > 0 && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-zelux-gray mb-3">{isApparel ? 'Select Size' : 'Select Variant'}</p>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.map(v => (
                    <button key={v} onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 text-xs rounded-lg border tracking-wider transition-all duration-300 ${selectedVariant === v ? 'bg-zelux-cyan text-zelux-navy border-zelux-cyan shadow-glow-sm' : 'bg-zelux-navy-card text-zelux-white border-zelux-gray-mid/40 hover:border-zelux-cyan/50'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-zelux-gray mb-3">Select Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-xs rounded-lg border tracking-wider transition-all duration-300 ${selectedColor === c ? 'bg-zelux-cyan text-zelux-navy border-zelux-cyan shadow-glow-sm' : 'bg-zelux-navy-card text-zelux-white border-zelux-gray-mid/40 hover:border-zelux-cyan/50'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.customizable && (
              <div className="mb-6 bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-xl p-5">
                <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">Customize (Optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zelux-gray block mb-1.5">Name</label>
                    <input value={customName} onChange={e => setCustomName(e.target.value.slice(0, 20))}
                      className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-3 py-2 text-sm text-zelux-white outline-none focus:border-zelux-cyan" placeholder="e.g. RONALDO" />
                  </div>
                  <div>
                    <label className="text-[11px] text-zelux-gray block mb-1.5">Number</label>
                    <input value={customNumber} onChange={e => setCustomNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                      className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-3 py-2 text-sm text-zelux-white outline-none focus:border-zelux-cyan" placeholder="e.g. 7" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-zelux-gray-mid/40 rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-zelux-gray hover:text-zelux-cyan transition-colors">&minus;</button>
                <span className="w-12 text-center text-sm text-zelux-white">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-zelux-gray hover:text-zelux-cyan transition-colors">+</button>
              </div>
              <button onClick={() => toggle(product)} className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-300 ${isWishlisted ? 'bg-zelux-cyan border-zelux-cyan text-zelux-navy' : 'border-zelux-gray-mid/40 text-zelux-gray hover:border-zelux-cyan/50 hover:text-zelux-cyan'}`}>
                <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            {product.inStock === false ? (
              <button disabled className="w-full py-4 text-xs tracking-widest uppercase font-medium bg-zelux-gray-light text-zelux-gray rounded-full cursor-not-allowed">Out of Stock</button>
            ) : (
              <button onClick={handleAddToCart} className={`btn-glow w-full py-4 text-xs tracking-widest uppercase font-semibold rounded-full transition-all duration-300 ${added ? 'bg-emerald-500 text-white' : 'bg-zelux-cyan text-zelux-navy hover:shadow-glow-lg hover:scale-[1.02]'}`}>
                {added ? 'Added to Cart' : 'Add to Cart'}
              </button>
            )}
            {product.details && product.details.length > 0 && (
              <div className="mt-10 border-t border-zelux-gray-mid/30 pt-8">
                <h3 className="text-xs tracking-widest uppercase mb-4 text-zelux-cyan">Product Details</h3>
                <ul className="space-y-2">
                  {product.details.map(d => <li key={d} className="text-sm text-zelux-gray flex items-start gap-2"><span className="text-zelux-cyan mt-0.5">&middot;</span>{d}</li>)}
                </ul>
              </div>
            )}
            {product.specs && (
              <div className="mt-6">
                <h3 className="text-xs tracking-widest uppercase mb-4 text-zelux-cyan">Specifications</h3>
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-zelux-gray-mid/20">
                    <span className="text-xs text-zelux-gray">{k}</span>
                    <span className="text-xs font-medium text-zelux-white">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-5 right-5 text-zelux-white hover:text-zelux-cyan text-3xl leading-none transition-colors">&times;</button>
          {product.images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setSelectedImg((selectedImg - 1 + product.images.length) % product.images.length); }}
              className="absolute left-4 sm:left-8 text-zelux-white hover:text-zelux-cyan transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <img src={product.images[selectedImg]} alt={product.name} className="max-w-full max-h-[90vh] object-contain animate-scale-in" onClick={e => e.stopPropagation()} />
          {product.images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setSelectedImg((selectedImg + 1) % product.images.length); }}
              className="absolute right-4 sm:right-8 text-zelux-white hover:text-zelux-cyan transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AdSlot placement="product-page" />
      </div>
      <Footer />
    </>
  );
}
