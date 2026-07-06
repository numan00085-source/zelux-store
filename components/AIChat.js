import { useState, useEffect, useRef } from 'react';

let cachedProducts = null;
async function fetchProducts() {
  if (cachedProducts) return cachedProducts;
  try {
    const res = await fetch('/api/products-list');
    const data = await res.json();
    cachedProducts = (data || []).filter(p => p.inStock !== false);
    return cachedProducts;
  } catch { return []; }
}

function buildProductContext(products) {
  if (!products || !products.length) return '';
  return products.map(p => {
    const sizes = p.sizes && p.sizes.length ? ' | Sizes: ' + p.sizes.join(', ') : '';
    const colors = p.colors && p.colors.length ? ' | Colors: ' + p.colors.join(', ') : '';
    const type = p.isDigital ? ' [Digital]' : '';
    return '\u2022 ' + p.name + type + ' \u2014 $' + p.price + sizes + colors;
  }).join(' | ');
}

const RULES = [
  { match: ['hello','hi','hey','hii','sup','yo','good morning','good evening','good afternoon'], reply: "Hey! Welcome to ZELUX \uD83D\uDC4B I can help with sizing, orders, shipping, products, returns, and more. What do you need?" },
  { match: ['return','refund','exchange','send back','money back'], reply: "All ZELUX sales are final \u2014 we don't accept returns or exchanges. If your item arrives damaged or incorrect, contact us via <support> or <instagram> and we'll fix it immediately." },
  { match: ['track','tracking number','where is my order','order status','zelux-','my order'], reply: "Track your order at our <receipt> page \u2014 enter your ZELUX-XXXXXXX tracking number to see live status, items, and estimated delivery." },
  { match: ['shipping','delivery time','how long','when will','arrive','estimated delivery','ship to','international','worldwide','express'], reply: "We ship worldwide! USA: 7\u201310 days, UK/Europe: 8\u201314 days, Asia/Australia: 10\u201316 days. Free shipping on orders over $30, otherwise $5.99. Track at <receipt> once shipped." },
  { match: ['size','sizing','fit','measurements','what size','too big','too small','size guide','xl','medium','large','small'], reply: "Size guide: XS=UK6, S=UK8, M=UK10\u201312, L=UK14, XL=UK16, XXL=UK18. For oversized streetwear style, go one size up. Shoes run true to US size. Tell me which product and I'll give specific advice!" },
  { match: ['payment','card','pay','stripe','checkout','secure','visa','mastercard','apple pay','google pay','credit','debit'], reply: "We accept all major cards, Apple Pay, and Google Pay \u2014 all via Stripe (fully secure, PCI-compliant). Your card details are never stored on our servers." },
  { match: ['digital','ebook','e-book','capsule edit','download','pdf','guide'], reply: "Digital products (like The Capsule Edit wardrobe guide) are delivered to your email within 24 hours after purchase. Browse them at zeluxus.com/digital-assets." },
  { match: ['discount','coupon','promo code','sale','voucher','offer','deal'], reply: "We don't run discount codes \u2014 our pricing reflects real quality at fair value. Orders over $30 get free shipping. Follow <instagram> for future promotions." },
  { match: ['cancel','cancellation','cancel my order'], reply: "Orders go straight into processing once placed and can't be cancelled. Please review your cart carefully before checkout. For urgent issues, contact <support>." },
  { match: ['contact','support','help','speak to','talk to','human','agent','real person','issue','problem','complaint'], reply: "Our team is available via <support> (real-time chat) or <instagram>. We aim to reply within a few hours. Have your ZELUX tracking number ready for order issues." },
  { match: ['instagram','ig','social','follow','tiktok','youtube','pinterest'], reply: "Follow us on <instagram> for new arrivals, style drops, and behind-the-scenes content. We reply to DMs! Also on TikTok and Pinterest." },
  { match: ['product','best seller','popular','recommend','what do you sell','collection','new arrival','show me','catalog','streetwear','sneaker','blazer','jacket','hoodie','jeans','electronics','earbuds'], reply: '__PRODUCTS__' },
  { match: ['receipt','invoice','order confirmation','proof of purchase','download receipt'], reply: "View and download your official ZELUX receipt at <receipt>. Enter your ZELUX tracking number to access order details and save as PDF." },
  { match: ['password','login','account','forgot','sign in','register','create account'], reply: "Head to zeluxus.com/login to sign in or create an account. You'll get order history, wishlist, and saved addresses. For login issues, reach us via <support>." },
  { match: ['color','colour','variant','available in','come in','options','styles','black','white'], reply: "All available colors, sizes, and variants are shown on each product page. Out-of-stock variants are clearly marked." },
  { match: ['price','cost','expensive','cheap','affordable','how much','value'], reply: "Our prices reflect premium quality without the luxury markup. Browse zeluxus.com to see our full range." },
  { match: ['wishlist','save','favourite','favorite','save for later','heart'], reply: "Add products to your wishlist by clicking the heart icon on any product card. Access your wishlist at zeluxus.com/wishlist (login required)." },
  { match: ['about','who are you','zelux','brand','founded','story','what is zelux'], reply: "ZELUX is a premium e-commerce brand founded in 2024 \u2014 built for those who refuse to settle. We curate streetwear, footwear, electronics, and digital guides at zeluxus.com." },
  { match: ['photo','image','picture','look like','can i see'], reply: "All product photos are available on each product page at zeluxus.com. We show multiple angles so you can see exactly what you're getting before buying." },
];

const FALLBACK = "I'm not sure about that one \u2014 for anything specific, our team will know. Reach us via <support> or DM <instagram>.";
const WELCOME = "Hi! I'm the ZELUX assistant. Ask me about sizing, shipping, orders, returns, or anything about our store.";
const QUICK = ['Track my order', 'Shipping info', 'Return policy', 'Sizing help', 'Contact support'];

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

function getReply(text, products) {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some(kw => lower.includes(kw))) {
      if (rule.reply === '__PRODUCTS__') {
        const ctx = buildProductContext(products);
        return ctx
          ? 'Here\'s what we currently carry at ZELUX: ' + ctx + ' | Browse and buy at zeluxus.com!'
          : 'We carry premium streetwear, footwear, electronics, and digital guides. Browse everything at zeluxus.com!';
      }
      return rule.reply;
    }
  }
  return FALLBACK;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const handleOpen = () => {
    setMessages([{ from: 'bot', text: WELCOME }]);
    setInput('');
    setTyping(false);
    setOpen(true);
    fetchProducts().then(data => setProducts(data || []));
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text: getReply(msg, products) }]);
    }, 700 + Math.random() * 300);
  };

  const showQuick = messages.length <= 2;

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 flex flex-col w-[340px] sm:w-[380px] rounded-3xl overflow-hidden"
          style={{maxHeight:'520px', background:'#060B16', boxShadow:'0 0 0 1px rgba(63,216,242,0.15), 0 0 60px rgba(63,216,242,0.12), 0 24px 64px rgba(0,0,0,0.6)'}}>

          <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
            style={{borderBottom:'1px solid rgba(63,216,242,0.12)', background:'linear-gradient(135deg,#060B16 0%,#081222 100%)'}}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{background:'linear-gradient(135deg,rgba(63,216,242,0.2),rgba(63,216,242,0.05))', border:'1px solid rgba(63,216,242,0.3)'}}>
                <span className="font-display text-lg font-bold text-zelux-cyan">Z</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zelux-navy" style={{background:'#22c55e'}}></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zelux-white tracking-wide">ZELUX Assistant</p>
              <p className="text-[11px]" style={{color:'#22c55e'}}>Online &middot; Instant replies</p>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors text-zelux-gray hover:text-zelux-white hover:bg-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{background:'#060B16'}}>
            {messages.map((m, i) => (
              <div key={i} className={'flex items-end gap-2 ' + (m.from === 'user' ? 'justify-end' : 'justify-start')}>
                {m.from === 'bot' && (
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
                    style={{background:'rgba(63,216,242,0.12)', border:'1px solid rgba(63,216,242,0.25)'}}>
                    <span className="text-[11px] font-bold text-zelux-cyan">Z</span>
                  </div>
                )}
                <div className="max-w-[80%] text-sm leading-relaxed" style={{
                  padding:'10px 14px',
                  borderRadius: m.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.from === 'user' ? '#3FD8F2' : 'rgba(255,255,255,0.06)',
                  color: m.from === 'user' ? '#060B16' : '#E5E7EB',
                  border: m.from === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontWeight: m.from === 'user' ? '500' : '400',
                }}>
                  {m.from === 'bot' ? <ReplyText text={m.text} /> : m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{background:'rgba(63,216,242,0.12)', border:'1px solid rgba(63,216,242,0.25)'}}>
                  <span className="text-[11px] font-bold text-zelux-cyan">Z</span>
                </div>
                <div style={{padding:'12px 16px', borderRadius:'18px 18px 18px 4px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div className="flex gap-1.5">
                    {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{background:'#3FD8F2', animationDelay:d+'ms'}}></span>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {showQuick && (
            <div className="px-4 py-2.5 flex gap-1.5 flex-wrap flex-shrink-0"
              style={{borderTop:'1px solid rgba(255,255,255,0.06)', background:'#060B16'}}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-[11px] px-3 py-1.5 rounded-full transition-colors whitespace-nowrap hover:bg-zelux-cyan/20"
                  style={{background:'rgba(63,216,242,0.08)', color:'#3FD8F2', border:'1px solid rgba(63,216,242,0.25)'}}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
            style={{borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)'}}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              className="flex-1 text-sm outline-none text-white placeholder-zelux-gray"
              style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'50px', padding:'9px 16px'}}
              onFocus={e => e.target.style.borderColor='rgba(63,216,242,0.5)'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
            <button onClick={() => send()} disabled={!input.trim()}
              className="flex-shrink-0 flex items-center justify-center transition-all"
              style={{width:'38px', height:'38px', borderRadius:'50%', border:'none', cursor:input.trim()?'pointer':'not-allowed',
                background:input.trim()?'#3FD8F2':'rgba(63,216,242,0.2)', color:input.trim()?'#060B16':'rgba(63,216,242,0.4)'}}>
              <svg style={{width:'16px',height:'16px',transform:'translateX(1px)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Premium bubble */}
      <div style={{position:'fixed',bottom:'20px',right:'20px',zIndex:50}}>
        {!open && (
          <>
            <span style={{position:'absolute',inset:'-6px',borderRadius:'50%',border:'1.5px solid rgba(63,216,242,0.4)',animation:'zPing 2.5s ease-out infinite'}}></span>
            <span style={{position:'absolute',inset:'-12px',borderRadius:'50%',border:'1px solid rgba(63,216,242,0.2)',animation:'zPing 2.5s ease-out infinite',animationDelay:'0.7s'}}></span>
          </>
        )}
        <button onClick={open ? () => setOpen(false) : handleOpen}
          style={{position:'relative',width:'56px',height:'56px',borderRadius:'50%',
            background:open?'rgba(6,11,22,0.95)':'conic-gradient(from 0deg,#3FD8F2,#0891B2,#06B6D4,#67E8F9,#3FD8F2)',
            border:open?'1.5px solid rgba(63,216,242,0.35)':'none',
            boxShadow:open?'none':'0 0 0 1px rgba(63,216,242,0.2),0 0 40px rgba(63,216,242,0.6),0 12px 40px rgba(0,0,0,0.6)',
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
            transition:'all 0.3s',animation:open?'none':'zSpin 5s linear infinite'}}>
          {open ? (
            <svg width="16" height="16" fill="none" stroke="rgba(63,216,242,0.9)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          ) : (
            <div style={{position:'absolute',inset:'3px',borderRadius:'50%',background:'linear-gradient(145deg,#0A1628,#060B16)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1px'}}>
              <span style={{fontSize:'12px',fontWeight:'800',color:'#3FD8F2',letterSpacing:'1px',lineHeight:1,fontFamily:'system-ui,sans-serif'}}>AI</span>
              <span style={{fontSize:'6.5px',fontWeight:'700',color:'rgba(63,216,242,0.55)',letterSpacing:'2.5px',lineHeight:1,fontFamily:'system-ui,sans-serif'}}>ZELUX</span>
            </div>
          )}
        </button>
        <style>{`@keyframes zSpin{from{filter:hue-rotate(0deg)}to{filter:hue-rotate(360deg)}}@keyframes zPing{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.6);opacity:0}}`}</style>
      </div>
    </>
  );
}
