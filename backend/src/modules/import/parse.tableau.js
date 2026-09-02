const { readWorkbook, sheetRows, cell, str, num, findRowByLabel } = require('./excel.utils');

// Fichier 2 : « Tableau Financier ».
// Feuille « Tableau Financier ». Les totaux charges/produits/résultat servent
// à alimenter la section 8 (situation financière).
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
  };
}

// Retire les espaces insécables et « € » des montants déjà formatés.
function cleanAmount(v) {
  if (v === null || v === undefined) return null;
  return String(v).replace(/\u00A0/g, ' ').trim();
}

module.exports = { parseTableauFinancier };