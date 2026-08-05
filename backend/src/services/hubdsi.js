const axios = require('axios');
const { env } = require('../config/env');

// Module unique pour les appels à l'API métier Hub DSI (données Ville).
// Jeton dédié dsk_... transmis dans le header X-API-Key.
const hub = axios.create({
  baseURL: env.hubDsi.url,
  headers: { 'X-API-Key': env.hubDsi.key },
  timeout: 10000,
});

module.exports = { hub };
