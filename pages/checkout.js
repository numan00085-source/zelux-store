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
  // If every item in the cart is a digital asset, address/country become
  // optional rather than required - per explicit decision, email is what
  // actually matters for delivery here, not a shipping address. A MIXED
  // cart (some physical, some digital) still requires the full address,
  // since at least one item genuinely needs to ship.
  const isAllDigitalCart = cart.length > 0 && cart.every(item => item.isDigital);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: '' });
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
    if (!form.name || !form.email) { setError('Please fill in all required fields.'); return; }
    if (!isAllDigitalCart) {
      if (!form.address) { setError('Please fill in all required fields.'); return; }
      if (!form.country) { setError('Please select a shipping country.'); return; }
      if (!form.phone) { setError('Please enter your phone number.'); return; }
      if (!form.zip) { setError('Please enter your ZIP / postal code.'); return; }
    }
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

  // Real bug fixed here: this line previously computed shipping purely from
  // the free-shipping threshold, never checking isAllDigitalCart at all -
  // meaning a digital-only order (correctly shown as "N/A" on the cart page)
  // would still get charged a real shipping fee at checkout and at payment,
  // contradicting what cart.js already showed the customer. isAllDigitalCart
  // must come first in this check, not be layered on top of it.
  const shipping = isAllDigitalCart ? 0 : (total >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.shippingFee);
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

  const inputCls = "w-full bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-xl px-4 py-3 text-sm text-zelux-white outline-none focus:border-zelux-cyan transition-colors placeholder-zelux-gray/40";
  const labelCls = "block text-[10px] text-zelux-gray tracking-widest uppercase mb-1.5";

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-zelux-navy">
        {/* Header bar */}
        <div className="border-b border-zelux-gray-mid/20 bg-zelux-navy-light/30">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="font-display text-xl font-light text-zelux-white">Checkout</h1>
            <div className="flex items-center gap-1.5 text-[11px] text-zelux-gray">
              <svg className="w-3.5 h-3.5 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              SSL Secured by Stripe
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT — form */}
            <div className="lg:col-span-3 space-y-6">

              {isAllDigitalCart && (
                <div className="flex items-center gap-2 text-xs text-zelux-cyan bg-zelux-cyan/10 border border-zelux-cyan/30 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25m-18 0v.243a2.25 2.25 0 001.183 1.981l7.5 4.219a2.25 2.25 0 002.234 0l7.5-4.219A2.25 2.25 0 0021 8.493V8.25" /></svg>
                  Digital order — delivered to your email instantly
                </div>
              )}

              {/* Saved address picker */}
              {!isAllDigitalCart && savedAddresses.length > 0 && (
                <div>
                  <label className={labelCls}>Use Saved Address</label>
                  <select value={selectedAddressId} onChange={e => applySavedAddress(e.target.value)} className={inputCls}>
                    <option value="">Enter a new address</option>
                    {savedAddresses.map(a => (
                      <option key={a.id} value={a.id}>{a.label ? `${a.label} — ` : ''}{a.address}, {a.city}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Contact */}
              <div className="bg-zelux-navy-card border border-zelux-gray-mid/20 rounded-2xl p-5">
                <p className="text-[10px] tracking-widest uppercase text-zelux-cyan mb-4">Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input name="name" type="text" value={form.name} onChange={handleChange} className={inputCls} placeholder="John Smith" autoComplete="name" />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls} placeholder="you@email.com" autoComplete="email" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              {!isAllDigitalCart && (
                <div className="bg-zelux-navy-card border border-zelux-gray-mid/20 rounded-2xl p-5">
                  <p className="text-[10px] tracking-widest uppercase text-zelux-cyan mb-4">Shipping Address</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputCls} placeholder="+1 555 000 0000" autoComplete="tel" />
                      </div>
                      <div>
                        <label className={labelCls}>ZIP / Postal Code</label>
                        <input name="zip" type="text" value={form.zip} onChange={handleChange} className={inputCls} placeholder="10001" autoComplete="postal-code" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Street Address</label>
                      <input name="address" type="text" value={form.address} onChange={handleChange} className={inputCls} placeholder="123 Main St, Apt 4B" autoComplete="street-address" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>City</label>
                        <input name="city" type="text" value={form.city} onChange={handleChange} className={inputCls} placeholder="New York" autoComplete="address-level2" />
                      </div>
                      <div>
                        <label className={labelCls}>State</label>
                        <input name="state" type="text" value={form.state} onChange={handleChange} className={inputCls} placeholder="NY" autoComplete="address-level1" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <CountrySelect value={form.country} onChange={code => setForm({ ...form, country: code })} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT — order summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-zelux-navy-card border border-zelux-gray-mid/20 rounded-2xl p-5">
                  <p className="text-[10px] tracking-widest uppercase text-zelux-cyan mb-4">Your Order</p>
                  <div className="space-y-2 mb-4">
                    {cart.map(i => (
                      <div key={i.key} className="flex justify-between text-sm py-1.5 border-b border-zelux-gray-mid/10 last:border-0">
                        <span className="text-zelux-gray truncate mr-2">{i.name} <span className="text-zelux-gray/60">×{i.quantity}</span></span>
                        <span className="text-zelux-white flex-shrink-0">${(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-zelux-gray-mid/20 pt-3 space-y-2 mb-5">
                    <div className="flex justify-between text-sm text-zelux-gray">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zelux-gray">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-emerald-400' : 'text-zelux-white'}>
                        {isAllDigitalCart ? 'Free (digital)' : shipping === 0 ? 'Free' : `$${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold text-zelux-white pt-1 border-t border-zelux-gray-mid/20">
                      <span>Total</span>
                      <span className="text-zelux-cyan">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={handleSubmit} disabled={loading || cart.length === 0}
                    className="btn-glow w-full bg-zelux-cyan text-zelux-navy py-4 text-sm tracking-widest uppercase font-bold rounded-xl hover:shadow-glow-lg hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:scale-100">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-zelux-navy/30 border-t-zelux-navy rounded-full animate-spin"></span>
                        Processing...
                      </span>
                    ) : `Pay $${grandTotal.toFixed(2)}`}
                  </button>

                  <div className="flex items-center justify-center gap-3 mt-4">
                    <svg className="w-3.5 h-3.5 text-zelux-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    <p className="text-[10px] text-zelux-gray tracking-wide">Secured by Stripe · SSL Encrypted</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
