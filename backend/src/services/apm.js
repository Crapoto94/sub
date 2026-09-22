const fs = require('fs');
const https = require('https');
const axios = require('axios');
const { env } = require('../config/env');

// L'APM interne est derrière un certificat auto-signé : on fait confiance soit
// au certificat fourni (APM_CA_CERT), soit on désactive la vérification en dev
// (APM_TLS_INSECURE=true). En production, APM_CA_CERT doit être renseigné.
function buildHttpsAgent() {
  if (env.apm.tlsInsecure) return new https.Agent({ rejectUnauthorized: false });
  if (env.apm.caCert) return new https.Agent({ ca: fs.readFileSync(env.apm.caCert) });
  return undefined;
}

// Module unique pour tous les appels à l'API centrale (APM).
// Chaque requête porte la clé X-API-KEY de l'application.
const apm = axios.create({
  baseURL: env.apm.url,
  headers: { 'X-API-KEY': env.apm.key },
  timeout: 10000,
  httpsAgent: buildHttpsAgent(),
});

// Vérifie un couple login/mot de passe contre l'Active Directory.
// -> { success: true, dn: "CN=..." }
async function authenticateAD(username, password) {
  try {
    const { data } = await apm.post('/api/v1/ad/authenticate', { username, password });
    // 200 = authentification réussie : on normalise la réponse.
    return { success: true, ...(data && typeof data === 'object' ? data : {}) };
  } catch (err) {
    const status = err.response?.status;
    // 401/404 => identifiants invalides ou utilisateur introuvable (ce n'est pas une erreur technique).
    if (status === 401 || status === 404) {
      return { success: false, error: err.response?.data?.error || 'Identifiants invalides' };
    }
    // APM injoignable, clé sans permission, etc. : erreur technique remontée telle quelle.
    throw err;
  }
}

// Récupère les informations d'un agent (mail, service, nom…).
// -> GET /api/v1/ad/user?identifier=...
async function getUserAD(identifier) {
  const { data } = await apm.get('/api/v1/ad/user', { params: { identifier } });
  return data;
}

module.exports = { apm, authenticateAD, getUserAD };
