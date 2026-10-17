import { useState, useEffect } from 'react';

const COLOR_MAP = {
  cyan:  { bg: 'bg-zelux-cyan/10 border-zelux-cyan/30', text: 'text-zelux-cyan', dot: 'bg-zelux-cyan' },
  gold:  { bg: 'bg-amber-400/10 border-amber-400/30',   text: 'text-amber-400',  dot: 'bg-amber-400' },
  red:   { bg: 'bg-red-500/10 border-red-500/30',       text: 'text-red-400',    dot: 'bg-red-400' },
  green: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

export default function OfferBanner() {
  const [offers, setOffers] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then(data => {
        const now = new Date();
        const active = (Array.isArray(data) ? data : []).filter(o =>
          o.active && (!o.expiresAt || new Date(o.expiresAt) > now)
        );
        setOffers(active);
      })
      .catch(() => {});
  }, []);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!offers.length || dismissed) return null;

  // Show the most recent active offer
  const offer = offers[0];
  const c = COLOR_MAP[offer.color] || COLOR_MAP.cyan;

  return (
    <div className={`relative border-b ${c.bg} px-4 py-2.5`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
        {offer.label && (
          <span className={`text-[10px] font-bold tracking-widest uppercase ${c.text}`}>
            {offer.label}
          </span>
        )}
        <span className="text-xs text-zelux-white">{offer.message}</span>
        {offer.code && (
          <button
            onClick={() => copyCode(offer.code, offer.id)}
            className={`flex items-center gap-1.5 border ${c.bg} ${c.text} text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full hover:brightness-110 transition-all`}
          >
            {copied === offer.id ? (
              <>✓ Copied!</>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                Use code: {offer.code}
              </>
            )}
          </button>
        )}
        {offer.discount && !offer.code && (
          <span className={`text-[10px] font-bold ${c.text} bg-white/5 px-2 py-0.5 rounded-full`}>
            {offer.discount} OFF
          </span>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zelux-gray hover:text-zelux-white transition-colors p-1"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}
