import { getStorefrontSecuritySettings } from '../../lib/redis';

export default async function handler(req, res) {
  try {
    const ip = req.query.ip || '';
    const settings = await getStorefrontSecuritySettings();
    const blocked = settings.blockedIps.includes(ip);
    res.json({ blocked });
  } catch (err) {
    // Fail open: if Redis is unreachable, don't block legitimate traffic.
    res.json({ blocked: false });
  }
}
