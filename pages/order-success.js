import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '../lib/store';

export default function OrderSuccess() {
  const clearCart = useCartStore(s => s.clearCart);
  useEffect(() => { clearCart(); }, []);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-light mb-4">Order Confirmed</h1>
          <p className="text-gray-500 mb-3 text-sm">Thank you for your purchase. Your order is being prepared with care.</p>
          <p className="text-gray-400 text-xs mb-8">Track your order status in your profile, or reach out to us on Instagram @zelux.us for any inquiries.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile" className="bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-yellow-500 hover:text-black transition-colors">My Orders</Link>
            <Link href="/" className="border border-black text-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors">Continue Shopping</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
