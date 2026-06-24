import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  const router = useRouter();

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

  // Records a simple page-view count (no unique-visitor dedup, no
  // cookies/IP tracking - just a raw count of page loads, as requested).
  // Fires once on initial mount, and again on every client-side route
  // change (Next.js Link navigation doesn't trigger a full page reload, so
  // without the router event, navigating between pages within the SPA
  // wouldn't be counted at all).
  useEffect(() => {
    const record = () => fetch('/api/visitors', { method: 'POST' }).catch(() => {});
    record();
    router.events.on('routeChangeComplete', record);
    return () => router.events.off('routeChangeComplete', record);
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
