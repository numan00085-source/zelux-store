import { useState, useEffect } from 'react';

export default function FlashSaleBanner({ settings }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!settings?.flashSaleEnabled || !settings?.flashSaleEndsAt) return;
    const tick = () => {
      const diff = new Date(settings.flashSaleEndsAt) - new Date();
      if (diff <= 0) { setTimeLeft(null); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h: String(h).padStart(2,'0'), m: String(m).padStart(2,'0'), s: String(s).padStart(2,'0') });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [settings]);

  if (!settings?.flashSaleEnabled) return null;

  return (
    <div className="w-full py-2.5 px-4 flex items-center justify-center gap-3 flex-wrap text-center"
      style={{background: 'linear-gradient(90deg, #0A1628, #0d1f3c, #0A1628)', borderBottom: '1px solid rgba(63,216,242,0.2)'}}>
      <span className="text-sm font-semibold text-zelux-white">{settings.flashSaleMessage}</span>
      {settings.flashSaleDiscount && (
        <span className="text-xs px-2.5 py-1 rounded-full bg-zelux-cyan text-zelux-navy font-bold">{settings.flashSaleDiscount}</span>
      )}
      {timeLeft && (
        <div className="flex items-center gap-1 text-zelux-cyan">
          <span className="text-xs text-zelux-gray">Ends in</span>
          {['h','m','s'].map((u,i) => (
            <span key={u} className="flex items-center gap-0.5">
              <span className="bg-zelux-navy-card border border-zelux-cyan/30 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-zelux-cyan">{timeLeft[u]}</span>
              {i < 2 && <span className="text-zelux-cyan/50 text-xs">:</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
