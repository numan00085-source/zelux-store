import { useState, useEffect } from 'react';

// Bold/cinematic entry animation per explicit request: NO logo image, NO
// circle - pure typography. "WELCOME TO" fades up small, then "ZELUX"
// punches in letter-by-letter with a dramatic scale+glow pop, then the
// whole thing holds briefly before a fast wipe-out transition. Total
// runtime is intentionally kept near ~3s (the user's original "2-3 second"
// spec from earlier in this build) even though the visual style itself is
// now bold/cinematic rather than minimal.
const ZELUX_LETTERS = ['Z', 'E', 'L', 'U', 'X'];

export default function IntroAnimation({ onComplete }) {
  const [stage, setStage] = useState('intro'); // intro -> letters -> hold -> wipeIn -> wipeOut -> done
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem('zelux-intro-seen');
    if (alreadySeen) {
      setSkip(true);
      onComplete();
      return;
    }
    sessionStorage.setItem('zelux-intro-seen', '1');

    const t1 = setTimeout(() => setStage('letters'), 500);
    const t2 = setTimeout(() => setStage('hold'), 1700);
    // wipeIn: the navy panel becomes visible at FULL width first (covering
    // the text completely) before wipeOut animates it away - without this
    // intermediate step, the panel's visibility (z-index) and its width
    // (scaleX) would change in the same instant, producing no visible sweep
    // at all rather than the intended cinematic wipe.
    const t3 = setTimeout(() => setStage('wipeIn'), 2500);
    const t4 = setTimeout(() => setStage('wipeOut'), 2540);
    const t5 = setTimeout(() => setStage('done'), 3040);
    const t6 = setTimeout(() => onComplete(), 3040);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, []);

  if (skip || stage === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zelux-navy overflow-hidden"
      style={{
        pointerEvents: stage === 'wipeOut' ? 'none' : 'auto',
      }}
    >
      {/* Subtle background grid, same texture as the rest of the brand's dark UI */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#3FD8F2 1px, transparent 1px), linear-gradient(90deg, #3FD8F2 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      {/* Two-panel wipe transition - covers the screen in a fast cinematic
          sweep rather than a plain fade. Becomes fully visible at wipeIn
          (full width, no transition - an instant reveal), then animates to
          zero width at wipeOut, which is the actual visible sweep. */}
      <div
        className="absolute inset-0 bg-zelux-navy"
        style={{
          transform: stage === 'wipeOut' || stage === 'done' ? 'scaleX(0)' : 'scaleX(1)',
          transformOrigin: 'left',
          transition: stage === 'wipeOut' ? 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1)' : 'none',
          zIndex: stage === 'wipeIn' || stage === 'wipeOut' ? 2 : -1,
        }}
      ></div>

      <div className="relative text-center px-4">
        <p
          className="text-xs sm:text-sm tracking-[0.3em] uppercase text-zelux-cyan mb-3 sm:mb-4"
          style={{
            opacity: stage === 'intro' || stage === 'letters' || stage === 'hold' ? 1 : 0,
            transform: stage === 'intro' ? 'translateY(12px)' : 'translateY(0)',
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          }}
        >
          Welcome To
        </p>

        <h1 className="font-display text-6xl sm:text-8xl md:text-9xl font-bold text-zelux-white tracking-tight flex justify-center">
          {ZELUX_LETTERS.map((letter, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                opacity: stage === 'intro' ? 0 : 1,
                transform: stage === 'intro'
                  ? 'scale(2.2) translateY(0)'
                  : stage === 'letters'
                    ? 'scale(1.08) translateY(-4px)'
                    : 'scale(1) translateY(0)',
                textShadow: stage === 'letters'
                  ? '0 0 40px rgba(63,216,242,0.9), 0 0 80px rgba(63,216,242,0.5)'
                  : '0 0 24px rgba(63,216,242,0.5)',
                transition: `opacity 0.35s ease-out ${i * 0.08}s, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s, text-shadow 0.4s ease-out ${i * 0.08}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Thin accent line draws in under the wordmark once letters have landed */}
        <div
          className="h-px bg-zelux-cyan mx-auto mt-4 sm:mt-6"
          style={{
            width: stage === 'hold' || stage === 'wipeIn' || stage === 'wipeOut' ? '120px' : '0px',
            opacity: stage === 'hold' || stage === 'wipeIn' || stage === 'wipeOut' ? 1 : 0,
            transition: 'width 0.6s ease-out, opacity 0.4s ease-out',
            boxShadow: '0 0 12px rgba(63,216,242,0.8)',
          }}
        ></div>
      </div>
    </div>
  );
}
