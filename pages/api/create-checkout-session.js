import Stripe from 'stripe';
import { getEffectiveStripeKeys, checkRateLimit } from '../../lib/redis';

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
      shipping_address_collection: {
        allowed_countries: [
          'BD', 'IN', 'PK', 'LK', 'NP', 'MV', 'JP', 'KR', 'SG', 'MY', 'TH', 'ID', 'PH', 'VN',
          'AE', 'SA', 'QA', 'OM', 'KW', 'BH',
          'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'PT', 'GR', 'IE', 'AT',
          'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE',
          'AU', 'NZ',
          'ZA', 'EG', 'MA', 'NG', 'KE',
        ],
      },
      metadata: {
        customerName: form.name,
        customerEmail: form.email,
        shippingAddress: `${form.address}, ${form.city}, ${form.state} ${form.zip}`,
        itemsSummary,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
