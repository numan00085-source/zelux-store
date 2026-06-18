let orders = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.json(orders);
  }
  if (req.method === 'POST') {
    const order = { ...req.body, id: `ORD-${Date.now()}`, createdAt: new Date().toISOString(), status: 'Processing' };
    orders.push(order);
    return res.json(order);
  }
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
    return res.json({ success: true });
  }
  res.status(405).end();
}
