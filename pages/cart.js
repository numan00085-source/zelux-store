import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useCartStore } from '../lib/store';
import { useState, useEffect } from 'react';

export default function Cart() {
  const cart = useCartStore(s => s.cart);
  const removeFromCart = useCartStore(s => s.removeFromCart);
  const updateQty = useCartStore(s => s.updateQty);
  const total = useCartStore(s => s.total());
  const [hydrated, setHydrated] = useState(false);
  const [shippingConfig, setShippingConfig] = useState({ freeShippingThreshold: 150, shippingFee: 9.99 });

  useEffect(() => {
    setHydrated(true);
    fetch('/api/settings').then(r => r.json()).then(d => setShippingConfig({ freeShippingThreshold: d.freeShippingThreshold ?? 150, shippingFee: d.shippingFee ?? 9.99 })).catch(() => {});
  }, []);

  const { freeShippingThreshold, shippingFee } = shippingConfig;
  const isFree = total >= freeShippingThreshold;
  const grandTotal = isFree ? total : total + shippingFee;

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-16 min-h-screen bg-zelux-navy">
        <h1 className="font-display text-4xl font-light mb-10 text-zelux-white">Shopping Cart</h1>
        {!hydrated ? null : cart.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-zelux-gray mb-6">Your cart is empty.</p>
            <Link href="/" className="btn-glow bg-zelux-cyan text-zelux-navy px-10 py-3 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow hover:scale-105 transition-all duration-300">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-5">
              {cart.map(item => (
                <div key={item.key} className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-xl hover:border-zelux-cyan/30 transition-colors duration-300">
                  <div className="flex gap-4">
                    <img src={item.images[0]} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover bg-zelux-navy-light rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0 sm:hidden">
                      <h3 className="font-display text-base font-light text-zelux-white leading-snug">{item.name}</h3>
                      <p className="text-xs text-zelux-gray mt-1">{item.selectedVariant}</p>
                      {item.customization && (item.customization.name || item.customization.number) && (
                        <p className="text-[11px] text-zelux-cyan mt-0.5">
                          Custom: {item.customization.name} {item.customization.number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="hidden sm:block">
                      <h3 className="font-display text-lg font-light text-zelux-white">{item.name}</h3>
                      <p className="text-xs text-zelux-gray mt-1">{item.selectedVariant}</p>
                      {item.customization && (item.customization.name || item.customization.number) && (
                        <p className="text-[11px] text-zelux-cyan mt-0.5">
                          Custom: {item.customization.name} {item.customization.number}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                      <div className="flex items-center border border-zelux-gray-mid/40 rounded-lg flex-shrink-0">
                        <button onClick={() => item.quantity > 1 ? updateQty(item.key, item.quantity - 1) : removeFromCart(item.key)} className="w-9 h-9 flex items-center justify-center text-sm text-zelux-gray hover:text-zelux-cyan transition-colors">&minus;</button>
                        <span className="w-8 text-center text-sm text-zelux-white">{item.quantity}</span>
                        <button onClick={() => updateQty(item.key, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-sm text-zelux-gray hover:text-zelux-cyan transition-colors">+</button>
                      </div>
                      <span className="font-semibold text-zelux-cyan ml-auto">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.key)} className="text-xs text-zelux-gray hover:text-red-400 underline transition-colors px-1 py-1 flex-shrink-0">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-8 h-fit">
              <h2 className="font-display text-2xl font-light mb-6 text-zelux-white">Order Summary</h2>
              <div className="space-y-3 mb-6 text-zelux-gray">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span className="text-zelux-white">${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-zelux-white">{isFree ? 'Free' : `$${shippingFee.toFixed(2)}`}</span></div>
                <div className="border-t border-zelux-gray-mid/30 pt-3 flex justify-between font-medium text-zelux-white"><span>Total</span><span className="text-zelux-cyan font-semibold">${grandTotal.toFixed(2)}</span></div>
              </div>
              <Link href="/checkout" className="btn-glow block w-full bg-zelux-cyan text-zelux-navy text-center py-4 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-300">Proceed to Checkout</Link>
              <p className="text-xs text-zelux-gray text-center mt-4">Free shipping on orders over ${freeShippingThreshold}</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
