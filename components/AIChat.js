import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const RULES = [
  {
    match: ['return', 'refund', 'exchange', 'send back'],
    reply: "All ZELUX sales are final — we don't accept returns or exchanges. However, if your item arrives damaged or incorrect, reach out to us on Instagram @zelux.us and we'll make it right."
  },
  {
    match: ['track', 'tracking', 'order status', 'where is my', 'delivery'],
    reply: "To track your order, visit zeluxus.com/receipt and enter your ZELUX tracking number (format: ZELUX-XXXXXXX). You'll see full status updates there."
  },
  {
    match: ['shipping', 'ship', 'how long', 'delivery time', 'when will'],
    reply: "We offer standard worldwide shipping. Estimated delivery is 7–14 business days. Free shipping on orders over $30, otherwise $5.99."
  },
  {
    match: ['size', 'sizing', 'fit', 'measurement', 'what size'],
    reply: "Size guides are available on each product page. For apparel, we recommend going one size up if you prefer an oversized fit. Need specific advice? DM us on Instagram @zelux.us."
  },
  {
    match: ['payment', 'pay', 'card', 'stripe', 'checkout'],
    reply: "We accept all major credit and debit cards via Stripe — our secure payment processor. Your card details are never stored on our servers."
  },
  {
    match: ['digital', 'ebook', 'e-book', 'download', 'pdf'],
    reply: "Our digital products (like The Capsule Edit guide) are delivered to your email manually after purchase, usually within 24 hours. Visit zeluxus.com/digital-assets to browse."
  },
  {
    match: ['discount', 'coupon', 'promo', 'sale', 'offer'],
    reply: "We don't currently offer discount codes, but we do have free shipping on orders over $30. Follow us on Instagram @zelux.us for any future promotions."
  },
  {
    match: ['contact', 'support', 'help', 'question', 'problem', 'issue'],
    reply: "You can reach us via our Support Chat at zeluxus.com/support, or message us directly on Instagram @zelux.us. We typically reply within 24 hours."
  },
  {
    match: ['instagram', 'tiktok', 'social', 'follow'],
    reply: "Follow us on Instagram @zelux.us for new arrivals, style inspiration, and updates. We're also on TikTok!"
  },
  {
    match: ['product', 'item', 'buy', 'purchase', 'shop', 'best', 'recommend', 'popular'],
    reply: "Browse our full collection at zeluxus.com — we carry premium streetwear, footwear, electronics, and digital guides. New arrivals drop regularly!"
  },
  {
    match: ['cancel', 'cancellation'],
    reply: "Orders cannot be cancelled once placed as they go straight to processing. Please double-check your order before completing checkout."
  },
  {
    match: ['hello', 'hi', 'hey', 'hii', 'helo', 'sup', 'yo'],
    reply: "Hey! Welcome to ZELUX 👋 I'm your shopping assistant. Ask me anything about our products, shipping, sizing, or orders!"
  },
];

const FALLBACK = "I'm not sure about that one! For specific questions, our support team is happy to help — chat with us at zeluxus.com/support or DM @zelux.us on Instagram.";

const WELCOME = "Hi! I'm the ZELUX assistant 👋 Ask me about sizing, shipping, orders, returns, or anything about our store!";

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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: userText }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text: getReply(userText) }]);
    }, 800 + Math.random() * 400);
  };

  const QUICK = ['Shipping info', 'Track order', 'Return policy', 'Sizing help', 'Contact support'];

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-3xl overflow-hidden"
          style={{maxHeight:'500px', boxShadow:'0 0 40px rgba(63,216,242,0.15), 0 20px 60px rgba(0,0,0,0.5)'}}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
            style={{background:'linear-gradient(135deg,#060B16,#0A1628)', borderBottom:'1px solid rgba(63,216,242,0.15)'}}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-zelux-cyan/20 border border-zelux-cyan/40 flex items-center justify-center">
                <span className="font-display text-base font-bold text-zelux-cyan">Z</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-zelux-navy"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zelux-white">ZELUX Assistant</p>
              <p className="text-[10px] text-green-400">Online · Instant replies</p>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zelux-navy transition-colors text-zelux-gray hover:text-zelux-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-zelux-navy">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {m.from === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-zelux-cyan/20 border border-zelux-cyan/30 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <span className="text-[10px] font-bold text-zelux-cyan">Z</span>
                  </div>
                )}
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === 'user' ? 'bg-zelux-cyan text-zelux-navy rounded-br-sm font-medium' : 'bg-zelux-navy-light text-zelux-white border border-zelux-gray-mid/25 rounded-bl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-zelux-cyan/20 border border-zelux-cyan/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-zelux-cyan">Z</span>
                </div>
                <div className="bg-zelux-navy-light border border-zelux-gray-mid/25 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-zelux-cyan rounded-full animate-bounce" style={{animationDelay:d+'ms'}}></span>)}
                </div>
              </div>
            )}
            <div ref={endRef}></div>
          </div>

          {/* Quick buttons */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 flex gap-1.5 flex-wrap bg-zelux-navy border-t border-zelux-gray-mid/20">
              {QUICK.map(q => (
                <button key={q} onClick={() => { setMessages(prev => [...prev, {from:'user',text:q}]); setTyping(true); setTimeout(() => { setTyping(false); setMessages(prev => [...prev, {from:'bot',text:getReply(q)}]); }, 800); }}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-zelux-cyan/10 text-zelux-cyan border border-zelux-cyan/30 hover:bg-zelux-cyan/20 transition-colors whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-zelux-navy-light border-t border-zelux-gray-mid/20 flex items-center gap-2">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a question..."
              className="flex-1 bg-zelux-navy border border-zelux-gray-mid/40 rounded-full px-4 py-2 text-sm text-zelux-white placeholder-zelux-gray outline-none focus:border-zelux-cyan transition-colors"/>
            <button onClick={send} disabled={!input.trim()}
              className="w-9 h-9 flex-shrink-0 rounded-full bg-zelux-cyan text-zelux-navy flex items-center justify-center hover:shadow-glow transition-all disabled:opacity-40">
              <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Bubble */}
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{background: open ? '#060B16' : 'linear-gradient(135deg,#3FD8F2,#0EA5C9)', boxShadow:'0 0 30px rgba(63,216,242,0.4), 0 8px 32px rgba(0,0,0,0.3)', border: open ? '2px solid rgba(63,216,242,0.5)' : 'none'}}>
        {open
          ? <svg className="w-5 h-5 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          : <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        }
      </button>
    </>
  );
}
