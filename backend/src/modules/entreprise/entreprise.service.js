const entrepriseClient = require('../../services/entreprise');
const associationsRepo = require('../associations/associations.repository');
const { env } = require('../../config/env');

// Cache mémoire des réponses API Entreprise (évite de re-solliciter l'API à
// chaque affichage). Clé = SIREN normalisé + mode (avec/sans subventions).
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

// ---------------------------------------------------------------------------
// Utilitaires de normalisation / comparaison
// ---------------------------------------------------------------------------

function isEmpty(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

function norm(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function unixToIso(u) {
  if (isEmpty(u)) return null;
  const n = Number(u);
  if (!Number.isFinite(n)) return null;
  return new Date(n * 1000).toISOString().slice(0, 10);
}

// Normalise les formats de date hétérogènes de la base locale
// (« 2024-03-17 », « 01/02/2024 », « Wed Jan 24 2024 … »).
function parseDateToIso(value) {
  if (!value) return null;
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

function defaultCompare(local, apiVal) {
  const a = norm(local);
  const b = norm(apiVal);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function joinAddress(adr) {
  if (!adr) return null;
  const street = [adr.numero_voie, adr.type_voie, adr.libelle_voie].filter(Boolean).join(' ').trim();
  const complement = adr.complement || adr.complement_adresse || null;
  return [complement, street].filter(Boolean).join(' - ') || null;
}

// ---------------------------------------------------------------------------
// Récupération brute (avec cache)
// ---------------------------------------------------------------------------

async function getRawData(association, { withSubventions = false, refresh = false, retries } = {}) {
  const sirenRaw = association.numero_siren;
  const siren = entrepriseClient.normalizeSiren(sirenRaw);
  const validSiren = entrepriseClient.isValidSiren(siren);
  const rna = (association.numero_rna || '').trim();
  const cacheKey = `${siren}|sub=${withSubventions ? 1 : 0}`;

  if (!refresh) {
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  }

  const result = {
    sirenRaw: sirenRaw ?? null,
    siren,
    validSiren,
    rna: rna || null,
    insee: null,
    etablissement: null,
    djepva: null,
    subventions: null,
    errors: [],
  };

  if (!env.apiEntreprise.key) {
    result.errors.push('API Entreprise non configurée : renseigner API_ENTREPRISE_KEY');
  } else if (!siren) {
    result.errors.push('SIREN absent dans la base locale');
  } else if (!validSiren) {
    result.errors.push(`SIREN « ${sirenRaw} » invalide (clé de Luhn) : ${siren}`);
  } else {
    const [insee, djepva] = await Promise.all([
      entrepriseClient.getUniteLegale(siren, { retries }),
      entrepriseClient.getAssociationDjepva(rna || siren, { retries }),
    ]);
    if (insee.error) result.errors.push(`INSEE : ${insee.error}`);
    else result.insee = insee.data?.data ?? null;
    if (djepva.error) result.errors.push(`DJEPVA : ${djepva.error}`);
    else result.djepva = djepva.data?.data ?? null;

    // Adresse de repli via l'établissement siège INSEE si DJEPVA indisponible.
    const siret = result.insee?.siret_siege_social;
    if (!result.djepva?.adresse_siege && siret) {
      const et = await entrepriseClient.getEtablissement(siret, { retries });
      if (!et.error) result.etablissement = et.data?.data ?? null;
    }

    if (withSubventions) {
      const sub = await entrepriseClient.getSubventions(siren);
      // Un 404 DataSubvention (association sans subvention État) n'est pas une anomalie.
      if (sub.error) {
        if (!/n'existe pas|ne comporte aucune information/i.test(sub.error)) {
          result.errors.push(`DataSubvention : ${sub.error}`);
        }
      } else {
        result.subventions = sub.data?.data ?? null;
      }
    }
  }

  cache.set(cacheKey, { at: Date.now(), value: result });
  return result;
}

// ---------------------------------------------------------------------------
// Extraction d'une vue API normalisée
// ---------------------------------------------------------------------------

function extractApi(raw) {
  const insee = raw.insee || {};
  const et = raw.etablissement || {};
  const dj = raw.djepva || {};
  const pm = insee.personne_morale_attributs || {};
  const djAdr = dj.adresse_siege || {};
  const inseeAdr = et.adresse || {};
  const agrements = Array.isArray(dj.agrements) ? dj.agrements : [];
  const etabs = Array.isArray(dj.etablissements) ? dj.etablissements : [];
  const contact = etabs.find((e) => e.telephone || e.courriel) || etabs[0] || {};

  return {
    nom: dj.nom || pm.raison_sociale || null,
    sigle: dj.sigle || pm.sigle || null,
    objet: dj.activites?.objet || null,
    adresse: joinAddress(djAdr) || joinAddress(inseeAdr) || null,
    codePostal: djAdr.code_postal || inseeAdr.code_postal || null,
    ville: djAdr.commune || inseeAdr.libelle_commune || null,
    numeroRna: insee.rna || dj.rna || null,
    numeroSiren: insee.siren || dj.siren || raw.siren || null,
    dateCreation: dj.date_creation || unixToIso(insee.date_creation) || null,
    active:
      typeof dj.active === 'boolean'
        ? dj.active
        : insee.etat_administratif
          ? insee.etat_administratif === 'A'
          : null,
    siretSiege: insee.siret_siege_social || dj.siret_siege || null,
    formeJuridique: insee.forme_juridique?.libelle || dj.forme_juridique?.libelle || null,
    naf: insee.activite_principale
      ? `${insee.activite_principale.code || ''} ${insee.activite_principale.libelle || ''}`.trim()
      : null,
    categorieEntreprise: insee.categorie_entreprise || null,
    effectif: insee.tranche_effectif_salarie?.intitule || null,
    ess: typeof insee.economie_sociale_et_solidaire === 'boolean' ? insee.economie_sociale_et_solidaire : null,
    datePublicationJo: dj.date_publication_journal_officiel || null,
    dateDissolution: dj.date_dissolution || null,
    agrements: agrements.map((a) => [a.type, a.numero].filter(Boolean).join(' ')).filter(Boolean),
    telephone: contact.telephone || null,
    email: contact.courriel || null,
  };
}

// ---------------------------------------------------------------------------
// Construction du tableau de comparaison
// ---------------------------------------------------------------------------

function computeStatus(local, apiVal, couverture, compare) {
  if (couverture === 'hors_api') {
    return isEmpty(local) ? 'absent' : 'non_verifiable';
  }
  const l = isEmpty(local);
  const a = isEmpty(apiVal);
  if (l && a) return 'absent';
  if (l) return 'api_seul';
  if (a) return 'local_seul';
  return compare(local, apiVal) ? 'ok' : 'ecart';
}

function buildRows(assoc, api) {
  const rows = [];
  const add = (cle, libelle, local, apiVal, opts = {}) => {
    const couverture = opts.couverture || 'api';
    rows.push({
      cle,
      libelle,
      local: isEmpty(local) ? null : String(local),
      api: isEmpty(apiVal) ? null : String(apiVal),
      source: opts.source || null,
      couverture,
      statut: computeStatus(local, apiVal, couverture, opts.compare || defaultCompare),
    });
  };

  add('nomOfficielAssociation', 'Nom officiel', assoc.nom_officiel_association, api.nom, { source: 'DJEPVA / INSEE' });
  add('sigleAbreviation', 'Sigle / abréviation', assoc.sigle_abreviation, api.sigle, { source: 'DJEPVA' });
  add('numeroSiren', 'SIREN', assoc.numero_siren, api.numeroSiren, {
    source: 'INSEE',
    // Écart si les SIREN diffèrent OU si la valeur locale est mal formée
    // (SIRET à 14 chiffres, espaces…).
    compare: (l, r) =>
      entrepriseClient.normalizeSiren(l) === entrepriseClient.normalizeSiren(r) &&
      String(l).trim() === entrepriseClient.normalizeSiren(l),
  });
  add('numeroRna', 'N° RNA', assoc.numero_rna, api.numeroRna, { source: 'INSEE / DJEPVA' });
  add('dateCreation', 'Date de création', parseDateToIso(assoc.date_creation) || assoc.date_creation, api.dateCreation, {
    source: 'DJEPVA / INSEE',
    compare: (l, r) => parseDateToIso(l) === parseDateToIso(r),
  });
  add(
    'isActive',
    'Association active',
    assoc.is_active ? 'Oui' : 'Non',
    api.active === null ? null : api.active ? 'Oui' : 'Non',
    { source: 'INSEE / DJEPVA' }
  );
  add('adresseSiegeSocial', 'Adresse du siège', assoc.adresse_siege_social, api.adresse, { source: 'DJEPVA / INSEE' });
  add('codePostal', 'Code postal', assoc.code_postal, api.codePostal, { source: 'DJEPVA / INSEE' });
  add('ville', 'Ville', assoc.ville, api.ville, { source: 'DJEPVA / INSEE' });
  add('objetAssociation', 'Objet (texte officiel RNA)', assoc.objet_association, api.objet, { source: 'DJEPVA' });
  add(
    'agrementJeunesseSports',
    'Agrément Jeunesse et Sports',
    assoc.agrement_jeunesse_sports,
    api.agrements.length ? api.agrements.join(' ; ') : null,
    { source: 'DJEPVA' }
  );

  // Champs hors périmètre de l'API Entreprise : jamais rapprochables.
  add('email', 'E-mail', assoc.email, api.email, { source: 'DJEPVA (rare)', couverture: 'hors_api' });
  add('telephone', 'Téléphone', assoc.telephone, api.telephone, { source: 'DJEPVA (rare)', couverture: 'hors_api' });
  add('siteWebReseauxSociaux', 'Site web / réseaux sociaux', assoc.site_web_reseaux_sociaux, null, { couverture: 'hors_api' });
  add('federationSportiveAffiliation', 'Fédération d’affiliation', assoc.federation_sportive_affiliation, null, { couverture: 'hors_api' });
  add('disciplinesPratiquees', 'Disciplines pratiquées', assoc.disciplines_pratiquees, null, { couverture: 'hors_api' });
  add('numeroAffiliation', 'N° d’affiliation', assoc.numero_affiliation, null, { couverture: 'hors_api' });
  add('categorieSportive', 'Catégorie sportive', assoc.categorie_sportive, null, { couverture: 'hors_api' });

  return rows;
}

function buildApiOnly(api) {
  const items = [
    { libelle: 'SIRET du siège', valeur: api.siretSiege, source: 'INSEE' },
    { libelle: 'Forme juridique', valeur: api.formeJuridique, source: 'INSEE / DJEPVA' },
    { libelle: 'Activité principale (NAF)', valeur: api.naf, source: 'INSEE' },
    { libelle: 'Catégorie d’entreprise', valeur: api.categorieEntreprise, source: 'INSEE' },
    { libelle: 'Tranche d’effectif salarié', valeur: api.effectif, source: 'INSEE' },
    {
      libelle: 'Économie sociale et solidaire',
      valeur: api.ess === null ? null : api.ess ? 'Oui' : 'Non',
      source: 'INSEE',
    },
    { libelle: 'Publication au Journal officiel', valeur: api.datePublicationJo, source: 'DJEPVA' },
    { libelle: 'Date de dissolution', valeur: api.dateDissolution, source: 'DJEPVA' },
  ];
  return items.filter((i) => i.valeur !== null && i.valeur !== undefined && String(i.valeur).trim() !== '');
}

function buildIssues(assoc, raw, rows) {
  const issues = [...raw.errors];

  if (raw.sirenRaw && entrepriseClient.normalizeSiren(raw.sirenRaw) !== String(raw.sirenRaw).trim()) {
    issues.push(`SIREN mal formé dans la base locale : « ${raw.sirenRaw} » → ${raw.siren}`);
  }
  const dateRow = rows.find((r) => r.cle === 'dateCreation');
  if (dateRow?.statut === 'ecart') {
    issues.push(`Date de création divergente : base locale ${dateRow.local} / API ${dateRow.api}`);
  }
  const nomRow = rows.find((r) => r.cle === 'nomOfficielAssociation');
  if (nomRow?.statut === 'ecart') {
    issues.push(`Nom officiel divergent : base locale « ${nomRow.local} » / API « ${nomRow.api} »`);
  }
  const rnaRow = rows.find((r) => r.cle === 'numeroRna');
  if (rnaRow?.statut === 'ecart') {
    issues.push(`RNA divergent : base locale ${rnaRow.local} / API ${rnaRow.api}`);
  }
  return issues;
}

function summarize(rows) {
  const summary = { total: rows.length, ok: 0, ecart: 0, local_seul: 0, api_seul: 0, non_verifiable: 0, absent: 0 };
  for (const r of rows) summary[r.statut] += 1;
  return summary;
}

function mapSubventions(raw) {
  const list = Array.isArray(raw.subventions) ? raw.subventions : [];
  return list.map((item) => {
    const d = item?.data?.demande_subvention || {};
    const sd = d.subvention_demandee || {};
    const instr = d.instruction || {};
    return {
      annee: d.annee_exercice_demande ?? null,
      dispositif: sd.dispositif ?? null,
      sousDispositif: sd.sous_dispositif ?? null,
      montantDemande: sd.montant_demande ?? null,
      montantAccorde: instr.montant_accorde ?? null,
      instructeur: instr.service_instructeur ?? null,
      statut: instr.statut_demande ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// API publique du service
// ---------------------------------------------------------------------------

async function getAssociationControle(id, { refresh = false, withSubventions = true } = {}) {
  const assoc = associationsRepo.findById(id);
  if (!assoc) {
    const err = new Error('Association introuvable');
    err.status = 404;
    throw err;
  }
  const raw = await getRawData(assoc, { withSubventions, refresh });
  const api = extractApi(raw);
  const rows = buildRows(assoc, api);
  return {
    association: {
      id: assoc.id,
      nom: assoc.nom_officiel_association,
      sirenLocal: raw.sirenRaw,
      sirenNormalise: raw.siren || null,
      rnaLocal: assoc.numero_rna,
    },
    apiDisponible: !!(raw.insee || raw.djepva),
    apiErreurs: raw.errors,
    rows,
    apiSeul: buildApiOnly(api),
    subventions: mapSubventions(raw),
    issues: buildIssues(assoc, raw, rows),
    summary: summarize(rows),
  };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor;
      cursor += 1;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function listControles({ refresh = false } = {}) {
  const { items } = associationsRepo.listAssociations({ limit: 200, offset: 0 });
  const controles = await mapLimit(items, 3, async (assoc) => {
    const raw = await getRawData(assoc, { withSubventions: false, refresh, retries: 0 });
    const api = extractApi(raw);
    const rows = buildRows(assoc, api);
    return {
      associationId: assoc.id,
      nom: assoc.nom_officiel_association,
      sirenLocal: raw.sirenRaw,
      sirenNormalise: raw.siren || null,
      sirenValide: raw.validSiren,
      apiDisponible: !!(raw.insee || raw.djepva),
      summary: summarize(rows),
      issues: buildIssues(assoc, raw, rows).length,
    };
  });
  return { items: controles };
}

module.exports = { getAssociationControle, listControles };
