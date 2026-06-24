import { useState, useEffect } from 'react';
import '../styles/globals.css';
import AdSlot from '../components/AdSlot';

function MaintenanceScreen({ message }) {
  return (
    <div className="min-h-screen bg-zelux-navy flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-4xl text-zelux-white glow-text mb-4">ZELUX</h1>
        <p className="text-zelux-gray text-sm max-w-md mx-auto">{message}</p>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  const [maintenance, setMaintenance] = useState(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.maintenanceMode) setMaintenance(d.maintenanceMessage || 'We are currently updating our store. Please check back shortly.');
      else setMaintenance(false);
    }).catch(() => setMaintenance(false));
  }, []);

  // Registers the service worker so the site meets PWA installability
  // criteria (manifest + service worker + HTTPS). Guarded with a feature
  // check since older/unsupported browsers simply won't have
  // navigator.serviceWorker - this must never throw or block rendering.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker registration failed', err);
      });
    }
  }, []);

  // Records ONE count per visit, not per page view. A visitor browsing 5
  // pages in one session should count as 1 visit, not 5 - otherwise the
  // admin's "visitors" number doesn't actually represent how many people
  // came to the site, it represents page views, which is a different (and
  // less useful) metric. sessionStorage marks the visit as already recorded
  // for this browser tab; it persists across client-side navigation
  // (Link clicks, router.push) but clears when the tab/browser closes, so a
  // genuinely new visit later still gets counted.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const alreadyCounted = sessionStorage.getItem('zelux-visit-counted');
    if (!alreadyCounted) {
      fetch('/api/visitors', { method: 'POST' }).catch(() => {});
      sessionStorage.setItem('zelux-visit-counted', '1');
    }
  }, []);

  if (maintenance === null) return null; // brief check before paint
  if (maintenance) return <MaintenanceScreen message={maintenance} />;

  return (
    <>
      <Component {...pageProps} />
      <AdSlot placement="homepage-social-bar" />
    </>
  );
}
