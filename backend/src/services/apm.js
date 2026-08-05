const axios = require('axios');
const { env } = require('../config/env');

// Module unique pour tous les appels à l'API centrale (APM).
// Chaque requête porte la clé X-API-KEY de l'application.
const apm = axios.create({
  baseURL: env.apm.url,
  headers: { 'X-API-KEY': env.apm.key },
  timeout: 10000,
});

// Vérifie un couple login/mot de passe contre l'Active Directory.
// -> { success: true, dn: "CN=..." }
async function authenticateAD(username, password) {
  const { data } = await apm.post('/api/v1/ad/authenticate', { username, password });
  return data;
}

// Récupère les informations d'un agent (mail, service, nom…).
// -> GET /api/v1/ad/user?identifier=...
async function getUserAD(identifier) {
  const { data } = await apm.get('/api/v1/ad/user', { params: { identifier } });
  return data;
}

module.exports = { apm, authenticateAD, getUserAD };
