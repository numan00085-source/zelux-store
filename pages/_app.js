import { useState, useEffect } from 'react';
import '../styles/globals.css';
import AdSlot from '../components/AdSlot';
import IntroAnimation from '../components/IntroAnimation';

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
  const [introDone, setIntroDone] = useState(false);

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
  // Explicitly calling registration.update() forces an immediate check for
  // a newer sw.js on every page load, rather than relying solely on the
  // browser's own (sometimes delayed) update-check timing - this matters
  // because the service worker's cache-first homepage strategy means an
  // installed PWA can otherwise keep serving stale content for a long time
  // after a real deployment, since skipWaiting/clients.claim only take
  // effect once the browser actually notices the new file exists.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.update().catch(() => {});
      }).catch((err) => {
        console.error('Service worker registration failed', err);
      });
    }
  }, []);

  // Records ONE count per visitor per CALENDAR DAY, not per page view and
  // not per browser-tab-session. localStorage (not sessionStorage) is used
  // because it survives closing/reopening the tab or browser - sessionStorage
  // would have reset on every new tab, which is exactly the bug reported:
  // visits looked like they were still being counted per-page because
  // closing and reopening a tab (normal browsing behavior) created a "new"
  // session and re-triggered the count. The stored value is today's date
  // string - if it doesn't match today, this is either a new day or a
  // first-ever visit on this browser, and we count it once and update the
  // stored date.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const todayString = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const lastCountedDate = localStorage.getItem('zelux-visit-last-counted-date');
    if (lastCountedDate !== todayString) {
      fetch('/api/visitors', { method: 'POST' }).catch(() => {});
      localStorage.setItem('zelux-visit-last-counted-date', todayString);
    }
  }, []);

  if (maintenance === null) return null; // brief check before paint
  if (maintenance) return <MaintenanceScreen message={maintenance} />;

  return (
    <>
      {/* Renders as a fixed overlay (z-[100], see IntroAnimation.js) on top
          of the actual page, which loads/renders simultaneously underneath -
          this means there's no extra wait once the animation finishes,
          since the real content has been ready the whole time. The
          component's own sessionStorage check skips it entirely (and calls
          onComplete immediately) for repeat page views within the same
          browser tab session, so it's shown once per visit, not on every
          internal navigation. */}
      {!introDone && <IntroAnimation onComplete={() => setIntroDone(true)} />}
      <Component {...pageProps} />
      <AdSlot placement="homepage-social-bar" />
    </>
  );
}
