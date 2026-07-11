import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '../lib/store';

// FOMO — live viewer simulation
export function FomoWidget({ productId, enabled }) {
  const [viewers, setViewers] = useState(null);
  const [recentBuyer, setRecentBuyer] = useState(null);
  const NAMES = ['Sarah M.','James K.','Priya S.','Alex T.','Morgan L.','Chris R.','Taylor B.','Jordan W.'];
  const CITIES = ['New York','Los Angeles','Chicago','Houston','Miami','Seattle','Austin','Boston'];

  useEffect(() => {
    if (!enabled) return;
    // Seed viewer count based on productId for consistency
    const seed = productId ? productId.charCodeAt(0) % 20 : 8;
    setViewers(8 + seed);
    // Show recent buyer after 3s
    const t1 = setTimeout(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      setRecentBuyer({ name, city });
    }, 3000);
    // Fluctuate viewers
    const t2 = setInterval(() => {
      setViewers(v => Math.max(5, v + (Math.random() > 0.5 ? 1 : -1)));
    }, 8000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, [productId, enabled]);

  if (!enabled) return null;

  return (
    <div className="space-y-2">
      {viewers && (
        <div className="flex items-center gap-2 text-xs text-zelux-gray">
          <span className="flex gap-0.5">
            {[...Array(3)].map((_,i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{animationDelay: i*200+'ms'}}></span>)}
          </span>
          <span><strong className="text-zelux-white">{viewers} people</strong> viewing this right now</span>
        </div>
      )}
      {recentBuyer && (
        <div className="flex items-center gap-2 bg-zelux-navy-card border border-zelux-gray-mid/20 rounded-xl px-3 py-2 animate-fade-in-up w-fit">
          <div className="w-6 h-6 rounded-full bg-zelux-cyan/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          </div>
          <p className="text-xs text-zelux-gray"><strong className="text-zelux-white">{recentBuyer.name}</strong> from {recentBuyer.city} just ordered · 2m ago</p>
        </div>
      )}
    </div>
  );
}

// Reviews
const SAMPLE_REVIEWS = [
  { name: 'Sarah M.', rating: 5, date: '2 days ago', text: 'Absolutely love it! Quality is amazing and shipping was fast. Will definitely order again.' },
  { name: 'James K.', rating: 5, date: '1 week ago', text: 'Exceeded my expectations. Looks exactly like the photos, great value for money.' },
  { name: 'Priya S.', rating: 4, date: '2 weeks ago', text: 'Really happy with my purchase. Packaging was premium and delivery was smooth.' },
];

export function ReviewsSection({ productId }) {
  const avg = 4.8;
  return (
    <div className="mt-10 border-t border-zelux-gray-mid/30 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-zelux-white tracking-wide">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_,i) => <span key={i} className="text-zelux-cyan text-sm">★</span>)}
          </div>
          <span className="text-sm font-semibold text-zelux-white">{avg}</span>
          <span className="text-xs text-zelux-gray">({SAMPLE_REVIEWS.length} reviews)</span>
        </div>
      </div>
      <div className="space-y-4">
        {SAMPLE_REVIEWS.map((r,i) => (
          <div key={i} className="bg-zelux-navy-card border border-zelux-gray-mid/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zelux-cyan/10 border border-zelux-cyan/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-zelux-cyan">{r.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zelux-white">{r.name}</p>
                  <p className="text-[11px] text-zelux-gray">{r.date}</p>
                </div>
              </div>
              <div className="flex">
                {[...Array(r.rating)].map((_,j) => <span key={j} className="text-zelux-cyan text-xs">★</span>)}
              </div>
            </div>
            <p className="text-sm text-zelux-gray leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Related Products
export function RelatedProducts({ currentProductId, category }) {
  const [products, setProducts] = useState([]);
  const addToCart = useCartStore(s => s.addToCart);

  useEffect(() => {
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => {
        const related = data
          .filter(p => p.id !== currentProductId && p.category === category && p.inStock !== false)
          .slice(0, 4);
        setProducts(related);
      })
      .catch(() => {});
  }, [currentProductId, category]);

  if (!products.length) return null;

  return (
    <div className="mt-12 border-t border-zelux-gray-mid/30 pt-8">
      <h3 className="text-sm font-medium text-zelux-white tracking-wide mb-6">You May Also Like</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map(p => (
          <Link key={p.id} href={`/products/${p.slug}`} className="group">
            <div className="relative rounded-xl overflow-hidden aspect-square bg-zelux-navy-card border border-zelux-gray-mid/30 group-hover:border-zelux-cyan/40 transition-colors mb-2">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>}
              <div className="absolute inset-0 bg-gradient-to-t from-zelux-navy/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-2">
                <span className="text-sm font-semibold text-zelux-cyan">${p.price}</span>
              </div>
            </div>
            <p className="text-xs text-zelux-white line-clamp-2 group-hover:text-zelux-cyan transition-colors">{p.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Size Guide Modal
export function SizeGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-3xl max-w-lg w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-zelux-white tracking-wide">Size Guide</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zelux-gray">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zelux-gray-mid/30">
                {['Size','US','UK','EU','Chest (in)','Waist (in)'].map(h => <th key={h} className="text-left py-2 pr-4 text-zelux-gray font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ['XS','0-2','4-6','32-34','31-33','24-26'],
                ['S','4-6','8-10','36-38','34-36','26-28'],
                ['M','8-10','12-14','40-42','37-39','29-31'],
                ['L','12-14','16-18','44-46','40-42','32-34'],
                ['XL','16-18','20-22','48-50','43-45','35-37'],
                ['XXL','20-22','24-26','52-54','46-48','38-40'],
              ].map((row,i) => (
                <tr key={i} className="border-b border-zelux-gray-mid/10">
                  {row.map((cell,j) => <td key={j} className={`py-2.5 pr-4 ${j===0 ? 'font-semibold text-zelux-cyan' : 'text-zelux-gray'}`}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-zelux-gray mt-4">Measurements are approximate. For best fit, measure yourself and compare to the chart.</p>
      </div>
    </div>
  );
}
