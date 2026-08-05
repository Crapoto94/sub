function notFound(req, res) {
  res.status(404).json({ error: 'Ressource introuvable' });
}

// Corps d'erreur normalisé : { error: "..." } (recommandation du guide).
function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${new Date().toISOString()}`, err);
  const status = err.status || err.statusCode || 500;
  const message =
    status >= 500 ? 'Erreur interne du serveur' : err.message || 'Erreur';
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
