const express = require('express');
const dossiersController = require('./dossiers.controller');
const { authRequired, adminRequired } = require('../../middlewares/auth');

const router = express.Router();
router.use(authRequired);

/**
 * @swagger
 * tags:
 *   name: Dossiers
 *   description: Dossiers de demande de subvention (1 par association et par année, 10 sections)
 */

/**
 * @swagger
 * /api/v1/dossiers:
 *   get:
 *     summary: Liste paginée des dossiers (filtres année, statut, recherche)
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: annee
 *         schema: { type: integer }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [brouillon, depose, instruction, decision, accorde, refuse] }
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
 *       200: { description: Liste des dossiers }
 *       401: { description: Non authentifié }
 *   post:
 *     summary: Créer un dossier pour une association et une année
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [associationId, annee]
 *             properties:
 *               associationId: { type: integer }
 *               annee: { type: integer, minimum: 2000, maximum: 2100 }
 *               statut: { type: string, enum: [brouillon, depose, instruction, decision, accorde, refuse] }
 *               dateDepot: { type: string }
 *     responses:
 *       201: { description: Dossier créé }
 *       400: { description: Données invalides }
 *       409: { description: Un dossier existe déjà pour cette association et cette année }
 */
router.get('/', dossiersController.list);
router.post('/', dossiersController.create);

/**
 * @swagger
 * /api/v1/dossiers/stats:
 *   get:
 *     summary: Statistiques des dossiers (par statut, montants sollicités/accordés)
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: annee
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Statistiques }
 *       401: { description: Non authentifié }
 */
router.get('/stats', dossiersController.stats);

/**
 * @swagger
 * /api/v1/dossiers/corbeille:
 *   get:
 *     summary: Corbeille — dossiers supprimés (restaurables), réservé aux admins
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: annee
 *         schema: { type: integer }
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
 *       200: { description: Dossiers dans la corbeille (deletedAt/deletedBy renseignés) }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux administrateurs }
 */
router.get('/corbeille', adminRequired, dossiersController.listCorbeille);

/**
 * @swagger
 * /api/v1/dossiers/{id}:
 *   get:
 *     summary: Détail d'un dossier avec toutes ses sections
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Dossier complet }
 *       404: { description: Dossier introuvable }
 *   patch:
 *     summary: Mise à jour du statut ou de la date de dépôt
 *     tags: [Dossiers]
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
 *               statut: { type: string, enum: [brouillon, depose, instruction, decision, accorde, refuse] }
 *               dateDepot: { type: string }
 *     responses:
 *       200: { description: Dossier mis à jour }
 *       404: { description: Dossier introuvable }
 */
router.get('/:id', dossiersController.get);
router.patch('/:id', dossiersController.patch);

/**
 * @swagger
 * /api/v1/dossiers/{id}:
 *   delete:
 *     summary: Mettre un dossier à la corbeille (suppression logique, réservé aux admins)
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dossier supprimé (deletedAt/deletedBy renseignés)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 deletedAt: { type: string, nullable: true }
 *                 deletedBy: { type: integer, nullable: true }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Dossier introuvable }
 *       409: { description: Dossier déjà dans la corbeille }
 */
router.delete('/:id', adminRequired, dossiersController.remove);

/**
 * @swagger
 * /api/v1/dossiers/{id}/restore:
 *   post:
 *     summary: Restaurer un dossier depuis la corbeille (réservé aux admins)
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Dossier restauré }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Dossier introuvable }
 *       409: { description: Le dossier n'est pas dans la corbeille }
 */
router.post('/:id/restore', adminRequired, dossiersController.restore);

/**
 * @swagger
 * /api/v1/dossiers/{id}/purge:
 *   delete:
 *     summary: Suppression définitive d'un dossier de la corbeille (réservé aux admins)
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dossier définitivement supprimé (sections incluses)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 reference: { type: string }
 *                 purged: { type: boolean }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux administrateurs }
 *       404: { description: Dossier introuvable }
 *       409: { description: Le dossier doit d'abord être mis à la corbeille }
 */
router.delete('/:id/purge', adminRequired, dossiersController.purge);

/**
 * @swagger
 * /api/v1/dossiers/{id}/sections/{section}:
 *   put:
 *     summary: Enregistrer une section du dossier (remplacement complet)
 *     tags: [Dossiers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *           enum: [effectifs, vie-associative, situation-financiere, niveaux-sportifs, projets-realises, projets-prevus, politique-tarifaire, autres-subventions, pieces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Objet pour les sections simples, tableau d'objets pour les sections multiples
 *     responses:
 *       200: { description: Section enregistrée }
 *       400: { description: Section inconnue ou données invalides }
 *       404: { description: Dossier introuvable }
 */
router.put('/:id/sections/:section', dossiersController.saveSection);

module.exports = router;
