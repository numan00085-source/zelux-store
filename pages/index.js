import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import IntroAnimation from '../components/IntroAnimation';
import AdSlot from '../components/AdSlot';
import Link from 'next/link';


function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const [heroImgIndex, setHeroImgIndex] = useState(0);
  const [settings, setSettings] = useState({
    heroSubtitle: 'Est. 2024 - Luxury Redefined',
    announcementText: 'Free Shipping on Orders Over $150 - Worldwide Delivery - Secure Checkout - New Arrivals Weekly',
    heroImages: [],
  });

  useEffect(() => {
    fetch('/api/products-list')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (!settings.heroImages || settings.heroImages.length < 2) return;
    const interval = setInterval(() => {
      setHeroImgIndex(prev => (prev + 1) % settings.heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [settings.heroImages]);

  const featured = products.filter(p => p.featured && p.inStock !== false);
  const electronics = products.filter(p => p.category === 'electronics' && p.inStock !== false).slice(0, 4);
  const apparel = products.filter(p => (p.category === 'apparel' || p.category === 'footwear') && p.inStock !== false).slice(0, 4);

  return (
    <>
      <IntroAnimation onComplete={() => setIntroDone(true)} />
      <Navbar />
      <main className="pt-16 bg-zelux-navy">

        {/* HERO */}
        <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-zelux-navy">
          {/* Rotating background category images, admin-controlled. Only render current + previous for smooth crossfade without loading all images at once. */}
          {(settings.heroImages || []).length > 0 && [
            (heroImgIndex - 1 + settings.heroImages.length) % settings.heroImages.length,
            heroImgIndex,
          ].map((idx, layer) => (
            <div
              key={idx}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms]"
              style={{
                backgroundImage: `url(${settings.heroImages[idx]})`,
                opacity: layer === 1 ? 0.32 : 0,
                zIndex: layer,
              }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-zelux-navy/60 via-zelux-navy/70 to-zelux-navy"></div>

          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-zelux-cyan/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zelux-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#3FD8F2 1px, transparent 1px), linear-gradient(90deg, #3FD8F2 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

          <div className="relative text-center px-4 max-w-3xl mx-auto z-10">
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>New Collection 2026</p>
            <h1 className="font-display text-7xl sm:text-9xl font-light tracking-widest mb-2 rainbow-text animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              ZELUX
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase text-zelux-cyan-dark mb-10 font-light animate-fade-in-up" style={{ animationDelay: '0.3s' }}>{settings.heroSubtitle}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
              <Link href="/collections/all" className="btn-glow bg-zelux-cyan text-zelux-navy px-10 py-4 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow-lg hover:scale-105 transition-all duration-300">
                Shop Now
              </Link>
              <Link href="/collections/electronics" className="btn-glow border border-zelux-cyan/50 text-zelux-white px-10 py-4 text-xs tracking-widest uppercase rounded-full hover:border-zelux-cyan hover:shadow-glow hover:scale-105 transition-all duration-300">
                Electronics
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-5 h-5 text-zelux-cyan/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </section>

        <div className="bg-zelux-navy-light border-y border-zelux-gray-mid/30 py-3 overflow-hidden whitespace-nowrap">
          <div className="inline-flex animate-marquee">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="text-xs tracking-widest uppercase text-zelux-gray px-8">
                {settings.announcementText} &nbsp;&middot;&nbsp;
              </span>
            ))}
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <Reveal className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">Curated Selection</p>
            <h2 className="font-display text-4xl font-light text-zelux-white">Featured Pieces</h2>
          </Reveal>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="shimmer-bg rounded-xl aspect-[3/4]"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 80}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          )}
          <Reveal className="text-center mt-12">
            <Link href="/collections/all" className="btn-glow inline-block border border-zelux-cyan/40 text-zelux-cyan px-10 py-3 text-xs tracking-widest uppercase rounded-full hover:bg-zelux-cyan hover:text-zelux-navy hover:shadow-glow transition-all duration-300">
              View All
            </Link>
          </Reveal>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <Reveal>
            <Link href="/collections/apparel" className="relative h-96 overflow-hidden group block rounded-2xl border border-zelux-gray-mid/30 hover:border-zelux-cyan/50 transition-colors duration-300">
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=90" alt="Apparel" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-zelux-navy via-zelux-navy/40 to-transparent"></div>
              <div className="absolute inset-0 flex items-end p-8">
                <div>
                  <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-2">Collection</p>
                  <h3 className="font-display text-3xl text-zelux-white font-light mb-3">Apparel &amp; Footwear</h3>
                  <span className="text-xs text-zelux-cyan tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">Explore <span>&rarr;</span></span>
                </div>
              </div>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/collections/electronics" className="relative h-96 overflow-hidden group block rounded-2xl border border-zelux-gray-mid/30 hover:border-zelux-cyan/50 transition-colors duration-300">
              <img src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&q=90" alt="Electronics" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-zelux-navy via-zelux-navy/40 to-transparent"></div>
              <div className="absolute inset-0 flex items-end p-8">
                <div>
                  <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-2">Collection</p>
                  <h3 className="font-display text-3xl text-zelux-white font-light mb-3">Premium Electronics</h3>
                  <span className="text-xs text-zelux-cyan tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">Explore <span>&rarr;</span></span>
                </div>
              </div>
            </Link>
          </Reveal>
        </section>

        <section className="bg-zelux-navy-light py-20 border-y border-zelux-gray-mid/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal className="text-center mb-12">
              <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">Tech Essentials</p>
              <h2 className="font-display text-4xl font-light text-zelux-white">Premium Electronics</h2>
            </Reveal>
            {!loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {electronics.map((p, i) => <Reveal key={p.id} delay={i * 80}><ProductCard product={p} /></Reveal>)}
              </div>
            )}
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Reveal className="text-center mb-12">
              <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">Style Edit</p>
              <h2 className="font-display text-4xl font-light text-zelux-white">Apparel &amp; Footwear</h2>
            </Reveal>
            {!loading && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {apparel.map((p, i) => <Reveal key={p.id} delay={i * 80}><ProductCard product={p} /></Reveal>)}
              </div>
            )}
          </div>
        </section>

        <AdSlot placement="homepage-banner" />

        <section className="border-y border-zelux-gray-mid/20 bg-zelux-navy-light py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: 'M5 13l4 4L19 7', label: 'Secure Checkout' },
              { icon: 'M3 7h18M3 12h18M3 17h18', label: 'Worldwide Shipping' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: '24/7 Support' },
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Authenticity Guaranteed' },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 60} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full border border-zelux-cyan/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                </div>
                <span className="text-xs text-zelux-gray tracking-wide">{item.label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="relative bg-zelux-navy py-24 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zelux-cyan/5 rounded-full blur-3xl"></div>
          <Reveal className="relative max-w-xl mx-auto px-4">
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-4">Follow the Movement</p>
            <h2 className="font-display text-4xl font-light mb-4 text-zelux-white glow-text">@zelux.us</h2>
            <p className="text-sm text-zelux-gray mb-8">Join our community on Instagram for exclusive drops, styling inspiration, and direct support.</p>
            <a href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer" className="btn-glow inline-flex items-center gap-3 bg-zelux-cyan text-zelux-navy px-10 py-4 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow-lg hover:scale-105 transition-all duration-300">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Follow @zelux.us
            </a>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
