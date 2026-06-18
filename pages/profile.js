import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useAuthStore, useWishlistStore } from '../lib/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const STATUS_STAGES = ['Processing', 'Shipped', 'Delivery', 'Delivered'];

function TrackingTimeline({ status }) {
  const idx = STATUS_STAGES.indexOf(status);
  return (
    <div className="flex items-center gap-0 mt-3">
      {STATUS_STAGES.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${i <= idx ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
            {i < idx ? '✓' : i + 1}
          </div>
          <div className="flex-col items-center hidden sm:flex ml-1 mr-1">
            <span className={`text-xs ${i <= idx ? 'text-black font-medium' : 'text-gray-400'}`}>{s}</span>
          </div>
          {i < STATUS_STAGES.length - 1 && <div className={`flex-1 h-px mx-1 ${i < idx ? 'bg-black' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const orders = useAuthStore(s => s.orders);
  const logout = useAuthStore(s => s.logout);
  const wishlist = useWishlistStore(s => s.wishlist);
  const toggle = useWishlistStore(s => s.toggle);
  const router = useRouter();
  const [tab, setTab] = useState('orders');
  const [liveOrders, setLiveOrders] = useState([]);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(setLiveOrders).catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-16 min-h-screen">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">Welcome back</p>
            <h1 className="font-display text-4xl font-light">{user.name}</h1>
          </div>
          <button onClick={() => { logout(); router.push('/'); }} className="text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors border border-gray-200 px-4 py-2">Sign Out</button>
        </div>

        <div className="flex border-b border-gray-100 mb-10">
          {['orders','wishlist','support'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`mr-8 pb-3 text-xs tracking-widest uppercase transition-colors ${tab === t ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'}`}>
              {t === 'orders' ? 'My Orders' : t === 'wishlist' ? 'Wishlist' : 'Support'}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div>
            {liveOrders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-6">No orders yet.</p>
                <Link href="/collections/all" className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {liveOrders.map(order => (
                  <div key={order.id} className="border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-400 tracking-wider mb-1">Order {order.id}</p>
                        <p className="font-medium text-sm">{order.productName}</p>
                        {order.variant && <p className="text-xs text-gray-400 mt-1">Variant: {order.variant}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total}</p>
                        <span className="text-xs bg-black text-white px-2 py-1 mt-1 inline-block">{order.status}</span>
                      </div>
                    </div>
                    <TrackingTimeline status={order.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-6">Your wishlist is empty.</p>
                <Link href="/collections/all" className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors">Browse Collections</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.map(item => (
                  <div key={item.id} className="relative group">
                    <Link href={`/products/${item.slug}`}>
                      <img src={item.images[0]} alt={item.name} className="w-full aspect-square object-cover bg-gray-50" />
                      <p className="font-display text-base mt-2">{item.name}</p>
                      <p className="text-sm font-medium mt-1">${item.price}</p>
                    </Link>
                    <button onClick={() => toggle(item)} className="absolute top-2 right-2 w-7 h-7 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'support' && (
          <div className="max-w-lg">
            <div className="bg-gray-50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Customer Support</p>
                  <p className="text-xs text-gray-500">Instagram Direct Message</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                For any inquiries, order updates, or assistance, our customer support is handled exclusively via Instagram. Please reach out to us directly at <strong>@zelux.us</strong>.
              </p>
              <a href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors">
                Message @zelux.us →
              </a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
