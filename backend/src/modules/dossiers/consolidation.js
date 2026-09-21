// Tableau « Consolidation » — recalculé à la volée à partir des dossiers.
// La structure (groupes et titres) provient de consolidation.structure.js,
// reproduite du fichier Consolidation.xlsx (DOCS). Aucune donnée n'est lue
// depuis le fichier : chaque valeur est calculée depuis les dossiers, si bien
// que le tableau est mis à jour automatiquement dès qu'un dossier est déposé
// ou modifié. Les colonnes sans équivalent dans les données affichent « - ».

const structure = require('./consolidation.structure');
const service = require('./dossiers.service');
const repository = require('./dossiers.repository');
const associationsRepo = require('../associations/associations.repository');

// ---- Helpers -------------------------------------------------------------

function present(v) {
  return v !== null && v !== undefined && v !== '';
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pct(part, total) {
  const p = num(part);
  const t = num(total);
  if (p === null || t === null || t === 0) return null;
  return p / t;
}

function evol(cur, prev) {
  const c = num(cur);
  const p = num(prev);
  if (c === null || p === null || p === 0) return null;
  return c / p - 1;
}

function sum(rows, key) {
  return rows.reduce((acc, r) => acc + (num(r && r[key]) ?? 0), 0);
}

function jeunesDeMoinsDe30(e, suffix) {
  const base = suffix ? (k) => e[`${k}${suffix}`] : (k) => e[k];
  return num(base('petiteEnfance0_5')) + num(base('enfance6_14')) + num(base('adolescents15_18')) + num(base('jeunes19_29'));
}

function totalAdherents(e, suffix) {
  const base = suffix ? (k) => e[`${k}${suffix}`] : (k) => e[k];
  const ivryens = num(base('ivryens'));
  const nonIvryens = num(base('nonIvryens'));
  if (present(ivryens) || present(nonIvryens)) return (ivryens ?? 0) + (nonIvryens ?? 0);
  const femmes = num(base('femmes'));
  const hommes = num(base('hommes'));
  if (present(femmes) || present(hommes)) return (femmes ?? 0) + (hommes ?? 0);
  return null;
}

const SEUIL_CONVENTION = 23000;

function aidesPubliquesCumulees(f, others) {
  return (num(f && f.subventionVille) ?? 0) + sum(others, 'montantAccorde2026');
}

function statutConvention(aides) {
  if (aides >= SEUIL_CONVENTION) {
    return 'Association conventionnée (aides publiques cumulées supérieures ou égales à 23 000 euros) — bilan à compléter obligatoirement.';
  }
  return 'Section sans objet à ce jour : aides publiques cumulées inférieures à 23 000 euros. Elle devient obligatoire si le seuil est franchi.';
}

// ---- Ligne = une association / un dossier --------------------------------

function buildRow(full) {
  const { dossier, association, sections, avis = {} } = full;
  const e = sections.effectifs || {};
  const v = sections['vie-associative'] || {};
  const f = sections['situation-financiere'] || {};
  const niveaux = sections['niveaux-sportifs'] || [];
  const tarifs = sections['politique-tarifaire'] || [];
  const others = sections['autres-subventions'] || [];

  const adhN1 = totalAdherents(e, 'N1');
  const adh = totalAdherents(e, '');
  const adhPrev = totalAdherents(e, 'Prev');

  const ivryensPctN1 = pct(e.ivryensN1, adhN1);
  const ivryensPct = pct(e.ivryens, adh);
  const femmesPctN1 = pct(e.femmesN1, adhN1);
  const femmesPct = pct(e.femmes, adh);

  const jeunesN1 = jeunesDeMoinsDe30(e, 'N1');
  const jeunes = jeunesDeMoinsDe30(e, '');
  const jeunesPctN1 = pct(jeunesN1, adhN1);
  const jeunesPct = pct(jeunes, adh);

  const produits2025 = num(f.totalProduits2025);
  const charges2025 = num(f.totalCharges2025);
  const produits2027 = num(f.totalProduits2027);
  const charges2027 = num(f.totalCharges2027);
  const subv2025 = num(f.subventionVille2025);
  const subv = num(f.subventionVille);

  const aideNationale = sum(others, 'montantAccorde2026');
  const aidesPlusSubv = (subv ?? 0) + aideNationale;

  const dep2025 = pct(subv2025, produits2025);
  const dep2026 = pct(subv, num(f.totalProduits));
  const eurAdh2025 = pct(subv2025, adhN1);

  const resultat2025 = produits2025 !== null && charges2025 !== null ? produits2025 - charges2025 : null;
  const resultat = num(f.resultatNet);
  const resultat2027 = produits2027 !== null && charges2027 !== null ? produits2027 - charges2027 : null;

  const montantsTarif = sum(tarifs, 'montantTotalEstime');
  const adherentsTarif = sum(tarifs, 'nombreAdherents');
  const cotisMoy = adherentsTarif ? montantsTarif / adherentsTarif : null;

  const totalRhN1 = (num(v.salariesPermanentsEtpN1) ?? 0) + (num(v.salariesCddCdduN1) ?? 0) + (num(v.emploisAidesN1) ?? 0) + (num(v.agentsMisADispositionN1) ?? 0) + (num(v.vacatairesIntervenantsN1) ?? 0) + (num(v.benevolesActifsN1) ?? 0);
  const totalRh = (num(v.salariesPermanentsEtp) ?? 0) + (num(v.salariesCddCddu) ?? 0) + (num(v.emploisAides) ?? 0) + (num(v.agentsMisADisposition) ?? 0) + (num(v.vacatairesIntervenants) ?? 0) + (num(v.benevolesActifs) ?? 0);

  const niveauCount = (label) => niveaux.filter((n) => (n.niveauSportif || '').toLowerCase().includes(label)).length;

  const seniorsN1 = (num(e.seniors60_74N1) ?? 0) + (num(e.grandAge75PlusN1) ?? 0);
  const seniors = (num(e.seniors60_74) ?? 0) + (num(e.grandAge75Plus) ?? 0);
  const seniorsPrev = (num(e.seniors60_74Prev) ?? 0) + (num(e.grandAge75PlusPrev) ?? 0);

  const aides = aidesPubliquesCumulees(f, others);

  const C = {
    A: { v: dossier.reference, t: 'text' },
    B: { v: association && association.nom_officiel_association, t: 'text' },
    C: { v: association && association.categorie_sportive, t: 'text' },
    D: { v: association && association.numero_siren, t: 'text' },
    E: { v: association && association.numero_rna, t: 'text' },

    // 2a · Effectifs
    F: { v: null, t: 'int' }, // 2024 non renseigné dans les dossiers
    G: { v: adhN1, t: 'int' },
    H: { v: adh, t: 'int' },
    I: { v: adhPrev, t: 'int' },
    J: { v: null, t: 'evol' }, // 24->25 non renseigné
    K: { v: evol(adh, adhN1), t: 'evol' },

    // 2b · Territoire
    L: { v: null, t: 'int' },
    M: { v: num(e.ivryensN1), t: 'int' },
    N: { v: num(e.ivryens), t: 'int' },
    O: { v: num(e.ivryensPrev), t: 'int' },
    P: { v: num(e.nonIvryensN1), t: 'int' },
    Q: { v: num(e.nonIvryens), t: 'int' },
    R: { v: ivryensPctN1, t: 'pct' },
    S: { v: ivryensPct, t: 'pct' },

    // 2c · Genre
    T: { v: null, t: 'int' },
    U: { v: num(e.hommesN1), t: 'int' },
    V: { v: num(e.hommes), t: 'int' },
    W: { v: num(e.hommesPrev), t: 'int' },
    X: { v: null, t: 'int' },
    Y: { v: num(e.femmesN1), t: 'int' },
    Z: { v: num(e.femmes), t: 'int' },
    AA: { v: num(e.femmesPrev), t: 'int' },
    AB: { v: femmesPctN1, t: 'pct' },
    AC: { v: femmesPct, t: 'pct' },

    // 2d · Tranches d'âge et part de jeunes. Granularité des dossiers :
    // 0-5 / 6-14 / 15-18 / 19-29 / 30-59 / 60-74 / 75+. Les colonnes plus
    // fines (0-2, 3-5, 6-11, 12-14, 15-17, 18-25, 26-64, 65-74) affichent « - ».
    AD: { v: null, t: 'int' },
    AE: { v: null, t: 'int' },
    AF: { v: null, t: 'int' },
    AG: { v: null, t: 'int' },
    AH: { v: null, t: 'int' },
    AI: { v: null, t: 'int' },
    AJ: { v: null, t: 'int' },
    AK: { v: null, t: 'int' },
    AL: { v: null, t: 'int' },
    AM: { v: null, t: 'int' },
    AN: { v: null, t: 'int' },
    AO: { v: null, t: 'int' },
    AP: { v: null, t: 'int' },
    AQ: { v: null, t: 'int' },
    AR: { v: null, t: 'int' },
    AS: { v: null, t: 'int' },
    AT: { v: null, t: 'int' },
    AU: { v: null, t: 'int' },
    AV: { v: null, t: 'int' },
    AW: { v: null, t: 'int' },
    AX: { v: null, t: 'int' },
    AY: { v: null, t: 'int' },
    AZ: { v: null, t: 'int' },
    BA: { v: null, t: 'int' },
    BB: { v: num(e.grandAge75PlusN1), t: 'int' },
    BC: { v: num(e.grandAge75Plus), t: 'int' },
    BD: { v: num(e.grandAge75PlusPrev), t: 'int' },
    BE: { v: jeunesPctN1, t: 'pct' },
    BF: { v: jeunesPct, t: 'pct' },

    // 2f · Catégories socio-professionnelles
    BG: { v: null, t: 'int' },
    BH: { v: num(e.salariesN1), t: 'int' },
    BI: { v: num(e.salaries), t: 'int' },
    BJ: { v: num(e.salariesPrev), t: 'int' },
    BK: { v: null, t: 'int' },
    BL: { v: num(e.demandeursEmploiN1), t: 'int' },
    BM: { v: num(e.demandeursEmploi), t: 'int' },
    BN: { v: num(e.demandeursEmploiPrev), t: 'int' },
    BO: { v: null, t: 'int' },
    BP: { v: num(e.etudiantsN1), t: 'int' },
    BQ: { v: num(e.etudiants), t: 'int' },
    BR: { v: num(e.etudiantsPrev), t: 'int' },
    BS: { v: null, t: 'int' },
    BT: { v: num(e.retraitesN1), t: 'int' },
    BU: { v: num(e.retraites), t: 'int' },
    BV: { v: num(e.retraitesPrev), t: 'int' },

    // 3 · Accessibilité / publics prioritaires
    BW: { v: femmesPctN1, t: 'pct' },
    BX: { v: femmesPct, t: 'pct' },
    BY: { v: pct(e.femmesPrev, adhPrev), t: 'pct' },
    BZ: { v: num(e.personnesSituationHandicapN1), t: 'int' },
    CA: { v: num(e.personnesSituationHandicap), t: 'int' },
    CB: { v: num(e.personnesSituationHandicapPrev), t: 'int' },
    CC: { v: null, t: 'int' }, // QPV/REP non renseigné
    CD: { v: null, t: 'int' },
    CE: { v: null, t: 'int' },
    CF: { v: pct(seniorsN1, adhN1), t: 'pct' },
    CG: { v: pct(seniors, adh), t: 'pct' },
    CH: { v: pct(seniorsPrev, adhPrev), t: 'pct' },
    CI: { v: pct(e.adultes30_59N1, adhN1), t: 'pct' },
    CJ: { v: pct(e.adultes30_59, adh), t: 'pct' },
    CK: { v: pct(e.adultes30_59Prev, adhPrev), t: 'pct' },
    CL: { v: num(e.nombreBeneficiairesPassSport), t: 'int' },
    CM: { v: null, t: 'text' }, // Labels non renseigné

    // 4 · Niveaux sportifs
    CN: { v: niveauCount('local'), t: 'int' },
    CO: { v: niveauCount('département'), t: 'int' },
    CP: { v: niveauCount('région'), t: 'int' },
    CQ: { v: niveauCount('national'), t: 'int' },
    CR: { v: niveauCount('international'), t: 'int' },
    CS: { v: null, t: 'int' }, // Nb licences non renseigné

    // 5 · Ressources humaines
    CT: { v: null, t: 'int' },
    CU: { v: null, t: 'int' },
    CV: { v: null, t: 'int' },
    CW: { v: null, t: 'int' },
    CX: { v: null, t: 'int' },
    CY: { v: num(v.salariesPermanentsEtpN1), t: 'dec' },
    CZ: { v: num(v.salariesPermanentsEtp), t: 'dec' },
    DA: { v: null, t: 'int' },
    DB: { v: null, t: 'int' },
    DC: { v: num(v.agentsMisADispositionN1), t: 'int' },
    DD: { v: num(v.agentsMisADisposition), t: 'int' },
    DE: { v: null, t: 'int' },
    DF: { v: null, t: 'int' },
    DG: { v: num(v.emploisAidesN1), t: 'int' },
    DH: { v: num(v.emploisAides), t: 'int' },
    DI: { v: null, t: 'int' },
    DJ: { v: null, t: 'int' },
    DK: { v: num(v.vacatairesIntervenantsN1), t: 'int' },
    DL: { v: num(v.vacatairesIntervenants), t: 'int' },
    DM: { v: null, t: 'int' },
    DN: { v: null, t: 'int' },
    DO: { v: num(v.benevolesActifsN1), t: 'int' },
    DP: { v: num(v.benevolesActifs), t: 'int' },
    DQ: { v: null, t: 'int' },
    DR: { v: null, t: 'int' },
    DS: { v: totalRhN1 || null, t: 'int' },
    DT: { v: totalRh || null, t: 'int' },
    DU: { v: null, t: 'int' },

    // 7 · Cotisations
    DV: { v: null, t: 'eur' },
    DW: { v: cotisMoy, t: 'eur' },
    DX: { v: null, t: 'eur' },

    // 8 · Situation financière
    DY: { v: charges2025, t: 'eur' },
    DZ: { v: num(f.totalCharges), t: 'eur' },
    EA: { v: charges2027, t: 'eur' },
    EB: { v: produits2025, t: 'eur' },
    EC: { v: num(f.totalProduits), t: 'eur' },
    ED: { v: produits2027, t: 'eur' },
    EE: { v: resultat2025, t: 'eur' },
    EF: { v: resultat, t: 'eur' },
    EG: { v: resultat2027, t: 'eur' },

    // 9 · Financements
    EH: { v: subv2025, t: 'eur' },
    EI: { v: subv, t: 'eur' },
    EJ: { v: num(f.montantSubventionSollicitee), t: 'eur' },
    EK: { v: null, t: 'dec' }, // Aides nat. heures non renseigné
    EL: { v: aideNationale || null, t: 'eur' },
    EM: { v: aidesPlusSubv || null, t: 'eur' },
    EN: { v: dep2025, t: 'pct' },
    EO: { v: dep2026, t: 'pct' },
    EP: { v: eurAdh2025, t: 'dec' },

    // 10 · Bilan convention d'objectifs
    EQ: { v: statutConvention(aides), t: 'text' },

    // Colonnes ER → EY : saisie libre (bilan de la convention d'objectifs et
    // avis), enregistrée dans la table consolidation_avis.
    ER: { v: avis.ER ?? null, t: 'text' },
    ES: { v: avis.ES ?? null, t: 'text' },
    ET: { v: avis.ET ?? null, t: 'text' },
    EU: { v: avis.EU ?? null, t: 'text' },
    EV: { v: avis.EV ?? null, t: 'text' },
    EW: { v: avis.EW ?? null, t: 'text' },
    EX: { v: avis.EX ?? null, t: 'text' },
    EY: { v: avis.EY ?? null, t: 'text' },
  };

  // Sommes brutes nécessaires aux totaux (ratios recalculés sur les sommes).
  return {
    cells: C,
    aux: {
      adhN1, adh, adhPrev,
      femmesN1: num(e.femmesN1), femmes: num(e.femmes), femmesPrev: num(e.femmesPrev),
      jeunesN1, jeunes,
      seniorsN1, seniors, seniorsPrev,
      adultesN1: num(e.adultes30_59N1), adultes: num(e.adultes30_59), adultesPrev: num(e.adultes30_59Prev),
      montantsTarif, adherentsTarif,
    },
  };
}

// ---- API ----------------------------------------------------------------

function buildConsolidation({ annee }) {
  const { items } = service.list({ annee: annee || undefined, limit: 100000, offset: 0 });
  const dossiers = items.filter((d) => d.statut !== 'brouillon');

  // Réponses libres (colonnes ER → EY) : chargées une seule fois pour tous les dossiers.
  const avisParDossier = new Map();
  for (const a of repository.listAvisAll()) {
    let map = avisParDossier.get(a.dossier_id);
    if (!map) {
      map = {};
      avisParDossier.set(a.dossier_id, map);
    }
    map[a.colonne] = a.valeur;
  }

  const rows = dossiers.map((d) => {
    const full = service.get(d.id);
    const dossier = {
      id: full.id,
      reference: full.reference,
      nomAssociation: full.nomAssociation,
      statut: full.statut,
    };
    const association = associationsRepo.findById(full.associationId);
    return {
      public: dossier,
      row: buildRow({
        dossier,
        association,
        sections: full.sections,
        avis: avisParDossier.get(d.id) || {},
      }),
    };
  });

  const lignes = rows.map(({ public: p, row }) => ({
    id: p.id ?? null,
    reference: p.reference,
    nomAssociation: p.nomAssociation,
    statut: p.statut,
    cells: row.cells,
  }));

  const totaux = buildTotals(lignes, rows.map((r) => r.row));

  return {
    annee: annee || null,
    titre: structure.titre,
    note: 'Tableau recalculé automatiquement à partir des dossiers de subvention : il est mis à jour à chaque dépôt ou modification d\'un dossier. Les colonnes affichant « - » n\'ont pas d\'équivalent dans les rubriques du dossier. Les colonnes ER à EY sont à saisie libre.',
    groupes: structure.groupes,
    lignes,
    totaux,
  };
}

function pctFromSums(rows, partFn, totalFn) {
  let part = 0;
  let total = 0;
  for (const r of rows) {
    part += num(partFn(r)) ?? 0;
    total += num(totalFn(r)) ?? 0;
  }
  return total ? part / total : null;
}

function buildTotals(lignes, rows) {
  const sumCells = (key) => rows.reduce((acc, r) => acc + (num(r.cells[key].v) ?? 0), 0);
  const sumAux = (key) => rows.reduce((acc, r) => acc + (num(r.aux[key]) ?? 0), 0);

  const valeurs = {};

  valeurs.A = null;
  valeurs.B = lignes.length ? `${lignes.length} association${lignes.length > 1 ? 's' : ''}` : null;
  for (const key of ['C', 'D', 'E']) valeurs[key] = null;

  // 2a · Effectifs
  valeurs.G = sumCells('G');
  valeurs.H = sumCells('H');
  valeurs.I = sumCells('I');
  const evolK = pctFromSums(rows, (r) => r.aux.adh, (r) => r.aux.adhN1);
  valeurs.K = evolK !== null ? evolK - 1 : null;

  // 2b · Territoire
  valeurs.M = sumCells('M');
  valeurs.N = sumCells('N');
  valeurs.O = sumCells('O');
  valeurs.P = sumCells('P');
  valeurs.Q = sumCells('Q');
  valeurs.R = pctFromSums(rows, (r) => r.cells.M.v, (r) => r.aux.adhN1);
  valeurs.S = pctFromSums(rows, (r) => r.cells.N.v, (r) => r.aux.adh);

  // 2c · Genre
  valeurs.U = sumCells('U');
  valeurs.V = sumCells('V');
  valeurs.W = sumCells('W');
  valeurs.Y = sumCells('Y');
  valeurs.Z = sumCells('Z');
  valeurs.AA = sumCells('AA');
  valeurs.AB = pctFromSums(rows, (r) => r.aux.femmesN1, (r) => r.aux.adhN1);
  valeurs.AC = pctFromSums(rows, (r) => r.aux.femmes, (r) => r.aux.adh);

  // 2d · Tranches d'âge
  valeurs.BB = sumCells('BB');
  valeurs.BC = sumCells('BC');
  valeurs.BD = sumCells('BD');
  valeurs.BE = pctFromSums(rows, (r) => r.aux.jeunesN1, (r) => r.aux.adhN1);
  valeurs.BF = pctFromSums(rows, (r) => r.aux.jeunes, (r) => r.aux.adh);

  // 2f · Catégories socio-professionnelles
  for (const key of ['BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BP', 'BQ', 'BR', 'BT', 'BU', 'BV']) valeurs[key] = sumCells(key);

  // 3 · Accessibilité / publics prioritaires
  valeurs.BW = pctFromSums(rows, (r) => r.aux.femmesN1, (r) => r.aux.adhN1);
  valeurs.BX = pctFromSums(rows, (r) => r.aux.femmes, (r) => r.aux.adh);
  valeurs.BY = pctFromSums(rows, (r) => r.aux.femmesPrev, (r) => r.aux.adhPrev);
  valeurs.BZ = sumCells('BZ');
  valeurs.CA = sumCells('CA');
  valeurs.CB = sumCells('CB');
  valeurs.CF = pctFromSums(rows, (r) => r.aux.seniorsN1, (r) => r.aux.adhN1);
  valeurs.CG = pctFromSums(rows, (r) => r.aux.seniors, (r) => r.aux.adh);
  valeurs.CH = pctFromSums(rows, (r) => r.aux.seniorsPrev, (r) => r.aux.adhPrev);
  valeurs.CI = pctFromSums(rows, (r) => r.aux.adultesN1, (r) => r.aux.adhN1);
  valeurs.CJ = pctFromSums(rows, (r) => r.aux.adultes, (r) => r.aux.adh);
  valeurs.CK = pctFromSums(rows, (r) => r.aux.adultesPrev, (r) => r.aux.adhPrev);
  valeurs.CL = sumCells('CL');

  // 4 · Niveaux sportifs
  for (const key of ['CN', 'CO', 'CP', 'CQ', 'CR']) valeurs[key] = sumCells(key);

  // 5 · Ressources humaines
  for (const key of ['CY', 'CZ', 'DC', 'DD', 'DG', 'DH', 'DK', 'DL', 'DO', 'DP', 'DS', 'DT']) valeurs[key] = sumCells(key);

  // 7 · Cotisations (moyenne pondérée par les adhérents)
  const totMontants = sumAux('montantsTarif');
  const totAdherents = sumAux('adherentsTarif');
  valeurs.DW = totAdherents ? totMontants / totAdherents : null;

  // 8 · Situation financière
  for (const key of ['DY', 'DZ', 'EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG']) valeurs[key] = sumCells(key);

  // 9 · Financements
  for (const key of ['EH', 'EI', 'EJ', 'EL', 'EM']) valeurs[key] = sumCells(key);
  valeurs.EN = pctFromSums(rows, (r) => r.cells.EH.v, (r) => r.cells.EB.v);
  valeurs.EO = pctFromSums(rows, (r) => r.cells.EI.v, (r) => r.cells.EC.v);
  valeurs.EP = pctFromSums(rows, (r) => r.cells.EH.v, (r) => r.aux.adhN1);

  const cells = {};
  const sample = rows[0];
  for (const g of structure.groupes) {
    for (const c of g.colonnes) {
      const has = Object.prototype.hasOwnProperty.call(valeurs, c.key);
      cells[c.key] = has ? { v: valeurs[c.key], t: sample ? sample.cells[c.key].t : 'text' } : null;
    }
  }
  return cells;
}

module.exports = { buildConsolidation };