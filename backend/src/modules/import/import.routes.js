const express = require('express');
const multer = require('multer');
const importController = require('./import.controller');
const { authRequired } = require('../../middlewares/auth');

const router = express.Router();
router.use(authRequired);

// Chargement en mémoire (pas de stockage disque : les fichiers sont des imports ponctuels).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
});

/**
 * @swagger
 * /api/v1/import/excel:
 *   post:
 *     summary: Importer un dossier depuis des fichiers Excel (dossier, tableau financier, bilan CPO)
 *     tags: [Import]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               annee: { type: integer, default: 2027 }
 *               dossier: { type: string, format: binary }
 *               financier: { type: string, format: binary }
 *               bilan: { type: string, format: binary }
 *     responses:
 *       201: { description: Dossier importé (création ou mise à jour) }
 *       400: { description: Fichier obligatoire (dossier) manquant ou données invalides }
 *       401: { description: Non authentifié }
 */
router.post(
  '/excel',
  upload.any(),
  importController.upload
);

module.exports = router;