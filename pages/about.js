import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function About() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-zelux-navy">

        {/* Hero */}
        <div className="relative py-20 text-center overflow-hidden" style={{background:'linear-gradient(180deg,#060B16 0%,#081424 100%)'}}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl" style={{background:'rgba(63,216,242,0.06)'}}></div>
          <div className="relative max-w-3xl mx-auto px-6">
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-4">Est. 2024 · United States</p>
            <h1 className="font-display text-5xl sm:text-6xl font-light text-zelux-white mb-6 glow-text">Our Story</h1>
            <p className="text-zelux-gray text-lg leading-relaxed max-w-xl mx-auto">
              Built for those who refuse to settle. ZELUX exists because premium style shouldn't come with a premium price tag.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">

          <section className="grid sm:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">Who We Are</p>
              <h2 className="font-display text-3xl font-light text-zelux-white mb-5">More than a store.</h2>
              <p className="text-zelux-gray text-sm leading-relaxed mb-4">
                ZELUX is a curated e-commerce brand based in the United States, built around a single belief — that the clothes you wear, the shoes you walk in, and the products around you should reflect who you are, not what you could afford to compromise on.
              </p>
              <p className="text-zelux-gray text-sm leading-relaxed">
                We source every item in our catalog with the same scrutiny we'd apply if we were buying for ourselves. If it doesn't meet the standard, it doesn't make the cut.
              </p>
            </div>
            <div className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-8 text-center">
              <p className="font-display text-5xl font-light text-zelux-cyan glow-text mb-2">2024</p>
              <p className="text-xs text-zelux-gray tracking-widest uppercase">Year Founded</p>
              <div className="border-t border-zelux-gray-mid/20 my-5"></div>
              <p className="font-display text-5xl font-light text-zelux-white mb-2">50+</p>
              <p className="text-xs text-zelux-gray tracking-widest uppercase">Countries Shipped To</p>
              <div className="border-t border-zelux-gray-mid/20 my-5"></div>
              <p className="font-display text-5xl font-light text-zelux-white mb-2">100%</p>
              <p className="text-xs text-zelux-gray tracking-widest uppercase">Satisfaction Standard</p>
            </div>
          </section>

          {/* What we sell */}
          <section>
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">What We Offer</p>
            <h2 className="font-display text-3xl font-light text-zelux-white mb-8">Curated for those who know the difference.</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: '👕', title: 'Streetwear', desc: 'Oversized silhouettes, premium fabrics, bold design. Built for the street, made to last.' },
                { icon: '👟', title: 'Footwear', desc: 'From clean minimalist sneakers to statement boots — footwear that completes every look.' },
                { icon: '💻', title: 'Electronics', desc: 'Curated tech and lifestyle electronics. Clean design, real performance.' },
                { icon: '📖', title: 'Digital Guides', desc: 'Knowledge worth owning — from wardrobe systems to lifestyle frameworks.' },
              ].map(item => (
                <div key={item.title} className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-6">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="text-sm font-semibold text-zelux-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zelux-gray leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Founder */}
          <section className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-3xl p-8 sm:p-10">
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-6">The Founder</p>
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-zelux-cyan/10 border border-zelux-cyan/30 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-xl font-bold text-zelux-cyan">N</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zelux-white mb-1">Numan Salclox</h3>
                <p className="text-xs text-zelux-cyan mb-4 tracking-wide">Founder & CEO, ZELUX</p>
                <p className="text-sm text-zelux-gray leading-relaxed mb-3">
                  ZELUX was founded with a clear intention: to build a brand that respects both the customer's taste and their budget. The idea was simple — source the best products available, present them honestly, and deliver them reliably.
                </p>
                <p className="text-sm text-zelux-gray leading-relaxed">
                  Every product decision, every design detail, and every customer interaction at ZELUX reflects that original intention. We're not here to move units. We're here to build something worth standing behind.
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section>
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3">Our Values</p>
            <h2 className="font-display text-3xl font-light text-zelux-white mb-8">What we stand for.</h2>
            <div className="space-y-4">
              {[
                { title: 'Honesty first', desc: 'Accurate product details, real pricing, no hidden fees. What you see is exactly what you get.' },
                { title: 'Quality over quantity', desc: 'Every product is reviewed before it goes live. We list what we believe in, nothing else.' },
                { title: 'Accessible premium', desc: 'Premium doesn\'t have to mean unaffordable. We work to close that gap, permanently.' },
                { title: 'Real support', desc: 'When something goes wrong, we fix it. Reach us via our Support Chat or on Instagram @zelux.us.' },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 items-start border-b border-zelux-gray-mid/20 pb-4 last:border-0 last:pb-0">
                  <div className="w-6 h-6 rounded-full bg-zelux-cyan/10 border border-zelux-cyan/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-zelux-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zelux-white mb-0.5">{v.title}</p>
                    <p className="text-xs text-zelux-gray leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h2 className="font-display text-3xl font-light text-zelux-white mb-4">Ready to find your next piece?</h2>
            <p className="text-zelux-gray text-sm mb-8">Browse the full ZELUX collection — new arrivals added regularly.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/" className="btn-glow bg-zelux-cyan text-zelux-navy px-8 py-3 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow hover:scale-105 transition-all duration-300">
                Shop Now
              </Link>
              <Link href="/support" className="border border-zelux-gray-mid/40 text-zelux-white px-8 py-3 text-xs tracking-widest uppercase rounded-full hover:border-zelux-cyan/50 hover:text-zelux-cyan transition-all duration-300">
                Contact Us
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
