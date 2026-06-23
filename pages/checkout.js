import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CountrySelect from '../components/CountrySelect';
import { useCartStore, useAuthStore } from '../lib/store';

export default function Checkout() {
  const router = useRouter();
  const cart = useCartStore(s => s.cart);
  const total = useCartStore(s => s.total());
  const user = useAuthStore(s => s.user);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingConfig, setShippingConfig] = useState({ freeShippingThreshold: 150, shippingFee: 9.99 });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useEffect(() => { setHydrated(true); }, []);
  // Checkout requires an account, same as the support chat and address book
  // tabs in profile.js - redirect to login (preserving the intended
  // destination via ?redirect= so login.js can send them back here after).
  useEffect(() => {
    if (hydrated && !user) router.push('/login?redirect=/checkout');
  }, [user, hydrated]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setShippingConfig({ freeShippingThreshold: d.freeShippingThreshold ?? 150, shippingFee: d.shippingFee ?? 9.99 })).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm(prev => ({ ...prev, name: prev.name || user.name || '', email: prev.email || user.email || '' }));
    fetch(`/api/addresses?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(setSavedAddresses)
      .catch(() => {});
  }, [user]);

  const applySavedAddress = (id) => {
    setSelectedAddressId(id);
    const addr = savedAddresses.find(a => a.id === id);
    if (!addr) return;
    setForm(prev => ({
      ...prev,
      name: addr.fullName || prev.name,
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      country: addr.country || prev.country,
    }));
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address) { setError('Please fill in all required fields.'); return; }
    if (!form.country) { setError('Please select a shipping country.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, form, total }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || 'Something went wrong.');
    } catch (e) {
      setError('Payment failed. Please try again.');
    }
    setLoading(false);
  };

  const shipping = total >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.shippingFee;
  const grandTotal = total + shipping;

  if (!hydrated || !user) return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-zelux-navy flex items-center justify-center">
        <p className="text-zelux-gray text-sm">Redirecting to login...</p>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-16 min-h-screen bg-zelux-navy">
        <h1 className="font-display text-4xl font-light mb-10 text-zelux-white">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xs tracking-widest uppercase mb-6 text-zelux-cyan">Shipping Information</h2>
            {user && savedAddresses.length > 0 && (
              <div className="mb-6">
                <label className="text-xs text-zelux-gray tracking-wider block mb-1.5">Use a saved address</label>
                <select value={selectedAddressId} onChange={e => applySavedAddress(e.target.value)}
                  className="w-full bg-zelux-navy-card border border-zelux-gray-mid/40 rounded-lg px-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors duration-300">
                  <option value="">Enter manually</option>
                  {savedAddresses.map(a => (
                    <option key={a.id} value={a.id}>{a.label ? `${a.label} — ` : ''}{a.address}, {a.city}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-4">
              {[
                { name: 'name', label: 'Full Name *', type: 'text' },
                { name: 'email', label: 'Email Address *', type: 'email' },
                { name: 'address', label: 'Street Address *', type: 'text' },
                { name: 'city', label: 'City *', type: 'text' },
                { name: 'state', label: 'State', type: 'text' },
                { name: 'zip', label: 'ZIP Code *', type: 'text' },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs text-zelux-gray tracking-wider block mb-1.5">{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                    className="w-full bg-zelux-navy-card border border-zelux-gray-mid/40 rounded-lg px-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors duration-300" />
                </div>
              ))}
              <div>
                <label className="text-xs text-zelux-gray tracking-wider block mb-1.5">Country *</label>
                <CountrySelect value={form.country} onChange={code => setForm({ ...form, country: code })} />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </div>
          <div>
            <h2 className="text-xs tracking-widest uppercase mb-6 text-zelux-cyan">Order Summary</h2>
            <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-6">
              <div className="space-y-3 mb-6">
                {cart.map(i => (
                  <div key={i.key} className="flex justify-between text-sm py-2 border-b border-zelux-gray-mid/20 text-zelux-gray">
                    <span>{i.name} &times; {i.quantity}</span>
                    <span className="text-zelux-white">${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-zelux-gray"><span>Shipping</span><span className="text-zelux-white">{shipping === 0 ? 'Free' : `$${shipping}`}</span></div>
                <div className="flex justify-between font-medium text-lg border-t border-zelux-gray-mid/30 pt-3 text-zelux-white"><span>Total</span><span className="text-zelux-cyan font-semibold">${grandTotal.toFixed(2)}</span></div>
              </div>
              <button onClick={handleSubmit} disabled={loading || cart.length === 0}
                className="btn-glow w-full bg-zelux-cyan text-zelux-navy py-4 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50">
                {loading ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
              </button>
              <p className="text-xs text-zelux-gray text-center mt-4">Secured by Stripe &middot; SSL Encrypted</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
