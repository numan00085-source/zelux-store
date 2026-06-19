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
