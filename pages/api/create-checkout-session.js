import Stripe from 'stripe';
import { getEffectiveStripeKeys, checkRateLimit } from '../../lib/redis';
import { SHIPPING_COUNTRIES } from '../../components/CountrySelect';

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  if (req.headers['x-real-ip']) return req.headers['x-real-ip'];
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = getClientIp(req);
  const rateCheck = await checkRateLimit(ip, 'checkout', 15);
  if (rateCheck.blocked) return res.status(403).json({ error: 'Access denied.' });
  if (!rateCheck.allowed) return res.status(429).json({ error: 'Too many checkout attempts. Please wait a moment and try again.' });

  let secretKey;
  try {
    const keys = await getEffectiveStripeKeys();
    secretKey = keys.secretKey;
  } catch (e) {
    secretKey = process.env.STRIPE_SECRET_KEY;
  }

  if (!secretKey) {
    return res.status(500).json({ error: 'Payment gateway is not configured.' });
  }

  const stripe = new Stripe(secretKey);
  const { cart, form, total } = req.body;

  try {
    const line_items = cart.map(item => {
      const parts = [item.selectedVariant];
      if (item.customization && (item.customization.name || item.customization.number)) {
        const custParts = [item.customization.name, item.customization.number].filter(Boolean).join(' #');
        if (custParts) parts.push(`Custom: ${custParts}`);
      }
      const label = parts.filter(Boolean).join(', ');
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: `${item.name}${label ? ` (${label})` : ''}`, images: [item.images[0]] },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Build a compact, human-readable summary of every item's options for the order record.
    // Stripe metadata values must be <= 500 characters each, so we keep this concise.
    const itemsSummary = cart.map(item => {
      const bits = [`${item.name} x${item.quantity}`];
      if (item.selectedVariant) bits.push(item.selectedVariant);
      if (item.customization && (item.customization.name || item.customization.number)) {
        const custParts = [item.customization.name, item.customization.number].filter(Boolean).join(' #');
        if (custParts) bits.push(`Custom: ${custParts}`);
      }
      return bits.join(' | ');
    }).join(' ;; ').slice(0, 490);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
      // Deliberately NOT collecting shipping address via Stripe
      // (shipping_address_collection) - the customer already provides their
      // full address on our own /checkout form (see metadata.shippingAddress
      // below), and the webhook already only ever reads that, never
      // Stripe's own collected address. Having Stripe additionally ask for
      // an address was pure redundancy and a real source of confusion: a
      // customer could select a different country in Stripe's own form
      // (e.g. accidentally choosing France while actually ordering from
      // Bangladesh), and even though that mismatched data was never actually
      // used anywhere, it created confusion at checkout time. Removing this
      // means there is exactly one address the customer ever provides, and
      // exactly one address that ever reaches the admin panel.
      metadata: {
        customerName: form.name,
        customerEmail: form.email,
        // Real bug fixed here: form.country is a code like "BD" (validated
        // as required on checkout), but it was never actually included in
        // this address string before - country was silently dropped between
        // the checkout form and the saved order record, even though the
        // customer was required to select one. Resolving the code to its
        // full name here so the address that reaches the admin panel
        // actually reflects what the customer selected, not Stripe's own
        // (now-removed) shipping address collection.
        shippingAddress: `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${SHIPPING_COUNTRIES.find(c => c.code === form.country)?.name || form.country}`,
        itemsSummary,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
