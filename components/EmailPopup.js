import { useState, useEffect } from 'react';

export default function EmailPopup({ settings }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!settings?.emailPopupEnabled) return;
    if (localStorage.getItem('zelux_popup_dismissed')) return;
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, [settings]);

  const dismiss = () => {
    localStorage.setItem('zelux_popup_dismissed', '1');
    setShow(false);
  };

  const submit = () => {
    if (!email.includes('@')) return;
    localStorage.setItem('zelux_popup_dismissed', '1');
    setDone(true);
    setTimeout(() => setShow(false), 2000);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-fade-in"
      style={{background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'}}
      onClick={dismiss}>
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{background: 'linear-gradient(145deg, #081222, #060B16)', border: '1px solid rgba(63,216,242,0.2)', boxShadow: '0 0 60px rgba(63,216,242,0.15), 0 24px 64px rgba(0,0,0,0.6)'}}
        onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={dismiss} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zelux-gray hover:text-zelux-white transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <div className="px-8 pt-10 pb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zelux-cyan/10 border border-zelux-cyan/30 flex items-center justify-center mx-auto mb-5">
            <span className="font-display text-xl font-bold text-zelux-cyan">Z</span>
          </div>

          {done ? (
            <>
              <p className="text-lg font-semibold text-zelux-white mb-2">You're in! 🎉</p>
              <p className="text-sm text-zelux-gray">Welcome to ZELUX. Check your email for your discount.</p>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl font-light text-zelux-white mb-2">{settings?.emailPopupTitle || 'Get 10% Off Your First Order'}</h3>
              <p className="text-sm text-zelux-gray mb-6 leading-relaxed">{settings?.emailPopupSubtitle || 'Join the ZELUX community and be first to know about new drops.'}</p>
              <div className="flex gap-2">
                <input value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="Your email address"
                  className="flex-1 bg-zelux-navy border border-zelux-gray-mid/40 rounded-full px-4 py-2.5 text-sm text-zelux-white placeholder-zelux-gray outline-none focus:border-zelux-cyan transition-colors"/>
                <button onClick={submit}
                  className="bg-zelux-cyan text-zelux-navy px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider hover:shadow-glow transition-all">
                  Join
                </button>
              </div>
              <button onClick={dismiss} className="mt-4 text-xs text-zelux-gray hover:text-zelux-white transition-colors">No thanks</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
