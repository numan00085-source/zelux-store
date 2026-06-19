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
    <div className="flex items-center mt-4">
      {STATUS_STAGES.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-500 ${i <= idx ? 'bg-zelux-cyan text-zelux-navy shadow-glow-sm' : 'bg-zelux-gray-light text-zelux-gray'}`}>
            {i < idx ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : i + 1}
            {i === idx && <span className="absolute inset-0 rounded-full bg-zelux-cyan animate-ping opacity-40"></span>}
          </div>
          <div className="hidden sm:flex flex-col ml-2 mr-2">
            <span className={`text-xs whitespace-nowrap ${i <= idx ? 'text-zelux-white font-medium' : 'text-zelux-gray'}`}>{s}</span>
          </div>
          {i < STATUS_STAGES.length - 1 && <div className={`flex-1 h-px mx-1 transition-colors duration-500 ${i < idx ? 'bg-zelux-cyan' : 'bg-zelux-gray-mid'}`} />}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, subtitle, ctaLabel, ctaHref }) {
  return (
    <div className="text-center py-20 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full border border-zelux-gray-mid/50 flex items-center justify-center">
        <svg className="w-7 h-7 text-zelux-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d={icon} /></svg>
      </div>
      <p className="text-zelux-white font-medium mb-1">{title}</p>
      <p className="text-zelux-gray text-sm mb-6">{subtitle}</p>
      <Link href={ctaHref} className="btn-glow inline-block bg-zelux-cyan text-zelux-navy px-8 py-3 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow hover:scale-105 transition-all duration-300">
        {ctaLabel}
      </Link>
    </div>
  );
}

export default function Profile() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const wishlist = useWishlistStore(s => s.wishlist);
  const toggle = useWishlistStore(s => s.toggle);
  const router = useRouter();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (hydrated && !user) router.push('/login'); }, [user, hydrated]);
  useEffect(() => { fetch('/api/orders').then(r => r.json()).then(setOrders).catch(() => {}); }, []);

  if (!hydrated || !user) return (
    <>
      <Navbar />
      <div className="pt-32 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zelux-cyan/30 border-t-zelux-cyan rounded-full animate-spin"></div>
      </div>
    </>
  );

  const myOrders = orders.filter(o => o.customerEmail === user.email);
  const initials = (user.name || user.email || 'U').slice(0, 1).toUpperCase();

  const tabs = [
    { id: 'orders', label: 'Orders', count: myOrders.length },
    { id: 'wishlist', label: 'Wishlist', count: wishlist.length },
    { id: 'support', label: 'Support' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-zelux-navy">

        {/* Profile Hero Banner */}
        <div className="relative bg-zelux-navy-light border-b border-zelux-gray-mid/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-zelux-cyan/5 rounded-full blur-3xl"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative">
            <div className="flex items-center gap-5 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zelux-cyan to-zelux-cyan-dark flex items-center justify-center text-zelux-navy font-display text-2xl font-semibold shadow-glow">
                {initials}
              </div>
              <div className="flex-1">
                <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-1">Welcome back</p>
                <h1 className="font-display text-3xl sm:text-4xl font-light text-zelux-white">{user.name}</h1>
                <p className="text-xs text-zelux-gray mt-1">{user.email}</p>
              </div>
              <button onClick={() => { logout(); router.push('/'); }} className="hidden sm:block text-xs tracking-widest uppercase text-zelux-gray hover:text-zelux-cyan transition-colors border border-zelux-gray-mid/50 hover:border-zelux-cyan/50 px-5 py-2.5 rounded-full">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          {/* Tabs */}
          <div className="flex gap-2 mb-10 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase rounded-full whitespace-nowrap transition-all duration-300 ${tab === t.id ? 'bg-zelux-cyan text-zelux-navy shadow-glow-sm font-semibold' : 'text-zelux-gray border border-zelux-gray-mid/40 hover:border-zelux-cyan/40 hover:text-zelux-cyan'}`}>
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center ${tab === t.id ? 'bg-zelux-navy text-zelux-cyan' : 'bg-zelux-gray-light text-zelux-gray'}`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="animate-fade-in">
              {myOrders.length === 0 ? (
                <EmptyState
                  icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  title="No orders yet"
                  subtitle="Your future purchases will appear here with live tracking."
                  ctaLabel="Start Shopping"
                  ctaHref="/collections/all"
                />
              ) : (
                <div className="space-y-5">
                  {myOrders.map(order => (
                    <div key={order.id} className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-6 hover:border-zelux-cyan/30 transition-colors duration-300">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div>
                          <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1">Order {order.id}</p>
                          <p className="font-medium text-sm text-zelux-white">{order.productName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-zelux-cyan">${order.total}</p>
                          <span className="text-[10px] bg-zelux-cyan/10 text-zelux-cyan border border-zelux-cyan/30 px-2.5 py-1 rounded-full mt-1 inline-block tracking-wide">{order.status}</span>
                        </div>
                      </div>
                      <TrackingTimeline status={order.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          {tab === 'wishlist' && (
            <div className="animate-fade-in">
              {wishlist.length === 0 ? (
                <EmptyState
                  icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  title="Your wishlist is empty"
                  subtitle="Save pieces you love and revisit them anytime."
                  ctaLabel="Browse Collections"
                  ctaHref="/collections/all"
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlist.map(item => (
                    <div key={item.id} className="relative group card-lift">
                      <Link href={`/products/${item.slug}`}>
                        <div className="rounded-xl overflow-hidden bg-zelux-navy-card border border-zelux-gray-mid/30">
                          <img src={item.images[0]} alt={item.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <p className="font-display text-base mt-2 text-zelux-white truncate">{item.name}</p>
                        <p className="text-sm font-semibold text-zelux-cyan mt-1">${item.price}</p>
                      </Link>
                      <button onClick={() => toggle(item)} className="absolute top-2 right-2 w-7 h-7 bg-zelux-navy/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-zelux-gray-mid/40">
                        <svg className="w-3.5 h-3.5 text-zelux-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUPPORT */}
          {tab === 'support' && (
            <div className="max-w-lg animate-fade-in">
              <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-zelux-cyan/5 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3 mb-6 relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-zelux-cyan to-zelux-cyan-dark rounded-full flex items-center justify-center shadow-glow-sm">
                    <svg className="w-5 h-5 text-zelux-navy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-zelux-white">Customer Support</p>
                    <p className="text-xs text-zelux-gray">Instagram Direct Message</p>
                  </div>
                </div>
                <p className="text-sm text-zelux-gray leading-relaxed mb-6 relative">
                  For any inquiries, order updates, or assistance, our customer support is handled exclusively via Instagram. Please reach out to us directly at <strong className="text-zelux-cyan">@zelux.us</strong>.
                </p>
                <a href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer"
                  className="btn-glow relative inline-flex items-center gap-2 bg-zelux-cyan text-zelux-navy px-8 py-3 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow hover:scale-105 transition-all duration-300">
                  Message @zelux.us &rarr;
                </a>
              </div>
            </div>
          )}

          <button onClick={() => { logout(); router.push('/'); }} className="sm:hidden mt-8 w-full text-xs tracking-widest uppercase text-zelux-gray hover:text-zelux-cyan transition-colors border border-zelux-gray-mid/50 px-5 py-3 rounded-full">
            Sign Out
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
