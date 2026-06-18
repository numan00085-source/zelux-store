import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { products, getProductBySlug } from '../../lib/products';
import { useCartStore, useWishlistStore } from '../../lib/store';

export default function ProductPage({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore(s => s.addToCart);
  const toggle = useWishlistStore(s => s.toggle);
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product?.id));

  if (!product) return <div className="pt-32 text-center">Product not found.</div>;

  const isApparel = product.category === 'apparel' || product.category === 'footwear';
  const variantOptions = isApparel ? product.sizes : product.variants;

  const handleAddToCart = () => {
    if (!selectedVariant) { alert('Please select a size or variant.'); return; }
    addToCart(product, selectedVariant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square overflow-hidden bg-gray-50">
              <img src={product.images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)} className={`w-16 h-16 overflow-hidden border-2 transition-colors ${selectedImg === i ? 'border-black' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">{product.category}</p>
            {product.badge && <span className="inline-block bg-black text-white text-xs px-3 py-1 tracking-wider w-fit mb-3">{product.badge}</span>}
            <h1 className="font-display text-4xl font-light mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-medium">${product.price}</span>
              {product.originalPrice && <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">{product.description}</p>
            {variantOptions && (
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase text-gray-500 mb-3">{isApparel ? 'Select Size' : 'Select Variant'}</p>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.map(v => (
                    <button key={v} onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 text-xs border tracking-wider transition-colors ${selectedVariant === v ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50">−</button>
                <span className="w-12 text-center text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50">+</button>
              </div>
              <button onClick={() => toggle(product)} className={`w-10 h-10 border flex items-center justify-center transition-colors ${isWishlisted ? 'bg-black border-black text-white' : 'border-gray-300 hover:border-black'}`}>
                <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <button onClick={handleAddToCart} className={`w-full py-4 text-xs tracking-widest uppercase font-medium transition-all duration-300 ${added ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-yellow-500 hover:text-black'}`}>
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
            {product.details && (
              <div className="mt-10 border-t border-gray-100 pt-8">
                <h3 className="text-xs tracking-widest uppercase mb-4">Product Details</h3>
                <ul className="space-y-2">
                  {product.details.map(d => <li key={d} className="text-sm text-gray-600 flex items-center gap-2"><span className="w-1 h-1 bg-yellow-500 rounded-full inline-block"></span>{d}</li>)}
                </ul>
              </div>
            )}
            {product.specs && (
              <div className="mt-6">
                <h3 className="text-xs tracking-widest uppercase mb-4">Specifications</h3>
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-xs font-medium">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  return { paths: products.map(p => ({ params: { slug: p.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const product = getProductBySlug(params.slug);
  return { props: { product: product || null } };
}
