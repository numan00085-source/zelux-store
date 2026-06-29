import Stripe from 'stripe';
import { getEffectiveStripeKeys, checkRateLimit, getRedis } from '../../lib/redis';
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

    // Digital Assets: any cart item with isDigital=true has no shipping
    // concept - the customer gets a download link instead. Collecting these
    // file URLs into the order record (rather than re-looking them up later
    // from a product ID that might since have changed/been deleted) means
    // the admin can always retrieve exactly what was sold at the time of
    // purchase. Joined with a delimiter unlikely to appear in a URL, and
    // truncated defensively to stay under Stripe's 500-char metadata limit -
    // same reasoning as itemsSummary above, just a tighter cap since this is
    // a secondary field, not the primary order summary.
    const digitalItems = cart.filter(item => item.isDigital && item.fileUrl);
    const isDigitalOrder = digitalItems.length > 0;
    const digitalFileLinks = digitalItems.map(item => `${item.name}: ${item.fileUrl}`).join(' ;; ').slice(0, 400);

    // Real fix: shipping was previously never actually charged through
    // Stripe at all - cart.js and checkout.js only ever displayed a
    // shipping figure as text, while the actual payment only ever included
    // product line items. Fixed here by adding a genuine Stripe
    // shipping_options entry, computed from settings read directly from
    // Redis server-side - NOT from any shipping/total value the client
    // sent in the request body, since trusting a client-computed charge
    // amount would let a tampered request pay $0 shipping regardless of
    // what the storefront UI displayed. An all-digital cart (every item
    // isDigital) gets a genuine $0/"No shipping required" rate rather than
    // simply omitting shipping_options, so the Stripe checkout page itself
    // is explicit about why there's nothing to pay for delivery, matching
    // what cart.js/checkout.js already show before the customer gets here.
    const redis = getRedis();
    const settingsRaw = await redis.get('zelux:settings');
    const settings = settingsRaw ? JSON.parse(settingsRaw) : {};
    const freeShippingThreshold = settings.freeShippingThreshold ?? 150;
    const shippingFee = settings.shippingFee ?? 9.99;
    const isAllDigitalCart = cart.length > 0 && cart.every(item => item.isDigital);

    // total is computed server-side from the cart's own prices/quantities,
    // not trusted from the client-sent value - this was a related gap worth
    // closing at the same time: a tampered request claiming an inflated
    // total could otherwise fake crossing the free-shipping threshold and
    // get free shipping on an order that shouldn't qualify. The product
    // prices themselves were already safe (line_items are built from each
    // cart item's own price field below), so this only affects the
    // shipping-threshold decision, not the actual amount charged for items.
    const serverComputedTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

    let shippingAmountCents;
    let shippingLabel;
    if (isAllDigitalCart) {
      shippingAmountCents = 0;
      shippingLabel = 'No shipping required (digital order)';
    } else if (serverComputedTotal >= freeShippingThreshold) {
      shippingAmountCents = 0;
      shippingLabel = 'Free shipping';
    } else {
      shippingAmountCents = Math.round(shippingFee * 100);
      shippingLabel = 'Standard shipping';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingAmountCents, currency: 'usd' },
            display_name: shippingLabel,
          },
        },
      ],
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
        // For an all-digital order, the customer may not have entered an
        // address at all (no longer required - see checkout.js). Building
        // the usual ", , , " string from empty fields would look like a
        // broken/missing address in the admin panel rather than a
        // deliberate "not needed" state, so this is explicit instead.
        shippingAddress: isDigitalOrder && !form.address
          ? 'Not applicable - digital order, delivered via email'
          : `${form.address}, ${form.city}, ${form.state} ${form.zip}, ${SHIPPING_COUNTRIES.find(c => c.code === form.country)?.name || form.country}`,
        itemsSummary,
        isDigitalOrder: isDigitalOrder ? 'true' : 'false',
        digitalFileLinks,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
