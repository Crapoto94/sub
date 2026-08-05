const express = require('express');
const { db } = require('../../db/sqlite');
const { env } = require('../../config/env');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: Santé et supervision de l'application
 */

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: État de santé de l'application et de ses dépendances
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Statut de l'app, de la base et des APIs configurées
 */
router.get('/', (req, res) => {
  let dbOk = true;
  try {
    db.prepare('SELECT 1').get();
  } catch {
    dbOk = false;
  }
  res.json({
    status: dbOk ? 'ok' : 'degraded',
    name: 'sub-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    checks: {
      database: dbOk ? 'ok' : 'error',
      apm: { configured: !!env.apm.key, url: env.apm.url },
      hubDsi: { configured: !!env.hubDsi.url },
    },
  });
});

module.exports = router;
