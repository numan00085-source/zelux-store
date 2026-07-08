import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

const FAQS = [
  {
    category: 'Orders & Tracking',
    items: [
      { q: 'How do I track my order?', a: 'Visit zeluxus.com/receipt and enter your ZELUX tracking number (format: ZELUX-XXXXXXX). You can find your tracking number in your order confirmation or in your account under "My Orders".' },
      { q: 'How long does it take to process my order?', a: 'Orders are processed within 1–3 business days. Once shipped, you will receive your ZELUX tracking number via email.' },
      { q: 'Can I change or cancel my order after placing it?', a: 'Orders go straight into processing once placed and cannot be changed or cancelled. Please review your cart carefully before completing checkout. For urgent concerns, contact us via Support Chat.' },
      { q: 'I placed an order but did not receive a confirmation. What should I do?', a: 'Check your spam/junk folder first. If you still cannot find it, contact our support team via Support Chat or Instagram @zelux.us with your order details.' },
    ]
  },
  {
    category: 'Shipping',
    items: [
      { q: 'Do you ship worldwide?', a: 'Yes — ZELUX ships worldwide. We deliver to the United States, United Kingdom, Canada, Australia, and many more countries globally.' },
      { q: 'How long does shipping take?', a: 'Estimated delivery times: USA 7–10 business days, UK & Europe 8–14 business days, Asia & Australia 10–16 business days. Times may vary slightly depending on your location and customs.' },
      { q: 'How much does shipping cost?', a: 'Shipping is free on all orders over $30. For orders under $30, a flat fee of $5.99 applies. No hidden fees — the price you see at checkout is final.' },
      { q: 'Does ZELUX ship to PO Boxes?', a: 'We recommend using a physical street address to ensure smooth delivery. PO Box delivery may not be available in all regions.' },
    ]
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'All ZELUX sales are final. We do not accept returns or exchanges. We stand behind every product we list, which is why we only list what we genuinely believe in.' },
      { q: 'What if my item arrives damaged or incorrect?', a: 'If your order arrives damaged, defective, or different from what you ordered — that is our mistake, and we will fix it. Contact us immediately via Support Chat or Instagram @zelux.us with photos and your order details.' },
      { q: 'Can I get a refund if I change my mind?', a: 'We do not offer refunds for change of mind. We encourage you to review product details, sizing guides, and descriptions carefully before purchasing. Our team is happy to help you decide before you buy.' },
    ]
  },
  {
    category: 'Products & Sizing',
    items: [
      { q: 'How do I find the right size?', a: 'Each product page includes a detailed size guide. For streetwear and apparel, we recommend going one size up for an oversized fit. Footwear runs true to US size. Still unsure? Contact us before ordering — we are happy to advise.' },
      { q: 'Are ZELUX products authentic?', a: 'Every product listed on ZELUX is reviewed for quality and accuracy before going live. Our product descriptions are honest and detailed — what you read is what you receive.' },
      { q: 'What categories does ZELUX carry?', a: 'ZELUX offers premium streetwear, footwear, electronics, and digital lifestyle guides. New products are added regularly. Browse our full collection at zeluxus.com.' },
      { q: 'Do you restock sold-out items?', a: 'Some items are restocked, others are limited. Follow us on Instagram @zelux.us or check back regularly to catch new arrivals and restocks.' },
    ]
  },
  {
    category: 'Payment',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), as well as Apple Pay and Google Pay — all processed securely via Stripe.' },
      { q: 'Is it safe to pay on ZELUX?', a: 'Absolutely. All payments are processed through Stripe, a PCI-compliant and industry-leading payment processor. Your card details are never stored on our servers.' },
      { q: 'Will I be charged in USD?', a: 'Yes, all prices on ZELUX are listed and charged in US Dollars (USD). Your bank may apply a currency conversion fee if you are paying from outside the United States.' },
    ]
  },
  {
    category: 'Support & Contact',
    items: [
      { q: 'How do I contact ZELUX?', a: 'You can reach us via our Support Chat at zeluxus.com/support or by messaging us directly on Instagram @zelux.us. We aim to respond within a few hours.' },
      { q: 'What are your support hours?', a: 'Our team monitors messages daily. While we do not guarantee 24/7 live response, we aim to reply to all inquiries within 24 hours.' },
      { q: 'I have a question not answered here. What should I do?', a: 'Reach out to us via Support Chat or Instagram @zelux.us — we are always happy to help with anything not covered in this FAQ.' },
    ]
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zelux-gray-mid/20 last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group">
        <span className={`text-sm font-medium transition-colors duration-200 ${open ? 'text-zelux-cyan' : 'text-zelux-white group-hover:text-zelux-cyan'}`}>{q}</span>
        <span className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 ${open ? 'border-zelux-cyan bg-zelux-cyan/10 rotate-45' : 'border-zelux-gray-mid/50'}`}>
          <svg className={`w-2.5 h-2.5 ${open ? 'text-zelux-cyan' : 'text-zelux-gray'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-sm text-zelux-gray leading-relaxed pb-4 pr-8 animate-fade-in">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(null);
  const filtered = activeCategory ? FAQS.filter(f => f.category === activeCategory) : FAQS;

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-zelux-navy">
        {/* Hero */}
        <div className="relative py-16 text-center overflow-hidden" style={{background:'linear-gradient(180deg,#060B16 0%,#081424 100%)'}}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-3xl" style={{background:'rgba(63,216,242,0.05)'}}></div>
          <div className="relative max-w-2xl mx-auto px-6">
            <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-4">Help Center</p>
            <h1 className="font-display text-4xl sm:text-5xl font-light text-zelux-white mb-4">Frequently Asked Questions</h1>
            <p className="text-zelux-gray text-sm leading-relaxed">Everything you need to know about ZELUX. Can't find an answer? <Link href="/support" className="text-zelux-cyan hover:underline">Contact our team</Link>.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-10">
            <button onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all ${!activeCategory ? 'bg-zelux-cyan text-zelux-navy font-semibold' : 'bg-zelux-navy-card border border-zelux-gray-mid/40 text-zelux-gray hover:border-zelux-cyan/50 hover:text-zelux-cyan'}`}>
              All
            </button>
            {FAQS.map(f => (
              <button key={f.category} onClick={() => setActiveCategory(f.category)}
                className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all ${activeCategory === f.category ? 'bg-zelux-cyan text-zelux-navy font-semibold' : 'bg-zelux-navy-card border border-zelux-gray-mid/40 text-zelux-gray hover:border-zelux-cyan/50 hover:text-zelux-cyan'}`}>
                {f.category}
              </button>
            ))}
          </div>

          {/* FAQ sections */}
          <div className="space-y-10">
            {filtered.map(section => (
              <div key={section.category} className="bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zelux-gray-mid/20">
                  <h2 className="text-xs tracking-widest uppercase text-zelux-cyan">{section.category}</h2>
                </div>
                <div className="px-6">
                  {section.items.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
                </div>
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div className="mt-12 bg-zelux-navy-card border border-zelux-gray-mid/30 rounded-2xl p-8 text-center">
            <p className="text-zelux-white font-medium mb-2">Still have questions?</p>
            <p className="text-zelux-gray text-sm mb-6">Our support team is here to help — usually responds within a few hours.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/support" className="btn-glow bg-zelux-cyan text-zelux-navy px-6 py-2.5 text-xs tracking-widest uppercase font-semibold rounded-full hover:shadow-glow transition-all">
                Support Chat
              </Link>
              <a href="https://instagram.com/zelux.us" target="_blank" rel="noreferrer"
                className="border border-zelux-gray-mid/40 text-zelux-white px-6 py-2.5 text-xs tracking-widest uppercase rounded-full hover:border-zelux-cyan/50 hover:text-zelux-cyan transition-all">
                @zelux.us
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
