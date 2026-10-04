const axios = require('axios');
const { env } = require('../config/env');

// Module unique pour les appels à l'API Entreprise (données publiques INSEE,
// DJEPVA/RNA et DataSubvention). Le jeton JWT est passé en Authorization: Bearer
// et chaque requête porte les paramètres obligatoires recipient / object / context.
const cfg = env.apiEntreprise;

const client = axios.create({
  baseURL: cfg.url,
  headers: {
    Authorization: `Bearer ${cfg.key}`,
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Normalise un identifiant SIREN : ne garde que les chiffres et, si un SIRET
// (14 chiffres) a été saisi par erreur, conserve les 9 premiers.
function normalizeSiren(input) {
  const digits = String(input ?? '').replace(/\D/g, '');
  if (digits.length === 14) return digits.slice(0, 9);
  return digits;
}

// Contrôle de la clé de Luhn (valide un SIREN de 9 chiffres).
function isValidSiren(siren) {
  if (!/^\d{9}$/.test(siren)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let d = Number(siren[i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function queryParams() {
  return { recipient: cfg.recipient, object: cfg.object, context: cfg.context };
}

function formatError(err) {
  const detail = err?.response?.data?.errors?.[0]?.detail;
  if (detail) return detail;
  if (err?.response?.status) return `Erreur HTTP ${err.response.status}`;
  if (err?.code === 'ECONNABORTED') return 'Délai dépassé (API Entreprise)';
  return err?.message || 'Erreur inconnue';
}

async function call(path, { retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const { data } = await client.get(path, { params: queryParams() });
      return { data };
    } catch (err) {
      lastErr = err;
      const status = err.response?.status;
      // 400 (identifiant invalide), 403 (token) et 404 (inconnu) ne se réessaient pas.
      if (status === 400 || status === 403 || status === 404) break;
      // 5xx / timeout : on retente une fois.
    }
  }
  return { error: formatError(lastErr) };
}

// Identité légale INSEE (unité légale par SIREN).
function getUniteLegale(siren, opts) {
  return call(`/v3/insee/sirene/unites_legales/${siren}`, opts);
}

// Établissement INSEE (adresse détaillée, par SIRET).
function getEtablissement(siret, opts) {
  return call(`/v3/insee/sirene/etablissements/${siret}`, opts);
}

// Fiche association DJEPVA / RNA.
function getAssociationDjepva(sirenOrRna, opts) {
  return call(`/v4/djepva/api-association/associations/open_data/${sirenOrRna}`, opts);
}

// Subventions versées par l'État et ses opérateurs (rubrique 9 « autres subventions »).
function getSubventions(sirenOrRna, opts = {}) {
  return call(`/v3/data_subvention/associations/${sirenOrRna}/subventions`, { retries: 0, ...opts });
}

module.exports = {
  normalizeSiren,
  isValidSiren,
  getUniteLegale,
  getEtablissement,
  getAssociationDjepva,
  getSubventions,
};
