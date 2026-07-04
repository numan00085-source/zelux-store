import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../lib/store';

export default function SupportPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const load = () => {
    if (!user?.email) return;
    fetch(`/api/support?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    load();
    fetch('/api/support', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email }) }).catch(() => {});
    const iv = setInterval(load, 6000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !user || sending) return;
    const text = input.trim();
    setSending(true);
    setInput('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, text }),
      });
      const d = await res.json();
      if (d.messages) setMessages(d.messages);
    } catch {}
    setSending(false);
    inputRef.current?.focus();
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] || '.jpg';
      const res = await fetch('/api/support-upload', {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'image/jpeg', 'x-filename': `support-${Date.now()}${ext}` },
        body: file,
      });
      const { url } = await res.json();
      if (url) {
        const r2 = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, imageUrl: url }),
        });
        const d2 = await r2.json();
        if (d2.messages) setMessages(d2.messages);
      }
    } catch {}
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const y = new Date(today); y.setDate(y.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const grouped = messages.reduce((acc, m) => {
    const key = new Date(m.createdAt).toDateString();
    if (!acc[key]) acc[key] = { label: fmtDate(m.createdAt), msgs: [] };
    acc[key].msgs.push(m);
    return acc;
  }, {});

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-zelux-navy">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zelux-navy-light border-b border-zelux-gray-mid/30 flex-shrink-0">
        <Link href="/profile" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zelux-navy transition-colors text-zelux-gray hover:text-zelux-cyan">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zelux-cyan to-zelux-cyan-dark flex items-center justify-center text-zelux-navy font-bold text-sm shadow-glow-sm flex-shrink-0">
          Z
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zelux-white">ZELUX Support</p>
          <p className="text-xs text-zelux-cyan">Online · typically replies within 24h</p>
        </div>
        <a href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zelux-navy transition-colors text-zelux-gray hover:text-zelux-cyan">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(63,216,242,0.03) 0%, transparent 60%)'}}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-20 h-20 rounded-full bg-zelux-cyan/10 border border-zelux-cyan/20 flex items-center justify-center mb-5">
              <svg className="w-9 h-9 text-zelux-cyan/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p className="text-zelux-white font-medium mb-1">Start a conversation</p>
            <p className="text-zelux-gray text-sm leading-relaxed">Have a question about your order, a product, or anything else? We're here to help.</p>
          </div>
        )}

        {Object.values(grouped).map((group, gi) => (
          <div key={gi}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-zelux-gray-mid/20"></div>
              <span className="text-[11px] text-zelux-gray bg-zelux-navy-light px-3 py-1 rounded-full">{group.label}</span>
              <div className="flex-1 h-px bg-zelux-gray-mid/20"></div>
            </div>
            {group.msgs.map((m, i) => {
              const isCustomer = m.sender === 'customer';
              const next = group.msgs[i + 1];
              const isLast = !next || next.sender !== m.sender;
              return (
                <div key={m.id} className={`flex items-end gap-2 mb-1 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                  {!isCustomer && (
                    <div className={`w-7 h-7 rounded-full bg-zelux-cyan/20 border border-zelux-cyan/30 flex items-center justify-center text-[10px] font-bold text-zelux-cyan flex-shrink-0 ${isLast ? 'opacity-100' : 'opacity-0'}`}>Z</div>
                  )}
                  <div className={`max-w-[72%] ${isCustomer ? 'items-end' : 'items-start'} flex flex-col`}>
                    {m.imageUrl && (
                      <img src={m.imageUrl} alt="attachment"
                        className={`rounded-2xl mb-1 max-h-56 object-cover shadow-md ${isCustomer ? 'rounded-br-sm' : 'rounded-bl-sm'}`} />
                    )}
                    {m.text && (
                      <div className={`px-4 py-2.5 shadow-sm ${
                        isCustomer
                          ? 'bg-zelux-cyan text-zelux-navy rounded-2xl rounded-br-sm'
                          : 'bg-zelux-navy-light text-zelux-white border border-zelux-gray-mid/25 rounded-2xl rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    )}
                    {isLast && (
                      <span className={`text-[10px] mt-1 px-1 ${isCustomer ? 'text-zelux-gray' : 'text-zelux-gray'}`}>
                        {fmt(m.createdAt)}
                        {isCustomer && <span className="ml-1 text-zelux-cyan/70">✓</span>}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 bg-zelux-navy-light border-t border-zelux-gray-mid/30 px-3 py-3">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImage} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-zelux-gray hover:text-zelux-cyan hover:bg-zelux-navy transition-colors disabled:opacity-40 mb-0.5">
            {uploading
              ? <div className="w-4 h-4 border-2 border-zelux-cyan/30 border-t-zelux-cyan rounded-full animate-spin"></div>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
            }
          </button>
          <div className="flex-1 bg-zelux-navy border border-zelux-gray-mid/40 rounded-3xl px-4 py-2.5 flex items-end focus-within:border-zelux-cyan/60 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Message ZELUX..."
              rows={1}
              className="w-full bg-transparent text-sm text-zelux-white placeholder-zelux-gray outline-none resize-none leading-relaxed"
              style={{height: '24px', maxHeight: '120px'}}
            />
          </div>
          <button onClick={send} disabled={sending || !input.trim()}
            className="w-10 h-10 flex-shrink-0 rounded-full bg-zelux-cyan text-zelux-navy flex items-center justify-center hover:shadow-glow transition-all disabled:opacity-40 mb-0.5">
            <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
