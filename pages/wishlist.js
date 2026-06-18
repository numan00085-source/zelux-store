import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useWishlistStore } from '../lib/store';

export default function Wishlist() {
  const wishlist = useWishlistStore(s => s.wishlist);
  const toggle = useWishlistStore(s => s.toggle);
  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-16 min-h-screen">
        <h1 className="font-display text-4xl font-light mb-10">Wishlist</h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">Your wishlist is empty.</p>
            <Link href="/collections/all" className="bg-black text-white px-10 py-3 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors">Browse Collections</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="group relative">
                <Link href={`/products/${item.slug}`}>
                  <img src={item.images[0]} alt={item.name} className="w-full aspect-[3/4] object-cover bg-gray-50" />
                  <h3 className="font-display text-lg mt-3">{item.name}</h3>
                  <p className="text-sm font-medium mt-1">${item.price}</p>
                </Link>
                <button onClick={() => toggle(item)} className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
