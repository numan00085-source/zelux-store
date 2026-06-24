import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import CountrySelect, { SHIPPING_COUNTRIES } from '../components/CountrySelect';
import { useAuthStore, useWishlistStore } from '../lib/store';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';

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
  const [expandedOrderTracking, setExpandedOrderTracking] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Customer support chat state
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportUploading, setSupportUploading] = useState(false);
  const [supportSending, setSupportSending] = useState(false);
  const supportFileInputRef = useRef(null);
  const supportEndRef = useRef(null);

  // Address book state
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: '', fullName: '', address: '', city: '', state: '', zip: '', country: '' });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (hydrated && !user) router.push('/login'); }, [user, hydrated]);
  // Fetches only this user's own orders - the API requires an email and
  // filters server-side, rather than the previous approach of fetching every
  // customer's orders and filtering client-side (a real privacy gap, since
  // every signed-in user's browser would have received every other
  // customer's name, address, and email just to filter them out locally).
  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`).then(r => r.json()).then(setOrders).catch(() => {});
  }, [user]);

  const loadSupportMessages = () => {
    if (!user) return;
    fetch(`/api/support?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(convo => setSupportMessages(convo.messages || []))
      .catch(() => {});
  };

  const loadAddresses = () => {
    if (!user) return;
    fetch(`/api/addresses?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(setAddresses)
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    loadSupportMessages();
    loadAddresses();
    // Mark conversation as read by the customer, and poll for new admin replies
    fetch('/api/support', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email }) }).catch(() => {});
    const interval = setInterval(loadSupportMessages, 8000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (tab === 'support') supportEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages, tab]);

  const handleSendSupportMessage = async () => {
    if (!supportInput.trim() || !user) return;
    setSupportSending(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, text: supportInput.trim() }),
      });
      const convo = await res.json();
      if (convo.messages) setSupportMessages(convo.messages);
      setSupportInput('');
    } catch (e) {}
    setSupportSending(false);
  };

  const handleSupportImageSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSupportUploading(true);
    try {
      const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
      const ext = extMatch ? extMatch[0] : '.jpg';
      const safeFilename = `support-${Date.now()}${ext}`;

      const uploadRes = await fetch('/api/support-upload', {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream', 'x-filename': safeFilename },
        body: file,
      });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        const res = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, imageUrl: uploadData.url }),
        });
        const convo = await res.json();
        if (convo.messages) setSupportMessages(convo.messages);
      }
    } catch (e) {}
    setSupportUploading(false);
    if (supportFileInputRef.current) supportFileInputRef.current.value = '';
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.address || !addressForm.city || !addressForm.country) return;
    setSavingAddress(true);
    try {
      const payload = editingAddress ? { ...addressForm, id: editingAddress.id } : addressForm;
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, address: payload }),
      });
      const updated = await res.json();
      setAddresses(updated);
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ label: '', fullName: '', address: '', city: '', state: '', zip: '', country: '' });
    } catch (e) {}
    setSavingAddress(false);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Remove this saved address?')) return;
    const res = await fetch('/api/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, addressId }),
    });
    const updated = await res.json();
    setAddresses(updated);
  };

  // Resolves a saved address's country to a readable name. New addresses
  // store the ISO code (via CountrySelect), but older addresses saved before
  // this dropdown existed may have free-text values - falling back to the
  // raw value keeps those still displaying something sensible.
  const countryDisplayName = (value) => {
    const match = SHIPPING_COUNTRIES.find(c => c.code === value);
    return match ? match.name : value;
  };

  const startEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({ label: addr.label || '', fullName: addr.fullName || '', address: addr.address || '', city: addr.city || '', state: addr.state || '', zip: addr.zip || '', country: addr.country || '' });
    setShowAddressForm(true);
  };

  if (!hydrated || !user) return (
    <>
      <Navbar />
      <div className="pt-32 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zelux-cyan/30 border-t-zelux-cyan rounded-full animate-spin"></div>
      </div>
    </>
  );

  // No client-side filter needed - /api/orders already scopes results to
  // this user's email server-side.
  const myOrders = orders;
  const initials = (user.name || user.email || 'U').slice(0, 1).toUpperCase();

  const tabs = [
    { id: 'orders', label: 'Orders', count: myOrders.length },
    { id: 'wishlist', label: 'Wishlist', count: wishlist.length },
    { id: 'addresses', label: 'Addresses' },
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
                  {myOrders.map(order => {
                    const isExpanded = expandedOrderTracking === order.trackingNumber;
                    return (
                      <div key={order.trackingNumber || order.id} className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-6 hover:border-zelux-cyan/30 transition-colors duration-300">
                        <button
                          onClick={() => setExpandedOrderTracking(isExpanded ? null : order.trackingNumber)}
                          className="w-full text-left"
                        >
                          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                            <div>
                              <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1">
                                {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : `Order ${order.id}`}
                              </p>
                              <p className="font-medium text-sm text-zelux-white">{order.productName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-zelux-cyan">${order.total}</p>
                              <span className="text-[10px] bg-zelux-cyan/10 text-zelux-cyan border border-zelux-cyan/30 px-2.5 py-1 rounded-full mt-1 inline-block tracking-wide">{order.status}</span>
                            </div>
                          </div>
                          <TrackingTimeline status={order.status} />
                        </button>

                        {isExpanded && (
                          <div className="mt-5 pt-5 border-t border-zelux-gray-mid/20 space-y-3 animate-fade-in">
                            <p className="text-[10px] text-zelux-gray uppercase tracking-widest">Tracking Updates</p>
                            <div className="space-y-2">
                              {(order.statusHistory || []).slice().reverse().map((entry, i) => (
                                <div key={i} className="flex items-start gap-3 bg-zelux-navy-light/40 border border-zelux-gray-mid/20 rounded-xl px-4 py-3">
                                  <span className="w-2 h-2 rounded-full bg-zelux-cyan mt-1.5 flex-shrink-0"></span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zelux-white font-medium">{entry.status}</p>
                                    {entry.caption && <p className="text-xs text-zelux-gray mt-0.5">{entry.caption}</p>}
                                    <p className="text-[10px] text-zelux-gray mt-1">{new Date(entry.updatedAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {order.address && (
                              <div className="text-xs text-zelux-gray pt-2">
                                <span className="block text-[10px] uppercase tracking-widest mb-1">Shipping To</span>
                                <span className="text-zelux-white">{order.address}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

          {/* ADDRESSES */}
          {tab === 'addresses' && (
            <div className="max-w-2xl animate-fade-in">
              {!showAddressForm && (
                <div className="flex justify-end mb-5">
                  <button onClick={() => { setEditingAddress(null); setAddressForm({ label: '', fullName: '', address: '', city: '', state: '', zip: '', country: '' }); setShowAddressForm(true); }}
                    className="btn-glow bg-zelux-cyan text-zelux-navy px-6 py-2.5 rounded-full text-xs tracking-widest uppercase font-semibold hover:shadow-glow transition-all">
                    + Add Address
                  </button>
                </div>
              )}

              {showAddressForm && (
                <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-6 mb-6 animate-scale-in">
                  <h3 className="font-display text-xl text-zelux-white mb-4">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Label (e.g. Home, Office)"
                      className="bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan sm:col-span-2" />
                    <input value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} placeholder="Full Name *"
                      className="bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan sm:col-span-2" />
                    <input value={addressForm.address} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} placeholder="Street Address *"
                      className="bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan sm:col-span-2" />
                    <input value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City *"
                      className="bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan" />
                    <input value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State"
                      className="bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan" />
                    <input value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} placeholder="ZIP Code"
                      className="bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan" />
                    <div className="sm:col-span-2">
                      <CountrySelect value={addressForm.country} onChange={code => setAddressForm({ ...addressForm, country: code })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-5">
                    <button onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="text-xs text-zelux-gray hover:text-zelux-white transition-colors px-4">Cancel</button>
                    <button onClick={handleSaveAddress} disabled={savingAddress}
                      className="btn-glow bg-zelux-cyan text-zelux-navy px-8 py-2.5 rounded-full text-xs tracking-widest uppercase font-semibold hover:shadow-glow transition-all disabled:opacity-50">
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </div>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <EmptyState
                  icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  title="No saved addresses"
                  subtitle="Add an address to make checkout faster next time."
                  ctaLabel="Start Shopping"
                  ctaHref="/collections/all"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-5 hover:border-zelux-cyan/30 transition-colors duration-300">
                      {addr.label && <span className="text-[10px] bg-zelux-cyan/10 text-zelux-cyan border border-zelux-cyan/30 px-2.5 py-1 rounded-full tracking-wide uppercase">{addr.label}</span>}
                      <p className="text-sm font-medium text-zelux-white mt-2">{addr.fullName}</p>
                      <p className="text-xs text-zelux-gray mt-1 leading-relaxed">{addr.address}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}</p>
                      <p className="text-xs text-zelux-gray">{countryDisplayName(addr.country)}</p>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => startEditAddress(addr)} className="text-xs text-zelux-cyan hover:text-zelux-cyan-light underline">Edit</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-zelux-gray hover:text-red-400 underline">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUPPORT */}
          {tab === 'support' && (
            <div className="max-w-2xl animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-8 relative overflow-hidden h-fit">
                <div className="absolute top-0 right-0 w-32 h-32 bg-zelux-cyan/5 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3 mb-6 relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-zelux-cyan to-zelux-cyan-dark rounded-full flex items-center justify-center shadow-glow-sm">
                    <svg className="w-5 h-5 text-zelux-navy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-zelux-white">Instagram Support</p>
                    <p className="text-xs text-zelux-gray">Direct Message</p>
                  </div>
                </div>
                <p className="text-sm text-zelux-gray leading-relaxed mb-6 relative">
                  For quick replies and updates, message us directly on Instagram at <strong className="text-zelux-cyan">@zelux.us</strong>.
                </p>
                <a href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer"
                  className="btn-glow relative inline-flex items-center gap-2 bg-zelux-cyan text-zelux-navy px-8 py-3 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow hover:scale-105 transition-all duration-300">
                  Message @zelux.us &rarr;
                </a>
              </div>

              <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl flex flex-col h-[480px]">
                <div className="px-6 py-4 border-b border-zelux-gray-mid/30">
                  <p className="font-medium text-sm text-zelux-white">ZELUX Support</p>
                  <p className="text-xs text-zelux-gray">We typically reply within a day</p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {supportMessages.length === 0 && (
                    <p className="text-xs text-zelux-gray text-center mt-10">Send us a message and we'll get back to you here.</p>
                  )}
                  {supportMessages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.sender === 'customer' ? 'bg-zelux-cyan text-zelux-navy' : 'bg-zelux-navy-light text-zelux-white border border-zelux-gray-mid/30'}`}>
                        {m.imageUrl && <img src={m.imageUrl} alt="attachment" className="rounded-lg mb-1.5 max-h-48 object-cover" />}
                        {m.text && <p className="text-sm leading-relaxed">{m.text}</p>}
                        <p className={`text-[10px] mt-1 ${m.sender === 'customer' ? 'text-zelux-navy/60' : 'text-zelux-gray'}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={supportEndRef}></div>
                </div>
                <div className="p-4 border-t border-zelux-gray-mid/30 flex items-center gap-2">
                  <input type="file" ref={supportFileInputRef} accept="image/*" className="hidden" onChange={handleSupportImageSelected} />
                  <button onClick={() => supportFileInputRef.current?.click()} disabled={supportUploading}
                    className="w-9 h-9 flex-shrink-0 rounded-full border border-zelux-gray-mid/40 flex items-center justify-center text-zelux-gray hover:text-zelux-cyan hover:border-zelux-cyan/50 transition-colors disabled:opacity-50">
                    {supportUploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-zelux-cyan/30 border-t-zelux-cyan rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    )}
                  </button>
                  <input value={supportInput} onChange={e => setSupportInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendSupportMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-full px-4 py-2.5 text-sm text-zelux-white outline-none focus:border-zelux-cyan" />
                  <button onClick={handleSendSupportMessage} disabled={supportSending || !supportInput.trim()}
                    className="btn-glow w-9 h-9 flex-shrink-0 rounded-full bg-zelux-cyan text-zelux-navy flex items-center justify-center hover:shadow-glow transition-all disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
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
