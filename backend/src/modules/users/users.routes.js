const express = require('express');
const usersController = require('./users.controller');
const { authRequired, adminRequired } = require('../../middlewares/auth');

const router = express.Router();

// Toutes les routes de gestion des utilisateurs sont réservées aux admins.
router.use(authRequired, adminRequired);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs de l'application (administration)
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Liste paginée des utilisateurs
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux administrateurs }
 *   post:
 *     summary: Créer un utilisateur (compte local si password fourni)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username]
 *             properties:
 *               username: { type: string }
 *               displayName: { type: string }
 *               email: { type: string }
 *               service: { type: string }
 *               role: { type: string, enum: [admin, membre] }
 *               password: { type: string, description: "Si renseigné, crée un compte local" }
 *     responses:
 *       201: { description: Utilisateur créé }
 *       400: { description: Données invalides }
 */
router.get('/', usersController.list);
router.post('/', usersController.create);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Détail d'un utilisateur
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Utilisateur }
 *       404: { description: Utilisateur introuvable }
 *   patch:
 *     summary: Mise à jour d'un utilisateur (rôle, activation, infos)
 *     tags: [Users]
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
 *               role: { type: string, enum: [admin, membre] }
 *               isActive: { type: boolean }
 *               displayName: { type: string }
 *               email: { type: string }
 *               service: { type: string }
 *     responses:
 *       200: { description: Utilisateur mis à jour }
 *       400: { description: Données invalides }
 *       404: { description: Utilisateur introuvable }
 */
router.get('/:id', usersController.get);
router.patch('/:id', usersController.patch);

/**
 * @swagger
 * /api/v1/users/{id}/password:
 *   post:
 *     summary: Définir / réinitialiser le mot de passe local d'un utilisateur
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200: { description: Mot de passe mis à jour }
 *       400: { description: Mot de passe trop court }
 *       404: { description: Utilisateur introuvable }
 */
router.post('/:id/password', usersController.setPassword);

module.exports = router;
