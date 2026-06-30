import Stripe from 'stripe';
import { addOrder, getEffectiveStripeKeys } from '../../lib/redis';

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let secretKey = process.env.STRIPE_SECRET_KEY;
  try {
    const keys = await getEffectiveStripeKeys();
    secretKey = keys.secretKey || secretKey;
  } catch (e) {
    // fall back to env var already set above
  }

  const stripe = new Stripe(secretKey);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const buf = await buffer(req);
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      // Fallback: no webhook secret configured, parse raw body (less secure, but functional)
      event = JSON.parse(buf.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

      const productNames = lineItems.data.map(li => li.description).join(', ');
      const total = (session.amount_total / 100).toFixed(2);

      const order = {
        id: `ORD-${Date.now()}`,
        productName: productNames || 'ZELUX Order',
        variant: '',
        itemsSummary: session.metadata?.itemsSummary || '',
        total,
        customerName: session.metadata?.customerName || session.customer_details?.name || 'Unknown',
        customerEmail: session.metadata?.customerEmail || session.customer_details?.email || '',
        address: session.metadata?.shippingAddress || '',
        // Digital Assets: isDigitalOrder flags this order as needing manual
        // delivery (no automatic email per explicit decision - see
        // digitalFileLinks below) rather than physical shipping. The admin
        // panel uses this to show the email prominently and surface the
        // exact file link(s) sold, rather than the admin having to
        // separately look up which product(s) were purchased.
        isDigitalOrder: session.metadata?.isDigitalOrder === 'true',
        digitalFileLinks: session.metadata?.digitalFileLinks || '',
        status: 'Processing',
        createdAt: new Date().toISOString(),
        stripeSessionId: session.id,
      };

      const savedOrder = await addOrder(order);

      // Notify the admin panel via push notification. This is a real
      // cross-project HTTP call (zelux-admin is a separate Vercel
      // deployment/domain, not shared code), authenticated with a shared
      // secret so this can't be triggered by an arbitrary internet request
      // hitting the admin's endpoint directly. Awaited (not fire-and-forget)
      // because Vercel serverless functions can suspend/kill background
      // work the instant a response is sent - an un-awaited call here could
      // silently never complete. Wrapped in its own try/catch so a failure
      // to notify (e.g. admin hasn't enabled notifications yet, or the
      // admin deployment is briefly down) never prevents the order itself
      // from being saved - the order record is the source of truth, the
      // push notification is a convenience on top of it.
      try {
        await fetch('https://zelux-admin.vercel.app/api/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_PUSH_SECRET || '',
          },
          body: JSON.stringify({
            title: 'ZELUX: New Order',
            // savedOrder (addOrder's return value), not the local `order`
            // variable - addOrder() is what generates trackingNumber, and
            // the local `order` object never receives it back, since its
            // return value was previously discarded entirely. Referencing
            // order.trackingNumber here would have silently produced
            // "undefined" in every single notification.
            body: `${savedOrder.productName} - $${savedOrder.total} (${savedOrder.trackingNumber})`,
            url: '/dashboard',
          }),
        });
      } catch (pushErr) {
        console.error('Failed to send push notification for new order', pushErr);
      }
    } catch (err) {
      console.error('Failed to save order from webhook', err);
    }
  }

  res.json({ received: true });
}
