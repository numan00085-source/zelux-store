import { useState, useRef, useEffect } from 'react';

export const SHIPPING_COUNTRIES = [
  { code: 'US', name: 'United States (USA)' },
  { code: 'GB', name: 'United Kingdom (UK)' },
];

export default function CountrySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = SHIPPING_COUNTRIES.find(c => c.code === value);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full bg-zelux-navy-light border border-zelux-gray-mid/40 rounded-lg px-4 py-3 text-sm text-left outline-none focus:border-zelux-cyan transition-colors flex items-center justify-between"
      >
        <span className={selected ? 'text-zelux-white' : 'text-zelux-gray'}>
          {selected ? selected.name : 'Select country...'}
        </span>
        <svg className={`w-4 h-4 text-zelux-gray transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-zelux-navy-card border border-zelux-gray-mid/40 rounded-lg shadow-xl overflow-hidden">
          {SHIPPING_COUNTRIES.map(country => (
            <button
              key={country.code}
              type="button"
              onClick={() => { onChange(country.code); setOpen(false); }}
              className={`w-full px-4 py-3 text-sm text-left hover:bg-zelux-cyan/10 transition-colors flex items-center gap-3 ${value === country.code ? 'text-zelux-cyan bg-zelux-cyan/5' : 'text-zelux-white'}`}
            >
              <span className="text-lg">{country.code === 'US' ? '🇺🇸' : '🇬🇧'}</span>
              <span>{country.name}</span>
              {value === country.code && (
                <svg className="ml-auto w-4 h-4 text-zelux-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
