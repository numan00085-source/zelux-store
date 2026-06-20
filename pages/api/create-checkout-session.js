import Stripe from 'stripe';
import { getEffectiveStripeKeys } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

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
    const line_items = cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: `${item.name} (${item.selectedVariant})`, images: [item.images[0]] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      metadata: {
        customerName: form.name,
        customerEmail: form.email,
        shippingAddress: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
