const repository = require('./dossiers.repository');

// Sections : clé API (camelCase) -> colonne SQL.
const SECTION_API_MAP = {
  effectifs: {
    ivryens: 'ivryens',
    nonIvryens: 'non_ivryens',
    femmes: 'femmes',
    hommes: 'hommes',
    salaries: 'salaries',
    etudiants: 'etudiants',
    demandeursEmploi: 'demandeurs_emploi',
    retraites: 'retraites',
    nonCommunique: 'non_communique',
    petiteEnfance0_5: 'petite_enfance_0_5_ans',
    enfance6_14: 'enfance_6_14_ans',
    adolescents15_18: 'adolescents_15_18_ans',
    jeunes19_29: 'jeunes_19_29_ans',
    adultes30_59: 'adultes_30_59_ans',
    seniors60_74: 'seniors_60_74_ans',
    grandAge75Plus: 'grand_age_75_ans_et_plus',
    personnesSituationHandicap: 'personnes_en_situation_handicap',
    beneficiairesTarifsReduitsSociaux: 'beneficiaires_tarifs_reduits_sociaux',
    actionsPublicsEloignes: 'actions_publics_eloignes',
    nombreBeneficiairesPassSport: 'nombre_beneficiaires_passsport',
    ivryensN1: 'ivryens_n1',
    nonIvryensN1: 'non_ivryens_n1',
    femmesN1: 'femmes_n1',
    hommesN1: 'hommes_n1',
    salariesN1: 'salaries_n1',
    etudiantsN1: 'etudiants_n1',
    demandeursEmploiN1: 'demandeurs_emploi_n1',
    retraitesN1: 'retraites_n1',
    nonCommuniqueN1: 'non_communique_n1',
    petiteEnfance0_5N1: 'petite_enfance_0_5_ans_n1',
    enfance6_14N1: 'enfance_6_14_ans_n1',
    adolescents15_18N1: 'adolescents_15_18_ans_n1',
    jeunes19_29N1: 'jeunes_19_29_ans_n1',
    adultes30_59N1: 'adultes_30_59_ans_n1',
    seniors60_74N1: 'seniors_60_74_ans_n1',
    grandAge75PlusN1: 'grand_age_75_ans_et_plus_n1',
    personnesSituationHandicapN1: 'personnes_en_situation_handicap_n1',
    beneficiairesTarifsReduitsSociauxN1: 'beneficiaires_tarifs_reduits_sociaux_n1',
    nombreBeneficiairesPassSportN1: 'nombre_beneficiaires_passsport_n1',
    ivryensPrev: 'ivryens_prev',
    nonIvryensPrev: 'non_ivryens_prev',
    femmesPrev: 'femmes_prev',
    hommesPrev: 'hommes_prev',
    salariesPrev: 'salaries_prev',
    etudiantsPrev: 'etudiants_prev',
    demandeursEmploiPrev: 'demandeurs_emploi_prev',
    retraitesPrev: 'retraites_prev',
    nonCommuniquePrev: 'non_communique_prev',
    petiteEnfance0_5Prev: 'petite_enfance_0_5_ans_prev',
    enfance6_14Prev: 'enfance_6_14_ans_prev',
    adolescents15_18Prev: 'adolescents_15_18_ans_prev',
    jeunes19_29Prev: 'jeunes_19_29_ans_prev',
    adultes30_59Prev: 'adultes_30_59_ans_prev',
    seniors60_74Prev: 'seniors_60_74_ans_prev',
    grandAge75PlusPrev: 'grand_age_75_ans_et_plus_prev',
    personnesSituationHandicapPrev: 'personnes_en_situation_handicap_prev',
    beneficiairesTarifsReduitsSociauxPrev: 'beneficiaires_tarifs_reduits_sociaux_prev',
    nombreBeneficiairesPassSportPrev: 'nombre_beneficiaires_passsport_prev',
  },
  'vie-associative': {
    dateDerniereAssembleeGenerale: 'date_derniere_assemblee_generale',
    reglementInterieurAJour: 'reglement_interieur_a_jour',
    benevolesActifs: 'benevoles_actifs',
    salariesPermanentsEtp: 'salaries_permanents_etp',
    salariesCddCddu: 'salaries_cdd_cddu',
    emploisAides: 'emplois_aides',
    agentsMisADisposition: 'agents_mis_a_disposition',
    vacatairesIntervenants: 'vacataires_intervenants',
    nombreHeuresBenevoles: 'nombre_heures_benevoles',
    montantValorisationBenevolat: 'montant_valorisation_benevolat',
    actionsFormationsRealisees: 'actions_formations_realisees',
    benevolesActifsN1: 'benevoles_actifs_n1',
    salariesPermanentsEtpN1: 'salaries_permanents_etp_n1',
    salariesCddCdduN1: 'salaries_cdd_cddu_n1',
    emploisAidesN1: 'emplois_aides_n1',
    agentsMisADispositionN1: 'agents_mis_a_disposition_n1',
    vacatairesIntervenantsN1: 'vacataires_intervenants_n1',
    nombreHeuresBenevolesN1: 'nombre_heures_benevoles_n1',
  },
  'situation-financiere': {
    totalCharges: 'total_charges',
    totalProduits: 'total_produits',
    subventionVille: 'subvention_ville',
    resultatNet: 'resultat_net',
    tresorerieDisponible: 'tresorerie_disponible',
    fondsPropresReserves: 'fonds_propres_reserves',
    montantSubventionSollicitee: 'montant_subvention_sollicitee',
    justificationMontantDemande: 'justification_montant_demande',
    totalCharges2025: 'total_charges_2025',
    totalProduits2025: 'total_produits_2025',
    subventionVille2025: 'subvention_ville_2025',
    totalCharges2027: 'total_charges_2027',
    totalProduits2027: 'total_produits_2027',
    subventionVille2027: 'subvention_ville_2027',
  },
  'niveaux-sportifs': {
    categorieSection: 'categorie_section',
    niveauSportif: 'niveau_sportif',
    principauxResultatsSportifs: 'principaux_resultats_sportifs',
    nombreDeplacements: 'nombre_deplacements',
    lieuxDeplacements: 'lieux_deplacements',
    objectifsSportifsSaisonSuivante: 'objectifs_sportifs_saison_suivante',
  },
  'projets-realises': {
    intitule: 'intitule',
    description: 'description',
    objectifs: 'objectifs',
    moyensMisEnOeuvre: 'moyens_mis_en_oeuvre',
    publicsVises: 'publics_vises',
  },
  'projets-prevus': {
    intitule: 'intitule',
    description: 'description',
    objectifs: 'objectifs',
    moyensMisEnOeuvre: 'moyens_mis_en_oeuvre',
    publicsVises: 'publics_vises',
  },
  'politique-tarifaire': {
    categorieCotisation: 'categorie_cotisation',
    cotisationIvryens: 'cotisation_ivryens',
    cotisationNonIvryens: 'cotisation_non_ivryens',
    nombreAdherents: 'nombre_adherents',
    montantTotalEstime: 'montant_total_estime',
  },
  'autres-subventions': {
    financeur: 'financeur',
    montantAccorde2025: 'montant_accorde_2025',
    montantAccorde2026: 'montant_accorde_2026',
    montantSollicite2027: 'montant_sollicite_2027',
    objetFinancement: 'objet_financement',
  },
  pieces: {
    typePiece: 'type_piece',
    fichier: 'fichier',
    dateDepot: 'date_depot',
    valide: 'valide',
  },
};

const STATUTS = ['brouillon', 'depose', 'instruction', 'decision', 'accorde', 'refuse'];

function toApiSection(sectionName, rows) {
  const map = SECTION_API_MAP[sectionName];
  if (repository.SECTIONS[sectionName].single) {
    if (!rows) return {};
    const out = {};
    for (const [api, column] of Object.entries(map)) out[api] = rows[column] ?? null;
    return out;
  }
  return (rows || []).map((r) => {
    const out = { id: r.id };
    for (const [api, column] of Object.entries(map)) out[api] = r[column] ?? null;
    return out;
  });
}

function toSqlSection(sectionName, input) {
  const map = SECTION_API_MAP[sectionName];
  const out = {};
  for (const [api, column] of Object.entries(map)) {
    if (input[api] !== undefined && input[api] !== null && input[api] !== '') {
      out[column] = input[api];
    }
  }
  return out;
}

function publicDossier(d) {
  return {
    id: d.id,
    reference: d.reference,
    associationId: d.association_id,
    nomAssociation: d.nom_officiel_association ?? null,
    sigleAssociation: d.sigle_abreviation ?? null,
    annee: d.annee,
    statut: d.statut,
    dateDepot: d.date_depot ?? null,
    sollicite: d.sollicite ?? null,
    createdBy: d.created_by ?? null,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    deletedAt: d.deleted_at ?? null,
    deletedBy: d.deleted_by ?? null,
  };
}

function list({ annee, statut, q, deleted, limit, offset }) {
  const result = repository.listDossiers({ annee, statut, q, deleted: Boolean(deleted), limit, offset });
  return { total: result.total, items: result.items.map(publicDossier) };
}

function get(id) {
  const d = repository.findById(id);
  if (!d) {
    const err = new Error('Dossier introuvable');
    err.status = 404;
    throw err;
  }
  const dossier = publicDossier(d);
  const sections = {};
  for (const name of Object.keys(repository.SECTIONS)) {
    sections[name] = toApiSection(name, repository.getSection(id, name));
  }
  return { ...dossier, sections };
}

function create({ associationId, annee, statut, dateDepot }, user) {
  const associationIdN = Number(associationId);
  const anneeN = Number(annee);
  if (!Number.isInteger(associationIdN) || !Number.isInteger(anneeN) || anneeN < 2000 || anneeN > 2100) {
    const err = new Error('associationId et annee (2000-2100) sont obligatoires');
    err.status = 400;
    throw err;
  }
  const statutN = statut && STATUTS.includes(statut) ? statut : 'brouillon';
  const existing = repository.findByAssociationAndYear(associationIdN, anneeN);
  if (existing) {
    const err = new Error('Un dossier existe déjà pour cette association et cette année');
    err.status = 409;
    throw err;
  }
  return publicDossier(repository.createDossier({
    associationId: associationIdN,
    annee: anneeN,
    statut: statutN,
    dateDepot: dateDepot || null,
    createdBy: user ? (user.id ?? user.sub) : null,
  }));
}

function patch(id, { statut, dateDepot }) {
  const fields = {};
  if (statut !== undefined) {
    if (!STATUTS.includes(statut)) {
      const err = new Error(`Statut invalide (valeurs possibles : ${STATUTS.join(', ')})`);
      err.status = 400;
      throw err;
    }
    fields.statut = statut;
  }
  if (dateDepot !== undefined) fields.date_depot = dateDepot || null;

  const updated = repository.updateDossier(id, fields);
  if (!updated) {
    const err = new Error('Dossier introuvable');
    err.status = 404;
    throw err;
  }
  return publicDossier(updated);
}

function remove(id, user) {
  const existing = repository.findById(id, { includeDeleted: true });
  if (!existing) {
    const err = new Error('Dossier introuvable');
    err.status = 404;
    throw err;
  }
  if (existing.deleted_at) {
    const err = new Error('Ce dossier est déjà dans la corbeille');
    err.status = 409;
    throw err;
  }
  return publicDossier(repository.softDeleteDossier(id, user ? (user.id ?? user.sub) : null));
}

function restore(id) {
  const existing = repository.findById(id, { includeDeleted: true });
  if (!existing) {
    const err = new Error('Dossier introuvable');
    err.status = 404;
    throw err;
  }
  if (!existing.deleted_at) {
    const err = new Error("Ce dossier n'est pas dans la corbeille");
    err.status = 409;
    throw err;
  }
  const restored = repository.restoreDossier(id);
  if (!restored) {
    // Un dossier actif existe peut-être déjà pour cette association/année.
    const err = new Error('Restauration impossible');
    err.status = 409;
    throw err;
  }
  return publicDossier(restored);
}

function purge(id) {
  const existing = repository.findById(id, { includeDeleted: true });
  if (!existing) {
    const err = new Error('Dossier introuvable');
    err.status = 404;
    throw err;
  }
  if (!existing.deleted_at) {
    const err = new Error('Le dossier doit être dans la corbeille avant une suppression définitive');
    err.status = 409;
    throw err;
  }
  const purged = repository.purgeDossier(id);
  if (!purged) {
    const err = new Error('Suppression définitive impossible');
    err.status = 409;
    throw err;
  }
  return { id, reference: existing.reference, purged: true };
}

function saveSection(id, sectionName, input) {
  if (!repository.SECTIONS[sectionName]) {
    const err = new Error('Section inconnue');
    err.status = 400;
    throw err;
  }
  const exists = repository.findById(id);
  if (!exists) {
    const err = new Error('Dossier introuvable');
    err.status = 404;
    throw err;
  }
  const single = repository.SECTIONS[sectionName].single;
  const sqlData = single ? toSqlSection(sectionName, input || {}) : (Array.isArray(input) ? input : []);
  if (!single) {
    const mapped = sqlData.map((row) => toSqlSection(sectionName, row || {}));
    return { dossierId: id, section: sectionName, data: toApiSection(sectionName, repository.upsertSection(id, sectionName, mapped)) };
  }
  return { dossierId: id, section: sectionName, data: toApiSection(sectionName, repository.upsertSection(id, sectionName, sqlData)) };
}

function stats({ annee }) {
  const year = annee ? Number(annee) : undefined;
  const raw = repository.statsByYear(year);
  const s = { ...raw };
  for (const key of ['sollicite', 'accorde_montant']) {
    s[key] = raw[key] ? Number(raw[key]) : 0;
  }
  return {
    annee: year ?? null,
    totalDossiers: raw.total,
    associations: raw.associations,
    parStatut: {
      brouillon: raw.brouillon,
      depose: raw.depose,
      instruction: raw.instruction,
      decision: raw.decision,
      accorde: raw.accorde,
      refuse: raw.refuse,
    },
    subventions: { sollicitees: s.sollicite, accordees: s.accorde_montant },
  };
}

module.exports = { list, get, create, patch, remove, restore, purge, saveSection, stats, STATUTS };
