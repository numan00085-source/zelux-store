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
        status: 'Processing',
        createdAt: new Date().toISOString(),
        stripeSessionId: session.id,
      };

      await addOrder(order);
    } catch (err) {
      console.error('Failed to save order from webhook', err);
    }
  }

  res.json({ received: true });
}
