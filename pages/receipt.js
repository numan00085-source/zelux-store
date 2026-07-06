import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../lib/store';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ReceiptDocument({ order, onDownload }) {
  const items = order.itemsSummary
    ? order.itemsSummary.split(';;').map(s => s.trim()).filter(Boolean)
    : [order.productName];

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const edd = new Date(date);
  edd.setDate(edd.getDate() + 12);
  const eddStr = edd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const statusColors = {
    'Processing': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    'Shipped': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'Delivery': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Delivered': 'bg-green-500/10 text-green-400 border-green-500/30',
  };

  return (
    <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-3xl overflow-hidden max-w-lg w-full mx-auto">

      {/* Header */}
      <div className="relative px-8 pt-8 pb-6 text-center" style={{background: 'linear-gradient(135deg, #060B16 0%, #0A1628 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'linear-gradient(#3FD8F2 1px, transparent 1px), linear-gradient(90deg, #3FD8F2 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-zelux-cyan/10 border border-zelux-cyan/30 flex items-center justify-center mx-auto mb-3">
            <span className="font-display text-2xl text-zelux-cyan font-bold">Z</span>
          </div>
          <p className="font-display text-xl tracking-widest text-zelux-white mb-0.5">ZELUX</p>
          <p className="text-[10px] tracking-widest uppercase text-zelux-gray">zeluxus.com</p>
        </div>
      </div>

      {/* Divider with dots */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-dashed border-zelux-gray-mid/40"></div>
        <div className="w-5 h-5 rounded-full bg-zelux-navy -ml-2.5 -mr-2.5 z-10 flex-shrink-0 border border-zelux-gray-mid/30"></div>
        <div className="flex-1 border-t border-dashed border-zelux-gray-mid/40"></div>
      </div>

      {/* Receipt body */}
      <div className="px-8 py-6 space-y-5">

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zelux-gray tracking-wide">Order Status</span>
          <span className={`text-[11px] px-3 py-1 rounded-full border font-medium tracking-wide ${statusColors[order.status] || 'bg-zelux-cyan/10 text-zelux-cyan border-zelux-cyan/30'}`}>
            {order.status}
          </span>
        </div>

        {/* Tracking */}
        <div>
          <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1.5">Tracking Number</p>
          <p className="font-mono text-zelux-cyan text-sm font-semibold tracking-wider">{order.trackingNumber}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-zelux-gray-mid/20"></div>

        {/* Items */}
        <div>
          <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-3">Items Ordered</p>
          <div className="space-y-2.5">
            {items.map((item, i) => {
              const [name, ...rest] = item.split('|');
              const details = rest.join('|').trim();
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zelux-cyan mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-zelux-white leading-snug">{name.trim()}</p>
                    {details && <p className="text-xs text-zelux-gray mt-0.5">{details}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-zelux-gray-mid/20"></div>

        {/* Order details grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1">Order Date</p>
            <p className="text-xs text-zelux-white">{dateStr}</p>
            <p className="text-[10px] text-zelux-gray">{timeStr}</p>
          </div>
          <div>
            <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1">Est. Delivery</p>
            <p className="text-xs text-zelux-white">{eddStr}</p>
            <p className="text-[10px] text-zelux-gray">{order.isDigitalOrder ? 'Via Email' : 'Standard Shipping'}</p>
          </div>
          {order.address && !order.isDigitalOrder && (
            <div className="col-span-2">
              <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1">Ship To</p>
              <p className="text-xs text-zelux-white leading-relaxed">{order.address}</p>
            </div>
          )}
          <div className="col-span-2">
            <p className="text-[10px] text-zelux-gray tracking-widest uppercase mb-1">Contact</p>
            <p className="text-xs text-zelux-white">{order.customerEmail}</p>
          </div>
        </div>

        <div className="border-t border-zelux-gray-mid/20"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zelux-gray">Order Total</p>
          <p className="text-xl font-semibold text-zelux-cyan">${Number(order.total).toFixed(2)}</p>
        </div>

      </div>

      {/* Ticket-style bottom divider */}
      <div className="relative flex items-center">
        <div className="w-5 h-5 rounded-full bg-zelux-navy -ml-2.5 -mr-2.5 z-10 flex-shrink-0 border border-zelux-gray-mid/30"></div>
        <div className="flex-1 border-t border-dashed border-zelux-gray-mid/40"></div>
        <div className="w-5 h-5 rounded-full bg-zelux-navy -ml-2.5 -mr-2.5 z-10 flex-shrink-0 border border-zelux-gray-mid/30"></div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 text-center">
        <p className="text-[10px] text-zelux-gray leading-relaxed mb-1">Thank you for shopping with ZELUX. For support, reach us on Instagram @zelux.us</p>
        <p className="text-[10px] text-zelux-gray/50">This is your official order receipt. Keep it for your records.</p>
        <button onClick={onDownload}
          className="mt-4 flex items-center gap-2 mx-auto text-xs text-zelux-cyan hover:text-zelux-cyan-light transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Download Receipt (PDF)
        </button>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  const user = useAuthStore(s => s.user);
  const [tracking, setTracking] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const receiptRef = useRef(null);

  const lookup = async () => {
    if (!tracking.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/receipt?tracking=${encodeURIComponent(tracking.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found.');
      setOrder(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    if (!order) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const el = receiptRef.current;
      await html2pdf().set({
        margin: 0,
        filename: `ZELUX-Receipt-${order.trackingNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#060B16' },
        jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
      }).from(el).save();
    } catch {
      window.print();
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-zelux-navy flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-zelux-cyan/10 border border-zelux-cyan/30 flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 className="font-display text-2xl text-zelux-white mb-3">Login Required</h1>
            <p className="text-sm text-zelux-gray mb-6">Sign in to access your ZELUX receipts and order history.</p>
            <Link href="/login" className="btn-glow bg-zelux-cyan text-zelux-navy px-8 py-3 text-xs tracking-widest uppercase font-semibold rounded-full">
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-zelux-navy px-4 py-12">
        <div className="max-w-lg mx-auto">

          {/* Page header */}
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-2">ZELUX</p>
            <h1 className="font-display text-3xl font-light text-zelux-white mb-3">Order Receipt</h1>
            <p className="text-sm text-zelux-gray leading-relaxed">
              Enter your tracking number to view and download your official ZELUX receipt.
            </p>
          </div>

          {/* Search */}
          <div className="flex gap-2 mb-8">
            <input
              value={tracking}
              onChange={e => setTracking(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && lookup()}
              placeholder="ZELUX-XXXXXXX"
              className="flex-1 bg-zelux-navy-card border border-zelux-gray-mid/40 rounded-full px-5 py-3 text-sm text-zelux-white placeholder-zelux-gray outline-none focus:border-zelux-cyan transition-colors font-mono tracking-wider"
            />
            <button onClick={lookup} disabled={loading || !tracking.trim()}
              className="bg-zelux-cyan text-zelux-navy px-6 py-3 rounded-full text-xs tracking-widest uppercase font-semibold hover:shadow-glow transition-all disabled:opacity-40">
              {loading ? '...' : 'Track'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-sm text-red-400 text-center mb-6">
              {error}
            </div>
          )}

          {/* Receipt */}
          {order && (
            <div ref={receiptRef}>
              <ReceiptDocument order={order} onDownload={downloadPDF} />
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
