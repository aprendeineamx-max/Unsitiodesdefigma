const express = require('express');
const router = express.Router();
const { purgeCloudflareCache } = require('../services/CloudflareService');

/**
 * POST /api/cloudflare/purge
 * Purga todo el caché de Cloudflare
 */
router.post('/purge', purgeCloudflareCache);

module.exports = router;
