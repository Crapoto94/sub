const { readWorkbook, sheetRows, cell, str, num, findRowByLabel } = require('./excel.utils');

// Fichier 2 : « Tableau Financier ».
// Feuille « Tableau Financier ». Les totaux charges/produits/résultat servent
// à alimenter la section 8 (situation financière) ; le détail ligne à ligne
// (charges puis produits) est repris pour être affiché dans la même section.
const SHEET = 'Tableau Financier';
const C = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7 };

function parseTableauFinancier(buffer) {
  const wb = readWorkbook(buffer);
  const rows = sheetRows(wb, SHEET, 0);

  const totalCharges = { 2025: null, 2026: null, 2027: null };
  const totalProduits = { 2025: null, 2026: null, 2027: null };
  const resultat = { 2025: null, 2026: null, 2027: null };

  // Ligne « TOTAL DES CHARGES » : valeurs à C, D, E (2025, 2026, 2027).
  const chR = findRowByLabel(rows, 'TOTAL DES CHARGES');
  if (chR >= 0) {
    totalCharges[2025] = num(cleanAmount(cell(rows, chR, C.C)));
    totalCharges[2026] = num(cleanAmount(cell(rows, chR, C.D)));
    totalCharges[2027] = num(cleanAmount(cell(rows, chR, C.E)));
  }
  const prR = findRowByLabel(rows, 'TOTAL DES PRODUITS');
  if (prR >= 0) {
    totalProduits[2025] = num(cleanAmount(cell(rows, prR, C.C)));
    totalProduits[2026] = num(cleanAmount(cell(rows, prR, C.D)));
    totalProduits[2027] = num(cleanAmount(cell(rows, prR, C.E)));
  }
  const resR = findRowByLabel(rows, 'RÉSULTAT DE L\'EXERCICE');
  if (resR >= 0) {
    resultat[2025] = num(cleanAmount(cell(rows, resR, C.C)));
    resultat[2026] = num(cleanAmount(cell(rows, resR, C.D)));
    resultat[2027] = num(cleanAmount(cell(rows, resR, C.E)));
  }

  // Subvention Ville d'Ivry-sur-Seine ligne 7411 (col C/D/E).
  let subventionVille = { 2025: null, 2026: null, 2027: null };
  const subR = findRowByLabel(rows, 'Subvention Ville d\'Ivry-sur-Seine', 1);
  if (subR >= 0) {
    subventionVille[2025] = num(cleanAmount(cell(rows, subR, C.C)));
    subventionVille[2026] = num(cleanAmount(cell(rows, subR, C.D)));
    subventionVille[2027] = num(cleanAmount(cell(rows, subR, C.E)));
  }

  return {
    bilan: {
      totalCharges,
      totalProduits,
      subventionVille,
      resultat,
    },
    detail: parseDetail(rows),
  };
}

// Reprend tout le contenu du fichier :
//  - bloc « CHARGES » puis « PRODUITS » : titres (« ▌ CHARGES »), rubriques
//    (« 60 — Achats »), lignes comptables (n° de compte + libellé + notes),
//    sous-totaux et totaux ;
//  - bloc « INDICATEURS AUTOMATIQUES » (ratios calculés, en %) ;
//  - bloc « CONTRIBUTIONS VOLONTAIRES EN NATURE » (heures, taux horaire, etc.) ;
//  - période de référence des comptes (année civile / sportive), ajoutée en tête
//    sous forme de ligne « meta ».
function parseDetail(rows) {
  const detail = [];
  let categorie = null;
  let ordre = 0;

  for (let r = 0; r < rows.length; r++) {
    const a = (str(cell(rows, r, C.A)) || '').replace(/\s+/g, ' ').trim();
    const b = (str(cell(rows, r, C.B)) || '').replace(/\s+/g, ' ').trim();
    if (!a && !b) continue;

    const upperA = a.toUpperCase();

    if (a.startsWith('▌')) {
      if (upperA.includes('CHARGES')) categorie = 'charge';
      else if (upperA.includes('PRODUITS')) categorie = 'produit';
      else if (upperA.includes('INDICATEURS')) categorie = 'indicateur';
      else if (upperA.includes('CONTRIBUTIONS')) categorie = 'benevole';
      else break; // « Plan comptable associatif » et suivants : hors périmètre.
      detail.push({ ordre: ordre++, categorie, type: 'titre', libelle: a.replace(/^▌\s*/, '') });
      continue;
    }
    if (!categorie) continue;

    if (categorie === 'indicateur') {
      // Colonne B = libellé de l'indicateur ; les valeurs (formules) sont en C/D/E.
      if (b) detail.push({ ordre: ordre++, categorie, type: 'indicateur', libelle: b, ...montants(rows, r) });
      continue;
    }
    if (categorie === 'benevole') {
      // Ligne d'en-tête « Élément | 2025 | 2026 | 2027 » à ignorer.
      if (a && upperA !== 'ÉLÉMENT') {
        detail.push({
          ordre: ordre++,
          categorie,
          type: 'benevole',
          libelle: a,
          note: str(cell(rows, r, C.H)) || null,
          ...montants(rows, r),
        });
      }
      continue;
    }

    if (upperA.startsWith('RÉSULTAT')) {
      detail.push({ ordre: ordre++, categorie, type: 'total', libelle: "Résultat de l'exercice", ...montants(rows, r) });
      continue;
    }
    if (upperA.startsWith('TOTAL DES')) {
      detail.push({ ordre: ordre++, categorie, type: 'total', libelle: b || a, ...montants(rows, r) });
      continue;
    }
    if (b.toUpperCase().startsWith('SOUS-TOTAL')) {
      detail.push({ ordre: ordre++, categorie, type: 'sous-total', libelle: b, ...montants(rows, r) });
      continue;
    }
    if (!b) {
      detail.push({ ordre: ordre++, categorie, type: 'rubrique', libelle: a });
      continue;
    }
    detail.push({
      ordre: ordre++,
      categorie,
      type: 'ligne',
      numeroCompte: a || null,
      libelle: b,
      note: str(cell(rows, r, C.H)) || null,
      ...montants(rows, r),
    });
  }

  // Les indicateurs du fichier sont des formules (souvent vides à l'import) :
  // on les complète par un calcul à partir du détail chargé/produit.
  const computed = computeIndicateurs(detail);
  for (const d of detail) {
    if (d.type !== 'indicateur') continue;
    const key = indicateurKey(d.libelle);
    if (!key || !computed[key]) continue;
    for (const y of ANNEES) {
      if ((d[`montant${y}`] === null || d[`montant${y}`] === undefined) && computed[key][y] != null) {
        d[`montant${y}`] = computed[key][y];
      }
    }
  }

  // Toutes les lignes du document : en-tête (titre, sous-titre, association,
  // période), puis le corps (charges/produits, indicateurs, contributions),
  // puis la note légale de bas de feuille.
  const footer = findFooter(rows);
  const all = [...buildMeta(rows), ...detail, ...footer];
  all.forEach((d, i) => {
    d.ordre = i;
  });

  return all;
}

// En-tête de la feuille (lignes 1 à 5).
function buildMeta(rows) {
  const meta = [];
  const title = clean(str(cell(rows, 0, C.A)));
  if (title) meta.push({ categorie: 'meta', type: 'titre-document', libelle: title });
  const subtitle = clean(str(cell(rows, 1, C.A)));
  if (subtitle) meta.push({ categorie: 'meta', type: 'sous-titre', libelle: subtitle });

  const assoLabel = clean(str(cell(rows, 2, C.A)));
  const assoValue = clean(str(cell(rows, 2, C.C)));
  if (assoLabel || assoValue) {
    meta.push({ categorie: 'meta', type: 'association', libelle: assoLabel || "Nom de l'association :", note: assoValue });
  }

  const periode = parsePeriode(rows);
  meta.push({
    categorie: 'meta',
    type: 'periode',
    libelle: periode ? periode.label : null,
    note: periode ? periode.code : null,
  });
  return meta;
}

// Note légale de bas de feuille (« Plan comptable associatif … »).
function findFooter(rows) {
  for (let r = 0; r < rows.length; r++) {
    const a = clean(str(cell(rows, r, C.A)));
    if (a && a.startsWith('Plan comptable associatif')) {
      return [{ categorie: 'meta', type: 'note-legale', libelle: a }];
    }
  }
  return [];
}

function clean(v) {
  return v ? v.replace(/\s+/g, ' ').trim() : null;
}

const ANNEES = [2025, 2026, 2027];

// « Année civile (janvier → décembre) » / « Année sportive (septembre → août) » :
// la case cochée se présente comme un caractère case (☒/☑) ou un « x ».
function parsePeriode(rows) {
  const options = [
    { r: 3, code: 'civile' },
    { r: 4, code: 'sportive' },
  ];
  for (const o of options) {
    const check = (str(cell(rows, o.r, C.F)) || '').trim();
    if (/[☒☑✔✓]/.test(check) || check.toUpperCase() === 'X') {
      const label = (str(cell(rows, o.r, C.D)) || '').replace(/\s+/g, ' ').trim();
      return { code: o.code, label: label || null };
    }
  }
  return null;
}

function indicateurKey(libelle) {
  const l = (libelle || '').toLowerCase();
  if (l.includes('subvention')) return 'subventions';
  if (l.includes('cotisation')) return 'cotisations';
  if (l.includes('couverture')) return 'couverture';
  return null;
}

// Calcule les 3 indicateurs (en %) à partir des totaux et des postes du détail.
function computeIndicateurs(detail) {
  const total = (motif) =>
    detail.find((d) => d.type === 'total' && (d.libelle || '').toUpperCase().includes(motif)) || null;
  const produits = total('TOTAL DES PRODUITS');
  const charges = total('TOTAL DES CHARGES');
  const subv = sumPostes(detail, (d) => (d.numeroCompte || '').startsWith('74'));
  const cot = sumPostes(detail, (d) => (d.numeroCompte || '').startsWith('70'));

  const out = { subventions: {}, cotisations: {}, couverture: {} };
  if (!produits) return out;
  for (const y of ANNEES) {
    if (subv && subv.counts[y] > 0) out.subventions[y] = ratio(subv.res[y], produits[`montant${y}`]);
    if (cot && cot.counts[y] > 0) out.cotisations[y] = ratio(cot.res[y], produits[`montant${y}`]);
    out.couverture[y] = ratio(charges ? charges[`montant${y}`] : null, produits[`montant${y}`]);
  }
  return out;
}

// Somme les montants des postes (hors titres/totaux) répondant au prédicat,
// par exercice, en ne comptant que les valeurs réellement présentes.
function sumPostes(detail, pred) {
  const res = { 2025: 0, 2026: 0, 2027: 0 };
  const counts = { 2025: 0, 2026: 0, 2027: 0 };
  for (const d of detail) {
    if (d.type !== 'ligne' && d.type !== 'sous-total') continue;
    if (!pred(d)) continue;
    for (const y of ANNEES) {
      const v = d[`montant${y}`];
      if (v !== null && v !== undefined) {
        res[y] += v;
        counts[y]++;
      }
    }
  }
  return Object.values(counts).some((c) => c > 0) ? { res, counts } : null;
}

// Ratio en pourcentage, arrondi à 2 décimales ; null si le dénominateur est vide.
function ratio(numerateur, denominateur) {
  if (numerateur === null || numerateur === undefined || !denominateur) return null;
  return Math.round((numerateur / denominateur) * 10000) / 100;
}

function montants(rows, r) {
  return {
    montant2025: num(cleanAmount(cell(rows, r, C.C))),
    montant2026: num(cleanAmount(cell(rows, r, C.D))),
    montant2027: num(cleanAmount(cell(rows, r, C.E))),
    ecart: num(cleanAmount(cell(rows, r, C.F))),
    evol: num(cleanAmount(cell(rows, r, C.G))),
  };
}

// Retire les espaces insécables et « € » des montants déjà formatés.
function cleanAmount(v) {
  if (v === null || v === undefined) return null;
  return String(v).replace(/\u00A0/g, ' ').trim();
}

module.exports = { parseTableauFinancier };
