import { useState, useEffect } from 'react';

export function useAdFrequency(frequencyCap) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const recordImpression = () => {};

  // Always show ads — no frequency cap limiting
  return { canShowAd: true, recordImpression, hydrated };
}
