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

  if (maintenance === null) return null; // brief check before paint
  if (maintenance) return <MaintenanceScreen message={maintenance} />;

  return (
    <>
      <Component {...pageProps} />
      <AdSlot placement="homepage-social-bar" />
    </>
  );
}
