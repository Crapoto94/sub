const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

// Vérifie le JWT applicatif (Authorization: Bearer ...).
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentification requise' });
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
}

// Restreint une route aux administrateurs.
function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  return next();
}

module.exports = { authRequired, adminRequired };
