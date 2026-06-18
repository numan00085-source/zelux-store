import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useCartStore } from '../lib/store';

export default function Cart() {
  const cart = useCartStore(s => s.cart);
  const removeFromCart = useCartStore(s => s.removeFromCart);
  const updateQty = useCartStore(s => s.updateQty);
  const total = useCartStore(s => s.total());

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-16 min-h-screen">
        <h1 className="font-display text-4xl font-light mb-10">Shopping Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">Your cart is empty.</p>
            <Link href="/collections/all" className="bg-black text-white px-10 py-3 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {cart.map(item => (
                <div key={item.key} className="flex gap-4 py-6 border-b border-gray-100">
                  <img src={item.images[0]} alt={item.name} className="w-24 h-24 object-cover bg-gray-50" />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-light">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.selectedVariant}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => item.quantity > 1 ? updateQty(item.key, item.quantity - 1) : removeFromCart(item.key)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50">−</button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.key, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50">+</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.key)} className="text-xs text-gray-400 hover:text-black underline">Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-8 h-fit">
              <h2 className="font-display text-2xl font-light mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{total >= 150 ? 'Free' : '$9.99'}</span></div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-medium"><span>Total</span><span>${(total >= 150 ? total : total + 9.99).toFixed(2)}</span></div>
              </div>
              <Link href="/checkout" className="block w-full bg-black text-white text-center py-4 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors">Proceed to Checkout</Link>
              <p className="text-xs text-gray-400 text-center mt-4">Free shipping on orders over $150</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
