import { getUserAddresses, saveUserAddress, deleteUserAddress } from '../../lib/redis';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { email } = req.query;
      if (!email) return res.status(400).json({ error: 'Email is required.' });
      const addresses = await getUserAddresses(email);
      return res.json(addresses);
    }

    if (req.method === 'POST') {
      const { email, address } = req.body;
      if (!email || !address) return res.status(400).json({ error: 'Email and address are required.' });
      const addresses = await saveUserAddress(email, address);
      return res.json(addresses);
    }

    if (req.method === 'DELETE') {
      const { email, addressId } = req.body;
      if (!email || !addressId) return res.status(400).json({ error: 'Email and addressId are required.' });
      const addresses = await deleteUserAddress(email, addressId);
      return res.json(addresses);
    }

    res.status(405).end();
  } catch (err) {
    console.error('addresses API error', err);
    res.status(500).json({ error: err.message });
  }
}
