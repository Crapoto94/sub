const express = require('express');
const associationsController = require('./associations.controller');
const { authRequired, adminRequired } = require('../../middlewares/auth');

const router = express.Router();

// La création et la modification des associations sont réservées aux admins.
router.get('/', authRequired, associationsController.list);
router.post('/', authRequired, adminRequired, associationsController.create);

/**
 * @swagger
 * tags:
 *   name: Associations
 *   description: Référentiel des associations sportives
 */

/**
 * @swagger
 * /api/v1/associations:
 *   get:
 *     summary: Liste paginée des associations (recherche possible par nom, SIREN ou RNA)
 *     tags: [Associations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Liste des associations }
 *       401: { description: Non authentifié }
 *   post:
 *     summary: Créer une association
 *     tags: [Associations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nomOfficielAssociation]
 *             properties:
 *               nomOfficielAssociation: { type: string }
 *               sigleAbreviation: { type: string }
 *               objetAssociation: { type: string }
 *               adresseSiegeSocial: { type: string }
 *               codePostal: { type: string }
 *               ville: { type: string }
 *               email: { type: string }
 *               telephone: { type: string }
 *               siteWebReseauxSociaux: { type: string }
 *               numeroRna: { type: string }
 *               numeroSiren: { type: string }
 *               dateCreation: { type: string }
 *               agrementJeunesseSports: { type: string }
 *               federationSportiveAffiliation: { type: string }
 *               disciplinesPratiquees: { type: string }
 *               numeroAffiliation: { type: string }
 *               categorieSportive: { type: string }
 *     responses:
 *       201: { description: Association créée }
 *       400: { description: Données invalides }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux administrateurs }
 */
router.get('/:id', authRequired, associationsController.get);
router.patch('/:id', authRequired, adminRequired, associationsController.patch);

/**
 * @swagger
 * /api/v1/associations/{id}:
 *   get:
 *     summary: Détail d'une association
 *     tags: [Associations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Association }
 *       404: { description: Association introuvable }
 *   patch:
 *     summary: Mise à jour d'une association
 *     tags: [Associations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomOfficielAssociation: { type: string }
 *               sigleAbreviation: { type: string }
 *               objetAssociation: { type: string }
 *               adresseSiegeSocial: { type: string }
 *               codePostal: { type: string }
 *               ville: { type: string }
 *               email: { type: string }
 *               telephone: { type: string }
 *               siteWebReseauxSociaux: { type: string }
 *               numeroRna: { type: string }
 *               numeroSiren: { type: string }
 *               dateCreation: { type: string }
 *               agrementJeunesseSports: { type: string }
 *               federationSportiveAffiliation: { type: string }
 *               disciplinesPratiquees: { type: string }
 *               numeroAffiliation: { type: string }
 *               categorieSportive: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Association mise à jour }
 *       404: { description: Association introuvable }
 */
module.exports = router;
