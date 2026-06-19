import { useEffect, useState, useRef } from 'react';
import { useAdFrequency } from '../lib/useAdFrequency';

export default function AdSlot({ placement }) {
  const [adsConfig, setAdsConfig] = useState(null);
  const containerRef = useRef(null);
  const hasRecorded = useRef(false);

  useEffect(() => {
    fetch('/api/ads').then(r => r.json()).then(setAdsConfig).catch(() => {});
  }, []);

  const frequencyCap = adsConfig?.frequencyCap ?? 2;
  const { canShowAd, recordImpression, hydrated } = useAdFrequency(frequencyCap);

  const adsForPlacement = (adsConfig?.ads || []).filter(a => a.placement === placement);
  const ad = adsForPlacement[0]; // show one ad per slot

  useEffect(() => {
    if (!ad || !canShowAd || !hydrated || hasRecorded.current) return;
    if (ad.type === 'script' && ad.scriptCode && containerRef.current) {
      // Inject the third-party script (e.g. Adsterra) into the container
      containerRef.current.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.innerHTML = ad.scriptCode;
      // Re-create script tags so they actually execute (innerHTML alone won't run <script>)
      Array.from(wrapper.querySelectorAll('script')).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.text = oldScript.textContent;
        oldScript.replaceWith(newScript);
      });
      containerRef.current.appendChild(wrapper);
    }
    hasRecorded.current = true;
    recordImpression();
  }, [ad, canShowAd, hydrated]);

  if (!hydrated || !ad || !canShowAd) return null;

  const isSocialBar = placement === 'homepage-social-bar';

  if (ad.type === 'custom') {
    return (
      <div className={isSocialBar ? 'fixed bottom-0 left-0 right-0 z-40 bg-zelux-navy/95 backdrop-blur-sm border-t border-zelux-gray-mid/30 flex justify-center py-2' : 'w-full flex justify-center py-4'}>
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block max-w-full">
          <img
            src={ad.imageUrl}
            alt={ad.altText || 'Advertisement'}
            className={isSocialBar ? 'max-h-16 rounded' : 'max-w-full rounded-lg border border-zelux-gray-mid/20'}
          />
        </a>
      </div>
    );
  }

  if (ad.type === 'script') {
    return <div ref={containerRef} className={isSocialBar ? 'fixed bottom-0 left-0 right-0 z-40 flex justify-center' : 'w-full flex justify-center py-4'} />;
  }

  return null;
}
