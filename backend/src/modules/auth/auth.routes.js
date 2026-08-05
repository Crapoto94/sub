const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const { authRequired } = require('../../middlewares/auth');

const router = express.Router();

// Limitation de débit sur la connexion (endpoint sensible).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification des agents via l'Active Directory (APM)
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Connexion d'un agent (login Ville + mot de passe AD)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: "j.durand" }
 *               password: { type: string, example: "******" }
 *     responses:
 *       200:
 *         description: Connexion réussie, renvoie le JWT applicatif et le profil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Identifiants manquants }
 *       401: { description: Identifiants invalides }
 *       403: { description: Compte désactivé }
 */
router.post('/login', loginLimiter, authController.login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur courant
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: Non authentifié }
 */
router.get('/me', authRequired, authController.me);

module.exports = router;
