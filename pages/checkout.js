import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCartStore, useAuthStore } from '../lib/store';

export default function Checkout() {
  const cart = useCartStore(s => s.cart);
  const total = useCartStore(s => s.total());
  const clearCart = useCartStore(s => s.clearCart);
  const addOrder = useAuthStore(s => s.addOrder);
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', state: '', zip: '', country: 'US' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.address) { setError('Please fill in all required fields.'); return; }
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

  const shipping = total >= 150 ? 0 : 9.99;
  const grandTotal = total + shipping;

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-16 min-h-screen">
        <h1 className="font-display text-4xl font-light mb-10">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xs tracking-widest uppercase mb-6">Shipping Information</h2>
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
                  <label className="text-xs text-gray-500 tracking-wider block mb-1">{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                    className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors" />
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
          <div>
            <h2 className="text-xs tracking-widest uppercase mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cart.map(i => (
                <div key={i.key} className="flex justify-between text-sm py-2 border-b border-gray-50">
                  <span className="text-gray-600">{i.name} × {i.quantity} <span className="text-xs text-gray-400">({i.selectedVariant})</span></span>
                  <span>${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span></div>
              <div className="flex justify-between font-medium text-lg border-t border-gray-200 pt-3"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={handleSubmit} disabled={loading || cart.length === 0}
              className="w-full bg-black text-white py-4 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
            </button>
            <div className="flex items-center justify-center gap-2 mt-4">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <p className="text-xs text-gray-400">Secured by Stripe · SSL Encrypted</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
