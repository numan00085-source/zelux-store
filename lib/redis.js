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

export async function addOrder(order) {
  const orders = await getAllOrders();
  orders.unshift(order);
  await saveAllOrders(orders);
  return order;
}

export async function updateOrderStatus(id, status) {
  const orders = await getAllOrders();
  const updated = orders.map(o => o.id === id ? { ...o, status } : o);
  await saveAllOrders(updated);
  return updated;
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
