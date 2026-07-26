import { useEffect, useState, useRef } from 'react';

export default function AdSlot({ placement }) {
  const [ad, setAd] = useState(null);
  const containerRef = useRef(null);
  const injected = useRef(false);

  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then(config => {
        const ads = (config.ads || []).filter(a => a.placement === placement && a.enabled !== false);
        if (ads.length > 0) setAd(ads[0]);
      })
      .catch(() => {});
  }, [placement]);

  useEffect(() => {
    if (!ad || injected.current) return;
    if (ad.type === 'script' && ad.scriptCode && containerRef.current) {
      injected.current = true;
      containerRef.current.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.innerHTML = ad.scriptCode;
      // Re-execute scripts so Adsterra/third-party code actually runs
      Array.from(wrapper.querySelectorAll('script')).forEach(old => {
        const s = document.createElement('script');
        Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value));
        s.text = old.textContent;
        old.replaceWith(s);
      });
      containerRef.current.appendChild(wrapper);
    }
  }, [ad]);

  if (!ad) return null;

  const isSocialBar = placement === 'homepage-social-bar';

  if (ad.type === 'custom') {
    return (
      <div className={isSocialBar
        ? 'fixed bottom-0 left-0 right-0 z-40 bg-zelux-navy/95 backdrop-blur-sm border-t border-zelux-gray-mid/30 flex justify-center py-2'
        : 'w-full flex justify-center py-4'}>
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block max-w-full">
          <img src={ad.imageUrl} alt={ad.altText || 'Advertisement'}
            className={isSocialBar ? 'max-h-16 rounded' : 'max-w-full rounded-lg border border-zelux-gray-mid/20'} />
        </a>
      </div>
    );
  }

  if (ad.type === 'script') {
    return (
      <div
        ref={containerRef}
        className={isSocialBar
          ? 'fixed bottom-0 left-0 right-0 z-40 flex justify-center'
          : 'w-full flex justify-center py-4'}
      />
    );
  }

  return null;
}
