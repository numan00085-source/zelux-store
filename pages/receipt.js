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

  const downloadPDF = () => {
    if (!order || !receiptRef.current) return;
    // Use a new window with light theme for reliable PDF printing across all devices.
    // Dark backgrounds don't render reliably in browser print dialogs, so we
    // inject the receipt HTML into a white-themed print window instead.
    const el = receiptRef.current;
    const items = order.itemsSummary
      ? order.itemsSummary.split(';;').map(s => s.trim()).filter(Boolean)
      : [order.productName];
    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const edd = new Date(date);
    edd.setDate(edd.getDate() + 12);
    const eddStr = edd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ZELUX Receipt - ${order.trackingNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111; padding: 32px; max-width: 480px; margin: 0 auto; }
    .header { text-align: center; padding: 24px 0 20px; border-bottom: 2px solid #f0f0f0; margin-bottom: 20px; }
    .brand { font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #0a1628; }
    .brand-sub { font-size: 11px; color: #999; letter-spacing: 3px; margin-top: 4px; }
    .section { margin-bottom: 18px; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 5px; }
    .value { font-size: 13px; color: #111; line-height: 1.5; }
    .tracking { font-family: monospace; font-size: 15px; font-weight: 600; color: #0a3d6b; letter-spacing: 2px; }
    .status { display: inline-block; padding: 3px 12px; border-radius: 20px; background: #e8f4fd; color: #0a3d6b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .divider { border: none; border-top: 1px dashed #ddd; margin: 18px 0; }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 2px solid #111; }
    .total-label { font-size: 13px; color: #666; }
    .total-amount { font-size: 22px; font-weight: 700; color: #0a1628; }
    .item { display: flex; gap: 8px; margin-bottom: 8px; }
    .item-dot { width: 6px; height: 6px; border-radius: 50%; background: #0a3d6b; margin-top: 5px; flex-shrink: 0; }
    .item-name { font-size: 13px; color: #111; }
    .item-detail { font-size: 11px; color: #777; margin-top: 2px; }
    .footer { text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee; }
    .footer p { font-size: 10px; color: #999; line-height: 1.8; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
<div class="header">
  <div class="brand">ZELUX</div>
  <div class="brand-sub">ZELUXUS.COM</div>
</div>

<div class="section">
  <div class="label">Order Status</div>
  <span class="status">${order.status}</span>
</div>

<div class="section">
  <div class="label">Tracking Number</div>
  <div class="tracking">${order.trackingNumber}</div>
</div>

<hr class="divider">

<div class="section">
  <div class="label">Items Ordered</div>
  ${items.map(item => {
    const [name, ...rest] = item.split('|');
    const detail = rest.join('|').trim();
    return `<div class="item"><div class="item-dot"></div><div><div class="item-name">${name.trim()}</div>${detail ? `<div class="item-detail">${detail}</div>` : ''}</div></div>`;
  }).join('')}
</div>

<hr class="divider">

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">
  <div class="section" style="margin:0">
    <div class="label">Order Date</div>
    <div class="value">${dateStr}</div>
  </div>
  <div class="section" style="margin:0">
    <div class="label">Est. Delivery</div>
    <div class="value">${eddStr}</div>
  </div>
</div>

${order.address && !order.isDigitalOrder ? `<div class="section"><div class="label">Ship To</div><div class="value">${order.address}</div></div>` : ''}

<div class="section">
  <div class="label">Email</div>
  <div class="value">${order.customerEmail}</div>
</div>

<div class="total-row">
  <span class="total-label">Order Total</span>
  <span class="total-amount">$${Number(order.total).toFixed(2)}</span>
</div>

<div class="footer">
  <p>Thank you for shopping with ZELUX.<br>For support, reach us on Instagram @zelux.us<br>This is your official order receipt.</p>
</div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
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
