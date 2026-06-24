import Redis from 'ioredis';

let client = null;

export function getRedis() {
  if (!client) {
    const url = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.STORAGE_REDIS_URL;
    if (!url) {
      throw new Error('No Redis connection string found in environment variables.');
    }
    client = new Redis(url, {
      maxRetriesPerRequest: 3,
      tls: url.startsWith('rediss://') ? {} : undefined,
    });
  }
  return client;
}

const PRODUCTS_KEY = 'zelux:products';
const ORDERS_KEY = 'zelux:orders';

export async function getAllProducts() {
  const redis = getRedis();
  const data = await redis.get(PRODUCTS_KEY);
  if (!data) return null;
  return JSON.parse(data);
}

export async function saveAllProducts(products) {
  const redis = getRedis();
  await redis.set(PRODUCTS_KEY, JSON.stringify(products));
}

export async function getAllOrders() {
  const redis = getRedis();
  const data = await redis.get(ORDERS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export async function saveAllOrders(orders) {
  const redis = getRedis();
  await redis.set(ORDERS_KEY, JSON.stringify(orders));
}

// Generates a unique, customer-facing ZELUX tracking number, distinct from
// the internal order id. Format: ZELUX-XXXXXXX (7 random alphanumeric
// characters, uppercase) - short enough to read aloud/type, long enough that
// collisions are practically impossible at this store's order volume.
function generateTrackingNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excludes easily-confused chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 7; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `ZELUX-${code}`;
}

export async function addOrder(order) {
  const orders = await getAllOrders();
  const trackingNumber = generateTrackingNumber();
  const fullOrder = {
    ...order,
    trackingNumber,
    // Each status the order has passed through, with a timestamp and an
    // optional admin-written caption (e.g. "Left our Dhaka warehouse") -
    // this is what powers the Shein-style detailed tracking view, not just
    // a single current-status field.
    statusHistory: [{ status: order.status || 'Processing', caption: '', updatedAt: new Date().toISOString() }],
  };
  orders.unshift(fullOrder);
  await saveAllOrders(orders);
  return fullOrder;
}

// Updates an order's status by tracking number (not the internal Stripe-
// derived id), appending a new entry to statusHistory rather than overwriting
// the previous status - this preserves the full timeline for the customer's
// tracking view, matching how Shein/courier tracking pages show a history of
// events rather than just "current status."
export async function updateOrderStatus(trackingNumber, status, caption) {
  const orders = await getAllOrders();
  const updated = orders.map(o => {
    if (o.trackingNumber !== trackingNumber) return o;
    const statusHistory = [...(o.statusHistory || []), { status, caption: caption || '', updatedAt: new Date().toISOString() }];
    return { ...o, status, statusHistory };
  });
  await saveAllOrders(updated);
  return updated.find(o => o.trackingNumber === trackingNumber);
}

// Returns only the orders belonging to a specific customer email, so the
// customer-facing API route never has to send (or the client never has to
// receive) every other customer's name/address/email just to filter
// client-side - that was a real privacy gap in the previous version of this
// API, fixed here rather than left in place.
export async function getOrdersForCustomer(email) {
  const orders = await getAllOrders();
  const normalizedEmail = (email || '').trim().toLowerCase();
  return orders.filter(o => (o.customerEmail || '').trim().toLowerCase() === normalizedEmail);
}

export async function getOrderByTrackingNumber(trackingNumber) {
  const orders = await getAllOrders();
  return orders.find(o => o.trackingNumber === trackingNumber) || null;
}

const STRIPE_KEYS_KEY = 'zelux:stripe-keys';

export async function getEffectiveStripeKeys() {
  const redis = getRedis();
  try {
    const data = await redis.get(STRIPE_KEYS_KEY);
    if (data) {
      const keys = JSON.parse(data);
      if (keys.useCustomKeys && keys.secretKey && keys.publishableKey) {
        return { secretKey: keys.secretKey, publishableKey: keys.publishableKey, source: 'admin' };
      }
    }
  } catch (e) {
    console.error('Failed to read custom Stripe keys, falling back to env vars', e);
  }
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    source: 'env',
  };
}

const USERS_KEY = 'zelux:users';

export async function getAllUsers() {
  const redis = getRedis();
  const data = await redis.get(USERS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export async function upsertUser(email, name) {
  const redis = getRedis();
  const users = await getAllUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;

  const existing = users.find(u => u.email === normalizedEmail);
  if (existing) {
    existing.lastSeenAt = new Date().toISOString();
    if (name && !existing.name) existing.name = name;
  } else {
    users.push({
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      signedUpAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    });
  }
  await redis.set(USERS_KEY, JSON.stringify(users));
  return existing || users[users.length - 1];
}

const SECURITY_KEY = 'zelux:security';

export async function getStorefrontSecuritySettings() {
  const redis = getRedis();
  try {
    const data = await redis.get(SECURITY_KEY);
    if (!data) return { blockedIps: [], storefrontRateLimitPerMinute: 30 };
    const parsed = JSON.parse(data);
    return { blockedIps: parsed.blockedIps || [], storefrontRateLimitPerMinute: parsed.storefrontRateLimitPerMinute || 30 };
  } catch {
    return { blockedIps: [], storefrontRateLimitPerMinute: 30 };
  }
}

// Simple fixed-window rate limiter keyed by IP + route name.
// Returns { allowed, remaining } so callers can decide whether to proceed.
export async function checkRateLimit(ip, routeName, limitOverride) {
  const redis = getRedis();
  const settings = await getStorefrontSecuritySettings();

  if (settings.blockedIps.includes(ip)) {
    return { allowed: false, blocked: true, remaining: 0 };
  }

  const limit = limitOverride || settings.storefrontRateLimitPerMinute || 30;
  const key = `zelux:ratelimit:${routeName}:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 60); // 1-minute fixed window
  }
  return { allowed: current <= limit, blocked: false, remaining: Math.max(0, limit - current) };
}

const SUPPORT_KEY = 'zelux:support-conversations';

function normalizeEmailKey(email) {
  return (email || '').trim().toLowerCase();
}

export async function getAllSupportConversations() {
  const redis = getRedis();
  const data = await redis.get(SUPPORT_KEY);
  if (!data) return {};
  return JSON.parse(data);
}

export async function getSupportConversation(email) {
  const conversations = await getAllSupportConversations();
  const key = normalizeEmailKey(email);
  return conversations[key] || { email: key, messages: [], updatedAt: null, unreadByAdmin: false, unreadByCustomer: false };
}

export async function addSupportMessage(email, message) {
  const redis = getRedis();
  const conversations = await getAllSupportConversations();
  const key = normalizeEmailKey(email);
  const convo = conversations[key] || { email: key, messages: [], updatedAt: null };

  convo.messages.push({
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sender: message.sender, // 'customer' | 'admin'
    text: message.text || '',
    imageUrl: message.imageUrl || null,
    createdAt: new Date().toISOString(),
  });
  convo.updatedAt = new Date().toISOString();
  // Track unread state per side so each inbox can show a notification badge.
  if (message.sender === 'customer') convo.unreadByAdmin = true;
  if (message.sender === 'admin') convo.unreadByCustomer = true;

  conversations[key] = convo;
  await redis.set(SUPPORT_KEY, JSON.stringify(conversations));
  return convo;
}

export async function markSupportConversationRead(email, side) {
  const redis = getRedis();
  const conversations = await getAllSupportConversations();
  const key = normalizeEmailKey(email);
  if (!conversations[key]) return null;
  if (side === 'admin') conversations[key].unreadByAdmin = false;
  if (side === 'customer') conversations[key].unreadByCustomer = false;
  await redis.set(SUPPORT_KEY, JSON.stringify(conversations));
  return conversations[key];
}

const ADDRESSES_KEY = 'zelux:addresses';

export async function getUserAddresses(email) {
  const redis = getRedis();
  const data = await redis.get(ADDRESSES_KEY);
  const all = data ? JSON.parse(data) : {};
  const key = normalizeEmailKey(email);
  return all[key] || [];
}

export async function saveUserAddress(email, address) {
  const redis = getRedis();
  const data = await redis.get(ADDRESSES_KEY);
  const all = data ? JSON.parse(data) : {};
  const key = normalizeEmailKey(email);
  const list = all[key] || [];

  if (address.id) {
    const idx = list.findIndex(a => a.id === address.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...address };
    else list.push({ ...address, id: `addr-${Date.now()}` });
  } else {
    list.push({ ...address, id: `addr-${Date.now()}` });
  }

  all[key] = list;
  await redis.set(ADDRESSES_KEY, JSON.stringify(all));
  return list;
}

export async function deleteUserAddress(email, addressId) {
  const redis = getRedis();
  const data = await redis.get(ADDRESSES_KEY);
  const all = data ? JSON.parse(data) : {};
  const key = normalizeEmailKey(email);
  all[key] = (all[key] || []).filter(a => a.id !== addressId);
  await redis.set(ADDRESSES_KEY, JSON.stringify(all));
  return all[key];
}
