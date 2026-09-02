const { query } = require('../../db/sqlite');

// camelCase -> snake_case (« nombreBeneficiairesPassSport » -> « nombre_beneficiaires_pass_sport »).
function toSnake(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-zA-Z])(\d{4})/g, '$1_$2')
    .toLowerCase();
}

// Convertit un objet clés camelCase en ligne SQL : seules les colonnes existantes
// dans la table sont conservées, avec le bon nom snake_case (alias appliqués).
const ALIAS = {
  // Handicap.
  personne_situation_handicap: 'personnes_en_situation_handicap',
  personne_en_situation_handicap: 'personnes_en_situation_handicap',
  personnes_situation_handicap: 'personnes_en_situation_handicap',
  // Pass'Sport (colonne « passsport », sans tiret).
  beneficiaire_pass_sport: 'nombre_beneficiaires_passsport',
  beneficiaires_pass_sport: 'nombre_beneficiaires_passsport',
  nombre_beneficiaire_pass_sport: 'nombre_beneficiaires_passsport',
  nombre_beneficiaires_pass_sport: 'nombre_beneficiaires_passsport',
  nombre_beneficiaires_passsport: 'nombre_beneficiaires_passsport',
  // Tranches d'âge (colonne « _ans »). Le camelCase produit « _0_5 » sans
  // trait d'union ; on normalise explicitement les deux formes.
  petite_enfance_0_5: 'petite_enfance_0_5_ans',
  petite_enfance0_5: 'petite_enfance_0_5_ans',
  enfance_6_14: 'enfance_6_14_ans',
  enfance6_14: 'enfance_6_14_ans',
  adolescents_15_18: 'adolescents_15_18_ans',
  adolescents15_18: 'adolescents_15_18_ans',
  jeunes_19_29: 'jeunes_19_29_ans',
  jeunes19_29: 'jeunes_19_29_ans',
  adultes_30_59: 'adultes_30_59_ans',
  adultes30_59: 'adultes_30_59_ans',
  seniors_60_74: 'seniors_60_74_ans',
  seniors60_74: 'seniors_60_74_ans',
  // Grand âge.
  grand_age_75_plus: 'grand_age_75_ans_et_plus',
  grand_age75_plus: 'grand_age_75_ans_et_plus',
  grand_age_75_ans_et_plus: 'grand_age_75_ans_et_plus',
};
function normalizeRow(section, data) {
  const allowed = new Set(section.columns);
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === '') continue;
    const snake = toSnake(k);
    let col = ALIAS[snake] || snake;
    if (!allowed.has(col)) {
      // Clés annuelles (ex. *_N1, *_prev, *_2025) : on les conserve uniquement si
      // la colonne correspondante existe dans le schéma ; sinon on les ignore.
      const m = snake.match(/^(.+?)_(n1|prev|2025|2026|2027)$/);
      if (m) {
        const base = ALIAS[m[1]] || m[1];
        const suffixed = base + '_' + m[2];
        if (allowed.has(suffixed)) col = suffixed;
        else continue;
      } else {
        continue;
      }
    }
    out[col] = v;
  }
  return out;
}

const DOSSIER_COLUMNS = ['id', 'reference', 'association_id', 'annee', 'statut', 'date_depot', 'created_by', 'created_at', 'updated_at'];

const SECTIONS = {
  effectifs: {
    table: 'dossier_effectifs',
    single: true,
    columns: [
      'ivryens', 'non_ivryens', 'femmes', 'hommes', 'salaries', 'etudiants',
      'demandeurs_emploi', 'retraites', 'non_communique', 'petite_enfance_0_5_ans',
      'enfance_6_14_ans', 'adolescents_15_18_ans', 'jeunes_19_29_ans',
      'adultes_30_59_ans', 'seniors_60_74_ans', 'grand_age_75_ans_et_plus',
      'personnes_en_situation_handicap', 'beneficiaires_tarifs_reduits_sociaux',
      'actions_publics_eloignes', 'nombre_beneficiaires_passsport',
      // N-1 (exercice 2025)
      'ivryens_n1', 'non_ivryens_n1', 'femmes_n1', 'hommes_n1', 'salaries_n1',
      'etudiants_n1', 'demandeurs_emploi_n1', 'retraites_n1', 'non_communique_n1',
      'petite_enfance_0_5_ans_n1', 'enfance_6_14_ans_n1', 'adolescents_15_18_ans_n1',
      'jeunes_19_29_ans_n1', 'adultes_30_59_ans_n1', 'seniors_60_74_ans_n1',
      'grand_age_75_ans_et_plus_n1', 'personnes_en_situation_handicap_n1',
      'beneficiaires_tarifs_reduits_sociaux_n1', 'nombre_beneficiaires_passsport_n1',
      // Prévisionnel (2027)
      'ivryens_prev', 'non_ivryens_prev', 'femmes_prev', 'hommes_prev', 'salaries_prev',
      'etudiants_prev', 'demandeurs_emploi_prev', 'retraites_prev', 'non_communique_prev',
      'petite_enfance_0_5_ans_prev', 'enfance_6_14_ans_prev', 'adolescents_15_18_ans_prev',
      'jeunes_19_29_ans_prev', 'adultes_30_59_ans_prev', 'seniors_60_74_ans_prev',
      'grand_age_75_ans_et_plus_prev', 'personnes_en_situation_handicap_prev',
      'beneficiaires_tarifs_reduits_sociaux_prev', 'nombre_beneficiaires_passsport_prev',
    ],
  },
  'vie-associative': {
    table: 'dossier_vie_associative',
    single: true,
    columns: [
      'date_derniere_assemblee_generale', 'reglement_interieur_a_jour',
      'benevoles_actifs', 'salaries_permanents_etp', 'salaries_cdd_cddu',
      'emplois_aides', 'agents_mis_a_disposition', 'vacataires_intervenants',
      'nombre_heures_benevoles', 'montant_valorisation_benevolat',
      'actions_formations_realisees',
    ],
  },
  'situation-financiere': {
    table: 'dossier_situation_financiere',
    single: true,
    columns: [
      'total_charges', 'total_produits', 'subvention_ville', 'resultat_net',
      'tresorerie_disponible', 'fonds_propres_reserves',
      'montant_subvention_sollicitee', 'justification_montant_demande',
    ],
  },
  'niveaux-sportifs': {
    table: 'dossier_niveaux_sportifs',
    single: false,
    columns: [
      'categorie_section', 'niveau_sportif', 'principaux_resultats_sportifs',
      'nombre_deplacements', 'lieux_deplacements',
      'objectifs_sportifs_saison_suivante',
    ],
  },
  'projets-realises': {
    table: 'dossier_projets_realises',
    single: false,
    columns: ['intitule', 'description', 'objectifs', 'moyens_mis_en_oeuvre', 'publics_vises'],
  },
  'projets-prevus': {
    table: 'dossier_projets_prevus',
    single: false,
    columns: ['intitule', 'description', 'objectifs', 'moyens_mis_en_oeuvre', 'publics_vises'],
  },
  'politique-tarifaire': {
    table: 'dossier_politique_tarifaire',
    single: false,
    columns: [
      'categorie_cotisation', 'cotisation_ivryens', 'cotisation_non_ivryens',
      'nombre_adherents', 'montant_total_estime',
    ],
  },
  'autres-subventions': {
    table: 'dossier_autres_subventions',
    single: false,
    columns: [
      'financeur', 'montant_accorde_2025', 'montant_accorde_2026',
      'montant_sollicite_2027', 'objet_financement',
    ],
  },
  pieces: {
    table: 'dossier_pieces',
    single: false,
    columns: ['type_piece', 'fichier', 'date_depot', 'valide'],
  },
};

const listDossiers = ({ annee, statut, q, deleted, limit, offset }) => {
  const where = ['d.deleted_at IS NULL'];
  const params = [];
  if (deleted) {
    where.length = 0;
    where.push('d.deleted_at IS NOT NULL');
  }
  if (annee) {
    where.push('d.annee = ?');
    params.push(annee);
  }
  if (statut) {
    where.push('d.statut = ?');
    params.push(statut);
  }
  if (q) {
    where.push('(d.reference LIKE ? OR a.nom_officiel_association LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { n } = query.get(
    `SELECT COUNT(*) AS n FROM dossiers d LEFT JOIN associations a ON a.id = d.association_id ${whereSql}`,
    params
  );
  const items = query.all(
    `SELECT d.*, a.nom_officiel_association, a.sigle_abreviation,
            f.montant_subvention_sollicitee AS sollicite
     FROM dossiers d
     LEFT JOIN associations a ON a.id = d.association_id
     LEFT JOIN dossier_situation_financiere f ON f.dossier_id = d.id
     ${whereSql} ORDER BY d.annee DESC, d.reference COLLATE NOCASE LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { total: n, items };
};

const findById = (id, { includeDeleted = false } = {}) =>
  query.get(
    `SELECT d.*, a.nom_officiel_association, a.sigle_abreviation,
            f.montant_subvention_sollicitee AS sollicite
     FROM dossiers d
     LEFT JOIN associations a ON a.id = d.association_id
     LEFT JOIN dossier_situation_financiere f ON f.dossier_id = d.id
     WHERE d.id = ?${includeDeleted ? '' : ' AND d.deleted_at IS NULL'}`,
    [id]
  );

const findByAssociationAndYear = (associationId, annee) =>
  query.get('SELECT * FROM dossiers WHERE association_id = ? AND annee = ? AND deleted_at IS NULL', [associationId, annee]);

const createDossier = ({ associationId, annee, statut, dateDepot, createdBy }) => {
  const row = query.get(
    `INSERT INTO dossiers (reference, association_id, annee, statut, date_depot, created_by)
     VALUES (?, ?, ?, ?, ?, ?) RETURNING *`,
    ['', associationId, annee, statut, dateDepot, createdBy]
  );
  const reference = `SUB-${annee}-${associationId}-${row.id}`;
  query.run('UPDATE dossiers SET reference = ? WHERE id = ?', [reference, row.id]);
  return findById(row.id);
};

const updateDossier = (id, fields) => {
  const sets = Object.entries(fields).map(([column]) => `${column} = ?`);
  if (!sets.length) return findById(id);
  query.run(
    `UPDATE dossiers SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
    [...Object.values(fields), id]
  );
  return findById(id);
};

const softDeleteDossier = (id, userId) => {
  const { changes } = query.run(
    `UPDATE dossiers SET deleted_at = datetime('now'), deleted_by = ?, updated_at = datetime('now')
     WHERE id = ? AND deleted_at IS NULL`,
    [userId ?? null, id]
  );
  return changes > 0 ? findById(id, { includeDeleted: true }) : undefined;
};

const restoreDossier = (id) => {
  const { changes } = query.run(
    `UPDATE dossiers SET deleted_at = NULL, deleted_by = NULL, updated_at = datetime('now')
     WHERE id = ? AND deleted_at IS NOT NULL`,
    [id]
  );
  return changes > 0 ? findById(id) : undefined;
};

const purgeDossier = (id) => {
  // Les sections liées sont supprimées en cascade (ON DELETE CASCADE).
  const { changes } = query.run('DELETE FROM dossiers WHERE id = ?', [id]);
  return changes > 0;
};

const getSection = (dossierId, sectionName) => {
  const section = SECTIONS[sectionName];
  if (section.single) {
    return query.get(`SELECT * FROM ${section.table} WHERE dossier_id = ?`, [dossierId]);
  }
  return query.all(`SELECT * FROM ${section.table} WHERE dossier_id = ? ORDER BY id`, [dossierId]);
};

const upsertSection = (dossierId, sectionName, data) => {
  const section = SECTIONS[sectionName];

  if (section.single) {
    const columns = Object.keys(normalizeRow(section, data));
    if (!columns.length) return getSection(dossierId, sectionName);
    const row = normalizeRow(section, data);
    const existing = query.get(`SELECT id FROM ${section.table} WHERE dossier_id = ?`, [dossierId]);
    if (existing) {
      const sets = columns.map((c) => `${c} = ?`);
      query.run(
        `UPDATE ${section.table} SET ${sets.join(', ')} WHERE dossier_id = ?`,
        [...columns.map((c) => row[c]), dossierId]
      );
    } else {
      query.run(
        `INSERT INTO ${section.table} (dossier_id, ${columns.join(', ')}) VALUES (?, ${columns.map(() => '?').join(', ')})`,
        [dossierId, ...columns.map((c) => row[c])]
      );
    }
    return getSection(dossierId, sectionName);
  }

  // Sections multiples : remplacement complet.
  query.run('DELETE FROM ' + section.table + ' WHERE dossier_id = ?', [dossierId]);
  for (const rawRow of data) {
    const row = normalizeRow(section, rawRow);
    const cols = Object.keys(row);
    if (!cols.length) continue;
    query.run(
      `INSERT INTO ${section.table} (dossier_id, ${cols.join(', ')}) VALUES (?, ${cols.map(() => '?').join(', ')})`,
      [dossierId, ...cols.map((c) => row[c])]
    );
  }
  return getSection(dossierId, sectionName);
};

const statsByYear = (annee) => {
  const filter = annee ? 'WHERE deleted_at IS NULL AND annee = ?' : 'WHERE deleted_at IS NULL';
  const params = annee ? [annee] : [];
  const totals = query.get(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN statut = 'depose' THEN 1 ELSE 0 END) AS depose,
            SUM(CASE WHEN statut = 'instruction' THEN 1 ELSE 0 END) AS instruction,
            SUM(CASE WHEN statut = 'decision' THEN 1 ELSE 0 END) AS decision,
            SUM(CASE WHEN statut = 'accorde' THEN 1 ELSE 0 END) AS accorde,
            SUM(CASE WHEN statut = 'refuse' THEN 1 ELSE 0 END) AS refuse,
            SUM(CASE WHEN statut = 'brouillon' THEN 1 ELSE 0 END) AS brouillon,
            COUNT(DISTINCT association_id) AS associations
     FROM dossiers ${filter}`,
    params
  );
  const finances = query.get(
    `SELECT COALESCE(SUM(f.montant_subvention_sollicitee), 0) AS sollicite,
            COALESCE(SUM(CASE WHEN d.statut = 'accorde' THEN f.montant_subvention_sollicitee ELSE 0 END), 0) AS accorde_montant
     FROM dossier_situation_financiere f
     JOIN dossiers d ON d.id = f.dossier_id
     ${filter}`,
    params
  );  return { ...totals, sollicite: finances.sollicite, accorde_montant: finances.accorde_montant };
};

module.exports = {
  SECTIONS,
  listDossiers,
  findById,
  findByAssociationAndYear,
  createDossier,
  updateDossier,
  softDeleteDossier,
  restoreDossier,
  purgeDossier,
  getSection,
  upsertSection,
  statsByYear,
};
