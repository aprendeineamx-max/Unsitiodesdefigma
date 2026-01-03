const axios = require('axios');

/**
 * Purga TODO el caché de Cloudflare para micuenta.shop
 * Requiere: CLOUDFLARE_ZONE_ID y CLOUDFLARE_API_KEY en .env
 */
async function purgeCloudflareCache(req, res) {
    const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
    const API_KEY = process.env.CLOUDFLARE_API_KEY;
    const EMAIL = process.env.CLOUDFLARE_EMAIL;

    if (!ZONE_ID || !API_KEY || !EMAIL) {
        return res.status(500).json({
            success: false,
            error: 'Missing Cloudflare credentials in .env'
        });
    }

    try {
        const response = await axios.post(
            `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
            { purge_everything: true },
            {
                headers: {
                    'X-Auth-Email': EMAIL,
                    'X-Auth-Key': API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            res.json({
                success: true,
                message: 'Cloudflare cache purged successfully',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                success: false,
                error: response.data.errors || 'Unknown Cloudflare error'
            });
        }
    } catch (error) {
        console.error('Cloudflare purge error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.errors || error.message
        });
    }
}

module.exports = { purgeCloudflareCache };
