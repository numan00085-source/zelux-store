import { useState, useEffect, useRef } from 'react';

const RULES = [
  {
    match: ['return', 'refund', 'exchange', 'send back', 'give back'],
    reply: "All ZELUX sales are final — we don't accept returns or exchanges. That said, if your item arrives damaged or incorrect (our mistake), reach us on <support> or <instagram> and we'll sort it out immediately.",
  },
  {
    match: ['track', 'tracking number', 'where is my order', 'order status', 'zelux-'],
    reply: "Visit our <receipt> page and enter your ZELUX-XXXXXXX tracking number to see full status updates and your order history.",
  },
  {
    match: ['shipping', 'delivery time', 'how long', 'when will', 'arrive', 'estimated'],
    reply: "We ship worldwide. Estimated delivery is 7–14 business days. Shipping is free on orders over $30, otherwise a flat $5.99.",
  },
  {
    match: ['size', 'sizing', 'fit', 'measurements', 'what size should'],
    reply: "Each product page has a size guide. For apparel, go one size up for an oversized fit. Still unsure? <support> or DM <instagram> and we'll advise based on the specific item.",
  },
  {
    match: ['payment', 'card', 'pay', 'stripe', 'checkout', 'secure'],
    reply: "We accept all major credit and debit cards via Stripe — fully secure, PCI-compliant. Your card details are never stored on our servers.",
  },
  {
    match: ['digital', 'ebook', 'e-book', 'capsule edit', 'download', 'pdf', 'guide'],
    reply: "Digital products (like The Capsule Edit) are delivered to your email within 24 hours after purchase. Browse them at zeluxus.com/digital-assets.",
  },
  {
    match: ['discount', 'coupon', 'promo code', 'sale', 'voucher'],
    reply: "We don't currently run discount codes — our pricing is already as lean as possible. Orders over $30 get free shipping though! Follow <instagram> for any future promotions.",
  },
  {
    match: ['cancel', 'cancellation', 'cancel my order'],
    reply: "Orders go straight into processing once placed and can't be cancelled. Please review your cart carefully before checkout.",
  },
  {
    match: ['contact', 'support', 'help', 'speak to', 'talk to', 'human', 'agent', 'issue', 'problem'],
    reply: "Our team is available via <support> (real-time chat) or on <instagram>. We typically reply within a few hours.",
  },
  {
    match: ['instagram', 'ig', 'social', 'follow us', 'tiktok'],
    reply: "Follow us on Instagram <instagram> for new arrivals, style content, and updates. We reply to DMs too!",
  },
  {
    match: ['product', 'best seller', 'popular', 'recommend', 'what do you sell', 'collection'],
    reply: "We carry premium streetwear, footwear, electronics, and digital guides. Browse everything at zeluxus.com or check our featured drops on <instagram>.",
  },
  {
    match: ['hello', 'hi', 'hey', 'hii', 'helo', 'sup', 'yo', 'good morning', 'good evening'],
    reply: "Hey! Welcome to ZELUX 👋 I can help with sizing, shipping, orders, returns, or anything about our store. What do you need?",
  },
  {
    match: ['receipt', 'invoice', 'order confirmation', 'proof of purchase'],
    reply: "You can view and download your official ZELUX receipt at <receipt> — just enter your ZELUX tracking number.",
  },
  {
    match: ['password', 'login', 'account', 'forgot', 'sign in'],
    reply: "Head to zeluxus.com/login to sign in. If you've forgotten your password, use the reset option there. For account issues, reach us via <support>.",
  },
];

const FALLBACK = "I'm not sure about that one — for anything specific, our team will know. Reach us via <support> or DM <instagram>.";
const WELCOME = "Hi! I'm the ZELUX assistant. Ask me about sizing, shipping, orders, returns, or anything about our store.";
const QUICK = ['Track my order', 'Shipping info', 'Return policy', 'Sizing help', 'Contact support'];

// Render reply text, replacing <support>, <instagram>, <receipt> with styled links
function ReplyText({ text }) {
  const parts = text.split(/(<support>|<instagram>|<receipt>)/g);
  return (
    <span>
      {parts.map((p, i) => {
        if (p === '<support>') return <a key={i} href="/support" className="underline font-semibold text-zelux-navy/80 hover:text-zelux-navy">Support Chat</a>;
        if (p === '<instagram>') return <a key={i} href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer" className="underline font-semibold text-zelux-navy/80 hover:text-zelux-navy">@zelux.us</a>;
        if (p === '<receipt>') return <a key={i} href="/receipt" className="underline font-semibold text-zelux-navy/80 hover:text-zelux-navy">ZELUX Receipt</a>;
        return p;
      })}
    </span>
  );
}

function getReply(text) {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some(kw => lower.includes(kw))) return rule.reply;
  }
  return FALLBACK;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Reset chat each time bubble is opened — fresh session every time
  const handleOpen = () => {
    setMessages([{ from: 'bot', text: WELCOME }]);
    setInput('');
    setTyping(false);
    setOpen(true);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text: getReply(msg) }]);
    }, 700 + Math.random() * 300);
  };

  const showQuick = messages.length <= 2;

  return (
    <>
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 flex flex-col w-[340px] sm:w-[380px] rounded-3xl overflow-hidden"
          style={{
            maxHeight: '520px',
            background: '#060B16',
            boxShadow: '0 0 0 1px rgba(63,216,242,0.15), 0 0 60px rgba(63,216,242,0.12), 0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{borderBottom: '1px solid rgba(63,216,242,0.12)', background: 'linear-gradient(135deg, #060B16 0%, #081222 100%)'}}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(63,216,242,0.2), rgba(63,216,242,0.05))', border: '1px solid rgba(63,216,242,0.3)'}}>
                <span className="font-display text-lg font-bold text-zelux-cyan">Z</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zelux-navy" style={{background: '#22c55e'}}></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zelux-white tracking-wide">ZELUX Assistant</p>
              <p className="text-[11px]" style={{color: '#22c55e'}}>Online · Instant replies</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{color: 'rgba(156,163,175,0.8)'}}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{background: '#060B16'}}>
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.from === 'bot' && (
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5" style={{background: 'rgba(63,216,242,0.12)', border: '1px solid rgba(63,216,242,0.25)'}}>
                    <span className="text-[11px] font-bold text-zelux-cyan">Z</span>
                  </div>
                )}
                <div
                  className="max-w-[80%] text-sm leading-relaxed"
                  style={{
                    padding: '10px 14px',
                    borderRadius: m.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.from === 'user' ? '#3FD8F2' : 'rgba(255,255,255,0.06)',
                    color: m.from === 'user' ? '#060B16' : '#E5E7EB',
                    border: m.from === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    fontWeight: m.from === 'user' ? '500' : '400',
                  }}
                >
                  {m.from === 'bot' ? <ReplyText text={m.text} /> : m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: 'rgba(63,216,242,0.12)', border: '1px solid rgba(63,216,242,0.25)'}}>
                  <span className="text-[11px] font-bold text-zelux-cyan">Z</span>
                </div>
                <div style={{padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)'}}>
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background: '#3FD8F2', animationDelay: d + 'ms'}}></span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Quick buttons */}
          {showQuick && (
            <div className="px-4 py-2.5 flex gap-1.5 flex-wrap flex-shrink-0" style={{borderTop: '1px solid rgba(255,255,255,0.06)', background: '#060B16'}}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-[11px] px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                  style={{background: 'rgba(63,216,242,0.08)', color: '#3FD8F2', border: '1px solid rgba(63,216,242,0.25)'}}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(63,216,242,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(63,216,242,0.08)'}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0" style={{borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)'}}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              className="flex-1 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50px',
                padding: '9px 16px',
                color: '#fff',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(63,216,242,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                background: input.trim() ? '#3FD8F2' : 'rgba(63,216,242,0.2)',
                color: input.trim() ? '#060B16' : 'rgba(63,216,242,0.5)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', cursor: input.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <svg style={{width: '16px', height: '16px', transform: 'translateX(1px)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Premium bubble */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        style={{
          position: 'fixed', bottom: '20px', right: '20px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: open ? '#060B16' : 'linear-gradient(135deg, #3FD8F2 0%, #0891B2 100%)',
          border: open ? '1.5px solid rgba(63,216,242,0.4)' : 'none',
          boxShadow: '0 0 0 1px rgba(63,216,242,0.2), 0 0 30px rgba(63,216,242,0.35), 0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.25s', zIndex: 50,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(63,216,242,0.3), 0 0 40px rgba(63,216,242,0.5), 0 12px 40px rgba(0,0,0,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(63,216,242,0.2), 0 0 30px rgba(63,216,242,0.35), 0 8px 32px rgba(0,0,0,0.4)'; }}
      >
        {open ? (
          <svg style={{width: '18px', height: '18px', color: '#3FD8F2'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        ) : (
          <svg style={{width: '24px', height: '24px', color: '#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
        )}
      </button>
    </>
  );
}
