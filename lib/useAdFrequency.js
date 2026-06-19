import { useState, useEffect } from 'react';

const STORAGE_KEY = 'zelux-ad-impressions';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readImpressions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    // Clear out old days to keep storage small
    const today = getTodayKey();
    if (data.day !== today) return { day: today, count: 0 };
    return data;
  } catch {
    return { day: getTodayKey(), count: 0 };
  }
}

function writeImpressions(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useAdFrequency(frequencyCap) {
  const [canShowAd, setCanShowAd] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const data = readImpressions();
    setCanShowAd(data.count < frequencyCap);
    setHydrated(true);
  }, [frequencyCap]);

  const recordImpression = () => {
    const data = readImpressions();
    const updated = { day: getTodayKey(), count: (data.count || 0) + 1 };
    writeImpressions(updated);
    setCanShowAd(updated.count < frequencyCap);
  };

  return { canShowAd: hydrated ? canShowAd : false, recordImpression, hydrated };
}
