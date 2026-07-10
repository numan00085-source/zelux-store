import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ReturnsPolicy() {
  return (
    <>
      <Head>
        <title>Returns Policy — ZELUX</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <Navbar />
      <main className="pt-16 min-h-screen bg-zelux-navy">
        <div className="bg-zelux-navy-light border-b border-zelux-gray-mid/30 py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-zelux-cyan/5 rounded-full blur-3xl"></div>
          <p className="text-xs tracking-widest uppercase text-zelux-cyan mb-3 relative">Customer Care</p>
          <h1 className="font-display text-5xl font-light text-zelux-white relative glow-text">Returns Policy</h1>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-16 text-zelux-gray leading-relaxed space-y-8">
          <p className="text-lg text-zelux-white font-light leading-relaxed">
            At ZELUX, every piece we offer is selected, inspected, and prepared with a single standard in mind: that it
            arrives exactly as it was the moment we approved it for our collection. It is this standard - not a
            store policy written to limit your options - that shapes how we think about returns.
          </p>

          <section className="space-y-3">
            <h2 className="text-zelux-cyan text-sm tracking-widest uppercase">Our Policy</h2>
            <p>
              ZELUX does not accept returns or exchanges on any order, for any reason, once it has shipped. This
              applies to every category we carry - apparel, footwear, and electronics alike - and to every order,
              regardless of size or value.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zelux-cyan text-sm tracking-widest uppercase">Why We Operate This Way</h2>
            <p>
              Conventional return systems exist to absorb uncertainty - sizing guesses, color mismatches, quality
              that disappoints once a product is finally in hand. We have chosen to remove that uncertainty before
              it ever reaches you, rather than manage it after the fact.
            </p>
            <p>
              Every product on ZELUX is reviewed for construction, material, and finish before it is listed.
              Measurements, descriptions, and imagery are prepared with the same scrutiny we would want if we were
              buying for ourselves. A no-returns policy is the other half of that commitment: it keeps us accountable
              to getting the listing right the first time, rather than relying on a return process to correct an
              oversight after the sale.
            </p>
            <p>
              It also allows us to keep our pricing honest. Return logistics - restocking, re-inspection, repackaging,
              the inventory that sits unsold while a decision is made - are costs that most retailers fold quietly
              into their prices. We would rather not charge you for a system you may never use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zelux-cyan text-sm tracking-widest uppercase">Before You Order</h2>
            <p>
              Because every sale is final, we encourage a careful look before checkout. Review the sizing details and
              measurements on each product page. Read the full description, not only the highlights. If a question
              remains unanswered, reach out to us beforehand rather than after - we are glad to help you decide with
              confidence, before a purchase is made rather than after.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-zelux-cyan text-sm tracking-widest uppercase">If Something Arrives Damaged or Incorrect</h2>
            <p>
              A no-returns policy covers a change of mind - it does not cover our own error. If an item arrives
              genuinely damaged in transit, defective, or different from what you ordered, contact us directly and
              we will make it right. This is a separate matter from returns, and we treat it as one.
            </p>
          </section>

          <p className="text-sm text-zelux-gray/80 pt-4 border-t border-zelux-gray-mid/20">
            Questions about this policy, or about a specific order, are always welcome - reach out through our
            support channel before you complete a purchase, or at any time after.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
