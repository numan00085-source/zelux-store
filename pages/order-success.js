import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCartStore } from '../lib/store';

export default function OrderSuccess() {
  const clearCart = useCartStore(s => s.clearCart);
  const router = useRouter();
  const [order, setOrder] = useState(null);

  useEffect(() => { clearCart(); }, []);

  useEffect(() => {
    const { session_id } = router.query;
    if (!session_id) return;
    fetch(`/api/order-by-session?session_id=${encodeURIComponent(session_id)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setOrder(data); })
      .catch(() => {});
  }, [router.query]);

  useEffect(() => {
    if (!order?.customerEmail) return;
    const edd = new Date(order.createdAt || Date.now());
    edd.setDate(edd.getDate() + 12);
    const estimatedDeliveryDate = edd.toISOString().slice(0, 10);
    const deliveryCountry = order.countryCode || 'US';
    window.renderOptIn = function () {
      window.gapi.load('surveyoptin', function () {
        window.gapi.surveyoptin.render({
          merchant_id: 5816933216,
          order_id: order.trackingNumber || 'ZELUX-ORDER',
          email: order.customerEmail,
          delivery_country: deliveryCountry,
          estimated_delivery_date: estimatedDeliveryDate,
        });
      });
    };
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch(e) {}
      delete window.renderOptIn;
    };
  }, [order]);

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 bg-zelux-navy relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-zelux-cyan/8 rounded-full blur-3xl"></div>
        <div className="text-center max-w-md relative animate-scale-in">
          <div className="w-16 h-16 bg-zelux-cyan rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-lg">
            <svg className="w-8 h-8 text-zelux-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-4xl font-light mb-4 text-zelux-white glow-text">Order Confirmed</h1>
          <p className="text-zelux-gray mb-3 text-sm">Thank you for your purchase. Your order is being prepared with care.</p>
          <p className="text-zelux-gray text-xs mb-8">Track your order status in your profile, or reach out to us on Instagram @zelux.us for any inquiries.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile" className="btn-glow bg-zelux-cyan text-zelux-navy px-8 py-3 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow hover:scale-105 transition-all duration-300">My Orders</Link>
            <Link href="/" className="border border-zelux-gray-mid/40 text-zelux-white px-8 py-3 text-xs tracking-widest uppercase rounded-full hover:border-zelux-cyan/50 hover:text-zelux-cyan transition-all duration-300">Continue Shopping</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
