import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const featured = products.filter(p => p.featured && p.inStock !== false);
  const electronics = products.filter(p => p.category === 'electronics' && p.inStock !== false).slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=90" alt="ZELUX Hero" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="relative text-center text-white px-4 max-w-3xl mx-auto">
            <p className="text-xs tracking-widest uppercase text-yellow-400 mb-6">New Collection 2025</p>
            <h1 className="font-display text-6xl sm:text-8xl font-light tracking-widest mb-6">ZELUX</h1>
            <p className="text-sm tracking-widest uppercase text-gray-300 mb-10 font-light">Luxury Redefined</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/collections/apparel" className="bg-white text-black px-10 py-4 text-xs tracking-widest uppercase hover:bg-yellow-400 transition-colors duration-300">Shop Now</Link>
              <Link href="/collections/electronics" className="border border-white text-white px-10 py-4 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300">Electronics</Link>
            </div>
          </div>
        </section>
        <div className="bg-black text-white text-center py-3">
          <p className="text-xs tracking-widest uppercase text-gray-300">Free Shipping on Orders Over $150 · Worldwide Delivery · Secure Checkout</p>
        </div>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-yellow-600 mb-3">Curated Selection</p>
            <h2 className="font-display text-4xl font-light">Featured Pieces</h2>
          </div>
          {loading ? (
            <p className="text-center text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/collections/all" className="border border-black text-black px-10 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300">View All</Link>
          </div>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-1 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <Link href="/collections/apparel" className="relative h-96 overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=90" alt="Apparel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-8">
              <div>
                <p className="text-xs tracking-widest uppercase text-yellow-400 mb-2">Collection</p>
                <h3 className="font-display text-3xl text-white font-light">Apparel & Footwear</h3>
              </div>
            </div>
          </Link>
          <Link href="/collections/electronics" className="relative h-96 overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&q=90" alt="Electronics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-8">
              <div>
                <p className="text-xs tracking-widest uppercase text-yellow-400 mb-2">Collection</p>
                <h3 className="font-display text-3xl text-white font-light">Premium Electronics</h3>
              </div>
            </div>
          </Link>
        </section>
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs tracking-widest uppercase text-yellow-600 mb-3">Tech Essentials</p>
              <h2 className="font-display text-4xl font-light">Premium Electronics</h2>
            </div>
            {!loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {electronics.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
        <section className="bg-black text-white py-20 text-center">
          <div className="max-w-xl mx-auto px-4">
            <p className="text-xs tracking-widest uppercase text-yellow-400 mb-4">Follow the Movement</p>
            <h2 className="font-display text-4xl font-light mb-4">@zelux.us</h2>
            <p className="text-sm text-gray-400 mb-8">Join our community on Instagram for exclusive drops, styling inspiration, and direct support.</p>
            <a href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 text-xs tracking-widest uppercase hover:bg-yellow-400 transition-colors duration-300">Follow @zelux.us</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
