import { getRedis } from '../../lib/redis';

const ADS_KEY = 'zelux:ads';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const redis = getRedis();
    const data = await redis.get(ADS_KEY);
    const config = data ? JSON.parse(data) : { frequencyCap: 2, ads: [] };
    // Only send enabled ads to the public
    const enabledAds = (config.ads || []).filter(a => a.enabled);
    res.json({ frequencyCap: config.frequencyCap, ads: enabledAds });
  } catch (err) {
    res.json({ frequencyCap: 2, ads: [] });
  }
}
