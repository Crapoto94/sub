const express = require('express');
const controller = require('./entreprise.controller');
const { authRequired } = require('../../middlewares/auth');

const router = express.Router();
router.use(authRequired);

/**
 * @swagger
 * tags:
 *   name: API Entreprise
 *   description: Contrôle des données des associations par l'API Entreprise (INSEE, DJEPVA, DataSubvention)
 */

/**
 * @swagger
 * /api/v1/entreprise/controles:
 *   get:
 *     summary: Synthèse des contrôles de toutes les associations (écarts avec l'API Entreprise)
 *     tags: [API Entreprise]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: refresh
 *         schema: { type: boolean }
 *         description: Force le rechargement (ignore le cache de 10 min)
 *     responses:
 *       200: { description: Liste des contrôles }
 *       401: { description: Non authentifié }
 */
router.get('/controles', controller.listControles);

/**
 * @swagger
 * /api/v1/entreprise/associations/{id}:
 *   get:
 *     summary: Contrôle détaillé d'une association (champ par champ, données API seules, subventions)
 *     tags: [API Entreprise]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: refresh
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Comparaison détaillée }
 *       404: { description: Association introuvable }
 */
router.get('/associations/:id', controller.getControle);

module.exports = router;
